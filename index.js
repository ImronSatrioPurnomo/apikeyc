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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
