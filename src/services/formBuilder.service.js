/**
 * ==============================================================
 * FORM BUILDER SERVICE - Form Oluşturma Servisi
 * ==============================================================
 *
 * Bu servis, ham metinden eksiksiz form yapısı oluşturur.
 * Tüm diğer servisleri koordine eden ana orkestratör.
 *
 * AKIŞ:
 *   1. Metni normalize et (textParser)
 *   2. Alanları tespit et (fieldDetector)
 *   3. Duplicate'leri temizle (aynı tipten en yüksek confidence)
 *   4. HTML ve Zod schema generate et (schemaGenerator)
 *   5. Sonucu döndür
 *
 * KULLANIM:
 *   const { buildFormFromText } = require('./formBuilder.service');
 *   const result = buildFormFromText("Mail: test@example.com");
 */

const { normalizeText } = require("./textParser.service");
const { detectFields } = require("./fieldDetector.service");
const {
  generateHTML,
  generateZodSchema,
} = require("./schemaGenerator.service");

/**
 * Ham metinden form yapısı oluşturur
 *
 * @param {string} rawText - Kullanıcının girdiği ham metin
 * @returns {Object} - Form verisi, schema'lar ve meta bilgi
 *
 * Dönüş yapısı:
 * {
 *   form: {
 *     fields: [{ name, type, label, confidence, sample }, ...]
 *   },
 *   schemas: {
 *     html: "<form>...</form>",
 *     zod: "z.object({...})"
 *   },
 *   meta: {
 *     textLength: number,
 *     normalizedTextLength: number
 *   }
 * }
 */
function buildFormFromText(rawText) {
  // ---- ADIM 1: Metni normalize et ----
  // Smart quote'ları düzelt, fazla boşlukları temizle
  const normalized = normalizeText(rawText);

  // ---- ADIM 2: Alanları tespit et ----
  // Tüm rule'ları çalıştır, eşleşenleri topla
  const detections = detectFields(normalized);

  // ---- ADIM 3: Duplicate temizliği ----
  // Aynı tipten birden fazla eşleşme varsa (örn: 2 email)
  // sadece en yüksek confidence olanı tut
  const bestByType = new Map();

  for (const d of detections) {
    const prev = bestByType.get(d.type);

    // Bu tip daha önce görülmedi VEYA şimdiki daha güvenilir
    if (!prev || d.confidence > prev.confidence) {
      bestByType.set(d.type, d);
    }
  }

  // ---- ADIM 4: fields dizisini oluştur ----
  // Map'ten diziye çevir, confidence'a göre sırala
  const fields = Array.from(bestByType.values())
    .sort((a, b) => b.confidence - a.confidence) // Yüksek → düşük
    .map((d) => ({
      name: d.name, // HTML name attribute
      type: d.inputType, // HTML input type
      label: d.label, // Gösterilecek label
      confidence: d.confidence,
      sample: d.sample ?? null, // Örnek değer (varsa)
    }));

  // ---- ADIM 5: Sonucu döndür ----
  return {
    // Form field'ları
    form: { fields },

    // Generate edilmiş schema'lar
    schemas: {
      html: generateHTML(fields), // Hazır HTML form kodu
      zod: generateZodSchema(fields), // Hazır Zod validation
    },

    // Debug/analiz için meta bilgi
    meta: {
      textLength: rawText.length,
      normalizedTextLength: normalized.length,
    },
  };
}

module.exports = { buildFormFromText };
