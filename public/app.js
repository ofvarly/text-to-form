/**
 * Text-to-Form Frontend App
 * Ana entry point - tüm modülleri birleştirir
 */

import { setEditableFields } from "./js/state.js";
import { fetchFormFromText } from "./js/api.js";
import {
  initTabs,
  initCopyButtons,
  showLoading,
  showResults,
  showError,
} from "./js/ui.js";
import {
  initBuilder,
  renderFieldsList,
  renderBuilder,
  updateOutputs,
} from "./js/builder.js";

// DOM Elements
const inputText = document.getElementById("input-text");
const generateBtn = document.getElementById("generate-btn");

/**
 * Uygulama başlatıcı
 */
function init() {
  // UI modüllerini başlat
  initTabs();
  initCopyButtons();
  initBuilder();

  // Form generate butonu
  generateBtn.addEventListener("click", handleGenerate);

  // Ctrl+Enter shortcut
  inputText.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      generateBtn.click();
    }
  });
}

/**
 * Form generate handler
 */
async function handleGenerate() {
  const text = inputText.value.trim();

  if (!text) {
    showError("Lütfen bir metin girin.");
    return;
  }

  showLoading();

  try {
    const data = await fetchFormFromText(text);

    // State'i güncelle
    const fieldsWithId = data.form.fields.map((f, i) => ({
      id: Date.now() + i,
      ...f,
    }));
    setEditableFields(fieldsWithId);

    // UI'ı güncelle
    showResults();
    renderFieldsList();
    renderBuilder();
    updateOutputs();
  } catch (err) {
    showError(err.message);
  }
}

// Uygulama başlat
init();
