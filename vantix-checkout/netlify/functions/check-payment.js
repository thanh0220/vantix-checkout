async function getOrder(ref) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res   = await fetch(`${url}/get/${ref}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

exports.handler = async (event) => {
  const CORS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  const ref = event.queryStringParameters?.ref;
  if (!ref || !/^VNX[A-Z0-9]{6}$/.test(ref))
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Mã không hợp lệ" }) };

  const order = await getOrder(ref);
  if (!order)
    return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Không tìm thấy đơn hàng" }) };

  const paid = order.status === "paid";
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ paid, status: order.status, access_url: paid ? order.access_url : null }),
  };
};
