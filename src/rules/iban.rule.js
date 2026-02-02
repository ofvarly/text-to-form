/**
 * IBAN Rule
 * Uluslararası Banka Hesap Numarası algılama kuralı
 *
 * KURAL:
 *   - TR ile başlar
 *   - 26 karakter (2 ülke + 2 kontrol + 22 banka/hesap)
 *   - Boşluklu veya boşluksuz olabilir
 *
 * ÖRNEKLER:
 *   ✓ TR12 0001 0012 3456 7890 1234 56
 *   ✓ TR120001001234567890123456
 *   ✗ DE89370400440532013000 (Almanya)
 */

module.exports = {
  type: "iban",
  name: "iban",
  label: "IBAN",
  inputType: "text",

  /**
   * Metinde Türk IBAN'ı arar
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - Eşleşme varsa { raw, value }, yoksa null
   */
  match(text) {
    // Türk IBAN formatı: TR + 24 hane (boşluklu veya boşluksuz)
    const regex = /\bTR\s*\d{2}[\s\d]{22,30}\b/gi;
    const regexMatch = regex.exec(text);
    if (!regexMatch) return null;

    // Boşlukları temizle
    const cleaned = regexMatch[0].replace(/\s/g, "").toUpperCase();

    // 26 karakter olmalı
    if (cleaned.length !== 26) return null;

    return {
      raw: regexMatch[0],
      value: formatIban(cleaned), // Formatlı versiyonu
    };
  },

  /**
   * Eşleşme güvenilirlik skoru
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Etiket var mı: "iban", "hesap"
   * - TR ile başlıyor (zaten zorunlu)
   * - 26 karakter (zaten zorunlu)
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    let score = 0.8; // Baz puan (TR26 karakter = yüksek güven)

    // 1. Etiket kontrolü (+0.15)
    const hasLabel = /iban|hesap|account/i.test(lowercaseText);
    if (hasLabel) {
      score += 0.15;
    }

    // 2. Formatlı mı (boşluklu) (+0.05)
    const isFormatted = /\s/.test(match.raw);
    if (isFormatted) {
      score += 0.05;
    }

    return Math.min(score, 1); // Max 1.0
  },
};

/**
 * IBAN'ı okunabilir formata çevirir
 * TR12 0001 0012 3456 7890 1234 56
 *
 * @param {string} iban - Boşluksuz IBAN
 * @returns {string} - Formatlı IBAN
 */
function formatIban(iban) {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}
