/**
 * API Module
 * Backend ile iletişim
 */

const API_URL = "/api/form/from-text";

/**
 * Metni API'ye gönderir ve form verisi alır
 * @param {string} text - Analiz edilecek metin
 * @returns {Promise<Object>} - API yanıtı
 * @throws {Error} - API hatası
 */
export async function fetchFormFromText(text) {
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

  return response.json();
}
