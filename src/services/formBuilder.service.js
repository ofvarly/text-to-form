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
 */
function buildFormFromText(rawText) {
  // ---- ADIM 1: Metni normalize et ----
  const normalized = normalizeText(rawText);

  // ---- ADIM 2: Alanları tespit et ----
  const detections = detectFields(normalized);

  // ---- ADIM 3: Duplicate temizliği ----
  const bestByType = new Map();

  for (const d of detections) {
    const prev = bestByType.get(d.type);
    if (!prev || d.confidence > prev.confidence) {
      bestByType.set(d.type, d);
    }
  }

  // ---- ADIM 4: fields dizisini oluştur ----
  const fields = Array.from(bestByType.values())
    .sort((a, b) => b.confidence - a.confidence)
    .map((d) => ({
      name: d.name,
      type: d.inputType,
      label: d.label,
      confidence: d.confidence,
      sample: d.sample ?? null,
    }));

  // ---- ADIM 5: Sonucu döndür ----
  return {
    form: { fields },
    schemas: {
      html: generateHTML(fields),
      zod: generateZodSchema(fields),
    },
    meta: {
      textLength: rawText.length,
      normalizedTextLength: normalized.length,
    },
  };
}

module.exports = { buildFormFromText };
