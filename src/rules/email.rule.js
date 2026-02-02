/**
 * ==============================================================
 * EMAIL RULE - E-posta Algılama Kuralı
 * ==============================================================
 *
 * Bu modül, metin içinden e-posta adreslerini tespit eder.
 *
 * DESTEKLENEN FORMATLAR:
 * - user@example.com
 * - user.name@domain.co.uk
 * - user+tag@gmail.com
 *
 * NOT: Basit regex, tüm edge case'leri kapsamaz (RFC 5322 tam uyumu yok)
 */

const { weightedAvg } = require("../utils/confidenceScore");

// ============================================================
// REGEX PATTERN
// ============================================================

/**
 * E-posta adresi için regex
 *
 * Açıklama:
 * - [a-z0-9._%+-]+  → Kullanıcı adı (harf, sayı, nokta, alt çizgi, yüzde, artı, tire)
 * - @               → @ işareti (zorunlu)
 * - [a-z0-9.-]+     → Domain adı (harf, sayı, nokta, tire)
 * - \.              → Nokta (zorunlu)
 * - [a-z]{2,}       → TLD (en az 2 harf: com, org, co.uk, vb.)
 * - /i              → Case-insensitive (büyük/küçük harf farketmez)
 */
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// ============================================================
// RULE EXPORT
// ============================================================

module.exports = {
  // Form field metadata
  type: "email", // Alan tipi (Zod z.string().email() için)
  name: "email", // HTML input name attribute
  label: "E-posta", // Kullanıcıya gösterilen label
  inputType: "email", // HTML input type="email" (browser validasyonu)

  /**
   * Metin içinde e-posta adresi arar
   *
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - { value } veya null
   *   - value: Bulunan e-posta adresi
   *
   * Örnek:
   *   "Mail: test@example.com" → { value: "test@example.com" }
   */
  match(text) {
    const m = text.match(EMAIL_RE);
    if (!m) return null;

    return { value: m[0] };
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Base skor: 0.9 (regex eşleşti = yüksek güven)
   * - @ içeriyor mu: 1 veya 0
   * - . içeriyor mu: 1 veya 0
   *
   * E-posta regex'i çok spesifik olduğu için base skor yüksek tutuldu.
   */
  confidence(text, match) {
    const hasAt = match.value.includes("@") ? 1 : 0;
    const hasDot = match.value.includes(".") ? 1 : 0;

    return weightedAvg([
      { value: 0.9, weight: 3 }, // Yüksek base skor (regex güvenilir)
      { value: hasAt, weight: 1 },
      { value: hasDot, weight: 1 },
    ]);
  },
};
