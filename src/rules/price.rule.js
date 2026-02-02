const { weightedAvg } = require("../utils/confidenceScore");

// 2500 TL, 2.500₺, 2500 lira
const PRICE_RE = /(\d{1,3}(\.\d{3})*|\d+)(,\d+)?\s?(tl|₺|lira)/i;

module.exports = {
  type: "price",
  name: "budget",
  label: "Bütçe",
  inputType: "text", // TL de yazıldığı için number inputa "1500 TL" yazılamaz
  match(text) {
    const m = text.match(PRICE_RE);
    if (!m) return null;
    return { value: m[0] };
  },
  confidence(text, match) {
    const hasCurrency = /(tl|₺|lira)/i.test(match.value);
    return weightedAvg([
      { value: 0.7, weight: 2 },
      { value: hasCurrency ? 1 : 0.3, weight: 2 },
    ]);
  },
};
