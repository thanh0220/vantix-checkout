const { generateRef }            = require("./shared/ref-utils");
const { isValidPlan, getPlan }   = require("./shared/plans");
const { saveOrder }              = require("./shared/order-store");
const { ok, err }                = require("./shared/response");

const BANK = {
  short_name:     process.env.BANK_SHORT_NAME      || "MB",
  account_number: process.env.BANK_ACCOUNT_NUMBER  || "",
  account_name:   process.env.BANK_ACCOUNT_NAME    || "",
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return err(405, "Method not allowed");

  let body;
  try { body = JSON.parse(event.body); }
  catch { return err(400, "Invalid JSON"); }

  const { email, name, phone, plan } = body;
  if (!email || !name || !plan || !isValidPlan(plan)) {
    return err(400, "Thiếu thông tin bắt buộc");
  }

  const planData = getPlan(plan);
  const ref_code = generateRef();

  const order = {
    ref_code, email, name, phone, plan,
    amount:     planData.amount,
    status:     "pending",
    created_at: Date.now(),
    access_url: null,
  };

  await saveOrder(ref_code, order);

  const qr_url = `https://qr.sepay.vn/img?acc=${BANK.account_number}&bank=${BANK.short_name}&amount=${planData.amount}&des=${ref_code}&template=compact&download=false`;

  return ok({
    ref_code,
    amount:         planData.amount,
    bank_name:      BANK.short_name,
    account_number: BANK.account_number,
    account_name:   BANK.account_name,
    qr_url,
  });
};
