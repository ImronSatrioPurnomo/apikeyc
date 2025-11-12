const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// === Setup koneksi MySQL ===
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Saepul1212Imron1212@@!!",
  database: "apikeyc_db",
  port: 3305
});

db.connect((err) => {
  if (err) {
    console.error("❌ Gagal konek ke database:", err.message);
  } else {
    console.log("✅ Terkoneksi ke MySQL database (port 3305)");
  }
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route utama
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
