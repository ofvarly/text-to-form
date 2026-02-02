/**
 * ==============================================================
 * NAME RULE - İsim Algılama Kuralı
 * ==============================================================
 *
 * Bu modül, metin içinden kişi isimlerini tespit eder.
 *
 * DESTEKLENEN FORMATLAR:
 * - "Adım Ahmet Yılmaz"
 * - "Ben Mehmet Demir"
 * - "adım Ali Veli"
 *
 * SINIRLAMALAR:
 * - Sadece "adım" veya "ben" ile başlayan ifadeler yakalanır
 * - İsim büyük harfle başlamalı
 * - Minimum 2 kelime (ad + soyad) tercih edilir
 *
 * NOT: Türkçe isim algılama çok karmaşık, bu MVP seviyesinde.
 */

const { weightedAvg } = require("../utils/confidenceScore");

// ============================================================
// REGEX PATTERN
// ============================================================

/**
 * Türkçe isim yakalama regex'i
 *
 * Açıklama:
 * - \b                    → Kelime sınırı
 * - (adım|adim|ben)       → Tetikleyici kelime (Türkçe karakterli ve ASCII)
 * - \s+                   → Bir veya daha fazla boşluk
 * - [A-ZÇĞİÖŞÜ]           → Büyük harfle başlayan (Türkçe karakterler dahil)
 * - [a-zçğıöşü]+          → Küçük harflerle devam eden
 * - (\s+[A-Z...][a-z...]+){1,3} → 1-3 ek kelime (soyad, ikinci isim vb.)
 * - \b                    → Kelime sınırı
 *
 * Örnekler:
 *   "Adım Ahmet Yılmaz"     → "Ahmet Yılmaz" yakalanır
 *   "Ben Mehmet"            → "Mehmet" yakalanır
 *   "adım ali"              → YAKALANMAZ (küçük harfle başlıyor)
 */
const NAME_RE =
  /\b(adım|adim|ben)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+){1,3})\b/;

// ============================================================
// RULE EXPORT
// ============================================================

module.exports = {
  // Form field metadata
  type: "name", // Alan tipi
  name: "fullName", // HTML input name attribute
  label: "Ad Soyad", // Kullanıcıya gösterilen label
  inputType: "text", // HTML input type

  /**
   * Metin içinde isim arar
   *
   * @param {string} text - Aranacak metin
   * @returns {Object|null} - { value } veya null
   *   - value: Bulunan isim (tetikleyici kelime hariç)
   *
   * Örnek:
   *   "Merhaba, adım Ahmet Yılmaz." → { value: "Ahmet Yılmaz" }
   *   "Ben Mehmet" → { value: "Mehmet" }
   *
   * NOT: m[2] kullanılıyor çünkü m[1] tetikleyici kelime ("adım")
   */
  match(text) {
    const m = text.match(NAME_RE);
    if (!m) return null;

    // m[2] = yakalanan isim kısmı (tetikleyici hariç)
    return { value: m[2] };
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Base skor: 0.55 (isim algılama belirsiz)
   * - Kelime sayısı:
   *   - 2+ kelime (ad soyad) → 0.85
   *   - 1 kelime (sadece ad) → 0.4
   *
   * NOT: Base skor düşük çünkü isim algılama hata yapabilir.
   * Örneğin "Adım bitmedi" → "bitmedi" yanlış yakalanabilir.
   */
  confidence(text, match) {
    // Kaç kelime var?
    const parts = match.value.trim().split(/\s+/).length;

    return weightedAvg([
      { value: 0.55, weight: 2 }, // Düşük base skor
      { value: parts >= 2 ? 0.85 : 0.4, weight: 2 }, // Ad+soyad bonusu
    ]);
  },
};
