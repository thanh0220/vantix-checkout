const PLAN_AMOUNTS = {
  month:    526836,
  year:     6322037,
  lifetime: 9160000,
};

const PLAN_LABELS = {
  month:    "Gói Tháng",
  year:     "Gói Năm",
  lifetime: "Gói Lifetime",
};

const PLAN_VALID_FOR = {
  month:    30,
  year:     365,
  lifetime: null,
};

function getPlan(key) {
  if (!PLAN_AMOUNTS[key]) return null;
  return {
    label:       PLAN_LABELS[key],
    amount:      PLAN_AMOUNTS[key],
    valid_for:   PLAN_VALID_FOR[key],
    whop_plan_id: process.env[`WHOP_PLAN_ID_${key.toUpperCase()}`] || null,
  };
}

function isValidPlan(key) {
  return key in PLAN_AMOUNTS;
}

module.exports = { getPlan, isValidPlan };
