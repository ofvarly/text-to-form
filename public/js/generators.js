// /**
//  * Generators Module
//  * HTML ve Zod kod üretimi
//  */

// import { escapeHTML } from "./utils.js";

// /**
//  * Field dizisinden HTML form kodu üretir
//  * @param {Array} fields - Form alanları
//  * @returns {string} - HTML form string
//  */
// export function generateHTMLFromFields(fields) {
//   if (!fields || fields.length === 0) {
//     return "<form></form>";
//   }

//   const inputLines = fields.map((field) => {
//     return `  <div class="form-group">
//     <label for="${field.name}">${escapeHTML(field.label)}</label>
//     <input type="${field.type}" id="${field.name}" name="${field.name}">
//   </div>`;
//   });

//   return `<form>
// ${inputLines.join("\n")}
//   <button type="submit">Gönder</button>
// </form>`;
// }

// /**
//  * Field dizisinden Zod validation schema üretir
//  * @param {Array} fields - Form alanları
//  * @returns {string} - Zod schema string
//  */
// export function generateZodFromFields(fields) {
//   if (!fields || fields.length === 0) {
//     return "z.object({})";
//   }

//   const schemaLines = fields.map((field) => {
//     let zodType = "z.string()";

//     switch (field.type) {
//       case "email":
//         zodType = "z.string().email()";
//         break;
//       case "tel":
//         zodType = "z.string().regex(/^[0-9\\s\\-\\+\\(\\)]{10,15}$/)";
//         break;
//       case "number":
//         zodType = "z.number()";
//         break;
//       case "date":
//         zodType = "z.string().date()";
//         break;
//       case "url":
//         zodType = "z.string().url()";
//         break;
//       default:
//         zodType = "z.string()";
//     }

//     return `  ${field.name}: ${zodType}`;
//   });

//   return `z.object({
// ${schemaLines.join(",\n")}
// })`;
// }
