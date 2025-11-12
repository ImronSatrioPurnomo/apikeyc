const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2");

const app = express();

// Koneksi DB
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Saepul1212Imron1212@@!!",
  database: "apikeyc_db",
  port: 3305
});
db.connect((err) => {
  if (err) console.error("❌ Gagal konek DB:", err.message);
  else console.log("✅ Konek DB (port 3305)");
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Generate API key ===
app.post("/api/generate", (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  const apiKey = crypto.randomBytes(32).toString("hex");
  const formattedKey = `${name.toUpperCase()}-${apiKey}`;

  const sql = "INSERT INTO api_keys (name, api_key) VALUES (?, ?)";
  db.query(sql, [name.trim(), formattedKey], (err) => {
    if (err) {
      console.error("❌ Gagal simpan API key:", err);
      return res.status(500).json({ error: "Database error while saving key" });
    }

    res.json({
      message: `API Key generated successfully for ${name}`,
      apiKey: formattedKey,
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// === Validate API key ===
app.post("/api/validate", (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ valid: false, error: "API key is required" });
  }

  const sql = "SELECT * FROM api_keys WHERE api_key = ?";
  db.query(sql, [apiKey], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ valid: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ valid: false, message: "❌ Invalid API Key" });
    }

    const row = results[0];
    res.json({
      valid: true,
      message: `✅ Valid API key for ${row.name}`,
      issuedAt: row.created_at,
    });
  });
});

// === Get all keys (debugging / Postman) ===
app.get("/api/keys", (req, res) => {
  db.query("SELECT * FROM api_keys ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch keys" });
    }
    res.json(results);
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
