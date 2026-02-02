/**
 * Age Rule
 * Yaş algılama kuralı
 *
 * KURAL:
 *   - Sayı + "yaş" veya "yaşında"
 *   - Mantıklı yaş aralığı (0-150)
 *
 * ÖRNEKLER:
 *   ✓ 25 yaşındayım
 *   ✓ yaşım 30
 *   ✓ 45 yaşında
 *   ✗ 200 yaşında (mantıksız)
 */

const { calculateConfidence } = require("../utils/confidenceScore");

module.exports = {
  type: "age",
  name: "age",
  label: "Yaş",
  inputType: "number",

  /**
   * Metinde yaş bilgisi arar
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - Eşleşme varsa { raw, value }, yoksa null
   */
  match(text) {
    const lower = text.toLowerCase();

    // Pattern 1: "25 yaşındayım", "30 yaşında"
    let m = lower.match(/(\d{1,3})\s*yaş(?:ında(?:yım)?)?/);
    if (m) {
      const age = parseInt(m[1], 10);
      if (age >= 0 && age <= 150) {
        return { raw: m[0], value: age };
      }
    }

    // Pattern 2: "yaşım 25"
    m = lower.match(/yaşım?\s*[:\-]?\s*(\d{1,3})/);
    if (m) {
      const age = parseInt(m[1], 10);
      if (age >= 0 && age <= 150) {
        return { raw: m[0], value: age };
      }
    }

    return null;
  },

  /**
   * Eşleşme güvenilirlik skoru
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   */
  confidence(text, match) {
    if (!match) return 0;

    const age = match.value;

    // Mantıklı yaş aralığı (18-80) yüksek güven
    if (age >= 18 && age <= 80) {
      return calculateConfidence(0.9);
    }

    // Diğer geçerli yaşlar orta güven
    return calculateConfidence(0.75);
  },
};
