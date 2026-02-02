/**
 * ==============================================================
 * FIELD DETECTOR SERVICE - Alan Tespit Servisi
 * ==============================================================
 *
 * Bu servis, tüm rule'ları çalıştırarak metinden form alanlarını tespit eder.
 *
 * AKIŞ:
 *   1. Tüm rule'ları sırayla dene
 *   2. Eşleşen her rule için detection objesi oluştur
 *   3. Tespit edilen alanları döndür
 *
 * KULLANIM:
 *   const { detectFields } = require('./fieldDetector.service');
 *   const fields = detectFields("Mail: test@example.com");
 *   // → [{ type: 'email', name: 'email', ... }]
 */

const emailRule = require("../rules/email.rule");
const phoneRule = require("../rules/phone.rule");
const priceRule = require("../rules/price.rule");
const dateRule = require("../rules/date.rule");
const nameRule = require("../rules/name.rule");

/**
 * Tüm aktif rule'ların listesi
 *
 * Sıralama önemli değil - her rule bağımsız çalışır.
 * Yeni rule eklemek için:
 *   1. rules/ klasörüne yeni.rule.js oluştur
 *   2. Buraya import et ve RULES dizisine ekle
 */
const RULES = [emailRule, phoneRule, priceRule, dateRule, nameRule];

/**
 * Metin içindeki tüm form alanlarını tespit eder
 *
 * @param {string} text - Analiz edilecek metin (normalize edilmiş olmalı)
 * @returns {Array<Object>} - Tespit edilen alanlar dizisi
 *
 * Her eleman şu yapıda:
 * {
 *   type: string,       // Rule tipi (email, phone, date...)
 *   name: string,       // HTML input name attribute
 *   label: string,      // Kullanıcıya gösterilecek label
 *   inputType: string,  // HTML input type (email, tel, text...)
 *   confidence: number, // 0-1 arası güven skoru
 *   sample: string|null // Metinden çıkarılan örnek değer
 * }
 *
 * Örnek:
 *   detectFields("Mail: a@b.com Tel: 0532 123 45 67")
 *   // → [
 *   //     { type: 'email', label: 'E-posta', sample: 'a@b.com', ... },
 *   //     { type: 'phone', label: 'Telefon', sample: '0532 123 45 67', ... }
 *   //   ]
 */
function detectFields(text) {
  const detections = [];

  // Her rule'ı sırayla dene
  for (const rule of RULES) {
    // Rule'un match fonksiyonunu çağır
    const match = rule.match(text);

    // Eşleşme yoksa sonraki rule'a geç
    if (!match) continue;

    // Eşleşme varsa detection objesi oluştur
    detections.push({
      type: rule.type, // email, phone, date...
      name: rule.name, // email, phone, appointmentDate...
      label: rule.label, // E-posta, Telefon, Randevu Tarihi...
      inputType: rule.inputType, // email, tel, date, text...

      // Güven skorunu hesapla (rule'un confidence fonksiyonu)
      confidence: rule.confidence(text, match),

      // Örnek değer: value varsa onu al, yoksa raw, yoksa null
      // value: parse edilmiş değer (örn: ISO tarih)
      // raw: ham regex eşleşmesi
      sample: match?.value ?? match?.raw ?? null,
    });
  }

  return detections;
}

module.exports = { detectFields };
