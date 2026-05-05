const PLANS = {
  month:    { amount: 526836  },
  year:     { amount: 6322037 },
  lifetime: { amount: 9160000 },
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genRef() {
  let code = "VNX";
  for (let i = 0; i < 6; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

async function saveOrder(ref, order) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const val   = encodeURIComponent(JSON.stringify(order));
  await fetch(`${url}/set/${ref}/${val}?EX=7200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

exports.handler = async (event) => {
  const CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 204, headers: CORS, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { email, name, phone, plan } = body;
  if (!email || !name || !plan || !PLANS[plan])
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Thiếu thông tin bắt buộc" }) };

  const ref    = genRef();
  const amount = PLANS[plan].amount;
  const bank   = process.env.BANK_SHORT_NAME      || "MB";
  const acc    = process.env.BANK_ACCOUNT_NUMBER  || "";
  const owner  = process.env.BANK_ACCOUNT_NAME    || "";

  await saveOrder(ref, { ref, email, name, phone, plan, amount, status: "pending", created_at: Date.now() }).catch(() => {});

  const qr = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${ref}&template=compact&download=false`;

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ ref_code: ref, amount, bank_name: bank, account_number: acc, account_name: owner, qr_url: qr }),
  };
};
