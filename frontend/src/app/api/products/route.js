import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createConnection } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const formData = await req.formData();
  const name = formData.get("name");
  const stock = formData.get("stock");
  const price = formData.get("price");
  const description = formData.get("description") || ""; // Get description or default to empty string

  // Process up to 3 images
  const imagePaths = [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    // Process each image (up to 3)
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`image${i}`);
      if (file && typeof file !== "string") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = path.extname(file.name);
        const filename = `${uuidv4()}${fileExt}`;
        const filepath = path.join(uploadDir, filename);
        
        await fs.promises.writeFile(filepath, buffer);
        imagePaths.push(`/uploads/${filename}`);
      }
    }

    // Convert image array to JSON string for database storage
    const imagesJson = JSON.stringify(imagePaths);

    // Save to DB
    const db = await createConnection();
    await db.execute(
      "INSERT INTO products (name, stock, price, description, images) VALUES (?, ?, ?, ?, ?)",
      [name, stock, price, description, imagesJson]
    );

    return NextResponse.json({ 
      success: true,
      message: "Produk berhasil ditambahkan" 
    });
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    // Cleanup uploaded files if error occurs
    imagePaths.forEach(imagePath => {
      const filepath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });
    return NextResponse.json(
      { 
        success: false,
        message: "Gagal menambahkan produk",
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  const db = await createConnection();
  try {
    const [rows] = await db.execute("SELECT * FROM products");
    
    // Ensure images is always an array and description exists
    const products = rows.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      description: product.description || ""
    }));
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Gagal mengambil produk:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Gagal mengambil produk",
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}