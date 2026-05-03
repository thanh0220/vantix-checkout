const REF_CHARS   = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REF_PATTERN = /VNX[A-Z0-9]{6}/;
const REF_STRICT  = /^VNX[A-Z0-9]{6}$/;

function generateRef() {
  let code = "VNX";
  for (let i = 0; i < 6; i++) code += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return code;
}

function isValidRef(ref) {
  return REF_STRICT.test(ref);
}

function extractRef(content) {
  return (content || "").match(REF_PATTERN)?.[0] || null;
}

module.exports = { generateRef, isValidRef, extractRef };
