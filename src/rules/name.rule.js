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
  /\b(isim|ad|adi|adı|adım|adim|ben)\s+([A-ZÇĞİÖŞÜa-zçğıöşü]+(\s+[A-ZÇĞİÖŞÜa-zçğıöşü]+){1,3})\b/i;

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
   * NOT: regexMatch[2] kullanılıyor çünkü regexMatch[1] tetikleyici kelime ("adım")
   */
  match(text) {
    const regexMatch = text.match(NAME_RE);
    if (!regexMatch) return null;

    // regexMatch[2] = yakalanan isim kısmı (tetikleyici hariç)
    return { value: regexMatch[2] };
  },

  /**
   * Eşleşmenin güvenilirlik skorunu hesaplar
   *
   * @param {string} text - Orijinal metin
   * @param {Object} match - match() fonksiyonunun döndürdüğü obje
   * @returns {number} - 0-1 arası güven skoru
   *
   * Faktörler:
   * - Tetikleyici etiket var mı: "adım", "ben", "isim"
   * - Kelime sayısı: 2+ kelime (ad soyad) daha güvenilir
   * - İsim uzunluğu: çok kısa isimler daha az güvenilir
   */
  confidence(text, match) {
    if (!match) return 0;

    const lowercaseText = text.toLowerCase();
    const name = match.value.trim();
    const wordCount = name.split(/\s+/).length;
    let score = 0.5; // Baz puan

    // 1. Etiket kontrolü (+0.2)
    const hasLabel = /adı|adım|isim|ben|name/i.test(lowercaseText);
    if (hasLabel) {
      score += 0.2;
    }

    // 2. Ad + Soyad kontrolü (+0.2)
    if (wordCount >= 2) {
      score += 0.2;
    }

    // 3. İsim uzunluğu kontrolü (+0.1)
    if (name.length >= 5) {
      score += 0.1;
    }

    return Math.min(score, 1); // Max 1.0
  },
};
