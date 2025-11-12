const express = require("express");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// === Setup database ===
const dbPath = path.join(__dirname, "apikeys.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Database error:", err.message);
  else console.log("✅ Connected to SQLite database");
});

// Buat tabel kalau belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Route utama ===
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// === Generate API key ===
app.post("/api/generate", (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  const apiKey = crypto.randomBytes(32).toString("hex");
  const formattedKey = `${name.toUpperCase()}-${apiKey}`;

  db.run(
    "INSERT INTO api_keys (name, api_key) VALUES (?, ?)",
    [name.trim(), formattedKey],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save API key to database" });
      }

      res.json({
        message: `API Key generated successfully for ${name}`,
        apiKey: formattedKey,
      });
    }
  );
});

// === Validate API key ===
app.post("/api/validate", (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ valid: false, error: "API key is required" });
  }

  db.get("SELECT * FROM api_keys WHERE api_key = ?", [apiKey], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ valid: false, message: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ valid: false, message: "❌ Invalid API Key" });
    }

    res.json({
      valid: true,
      message: `✅ Valid API key for ${row.name}`,
      issuedAt: row.created_at,
    });
  });
});

// === Get all keys (for debugging / Postman) ===
app.get("/api/keys", (req, res) => {
  db.all("SELECT * FROM api_keys", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch keys" });
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
