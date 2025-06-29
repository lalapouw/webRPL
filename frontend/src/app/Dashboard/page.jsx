"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./dashboard.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "@/components/Navbar/Navbar";


export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formProduk, setFormProduk] = useState({
    name: "",
    stock: "",
    price: "",
    image: ""
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Gagal mengambil data produk:", err);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormProduk({ ...formProduk, [name]: value });
  };

  const handleSubmitProduk = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", formProduk.name);
    formData.append("stock", formProduk.stock);
    formData.append("price", formProduk.price);
    formData.append("image", selectedFile); // dari <input type="file" />

    try {
      const res = await fetch(
        editMode ? `/api/products/${editingId}` : "/api/products",
        {
          method: editMode ? "PUT" : "POST",
          body: formData,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menyimpan produk");

      alert(editMode ? "Produk berhasil diubah" : "Produk berhasil ditambahkan");
      setShowModal(false);
      setEditMode(false);
      setEditingId(null);
      setFormProduk({ name: "", stock: "", price: "", image: "" });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      // Hapus dari state
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <Navbar />
      <div className="judul">
        <h1>Kelola Produk</h1>
        <button onClick={() => setShowModal(true)}>+ Tambah Produk</button>
      </div>

      <div className="product-table">
        <table>
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Stock</th>
              <th>Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><img
                    src={p.image}
                    alt={p.name}
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                  />{p.name}</td>
                <td>{p.stock}</td>
                <td>Rp {p.price.toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => {
                      setFormProduk({
                        name: p.name,
                        stock: p.stock,
                        price: p.price,
                        image: p.image,
                      });
                      setEditingId(p.id);
                      setEditMode(true);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>

                  <button onClick={() => handleDelete(p.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Tambah Produk</h2>
            <form onSubmit={handleSubmitProduk}>
              <input
                type="text"
                name="name"
                placeholder="Nama Produk"
                onChange={handleInputChange}
                value={formProduk.name}
              />
              <input
                type="number"
                name="stock"
                placeholder="Stok"
                onChange={handleInputChange}
                value={formProduk.stock}
              />
              <input
                type="number"
                name="price"
                placeholder="Harga"
                onChange={handleInputChange}
                value={formProduk.price}
              />

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange} // ← pakai ini
              />

              <div className="modal-buttons">
                <button type="submit">Simpan</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormProduk({ name: "", stock: "", price: "", image: "" });
                    setSelectedFile(null);
                    setEditMode(false);
                    setEditingId(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
