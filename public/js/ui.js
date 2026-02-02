/**
 * UI Module
 * Tab navigation, loading, error, copy butonları
 */

/**
 * DOM Element referansları
 */
const resultsSection = document.getElementById("results");
const loadingSection = document.getElementById("loading");
const errorSection = document.getElementById("error");
const errorMessage = document.getElementById("error-message");

/**
 * Tab sistemi başlatıcı
 */
export function initTabs() {
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
}

/**
 * Copy butonları başlatıcı
 */
export function initCopyButtons() {
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
}

/**
 * Loading state'i gösterir
 */
export function showLoading() {
  resultsSection.style.display = "none";
  errorSection.style.display = "none";
  loadingSection.style.display = "block";
}

/**
 * Results section'ı gösterir
 */
export function showResults() {
  loadingSection.style.display = "none";
  errorSection.style.display = "none";
  resultsSection.style.display = "block";
}

/**
 * Hata mesajı gösterir
 * @param {string} message - Hata mesajı
 */
export function showError(message) {
  loadingSection.style.display = "none";
  resultsSection.style.display = "none";
  errorSection.style.display = "block";
  errorMessage.textContent = message;
}
