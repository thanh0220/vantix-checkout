const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function ok(body) {
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function err(statusCode, message) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify({ error: message }) };
}

function skip(reason) {
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ skip: reason }) };
}

module.exports = { ok, err, skip };
