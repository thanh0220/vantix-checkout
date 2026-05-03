const { isValidRef }  = require("./shared/ref-utils");
const { getOrder }    = require("./shared/order-store");
const { ok, err }     = require("./shared/response");

exports.handler = async (event) => {
  const ref = event.queryStringParameters?.ref;

  if (!isValidRef(ref)) return err(400, "Mã tham chiếu không hợp lệ");

  const order = await getOrder(ref);
  if (!order) return err(404, "Không tìm thấy đơn hàng");

  const paid = order.status === "paid";
  return ok({ paid, status: order.status, access_url: paid ? order.access_url : null });
};
