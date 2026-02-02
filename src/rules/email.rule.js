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
    const regexMatch = text.match(EMAIL_RE);
    if (!regexMatch) return null;

    return { value: regexMatch[0] };
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Etiket var mı: "mail", "e-posta", "iletişim" gibi
   * - Bilinen domain: gmail, hotmail, outlook
   * - Username uzunluğu: daha uzun = daha güvenilir
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    const email = match.value.toLowerCase();
    let score = 0.6; // Baz puan (regex eşleşti)

    // 1. Etiket kontrolü (+0.2)
    const hasLabel = /mail|e-?posta|iletişim|contact|email/i.test(
      lowercaseText,
    );
    if (hasLabel) {
      score += 0.2;
    }

    // 2. Bilinen domain kontrolü (+0.1)
    const knownDomains = /gmail|hotmail|outlook|yahoo|yandex|icloud/;
    if (knownDomains.test(email)) {
      score += 0.1;
    }

    // 3. Username uzunluğu kontrolü (+0.1)
    const username = email.split("@")[0];
    if (username.length >= 5) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};
