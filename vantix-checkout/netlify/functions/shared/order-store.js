const { getStore } = require("@netlify/blobs");

const STORE_NAME = "orders";

function getOrderStore() {
  return getStore(STORE_NAME);
}

async function getOrder(ref_code) {
  return getOrderStore().get(ref_code, { type: "json" });
}

async function saveOrder(ref_code, order) {
  return getOrderStore().setJSON(ref_code, order);
}

module.exports = { getOrder, saveOrder };
