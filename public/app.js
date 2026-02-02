/**
 * Text-to-Form Frontend App
 */

const API_URL = "/api/form/from-text";

// DOM Elements
const inputText = document.getElementById("input-text");
const generateBtn = document.getElementById("generate-btn");
const resultsSection = document.getElementById("results");
const loadingSection = document.getElementById("loading");
const errorSection = document.getElementById("error");
const errorMessage = document.getElementById("error-message");

const fieldsList = document.getElementById("fields-list");
const formPreview = document.getElementById("form-preview");
const formReadonly = document.getElementById("form-readonly");
const htmlCode = document.getElementById("html-code");
const zodCode = document.getElementById("zod-code");

// Tab Handling
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`tab-${target}`).classList.add("active");
  });
});

// Copy Buttons
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const code = document.getElementById(targetId).textContent;

    navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.textContent;
      btn.textContent = "✅ Kopyalandı!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  });
});

// Generate Form
generateBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();

  if (!text) {
    showError("Lütfen bir metin girin.");
    return;
  }

  showLoading();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "API hatası");
    }

    const data = await response.json();
    displayResults(data);
  } catch (err) {
    showError(err.message);
  }
});

function showLoading() {
  resultsSection.style.display = "none";
  errorSection.style.display = "none";
  loadingSection.style.display = "block";
}

function showError(message) {
  loadingSection.style.display = "none";
  resultsSection.style.display = "none";
  errorSection.style.display = "block";
  errorMessage.textContent = message;
}

function displayResults(data) {
  loadingSection.style.display = "none";
  errorSection.style.display = "none";
  resultsSection.style.display = "block";

  // Fields List
  fieldsList.innerHTML = data.form.fields
    .map(
      (field) => `
    <div class="field-card">
      <div class="field-info">
        <span class="field-label">${escapeHTML(field.label)}</span>
        <span class="field-type">${field.type} • ${field.name}</span>
      </div>
      <div class="field-confidence">
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${field.confidence * 100}%"></div>
        </div>
        <span class="confidence-value">${Math.round(field.confidence * 100)}%</span>
      </div>
    </div>
  `,
    )
    .join("");

  // Form Preview
  formPreview.innerHTML = data.schemas.html;

  // Readonly Preview (with sample values & disabled)
  formReadonly.innerHTML = generateReadonlyHTML(data.form.fields);

  // Code Blocks
  htmlCode.textContent = data.schemas.html;
  zodCode.textContent = data.schemas.zod;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Generate readonly HTML with sample values filled in
function generateReadonlyHTML(fields) {
  if (!fields || fields.length === 0) {
    return "<p>Tespit edilen alan yok</p>";
  }

  const inputLines = fields.map((field) => {
    const sampleValue = field.sample || "";
    // Readonly'de sample'ı göstermek için text kullan (number inputa "1500 TL" yazılamaz)
    return `<div class="form-group">
    <label for="${field.name}-readonly">${escapeHTML(field.label)}</label>
    <input type=${field.type} id="${field.name}-readonly" name="${field.name}" value="${escapeHTML(sampleValue)}" disabled>
  </div>`;
  });

  return `<form>
${inputLines.join("\n")}
  <button type="button" disabled>Gönder</button>
</form>`;
}

// Enter key to generate
inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    generateBtn.click();
  }
});
