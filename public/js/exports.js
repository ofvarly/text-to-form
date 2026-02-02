/**
 * Export Generators Module
 * Farklı formatlarda kod üretimi: React, Vue, JSON Schema
 */

import { escapeHTML } from "./utils.js";

/**
 * React component kodu üretir (JSX)
 * @param {Array} fields - Form alanları
 * @returns {string} - React component kodu
 */
export function generateReactComponent(fields) {
  if (!fields || fields.length === 0) {
    return `export default function Form() {
  return <form></form>;
}`;
  }

  const stateLines = fields
    .map((f) => `  const [${f.name}, set${capitalize(f.name)}] = useState("");`)
    .join("\n");

  const inputLines = fields
    .map((f) => {
      const required = f.required
        ? `
          required`
        : "";
      return `      <div className="form-group">
        <label htmlFor="${f.name}">${escapeHTML(f.label)}</label>
        <input
          type="${f.type}"
          id="${f.name}"
          name="${f.name}"
          value={${f.name}}
          onChange={(e) => set${capitalize(f.name)}(e.target.value)}${required}
        />
      </div>`;
    })
    .join("\n");

  return `import { useState } from "react";

export default function Form() {
${stateLines}

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ${fields.map((f) => f.name).join(", ")} });
  };

  return (
    <form onSubmit={handleSubmit}>
${inputLines}
      <button type="submit">Gönder</button>
    </form>
  );
}`;
}

/**
 * Vue component kodu üretir (SFC)
 * @param {Array} fields - Form alanları
 * @returns {string} - Vue component kodu
 */
export function generateVueComponent(fields) {
  if (!fields || fields.length === 0) {
    return `<template>
  <form></form>
</template>

<script setup>
</script>`;
  }

  const refLines = fields.map((f) => `const ${f.name} = ref("");`).join("\n");

  const inputLines = fields
    .map((f) => {
      const required = f.required
        ? `
        required`
        : "";
      return `    <div class="form-group">
      <label for="${f.name}">${escapeHTML(f.label)}</label>
      <input
        type="${f.type}"
        id="${f.name}"
        v-model="${f.name}"${required}
      />
    </div>`;
    })
    .join("\n");

  return `<template>
  <form @submit.prevent="handleSubmit">
${inputLines}
    <button type="submit">Gönder</button>
  </form>
</template>

<script setup>
import { ref } from "vue";

${refLines}

function handleSubmit() {
  console.log({ ${fields.map((f) => f.name).join(", ")} });
}
</script>`;
}

/**
 * JSON Schema üretir
 * @param {Array} fields - Form alanları
 * @returns {string} - JSON Schema string
 */
export function generateJSONSchema(fields) {
  if (!fields || fields.length === 0) {
    return JSON.stringify({ type: "object", properties: {} }, null, 2);
  }

  const properties = {};
  const required = [];

  fields.forEach((f) => {
    let prop = { type: "string" };

    switch (f.type) {
      case "email":
        prop = { type: "string", format: "email" };
        break;
      case "tel":
        prop = { type: "string", pattern: "^[0-9\\s\\-\\+\\(\\)]{10,15}$" };
        break;
      case "number":
        prop = { type: "number" };
        break;
      case "date":
        prop = { type: "string", format: "date" };
        break;
      case "url":
        prop = { type: "string", format: "uri" };
        break;
    }

    prop.title = f.label;
    properties[f.name] = prop;

    if (f.required) {
      required.push(f.name);
    }
  });

  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties,
    required: required.length > 0 ? required : undefined,
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Field dizisinden HTML form kodu üretir (export için - değersiz)
 * @param {Array} fields - Form alanları
 * @returns {string} - HTML form string
 */
export function generateHTMLFromFields(fields) {
  if (!fields || fields.length === 0) {
    return "<form></form>";
  }

  const inputLines = fields.map((field) => {
    const required = field.required ? " required" : "";
    return `  <div class="form-group">
    <label for="${field.name}">${escapeHTML(field.label)}</label>
    <input type="${field.type}" id="${field.name}" name="${field.name}"${required}>
  </div>`;
  });

  return `<form>
${inputLines.join("\n")}
  <button type="submit">Gönder</button>
</form>`;
}

/**
 * Önizleme için HTML üretir (sample değerler ile)
 * @param {Array} fields - Form alanları
 * @returns {string} - HTML form string with values
 */
export function generatePreviewHTML(fields) {
  if (!fields || fields.length === 0) {
    return "<form></form>";
  }

  const inputLines = fields.map((field) => {
    const required = field.required ? " required" : "";
    const value = field.sample
      ? ` value="${escapeHTML(String(field.sample))}"`
      : "";
    return `  <div class="form-group">
    <label for="${field.name}">${escapeHTML(field.label)}</label>
    <input type="text" id="${field.name}" name="${field.name}"${value}${required} readonly>
  </div>`;
  });

  return `<form>
${inputLines.join("\n")}
  <button type="submit">Gönder</button>
</form>`;
}

/**
 * Field dizisinden Zod validation schema üretir
 * @param {Array} fields - Form alanları
 * @returns {string} - Zod schema string
 */
export function generateZodFromFields(fields) {
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
      case "url":
        zodType = "z.string().url()";
        break;
      default:
        zodType = "z.string()";
    }

    // required değilse .optional() ekle
    if (!field.required) {
      zodType += ".optional()";
    }

    return `  ${field.name}: ${zodType}`;
  });

  return `z.object({
${schemaLines.join(",\n")}
})`;
}

/**
 * Yardımcı: İlk harfi büyük yap
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
