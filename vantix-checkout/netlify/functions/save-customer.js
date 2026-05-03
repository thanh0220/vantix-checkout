exports.handler = async (event) => {
  const CORS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 204, headers: CORS, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS, body: "Method not allowed" };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { name, email, phone, plan } = body;
  if (!name || !email || !plan)
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing fields" }) };

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ name, email, phone: phone || null, plan }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase error:", err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "DB error" }) };
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
};
