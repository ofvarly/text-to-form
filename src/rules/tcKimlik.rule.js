/**
 * TC Kimlik Rule
 * Türkiye Cumhuriyeti Kimlik Numarası algılama kuralı
 *
 * KURAL:
 *   - 11 haneli sayı
 *   - İlk hane 0 olamaz
 *   - Algoritma kontrolü (opsiyonel - şimdilik sadece format)
 *
 * ÖRNEKLER:
 *   ✓ 12345678901
 *   ✓ TC: 12345678901
 *   ✗ 1234567890 (10 hane)
 *   ✗ 01234567890 (0 ile başlıyor)
 */

module.exports = {
  type: "tcKimlik",
  name: "tc_kimlik",
  label: "TC Kimlik No",
  inputType: "text",

  /**
   * Metinde TC Kimlik numarası arar
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - Eşleşme varsa { raw }, yoksa null
   */
  match(text) {
    // TC, T.C., tc kimlik gibi etiketlerle veya tek başına 11 hane
    const regex =
      /(?:tc|t\.?c\.?\s*(?:kimlik)?(?:\s*(?:no|numarası?))?\s*[:\-]?\s*)?(\d{11})\b/gi;
    const regexMatch = regex.exec(text);
    if (!regexMatch) return null;

    const tcNo = regexMatch[1];

    // İlk hane 0 olamaz
    if (tcNo[0] === "0") return null;

    // Basit algoritma kontrolü (opsiyonel)
    if (!validateTcKimlik(tcNo)) return null;

    return { raw: tcNo };
  },

  /**
   * Eşleşme güvenilirlik skoru
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Etiket var mı: "tc", "kimlik", "t.c."
   * - Algoritma geçerli (match varsa zaten geçerli)
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    let score = 0.7; // Baz puan (algoritma geçerli)

    // 1. Etiket kontrolü (+0.2)
    const hasLabel = /tc|t\.c\.|kimlik|identity/i.test(lowercaseText);
    if (hasLabel) {
      score += 0.2;
    }

    // 2. "no" veya "numarası" varsa (+0.1)
    const hasNoLabel = /no|numara/i.test(lowercaseText);
    if (hasNoLabel) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};

/**
 * TC Kimlik algoritma kontrolü
 * Türkiye'deki resmi algoritma:
 * - 1-9 basamakların toplamı × 7 - 2,4,6,8 basamakların toplamı = 10. basamak
 * - Tüm basamakların toplamı mod 10 = 11. basamak
 *
 * @param {string} tc - 11 haneli TC kimlik numarası
 * @returns {boolean} - Geçerli mi?
 */
function validateTcKimlik(tc) {
  if (tc.length !== 11) return false;
  if (tc[0] === "0") return false;

  const digits = tc.split("").map(Number);

  // İlk 10 basamak kontrolü
  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const even = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (odd * 7 - even) % 10;

  if (digit10 !== digits[9]) return false;

  // 11. basamak kontrolü
  const sum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  const digit11 = sum % 10;

  if (digit11 !== digits[10]) return false;

  return true;
}
