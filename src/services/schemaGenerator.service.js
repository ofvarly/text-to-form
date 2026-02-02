/**
 * ==============================================================
 * SCHEMA GENERATOR SERVICE - Kod Üretici Servisi
 * ==============================================================
 *
 * Bu servis, tespit edilen form alanlarından hazır kod üretir.
 *
 * ÇIKTILAR:
 *   1. HTML - Kullanıma hazır form kodu
 *   2. Zod - TypeScript/JavaScript validation schema
 *
 * KULLANIM:
 *   const { generateHTML, generateZodSchema } = require('./schemaGenerator.service');
 *
 *   const fields = [{ name: 'email', type: 'email', label: 'E-posta', confidence: 0.9 }];
 *   const html = generateHTML(fields);
 *   const zod = generateZodSchema(fields);
 */

/**
 * Form alanlarından HTML form kodu üretir
 *
 * @param {Array} fields - Form alanları
 *   Her eleman: { name, type, label, confidence, sample }
 * @returns {string} - HTML form string
 *
 * ÖZELLİKLER:
 *   - confidence > 0.8 → required attribute eklenir
 *   - sample varsa → placeholder olarak eklenir
 *   - XSS koruması için değerler escape edilir
 *
 * Örnek çıktı:
 *   <form>
 *     <div class="form-group">
 *       <label for="email">E-posta</label>
 *       <input type="email" id="email" name="email" placeholder="test@example.com" required>
 *     </div>
 *     <button type="submit">Gönder</button>
 *   </form>
 */
function generateHTML(fields) {
  // Boş fields → boş form
  if (!fields || fields.length === 0) {
    return "<form></form>";
  }

  // Her field için input HTML'i oluştur
  const inputLines = fields.map((field) => {
    // Yüksek confidence → required
    const required = field.confidence > 0.8 ? " required" : "";

    // Sample değer varsa placeholder olarak ekle
    const placeholder = field.sample
      ? ` placeholder="${escapeHTML(field.sample)}"`
      : "";

    // Input HTML'i (semantic form-group yapısı)
    return `  <div class="form-group">
    <label for="${field.name}">${escapeHTML(field.label)}</label>
    <input type="${field.type}" id="${field.name}" name="${field.name}"${placeholder}${required}>
  </div>`;
  });

  // Tüm input'ları form içine koy
  return `<form>
${inputLines.join("\n")}
  <button type="submit">Gönder</button>
</form>`;
}

/**
 * Form alanlarından Zod validation schema üretir
 *
 * @param {Array} fields - Form alanları
 * @returns {string} - Zod schema string
 *
 * TİP EŞLEŞMELERİ:
 *   email  → z.string().email()
 *   tel    → z.string().regex(telefon formatı)
 *   number → z.number()
 *   date   → z.string().date()
 *   text   → z.string()
 *
 * confidence ≤ 0.8 → .optional() eklenir
 *
 * Örnek çıktı:
 *   z.object({
 *     email: z.string().email(),
 *     phone: z.string().regex(/^[0-9\s\-\+\(\)]{10,15}$/).optional()
 *   })
 */
function generateZodSchema(fields) {
  // Boş fields → boş obje
  if (!fields || fields.length === 0) {
    return "z.object({})";
  }

  // Her field için Zod type oluştur
  const schemaLines = fields.map((field) => {
    let zodType = "z.string()"; // Default

    // Input type'a göre Zod type belirle
    switch (field.type) {
      case "email":
        // Built-in email validasyonu
        zodType = "z.string().email()";
        break;

      case "tel":
        // Telefon formatı regex'i
        // 10-15 karakter, rakam/boşluk/tire/artı/parantez
        zodType = "z.string().regex(/^[0-9\\s\\-\\+\\(\\)]{10,15}$/)";
        break;

      case "number":
        // Sayısal değer
        zodType = "z.number()";
        break;

      case "date":
        // ISO tarih formatı (YYYY-MM-DD)
        zodType = "z.string().date()";
        break;

      default:
        // Diğer her şey string
        zodType = "z.string()";
    }

    // Düşük confidence → optional (zorunlu değil)
    // Kullanıcı bu alanı doldurmayabilir
    if (field.confidence <= 0.8) {
      zodType += ".optional()";
    }

    return `  ${field.name}: ${zodType}`;
  });

  // z.object ile sar
  return `z.object({
${schemaLines.join(",\n")}
})`;
}

/**
 * HTML karakterlerini escape eder (XSS koruması)
 *
 * @param {string} str - Escape edilecek string
 * @returns {string} - Güvenli string
 *
 * Dönüşümler:
 *   & → &amp;
 *   < → &lt;
 *   > → &gt;
 *   " → &quot;
 *
 * Örnek:
 *   escapeHTML('<script>alert("xss")</script>')
 *   // → '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
function escapeHTML(str) {
  if (!str) return "";

  return String(str)
    .replace(/&/g, "&amp;") // & işareti
    .replace(/</g, "&lt;") // Küçüktür
    .replace(/>/g, "&gt;") // Büyüktür
    .replace(/"/g, "&quot;"); // Çift tırnak
}

module.exports = { generateHTML, generateZodSchema };
