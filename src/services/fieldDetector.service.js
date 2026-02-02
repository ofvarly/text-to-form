const emailRule = require("../rules/email.rule");
const phoneRule = require("../rules/phone.rule");
const priceRule = require("../rules/price.rule");
const dateRule = require("../rules/date.rule");
const nameRule = require("../rules/name.rule");

const RULES = [emailRule, phoneRule, priceRule, dateRule, nameRule];

function detectFields(text) {
  const detections = [];

  for (const rule of RULES) {
    const match = rule.match(text);
    if (!match) continue;

    detections.push({
      type: rule.type,
      name: rule.name,
      label: rule.label,
      inputType: rule.inputType,
      confidence: rule.confidence(text, match),
      sample: match?.value ?? match?.raw ?? null,
    });
  }

  return detections;
}

module.exports = { detectFields };
