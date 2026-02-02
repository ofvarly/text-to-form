const { weightedAvg } = require("../utils/confidenceScore");

// Basit tarih yakalama: 03.05.2026, 3/5/2026, 3 mayıs, 3 mayıs 2026
const DOT_DATE_RE = /\b(\d{1,2})[./-](\d{1,2})([./-](\d{2,4}))?\b/;
const MONTHS = [
  "ocak",
  "şubat",
  "subat",
  "mart",
  "nisan",
  "mayıs",
  "mayis",
  "haziran",
  "temmuz",
  "ağustos",
  "agustos",
  "eylül",
  "eylul",
  "ekim",
  "kasım",
  "kasim",
  "aralık",
  "aralik",
];

// Ay isimlerini index'e çevir (1-12)
const MONTH_TO_NUM = {};
MONTHS.forEach((m, i) => {
  // Her iki ay ismi aynı indexe (şubat/subat -> 2)
  MONTH_TO_NUM[m.toLowerCase()] = Math.floor(i / 2) + 1;
});
// Düzeltme: doğru eşleştirme
const MONTH_MAP = {
  ocak: 1,
  şubat: 2,
  subat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  mayis: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  agustos: 8,
  eylül: 9,
  eylul: 9,
  ekim: 10,
  kasım: 11,
  kasim: 11,
  aralık: 12,
  aralik: 12,
};

const TEXT_DATE_RE = new RegExp(
  `\\b(\\d{1,2})\\s+(${MONTHS.join("|")})(\\s+(\\d{4}))?\\b`,
  "i",
);

// Tarihi ISO formatına çevir (YYYY-MM-DD)
function parseToISO(raw) {
  // 15.03.2026 veya 15/03/2026 formatı
  let m = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");
    let year = m[3];
    if (year.length === 2) year = "20" + year;
    return `${year}-${month}-${day}`;
  }

  // 5 mayıs 2026 formatı
  m = raw.match(/(\d{1,2})\s+([a-zşçğüıöİ]+)(?:\s+(\d{4}))?/i);
  if (m) {
    const day = m[1].padStart(2, "0");
    const monthName = m[2].toLowerCase();
    const monthNum = MONTH_MAP[monthName];
    if (!monthNum) return null;
    const month = String(monthNum).padStart(2, "0");
    const year = m[3] || new Date().getFullYear();
    return `${year}-${month}-${day}`;
  }

  return null;
}

module.exports = {
  type: "date",
  name: "appointmentDate",
  label: "Randevu Tarihi",
  inputType: "date",
  match(text) {
    let m = text.match(DOT_DATE_RE);
    if (m) {
      const raw = m[0];
      const iso = parseToISO(raw);
      return { raw, value: iso || raw };
    }

    m = text.match(TEXT_DATE_RE);
    if (m) {
      const raw = m[0];
      const iso = parseToISO(raw);
      return { raw, value: iso || raw };
    }

    // “yarın”, “bugün” gibi şeyleri sonra ekleyeceğiz
    return null;
  },
  confidence(text, match) {
    const looksNumeric = /\d/.test(match.raw);
    return weightedAvg([
      { value: 0.65, weight: 2 },
      { value: looksNumeric ? 0.9 : 0.5, weight: 2 },
    ]);
  },
};
