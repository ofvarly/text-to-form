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
    const regexMatch = text.match(PRICE_RE);
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
   * - Etiket var mı: "bütçe", "fiyat", "tutar", "ücret"
   * - Para birimi sembolü: TL, ₺, lira
   * - Miktar makul mü
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    let score = 0.5; // Baz puan

    // 1. Etiket kontrolü (+0.2)
    const hasLabel = /bütçe|fiyat|tutar|ücret|maliyet|price|cost/i.test(
      lowercaseText,
    );
    if (hasLabel) {
      score += 0.2;
    }

    // 2. Para birimi sembolü kontrolü (+0.2)
    const hasCurrency = /(tl|₺|lira)/i.test(match.value);
    if (hasCurrency) {
      score += 0.2;
    }

    // 3. Makul miktar kontrolü (+0.1)
    const amount = parseFloat(
      match.value.replace(/[^\d,\.]/g, "").replace(",", "."),
    );
    if (amount > 0 && amount < 10000000) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};
