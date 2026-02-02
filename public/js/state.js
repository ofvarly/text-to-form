/**
 * State Module
 * Uygulamanın merkezi state'ini yönetir
 */

/**
 * Düzenlenebilir form alanları
 * Her eleman: { id, name, type, label, confidence, sample }
 */
export let editableFields = [];

/**
 * State'i günceller
 * @param {Array} newFields - Yeni field dizisi
 */
export function setEditableFields(newFields) {
  editableFields = newFields;
}

/**
 * State'e yeni field ekler
 * @param {Object} field - Eklenecek field
 */
export function addField(field) {
  editableFields.push(field);
}

/**
 * State'ten field siler
 * @param {number} id - Silinecek field'ın id'si
 */
export function removeField(id) {
  editableFields = editableFields.filter((f) => f.id !== id);
}

/**
 * State'teki bir field'ı günceller
 * @param {number} id - Güncellenecek field'ın id'si
 * @param {string} key - Güncellenecek property
 * @param {*} value - Yeni değer
 */
export function updateField(id, key, value) {
  const index = editableFields.findIndex((f) => f.id === id);
  if (index !== -1) {
    editableFields[index][key] = value;
  }
}

/**
 * İki field'ın yerini değiştirir (drag-drop için)
 * @param {number} fromIndex - Kaynak index
 * @param {number} toIndex - Hedef index
 */
export function reorderFields(fromIndex, toIndex) {
  const [item] = editableFields.splice(fromIndex, 1);
  editableFields.splice(toIndex, 0, item);
}

/**
 * Builder'daki type dropdown için seçenekler
 */
export const INPUT_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Telefon" },
  { value: "number", label: "Sayı" },
  { value: "date", label: "Tarih" },
  { value: "url", label: "URL" },
  { value: "password", label: "Şifre" },
];
