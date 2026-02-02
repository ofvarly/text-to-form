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

const { calculateConfidence } = require("../utils/confidenceScore");

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
    const m = regex.exec(text);
    if (!m) return null;

    // Boşlukları temizle
    const cleaned = m[0].replace(/\s/g, "").toUpperCase();

    // 26 karakter olmalı
    if (cleaned.length !== 26) return null;

    return {
      raw: m[0],
      value: formatIban(cleaned), // Formatlı versiyonu
    };
  },

  /**
   * Eşleşme güvenilirlik skoru
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() sonucu
   * @returns {number} - 0-1 arası güven skoru
   */
  confidence(text, match) {
    if (!match) return 0;
    const lower = text.toLowerCase();

    // "IBAN" etiketi varsa yüksek güven
    if (lower.includes("iban")) {
      return calculateConfidence(0.95);
    }

    // TR ile başlayan 26 karakter = yüksek güven
    return calculateConfidence(0.9);
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
