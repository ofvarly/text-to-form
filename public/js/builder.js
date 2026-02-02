/**
 * Builder Module
 * Form builder UI mantığı: render, edit, delete, drag-drop
 */

import {
  editableFields,
  updateField,
  removeField,
  addField,
  reorderFields,
  INPUT_TYPES,
} from "./state.js";
import { escapeHTML } from "./utils.js";
import {
  generateReactComponent,
  generateVueComponent,
  generateJSONSchema,
  generateHTMLFromFields,
  generateZodFromFields,
  generatePreviewHTML,
} from "./exports.js";

// DOM Elements
const fieldsList = document.getElementById("fields-list");
const builderList = document.getElementById("builder-list");
const addFieldBtn = document.getElementById("add-field-btn");
const formPreview = document.getElementById("form-preview");
const htmlCode = document.getElementById("html-code");
const zodCode = document.getElementById("zod-code");
const reactCode = document.getElementById("react-code");
const vueCode = document.getElementById("vue-code");
const jsonCode = document.getElementById("json-code");

// Drag state
let draggedIndex = null;

/**
 * Builder'ı başlatır (add field butonu + download butonları)
 */
export function initBuilder() {
  addFieldBtn.addEventListener("click", handleAddField);
  initDownloadButtons();
}

/**
 * Download butonlarını başlatır
 */
function initDownloadButtons() {
  document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const format = btn.dataset.format;
      downloadFile(format);
    });
  });
}

/**
 * Dosya indirme işlemi
 */
function downloadFile(format) {
  let content = "";
  let filename = "";
  let mimeType = "text/plain";

  switch (format) {
    case "html":
      content = htmlCode.textContent;
      filename = "form.html";
      mimeType = "text/html";
      break;
    case "zod":
      content = zodCode.textContent;
      filename = "schema.ts";
      mimeType = "text/typescript";
      break;
    case "react":
      content = reactCode.textContent;
      filename = "Form.jsx";
      mimeType = "text/javascript";
      break;
    case "vue":
      content = vueCode.textContent;
      filename = "Form.vue";
      mimeType = "text/plain";
      break;
    case "json":
      content = jsonCode.textContent;
      filename = "schema.json";
      mimeType = "application/json";
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * "Alanlar" tab'ını render eder
 */
export function renderFieldsList() {
  fieldsList.innerHTML = editableFields
    .map(
      (field) => `
    <div class="field-card">
      <div class="field-info">
        <span class="field-label">${escapeHTML(field.label)}</span>
        <span class="field-type">${field.type} • ${field.name}</span>
      </div>
      <div class="field-confidence">
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${(field.confidence || 0) * 100}%"></div>
        </div>
        <span class="confidence-value">${Math.round((field.confidence || 0) * 100)}%</span>
      </div>
    </div>
  `,
    )
    .join("");
}

/**
 * "Builder" tab'ını render eder
 */
export function renderBuilder() {
  builderList.innerHTML = editableFields
    .map(
      (field, index) => `
    <div class="builder-card" draggable="true" data-index="${index}" data-id="${field.id}">
      <span class="drag-handle">☰</span>
      <div class="builder-card-content">
        <div class="builder-field">
          <label>Label</label>
          <input type="text" value="${escapeHTML(field.label)}" data-field="label" data-id="${field.id}">
        </div>
        <div class="builder-field">
          <label>Name</label>
          <input type="text" value="${escapeHTML(field.name)}" data-field="name" data-id="${field.id}">
        </div>
        <div class="builder-field">
          <label>Type</label>
          <select data-field="type" data-id="${field.id}">
            ${INPUT_TYPES.map(
              (t) =>
                `<option value="${t.value}" ${t.value === field.type ? "selected" : ""}>${t.label}</option>`,
            ).join("")}
          </select>
        </div>
        <div class="builder-field builder-checkbox">
          <label class="checkbox-label">
            <input type="checkbox" data-field="required" data-id="${field.id}" ${field.required ? "checked" : ""}>
            <span>Zorunlu</span>
          </label>
        </div>
      </div>
      <button class="delete-btn" data-id="${field.id}" title="Sil">🗑️</button>
    </div>
  `,
    )
    .join("");

  attachBuilderListeners();
}

/**
 * Builder kartlarına event listener ekler
 */
function attachBuilderListeners() {
  // Edit listeners
  builderList.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("change", handleFieldEdit);
    el.addEventListener("input", handleFieldEdit);
  });

  // Delete listeners
  builderList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDeleteField);
  });

  // Drag listeners
  builderList.querySelectorAll(".builder-card").forEach((card) => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);
    card.addEventListener("dragend", handleDragEnd);
  });
}

/**
 * Field düzenleme handler'ı
 */
function handleFieldEdit(e) {
  const id = parseInt(e.target.dataset.id);
  const field = e.target.dataset.field;

  // Checkbox için checked, diğerleri için value
  const value =
    e.target.type === "checkbox" ? e.target.checked : e.target.value;

  updateField(id, field, value);
  updateOutputs();
}

/**
 * Field silme handler'ı
 */
function handleDeleteField(e) {
  const id = parseInt(e.target.dataset.id);
  removeField(id);
  renderBuilder();
  renderFieldsList();
  updateOutputs();
}

/**
 * Yeni field ekleme handler'ı
 */
function handleAddField() {
  const newField = {
    id: Date.now(),
    name: `field_${editableFields.length + 1}`,
    type: "text",
    label: `Yeni Alan ${editableFields.length + 1}`,
    confidence: 1,
    sample: null,
  };
  addField(newField);
  renderBuilder();
  renderFieldsList();
  updateOutputs();
}

// Drag & Drop Handlers
function handleDragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const targetIndex = parseInt(
    e.target.closest(".builder-card")?.dataset.index,
  );

  if (
    draggedIndex !== null &&
    targetIndex !== undefined &&
    draggedIndex !== targetIndex
  ) {
    reorderFields(draggedIndex, targetIndex);
    renderBuilder();
    renderFieldsList();
    updateOutputs();
  }
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  draggedIndex = null;
}

/**
 * Tüm çıktıları günceller (HTML, Zod, React, Vue, JSON)
 */
export function updateOutputs() {
  // Önizleme (sample değerlerle)
  formPreview.innerHTML = generatePreviewHTML(editableFields);

  // HTML & Zod (export için - değersiz)
  // Export formats
  htmlCode.textContent = generateHTMLFromFields(editableFields);
  zodCode.textContent = generateZodFromFields(editableFields);
  reactCode.textContent = generateReactComponent(editableFields);
  vueCode.textContent = generateVueComponent(editableFields);
  jsonCode.textContent = generateJSONSchema(editableFields);
}
