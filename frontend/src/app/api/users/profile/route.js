import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import formidable from "formidable";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

// PUT: Update profile
export async function PUT(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type");

  const form = formidable({ multiples: false });
  const { fields, files } = await new Promise((resolve, reject) => {
    const stream = Readable.fromWeb(req.body);
    stream.headers = {
      "content-type": contentType,
      "content-length": req.headers.get("content-length") || "0",
    };
    form.parse(stream, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const name = fields.name?.[0] ?? null;
  const username = fields.username?.[0] ?? null;
  const email = fields.email?.[0] ?? null;
  const phone = fields.phone?.[0] ?? null;
  const address = fields.address?.[0] ?? null;
  const imageFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
  let photoPath = null;

  if (imageFile && imageFile.filepath && imageFile.originalFilename) {
    const fileExt = path.extname(imageFile.originalFilename);
    const filename = `${userId}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profile");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, await fs.promises.readFile(imageFile.filepath));
    photoPath = `/uploads/profile/${filename}`;
  }

  try {
    const updateFields = [];
    const values = [];

    if (name !== null) updateFields.push("name = ?"), values.push(name);
    if (username !== null) updateFields.push("username = ?"), values.push(username);
    if (email !== null) updateFields.push("email = ?"), values.push(email);
    if (phone !== null) updateFields.push("phone = ?"), values.push(phone);
    if (address !== null) updateFields.push("address = ?"), values.push(address);
    if (photoPath !== null) updateFields.push("photo = ?"), values.push(photoPath);

    if (updateFields.length > 0) {
      values.push(userId);
      await pool.execute(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        values
      );
    }

    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Gagal update profil:", err);
    return NextResponse.json(
      { message: "Gagal menyimpan perubahan" },
      { status: 500 }
    );
  }
}

// GET: Ambil data profil user
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT name, username, email, phone, address, photo FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("❌ Gagal ambil profil:", err);
    return NextResponse.json({ message: "Gagal ambil profil" }, { status: 500 });
  }
}
