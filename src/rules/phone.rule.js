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
    const regexMatch = text.match(PHONE_RE);
    if (!regexMatch) return null;

    // Fazla boşlukları temizle
    return { value: regexMatch[0].replace(/\s+/g, " ").trim() };
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Etiket var mı: "tel", "telefon", "cep", "gsm"
   * - Türkiye formatı mı: 90, 05, 5 ile başlıyor
   * - Hane sayısı: 10-11 hane ideal
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    const digits = match.value.replace(/\D/g, "");
    let score = 0.5; // Baz puan

    // 1. Etiket kontrolü (+0.2)
    const hasLabel = /tel|telefon|cep|gsm|numara|phone|mobile/i.test(
      lowercaseText,
    );
    if (hasLabel) {
      score += 0.2;
    }

    // 2. Türkiye GSM formatı kontrolü (+0.2)
    const isTurkishFormat =
      digits.startsWith("90") ||
      digits.startsWith("05") ||
      digits.startsWith("5");
    if (isTurkishFormat) {
      score += 0.2;
    }

    // 3. Hane sayısı kontrolü (+0.1)
    if (digits.length >= 10 && digits.length <= 12) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};
