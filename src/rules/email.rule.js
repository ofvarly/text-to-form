const { weightedAvg } = require("../utils/confidenceScore");

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

module.exports = {
  type: "email",
  name: "email",
  label: "E-posta",
  inputType: "email",
  match(text) {
    const m = text.match(EMAIL_RE);
    if (!m) return null;
    return { value: m[0] };
  },
  confidence(text, match) {
    // email regex eşleşmesi güçlü sinyal
    const hasAt = match.value.includes("@") ? 1 : 0;
    const hasDot = match.value.includes(".") ? 1 : 0;

    return weightedAvg([
      { value: 0.9, weight: 3 },
      { value: hasAt, weight: 1 },
      { value: hasDot, weight: 1 },
    ]);
  },
};
