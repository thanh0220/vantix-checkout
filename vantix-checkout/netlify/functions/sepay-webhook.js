const { extractRef }          = require("./shared/ref-utils");
const { getPlan }             = require("./shared/plans");
const { getOrder, saveOrder } = require("./shared/order-store");
const { ok, err, skip }       = require("./shared/response");

async function createWhopMembership(plan_id, email, valid_for, idempotency_key) {
  const body = { plan_id, email, ...(valid_for ? { valid_for } : {}) };
  const res = await fetch("https://api.whop.com/api/v2/memberships", {
    method: "POST",
    headers: {
      "Authorization":   `Bearer ${process.env.WHOP_API_KEY}`,
      "Content-Type":    "application/json",
      "Idempotency-Key": idempotency_key,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Whop API error ${res.status}`);
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return err(405, "Method not allowed");

  const token = event.headers["x-sepay-token"] || event.headers["authorization"] || "";
  if (process.env.SEPAY_WEBHOOK_TOKEN && token !== process.env.SEPAY_WEBHOOK_TOKEN) {
    return err(401, "Unauthorized");
  }

  let payload;
  try { payload = JSON.parse(event.body); }
  catch { return err(400, "Invalid JSON"); }

  const { transferType, transferAmount, content } = payload;

  if (transferType !== "in") return skip("not incoming");

  const ref_code = extractRef(content);
  if (!ref_code) return skip("no ref found");

  // Re-fetch mới nhất để tránh race condition
  const order = await getOrder(ref_code);
  if (!order)                 return skip("order not found");
  if (order.status === "paid") return skip("already paid");

  if (Math.abs(transferAmount - order.amount) > 1000) {
    console.log(`Amount mismatch ref=${ref_code}: got ${transferAmount}, expected ${order.amount}`);
    return skip("amount mismatch");
  }

  const planCfg = getPlan(order.plan);
  if (!planCfg?.whop_plan_id) {
    console.error(`Missing Whop plan ID for plan: ${order.plan}`);
    return err(500, "Lỗi cấu hình plan");
  }

  let access_url;
  try {
    const membership = await createWhopMembership(
      planCfg.whop_plan_id,
      order.email,
      planCfg.valid_for,
      `${ref_code}-${order.email}`,
    );
    access_url = membership.checkout_url || membership.access_url || membership.redirect_url || null;
  } catch (e) {
    console.error("Whop API error:", e.message);
    return err(502, "Lỗi kết nối Whop. Webhook sẽ được retry tự động.");
  }

  // Chỉ mark paid sau khi Whop thành công
  await saveOrder(ref_code, {
    ...order,
    status:      "paid",
    access_url,
    paid_at:     Date.now(),
    paid_amount: transferAmount,
  });

  return ok({ success: true, ref_code });
};
