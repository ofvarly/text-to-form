/**
 * Utils Module
 * Yardımcı fonksiyonlar
 */

/**
 * XSS koruması için HTML escape
 * @param {string} str - Escape edilecek string
 * @returns {string} - Güvenli string
 */
export function escapeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
