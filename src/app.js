const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const formRoutes = require("./routes/form.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Static dosyalar (public klasörü)
app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/form", formRoutes);

// Basit error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err?.message ?? "Unknown error",
  });
});

module.exports = app;
