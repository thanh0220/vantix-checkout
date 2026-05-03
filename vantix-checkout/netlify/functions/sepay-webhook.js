const PLANS = {
  month:    { valid_for: 30  },
  year:     { valid_for: 365 },
  lifetime: { valid_for: null },
};

async function getOrder(ref) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res   = await fetch(`${url}/get/${ref}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

async function saveOrder(ref, order) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const val   = encodeURIComponent(JSON.stringify(order));
  await fetch(`${url}/set/${ref}/${val}?EX=7200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function createWhopMembership(plan_id, email, valid_for, idempotency_key) {
  const body = { plan_id, email, ...(valid_for ? { valid_for } : {}) };
  const res  = await fetch("https://api.whop.com/api/v2/memberships", {
    method:  "POST",
    headers: {
      Authorization:    `Bearer ${process.env.WHOP_API_KEY}`,
      "Content-Type":   "application/json",
      "Idempotency-Key": idempotency_key,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Whop error ${res.status}`);
  return data;
}

exports.handler = async (event) => {
  const CORS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method not allowed" };

  const token = event.headers["x-sepay-token"] || event.headers["authorization"] || "";
  if (process.env.SEPAY_WEBHOOK_TOKEN && token !== process.env.SEPAY_WEBHOOK_TOKEN)
    return { statusCode: 401, body: "Unauthorized" };

  let payload;
  try { payload = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: "Invalid JSON" }; }

  const { transferType, transferAmount, content } = payload;

  if (transferType !== "in")
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ skip: "not incoming" }) };

  const match = (content || "").match(/VNX[A-Z0-9]{6}/);
  if (!match)
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ skip: "no ref found" }) };

  const ref   = match[0];
  const order = await getOrder(ref);

  if (!order)        return { statusCode: 200, headers: CORS, body: JSON.stringify({ skip: "order not found" }) };
  if (order.status === "paid") return { statusCode: 200, headers: CORS, body: JSON.stringify({ skip: "already paid" }) };

  if (Math.abs(transferAmount - order.amount) > 1000) {
    console.log(`Amount mismatch ref=${ref}: got ${transferAmount}, expected ${order.amount}`);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ skip: "amount mismatch" }) };
  }

  const planKey    = `WHOP_PLAN_ID_${order.plan.toUpperCase()}`;
  const whop_plan  = process.env[planKey];
  if (!whop_plan) {
    console.error("Missing Whop plan ID for:", order.plan);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Config error" }) };
  }

  let access_url = null;
  try {
    const membership = await createWhopMembership(
      whop_plan, order.email,
      PLANS[order.plan]?.valid_for,
      `${ref}-${order.email}`,
    );
    access_url = membership.checkout_url || membership.access_url || membership.redirect_url || null;
  } catch (e) {
    console.error("Whop API error:", e.message);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: "Whop error, will retry" }) };
  }

  await saveOrder(ref, { ...order, status: "paid", access_url, paid_at: Date.now(), paid_amount: transferAmount });

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, ref }) };
};
