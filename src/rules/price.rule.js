/**
 * ==============================================================
 * PRICE RULE - Fiyat/Bütçe Algılama Kuralı
 * ==============================================================
 *
 * Bu modül, metin içinden Türk Lirası fiyat bilgilerini tespit eder.
 *
 * DESTEKLENEN FORMATLAR:
 * - 2500 TL
 * - 2.500 TL (binlik ayırıcı)
 * - 2500₺
 * - 2.500,50 lira (kuruş dahil)
 * - 1500tl (bitişik)
 *
 * NOT: Sadece TL/₺/lira içeren ifadeler yakalanır
 */

const { weightedAvg } = require("../utils/confidenceScore");

// ============================================================
// REGEX PATTERN
// ============================================================

/**
 * Türk Lirası fiyat formatı için regex
 *
 * Açıklama:
 * - (\d{1,3}(.\d{3})*|\d+) → Sayı kısmı:
 *     - \d{1,3}           → 1-3 hane (1, 12, 123)
 *     - (.\d{3})*         → Opsiyonel binlik grupları (.000, .500)
 *     - |\d+              → VEYA düz sayı (2500)
 * - (,\d+)?               → Opsiyonel kuruş (,50)
 * - \s?                   → Opsiyonel boşluk
 * - (tl|₺|lira)           → Para birimi (case-insensitive)
 *
 * Örnekler:
 *   "2.500,50 TL" → match
 *   "1500₺"       → match
 *   "3000 lira"   → match
 *   "2500"        → NO match (para birimi yok)
 */
const PRICE_RE = /(\d{1,3}(\.\d{3})*|\d+)(,\d+)?\s?(tl|₺|lira)/i;

// ============================================================
// RULE EXPORT
// ============================================================

module.exports = {
  // Form field metadata
  type: "price", // Alan tipi
  name: "budget", // HTML input name attribute
  label: "Bütçe", // Kullanıcıya gösterilen label
  inputType: "text", // "text" kullanıyoruz çünkü "1500 TL" → number input'a yazılamaz

  /**
   * Metin içinde fiyat bilgisi arar
   *
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - { value } veya null
   *   - value: Bulunan fiyat ifadesi (para birimi dahil)
   *
   * Örnek:
   *   "Bütçem 2.500 TL" → { value: "2.500 TL" }
   */
  match(text) {
    const m = text.match(PRICE_RE);
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
   * - Base skor: 0.7 (fiyat formatı eşleşti)
   * - Para birimi içeriyor mu:
   *   - TL, ₺ veya lira varsa → 1.0
   *   - Yoksa → 0.3
   */
  confidence(text, match) {
    // Para birimi sembolü veya kelimesi var mı?
    const hasCurrency = /(tl|₺|lira)/i.test(match.value);

    return weightedAvg([
      { value: 0.7, weight: 2 }, // Base skor
      { value: hasCurrency ? 1 : 0.3, weight: 2 }, // Para birimi bonusu
    ]);
  },
};
