/**
 * URL Rule
 * Web adresi (URL) algılama kuralı
 *
 * KURAL:
 *   - http:// veya https:// ile başlar
 *   - veya www. ile başlar
 *   - Domain + path
 *
 * ÖRNEKLER:
 *   ✓ https://example.com
 *   ✓ http://www.test.com/path
 *   ✓ www.google.com
 *   ✗ example.com (protokolsüz)
 */

module.exports = {
  type: "url",
  name: "website",
  label: "Web Sitesi",
  inputType: "url",

  /**
   * Metinde URL arar
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - Eşleşme varsa { raw }, yoksa null
   */
  match(text) {
    // http(s):// veya www. ile başlayan URL'ler
    const regex = /\b(?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+/gi;
    const regexMatch = regex.exec(text);
    if (!regexMatch) return null;

    let url = regexMatch[0];

    // Sonundaki noktalama işaretlerini temizle
    url = url.replace(/[.,;:!?)]+$/, "");

    return { raw: url };
  },

  /**
   * Eşleşme güvenilirlik skoru
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Etiket var mı: "site", "web", "link"
   * - Protokol: https > http > www
   * - Bilinen domain
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    const url = match.raw.toLowerCase();
    let score = 0.6; // Baz puan

    // 1. Etiket kontrolü (+0.1)
    const hasLabel = /site|web|link|adres|url/i.test(lowercaseText);
    if (hasLabel) {
      score += 0.1;
    }

    // 2. Protokol kontrolü (+0.2 veya +0.15)
    if (url.startsWith("https://")) {
      score += 0.2;
    } else if (url.startsWith("http://")) {
      score += 0.15;
    } else {
      score += 0.1; // www.
    }

    // 3. Bilinen domain (+0.1)
    const knownDomains =
      /google|facebook|twitter|instagram|youtube|github|linkedin/;
    if (knownDomains.test(url)) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};
