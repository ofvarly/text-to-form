/**
 * ==============================================================
 * TEXT PARSER SERVICE - Metin İşleme Servisi
 * ==============================================================
 *
 * Bu servis, ham metni rule'lar için hazırlar (normalizasyon).
 *
 * İŞLEMLER:
 *   1. Smart quote'ları normal quote'lara çevir (' → ')
 *   2. Fazla boşlukları tek boşluğa indir (   → " ")
 *   3. Baştaki ve sondaki boşlukları temizle
 *
 * NEDEN GEREKLİ?
 *   - Kullanıcılar farklı kaynaklardan copy-paste yapabilir
 *   - Word/PDF'den gelen metinlerde smart quote'lar olur
 *   - Fazla boşluklar regex'leri bozabilir
 *
 * KULLANIM:
 *   const { normalizeText } = require('./textParser.service');
 *   const clean = normalizeText("   test   text   ");
 *   // → "test text"
 */

/**
 * Metni normalize eder (temizler)
 *
 * @param {string} text - Ham metin
 * @returns {string} - Normalize edilmiş metin
 *
 * Örnekler:
 *   "Hello   World"     → "Hello World"
 *   "It's a test"       → "It's a test" (smart → normal quote)
 *   "  trim me  "       → "trim me"
 */
function normalizeText(text) {
  return (
    String(text)
      // Smart quote'ları normal apostrophe'a çevir
      // \u2019 = ' (right single quote)
      // \u2018 = ' (left single quote)
      .replace(/\u2019|\u2018/g, "'")

      // Birden fazla boşluğu tek boşluğa indir
      // "a   b    c" → "a b c"
      .replace(/\s+/g, " ")

      // Baş ve sondaki boşlukları temizle
      .trim()
  );
}

module.exports = { normalizeText };
