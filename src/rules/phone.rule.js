const { weightedAvg } = require("../utils/confidenceScore");

// TR odaklı basit telefon: 05xx xxx xx xx, +90 5xx..., 5xx...
const PHONE_RE = /(\+90\s?)?(0?\s?5\d{2})[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/;

module.exports = {
  type: "phone",
  name: "phone",
  label: "Telefon",
  inputType: "tel",
  match(text) {
    const m = text.match(PHONE_RE);
    if (!m) return null;
    return { value: m[0].replace(/\s+/g, " ").trim() };
  },
  confidence(text, match) {
    const digits = match.value.replace(/\D/g, "");
    const looksTR =
      digits.startsWith("90") ||
      digits.startsWith("05") ||
      digits.startsWith("5");
    return weightedAvg([
      { value: 0.75, weight: 2 },
      { value: looksTR ? 1 : 0.4, weight: 2 },
    ]);
  },
};
