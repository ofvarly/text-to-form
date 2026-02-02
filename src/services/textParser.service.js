function normalizeText(text) {
  return String(text)
    .replace(/\u2019|\u2018/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { normalizeText };
