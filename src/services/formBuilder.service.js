const { normalizeText } = require("./textParser.service");
const { detectFields } = require("./fieldDetector.service");
const {
  generateHTML,
  generateZodSchema,
} = require("./schemaGenerator.service");

function buildFormFromText(rawText) {
  const normalized = normalizeText(rawText);
  const detections = detectFields(normalized);

  // Duplicate temizliği (aynı type birden çok kez yakalanırsa en yüksek confidence)
  const bestByType = new Map();
  for (const d of detections) {
    const prev = bestByType.get(d.type);
    if (!prev || d.confidence > prev.confidence) bestByType.set(d.type, d);
  }

  const fields = Array.from(bestByType.values())
    .sort((a, b) => b.confidence - a.confidence)
    .map((d) => ({
      name: d.name,
      type: d.inputType,
      label: d.label,
      confidence: d.confidence,
      sample: d.sample ?? null,
    }));

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
