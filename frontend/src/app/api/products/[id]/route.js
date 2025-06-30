import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export async function GET(request, { params }) {
  try {
    // Correct way to access params in Next.js 13+ API routes
    const id = params?.id; 
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const db = await createConnection();
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Parse product data safely
    const product = rows[0];
    let images = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch (e) {
      console.error("Error parsing images:", e);
    }

    return NextResponse.json({
      id: product.id,
      name: product.name || "",
      price: product.price || 0,
      stock: product.stock || 0,
      description: product.description || "",
      images: images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    });

  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(request, { params }) {
  const { id } = params;
  const db = await createConnection();

  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const stock = formData.get('stock');
    const price = formData.get('price');
    const description = formData.get('description') || '';
    const existingImages = JSON.parse(formData.get('existingImages') || '[]');
    const deletedImages = JSON.parse(formData.get('deletedImages') || '[]');

    // Process new images
    const newImages = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process up to 3 new images (image0, image1, image2)
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`image${i}`);
      if (file && file.name) {  // Check if file exists and has a name
        const fileExt = path.extname(file.name);
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, filename);
        
        const buffer = await file.arrayBuffer();
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        newImages.push(`/uploads/${filename}`);
      }
    }

    // Delete removed images
    for (const imgPath of deletedImages) {
      const fullPath = path.join(process.cwd(), 'public', imgPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Combine kept existing images with new images
    const updatedImages = existingImages.filter(img => !deletedImages.includes(img)).concat(newImages);

    // Update product in database
    await db.execute(
      "UPDATE products SET name = ?, stock = ?, price = ?, description = ?, images = ? WHERE id = ?",
      [name, stock, price, description, JSON.stringify(updatedImages), id]
    );

    // Return updated product
    const [updatedProduct] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    
    return NextResponse.json({
      success: true,
      message: "Produk berhasil diupdate",
      product: {
        ...updatedProduct[0],
        images: updatedProduct[0].images ? JSON.parse(updatedProduct[0].images) : []
      }
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Gagal update produk", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  const db = await createConnection();
  const { id } = params;

  try {
    // First get the product to delete its images
    const [product] = await db.execute("SELECT images FROM products WHERE id = ?", [id]);
    
    if (product.length > 0) {
      let images = [];
      try {
        images = product[0].images ? JSON.parse(product[0].images) : [];
      } catch (e) {
        console.error("Error parsing images JSON:", e);
        images = [];
      }
      
      // Delete associated images
      images.forEach(imagePath => {
        const filepath = path.join(process.cwd(), "public", imagePath);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      });
    }

    // Then delete the product
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ 
      success: true,
      message: "Produk berhasil dihapus" 
    });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Gagal menghapus produk",
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}