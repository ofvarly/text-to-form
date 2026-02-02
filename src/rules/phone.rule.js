/**
 * ==============================================================
 * PHONE RULE - Telefon Numarası Algılama Kuralı
 * ==============================================================
 *
 * Bu modül, metin içinden Türkiye telefon numaralarını tespit eder.
 *
 * DESTEKLENEN FORMATLAR:
 * - 0532 123 45 67
 * - 05321234567
 * - +90 532 123 45 67
 * - 532 123 45 67
 * - 0532-123-45-67
 *
 * NOT: Sadece Türkiye GSM numaraları destekleniyor (5xx ile başlayan)
 */

const { weightedAvg } = require("../utils/confidenceScore");

// ============================================================
// REGEX PATTERN
// ============================================================

/**
 * Türkiye telefon numarası için regex
 *
 * Açıklama:
 * - (\+90\s?)?      → Opsiyonel ülke kodu (+90 veya +90 boşluk)
 * - (0?\s?5\d{2})   → Operatör kodu (05xx veya 5xx, opsiyonel 0 ve boşluk)
 * - [\s-]?          → Opsiyonel ayırıcı (boşluk veya tire)
 * - \d{3}           → İlk 3 hane
 * - [\s-]?          → Opsiyonel ayırıcı
 * - \d{2}           → Sonraki 2 hane
 * - [\s-]?          → Opsiyonel ayırıcı
 * - \d{2}           → Son 2 hane
 *
 * Toplam: +90 0532 123 45 67 (10-12 hane)
 */
const PHONE_RE = /(\+90\s?)?(0?\s?5\d{2})[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/;

// ============================================================
// RULE EXPORT
// ============================================================

module.exports = {
  // Form field metadata
  type: "phone", // Alan tipi
  name: "phone", // HTML input name attribute
  label: "Telefon", // Kullanıcıya gösterilen label
  inputType: "tel", // HTML input type="tel" (mobilde numpad açar)

  /**
   * Metin içinde telefon numarası arar
   *
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - { value } veya null
   *   - value: Normalize edilmiş telefon numarası
   *
   * Örnek:
   *   "Ara: 0532  123  45  67" → { value: "0532 123 45 67" }
   *   (Fazla boşluklar tek boşluğa indirilir)
   */
  match(text) {
    const m = text.match(PHONE_RE);
    if (!m) return null;

    // Fazla boşlukları temizle
    return { value: m[0].replace(/\s+/g, " ").trim() };
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Base skor: 0.75 (telefon formatı eşleşti)
   * - Türkiye formatı mı:
   *   - 90 veya 05 veya 5 ile başlıyor → 1.0
   *   - Başka format → 0.4
   */
  confidence(text, match) {
    // Sadece rakamları al
    const digits = match.value.replace(/\D/g, "");

    // Türkiye GSM formatına uyuyor mu?
    const looksTR =
      digits.startsWith("90") || // Ülke koduyla
      digits.startsWith("05") || // 0 ile
      digits.startsWith("5"); // Direkt 5 ile

    return weightedAvg([
      { value: 0.75, weight: 2 }, // Base skor
      { value: looksTR ? 1 : 0.4, weight: 2 }, // TR formatı bonusu
    ]);
  },
};
