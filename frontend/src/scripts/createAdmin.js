// scripts/createAdmin.js
import 'dotenv/config'; // untuk memuat .env secara otomatis
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await db.execute(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    ["admin", "admin@gmail.com", hashedPassword, "admin"]
  );

  console.log("✅ Admin user created");
}

createAdmin();
