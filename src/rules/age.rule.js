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
    const lowercaseText = text.toLowerCase();

    // Pattern 1: "25 yaşındayım", "30 yaşında"
    let regexMatch = lowercaseText.match(/(\d{1,3})\s*yaş(?:ında(?:yım)?)?/);
    if (regexMatch) {
      const ageValue = parseInt(regexMatch[1], 10);
      if (ageValue >= 0 && ageValue <= 150) {
        return { raw: regexMatch[0], value: ageValue };
      }
    }

    // Pattern 2: "yaşım 25"
    regexMatch = lowercaseText.match(/yaşım?\s*[:\-]?\s*(\d{1,3})/);
    if (regexMatch) {
      const ageValue = parseInt(regexMatch[1], 10);
      if (ageValue >= 0 && ageValue <= 150) {
        return { raw: regexMatch[0], value: ageValue };
      }
    }

    return null;
  },

  /**
   * Eşleşme güvenilirlik skoru
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Etiket var mı: "yaş", "yaşındayım"
   * - Yaş aralığı: 18-80 arası daha güvenilir
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    const ageValue = match.value;
    let score = 0.6; // Baz puan

    // 1. Etiket kontrolü (+0.2)
    const hasLabel = /yaş|age/i.test(lowercaseText);
    if (hasLabel) {
      score += 0.2;
    }

    // 2. Makul yaş aralığı kontrolü (+0.2)
    if (ageValue >= 18 && ageValue <= 80) {
      score += 0.2;
    } else if (ageValue >= 0 && ageValue <= 150) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};
