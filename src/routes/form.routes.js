const express = require("express");
const { z } = require("zod");

const { buildFormFromText } = require("../services/formBuilder.service");

const router = express.Router();

const BodySchema = z.object({
  text: z.string().min(1, "text is required").max(10000, "text too long"),
});

router.post("/from-text", (req, res, next) => {
  try {
    const { text } = BodySchema.parse(req.body);
    const result = buildFormFromText(text);

    // format query parametresi: html, zod veya boş (hepsi)
    const format = req.query.format;

    if (format === "html") {
      return res.type("text/html").send(result.schemas.html);
    }
    if (format === "zod") {
      return res.type("text/plain").send(result.schemas.zod);
    }

    // Varsayılan: tüm veriyi JSON olarak döndür
    res.json(result);
  } catch (err) {
    // Zod validation
    if (err?.name === "ZodError") {
      return res.status(400).json({
        error: "ValidationError",
        issues: err.issues,
      });
    }
    next(err);
  }
});

module.exports = router;
