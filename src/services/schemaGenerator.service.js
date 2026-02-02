/**
 * Schema Generator Service
 * Form alanlarından HTML ve Zod schema generate eder
 */

/**
 * HTML form kodu generate eder
 * @param {Array} fields - Form alanları
 * @returns {string} HTML form string
 */
function generateHTML(fields) {
  if (!fields || fields.length === 0) {
    return "<form></form>";
  }

  const inputLines = fields.map((field) => {
    const required = field.confidence > 0.8 ? " required" : "";
    const placeholder = field.sample
      ? ` placeholder="${escapeHTML(field.sample)}"`
      : "";

    return `  <div class="form-group">
    <label for="${field.name}">${escapeHTML(field.label)}</label>
    <input type="${field.type}" id="${field.name}" name="${field.name}"${placeholder}${required}>
  </div>`;
  });

  return `<form>
${inputLines.join("\n")}
  <button type="submit">Gönder</button>
</form>`;
}

/**
 * Zod validation schema generate eder
 * @param {Array} fields - Form alanları
 * @returns {string} Zod schema string
 */
function generateZodSchema(fields) {
  if (!fields || fields.length === 0) {
    return "z.object({})";
  }

  const schemaLines = fields.map((field) => {
    let zodType = "z.string()";

    switch (field.type) {
      case "email":
        zodType = "z.string().email()";
        break;
      case "tel":
        zodType = "z.string().regex(/^[0-9\\s\\-\\+\\(\\)]{10,15}$/)";
        break;
      case "number":
        zodType = "z.number()";
        break;
      case "date":
        zodType = "z.string().date()";
        break;
      default:
        zodType = "z.string()";
    }

    // Düşük confidence → optional
    if (field.confidence <= 0.8) {
      zodType += ".optional()";
    }

    return `  ${field.name}: ${zodType}`;
  });

  return `z.object({
${schemaLines.join(",\n")}
})`;
}

/**
 * HTML karakterlerini escape eder
 */
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { generateHTML, generateZodSchema };
