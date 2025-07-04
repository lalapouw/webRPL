"use client";

import { useState, useEffect } from "react";
import "./dashboard.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

  const brandOptions = [
    { name: "HMNS", slug: "hmns" },
    { name: "SAFF & Co.", slug: "saff-co" },
    { name: "My Konos", slug: "my-konos" },
    { name: "ONIX", slug: "onix" },
    { name: "Lilith & Eve", slug: "lilith-eve" },
    { name: "Carl & Claire", slug: "carl-claire" },
    { name: "Hint", slug: "hint" }
  ];

export default function AdminProductPage() {
  const [formProduk, setFormProduk] = useState({
    name: "",
    stock: "",
    price: "",
    description: "",
    brand: "",
    brand_slug: ""
  });

  const [products, setProducts] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      
      const normalizedProducts = data.map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : 
               product.image ? [product.image] : [],
        description: product.description || "" // Ensure description exists
      }));
      
      setProducts(normalizedProducts);
    } catch (err) {
      setError(err.message);
      console.error("Gagal mengambil data produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormProduk(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormProduk({ ...formProduk, [name]: value });
  };

  const handleSubmitProduk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", formProduk.name);
    formData.append("stock", formProduk.stock);
    formData.append("price", formProduk.price);
    formData.append("description", formProduk.description); // Added description
    formData.append("brand", formProduk.brand);
    formData.append("brand_slug", formProduk.brand_slug);



    if (editMode) {
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("deletedImages", JSON.stringify(deletedImages));
    }

    selectedFiles.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });

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
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingId(null);
    setFormProduk({ 
      name: "", 
      stock: "", 
      price: "", 
      description: "",
      brand: "",
      brand_slug: ""
    });    
    setSelectedFiles([]);
    setExistingImages([]);
    setDeletedImages([]);
    setError(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("Unggah maksimal 3 gambar");
      return;
    }
    setSelectedFiles(files);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error(await res.text());

      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (indexToRemove) => {
    const imageToDelete = existingImages[indexToRemove];
    setDeletedImages([...deletedImages, imageToDelete]);
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
  };

  const removeSelectedFile = (indexToRemove) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const ProductImage = ({ src, alt, ...props }) => {
    const [imgError, setImgError] = useState(false);
    
    if (imgError || !src) {
      return (
        <div 
          className="image-placeholder" 
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px"
          }}
          {...props}
        >
          <span style={{ fontSize: "10px" }}>No Image</span>
        </div>
      );
    }



    
    return (
      <img 
        src={src} 
        alt={alt} 
        onError={() => setImgError(true)}
        style={{ 
          width: "60px", 
          height: "60px", 
          objectFit: "cover", 
          borderRadius: "8px" 
        }}
        {...props}
      />
    );
  };

  return (
    <div className="admin-dashboard">
      
      <div className="judul">
        <h1>Kelola Produk</h1>
        <button 
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          {loading ? "Loading..." : "+ Tambah Produk"}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: "red", margin: "10px 0" }}>
          {error}
        </div>
      )}

      <div className="product-table">
        {loading && !products.length ? (
          <div>Loading products...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama Produk</th>
                <th>Brand</th>
                <th>Deskripsi</th>
                <th>Stock</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const productImages = Array.isArray(p.images) ? p.images : [];
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {productImages.length > 0 ? (
                          productImages.map((img, idx) => (
                            <ProductImage
                              key={idx}
                              src={img}
                              alt={`${p.name} ${idx}`}
                            />
                          ))
                        ) : (
                          <ProductImage alt="No image" />
                        )}
                      </div>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.brand}</td>
                    <td className="description-cell">
                      {p.description.length > 50 
                        ? `${p.description.substring(0, 50)}...` 
                        : p.description}
                    </td>
                    <td>{p.stock}</td>
                    <td>Rp {p.price.toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => {
                          setFormProduk({
                            name: p.name,
                            stock: p.stock,
                            price: p.price,
                            description: p.description,
                            brand: p.brand,
                            brand_slug: p.brand_slug,
                          });
                          setExistingImages(productImages);
                          setEditingId(p.id);
                          setEditMode(true);
                          setShowModal(true);
                        }}
                        disabled={loading} className="edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        disabled={loading} className="delete-button"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editMode ? "Edit Produk" : "Tambah Produk"}</h2>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            <form onSubmit={handleSubmitProduk}>
              <input
                type="text"
                name="name"
                placeholder="Nama Produk"
                onChange={handleInputChange}
                value={formProduk.name}
                required
                disabled={loading}
              />

              <select
                name="brand"
                value={formProduk.brand}
                onChange={(e) => {
                  const selected = brandOptions.find(b => b.name === e.target.value);
                  setFormProduk(prev => ({
                    ...prev,
                    brand: selected.name,
                    brand_slug: selected.slug
                  }));
                }}
                required
                disabled={loading}
              >
                <option value="">Pilih Brand</option>
                {brandOptions.map((b, i) => (
                  <option key={i} value={b.name}>{b.name}</option>
                ))}
              </select>
              <input
                type="number"
                name="stock"
                placeholder="Stok"
                onChange={handleInputChange}
                value={formProduk.stock}
                required
                min="0"
                disabled={loading}
              />
              <input
                type="number"
                name="price"
                placeholder="Harga"
                onChange={handleInputChange}
                value={formProduk.price}
                required
                min="0"
                disabled={loading}
              />

              <textarea
                name="description"
                placeholder="Deskripsi Produk"
                onChange={handleTextareaChange}
                value={formProduk.description}
                rows="4"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />

              <div className="image-preview" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} style={{ position: 'relative' }}>
                    <ProductImage
                      src={img}
                      alt={`Existing ${idx}`}
                      style={{ width: "60px", height: "60px" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {selectedFiles.map((file, idx) => (
                  <div key={`new-${idx}`} style={{ position: 'relative' }}>
                    <ProductImage
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx}`}
                      style={{ width: "60px", height: "60px" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={loading}
              />
              <small>Maksimal 3 gambar (total termasuk yang sudah ada)</small>

              <div className="modal-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
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