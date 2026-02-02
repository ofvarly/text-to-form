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

const { calculateConfidence } = require("../utils/confidenceScore");

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
    const m = regex.exec(text);
    if (!m) return null;

    let url = m[0];

    // Sonundaki noktalama işaretlerini temizle
    url = url.replace(/[.,;:!?)]+$/, "");

    return { raw: url };
  },

  /**
   * Eşleşme güvenilirlik skoru
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   */
  confidence(text, match) {
    if (!match) return 0;

    const url = match.raw.toLowerCase();

    // https varsa yüksek güven
    if (url.startsWith("https://")) {
      return calculateConfidence(0.95);
    }

    // http varsa orta güven
    if (url.startsWith("http://")) {
      return calculateConfidence(0.9);
    }

    // www ile başlıyorsa
    return calculateConfidence(0.85);
  },
};
