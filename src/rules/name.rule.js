const { weightedAvg } = require("../utils/confidenceScore");

// Basit “adım X”, “ben X” yakalama. Türkçe özel durumlar sonsuz, şimdilik MVP.
const NAME_RE =
  /\b(adım|adim|ben)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+){1,3})\b/;

module.exports = {
  type: "name",
  name: "fullName",
  label: "Ad Soyad",
  inputType: "text",
  match(text) {
    const m = text.match(NAME_RE);
    if (!m) return null;
    return { value: m[2] };
  },
  confidence(text, match) {
    const parts = match.value.trim().split(/\s+/).length;
    return weightedAvg([
      { value: 0.55, weight: 2 },
      { value: parts >= 2 ? 0.85 : 0.4, weight: 2 },
    ]);
  },
};
