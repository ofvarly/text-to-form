/**
 * ==============================================================
 * DATE RULE - Tarih Algılama Kuralı
 * ==============================================================
 *
 * Bu modül, metin içinden tarih bilgilerini tespit eder.
 *
 * DESTEKLENEN FORMATLAR:
 * - Noktalı:  03.05.2026, 3.5.26
 * - Slashlı:  03/05/2026, 3/5/26
 * - Tireli:   03-05-2026, 3-5-26
 * - Yazılı:   5 mayıs 2026, 15 ocak
 *
 * ÇIKTI: ISO formatı (YYYY-MM-DD) döndürür
 */

const { weightedAvg } = require("../utils/confidenceScore");

// ============================================================
// REGEX PATTERNLERİ
// ============================================================

/**
 * Sayısal tarih formatı için regex
 * Eşleşir: 03.05.2026, 3/5/26, 15-03-2026
 *
 * Açıklama:
 * - \b           → Kelime sınırı (başka sayılarla karışmasın)
 * - (\d{1,2})    → Gün (1-2 hane)
 * - [./-]        → Ayırıcı (nokta, slash veya tire)
 * - (\d{1,2})    → Ay (1-2 hane)
 * - ([./-](\d{2,4}))? → Opsiyonel yıl (2 veya 4 hane)
 * - \b           → Kelime sınırı
 */
const DOT_DATE_RE = /\b(\d{1,2})[./-](\d{1,2})([./-](\d{2,4}))?\b/;

/**
 * Türkçe ay isimleri (hem Türkçe karakterli hem karaktersiz)
 * Her ayın iki versiyonu var: şubat/subat, ağustos/agustos vb.
 */
const MONTHS = [
  "ocak", // 1
  "şubat", // 2 (Türkçe karakterli)
  "subat", // 2 (ASCII)
  "mart", // 3
  "nisan", // 4
  "mayıs", // 5 (Türkçe karakterli)
  "mayis", // 5 (ASCII)
  "haziran", // 6
  "temmuz", // 7
  "ağustos", // 8 (Türkçe karakterli)
  "agustos", // 8 (ASCII)
  "eylül", // 9 (Türkçe karakterli)
  "eylul", // 9 (ASCII)
  "ekim", // 10
  "kasım", // 11 (Türkçe karakterli)
  "kasim", // 11 (ASCII)
  "aralık", // 12 (Türkçe karakterli)
  "aralik", // 12 (ASCII)
];

// ============================================================
// AY İSMİ → SAYI DÖNÜŞÜMÜ
// ============================================================

/**
 * Ay isimlerini sayıya çeviren harita
 * Örnek: "mayıs" → 5, "mayis" → 5
 */
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

/**
 * Yazılı tarih formatı için regex
 * Eşleşir: "5 mayıs 2026", "15 ocak"
 *
 * Dinamik olarak MONTHS dizisinden oluşturulur
 */
const TEXT_DATE_RE = new RegExp(
  `\\b(\\d{1,2})\\s+(${MONTHS.join("|")})(\\s+(\\d{4}))?\\b`,
  "i", // case-insensitive
);

// ============================================================
// YARDIMCI FONKSİYONLAR
// ============================================================

/**
 * Ham tarih stringini ISO formatına çevirir
 *
 * @param {string} raw - Ham tarih stringi (örn: "15.03.2026" veya "5 mayıs 2026")
 * @returns {string|null} - ISO format (YYYY-MM-DD) veya null
 *
 * Örnekler:
 *   "15.03.2026"   → "2026-03-15"
 *   "5/3/26"       → "2026-03-05"
 *   "5 mayıs 2026" → "2026-05-05"
 *   "15 ocak"      → "2026-01-15" (bu yılı kullanır)
 */
function parseToISO(raw) {
  // ---- Sayısal format: 15.03.2026, 15/03/26 ----
  let m = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (m) {
    // Gün ve ayı 2 haneye formatla (5 → 05)
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");

    // 2 haneli yılı 4 haneye çevir (26 → 2026)
    let year = m[3];
    if (year.length === 2) year = "20" + year;

    return `${year}-${month}-${day}`;
  }

  // ---- Yazılı format: 5 mayıs 2026 ----
  m = raw.match(/(\d{1,2})\s+([a-zşçğüıöİ]+)(?:\s+(\d{4}))?/i);
  if (m) {
    const day = m[1].padStart(2, "0");
    const monthName = m[2].toLowerCase();

    // Ay ismini sayıya çevir
    const monthNum = MONTH_MAP[monthName];
    if (!monthNum) return null; // Bilinmeyen ay ismi

    const month = String(monthNum).padStart(2, "0");

    // Yıl belirtilmemişse bu yılı kullan
    const year = m[3] || new Date().getFullYear();

    return `${year}-${month}-${day}`;
  }

  return null;
}

// ============================================================
// RULE EXPORT
// ============================================================

module.exports = {
  // Form field metadata
  type: "date", // Alan tipi (Zod için)
  name: "appointmentDate", // HTML input name attribute
  label: "Randevu Tarihi", // Kullanıcıya gösterilen label
  inputType: "date", // HTML input type attribute

  /**
   * Metin içinde tarih arar
   *
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - { raw, value } veya null
   *   - raw: Orijinal eşleşen metin ("15.03.2026")
   *   - value: ISO formatı ("2026-03-15")
   */
  match(text) {
    // Önce sayısal formatı dene (03.05.2026)
    let m = text.match(DOT_DATE_RE);
    if (m) {
      const raw = m[0];
      const iso = parseToISO(raw);
      return { raw, value: iso || raw };
    }

    // Sonra yazılı formatı dene (5 mayıs 2026)
    m = text.match(TEXT_DATE_RE);
    if (m) {
      const raw = m[0];
      const iso = parseToISO(raw);
      return { raw, value: iso || raw };
    }

    // TODO: "yarın", "bugün", "gelecek pazartesi" gibi göreceli tarihler
    return null;
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Base skor: 0.65 (tarih formatı eşleşti)
   * - Sayı içeriyor mu: Evet → 0.9, Hayır → 0.5
   */
  confidence(text, match) {
    const looksNumeric = /\d/.test(match.raw);

    return weightedAvg([
      { value: 0.65, weight: 2 }, // Base skor
      { value: looksNumeric ? 0.9 : 0.5, weight: 2 }, // Sayısal mı?
    ]);
  },
};
