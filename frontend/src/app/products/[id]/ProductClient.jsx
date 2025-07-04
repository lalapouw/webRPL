// app/products/[id]/ProductClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './product-detail.css'; // Regular CSS import

export default function ProductClient({ productId }) {
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Gagal mengambil produk');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

const selectImage = (index) => setCurrentImageIndex(index);
  const nextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };
  const prevImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const addToCart = async () => {
  await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity }),
      headers: { 'Content-Type': 'application/json' },
  });
  alert("Berhasil ditambahkan ke keranjang!");
  };

  const buyNow = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",       // kosong dulu
          address: "",
          phone: "",
          directBuy: true,
          productId: product.id,
          quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan order");

      // Redirect ke halaman checkout setelah berhasil
      router.push("/checkout");
    } catch (err) {
      console.error("❌ Gagal beli sekarang:", err.message);
      alert("Gagal melakukan pembelian langsung: " + err.message);
    }
  };


if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Memuat produk...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Gagal memuat produk: {error}</p>
        <button onClick={() => router.back()} className="back-button">
          Kembali
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-container">
        <p>Produk tidak ditemukan</p>
        <button onClick={goBack} className="back-button">
          Kembali
        </button>
      </div>
    );
  }

  return (
  <div>
    <div className="product-detail-container">
      
      <div className="product-header">
        <button className="back-button" onClick={() => router.back()} aria-label="Kembali">
          ←
        </button>
      </div>

      <div className="product-content">
        <div className="image-gallery">
          {product.images?.length > 0 ? (
            <>
              <div className="main-image-container">
                <button 
                  className="nav-button prev-button" 
                  onClick={prevImage}
                  aria-label="Gambar sebelumnya"
                  disabled={product.images.length <= 1}
                >
                  ‹
                </button>
                <img
                  src={product.images[currentImageIndex]}
                  alt={`${product.name} - Gambar ${currentImageIndex + 1}`}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <button 
                  className="nav-button next-button" 
                  onClick={nextImage}
                  aria-label="Gambar berikutnya"
                  disabled={product.images.length <= 1}
                >
                  ›
                </button>
              </div>

              {product.images.length > 1 && (
                <div className="thumbnail-container">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={() => selectImage(idx)}
                      aria-label={`Lihat gambar ${idx + 1}`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-thumb.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="image-placeholder">
              <img
                src="/images/placeholder.jpg"
                alt="Produk tanpa gambar"
                className="product-image"
              />
            </div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">
            Rp {Number(product.price).toLocaleString("id-ID", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>

          <div className="section-title">Deskripsi</div>
          <p className="product-description">
            {product.description || "Tidak ada deskripsi produk"}
          </p>

          <div className="stock-info">
            Stok: {product.stock > 0 ? product.stock : "Habis"}
          </div>

          <div className="quantity-controls">
            <div className="quantity-selector">
              <button 
                className="quantity-button decrease" 
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Kurangi jumlah"
              >
                -
              </button>
              <input
                type="number"
                className="quantity-input"
                value={quantity}
                min="1"
                max={product.stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(product.stock, value)));
                }}
                aria-label="Jumlah produk"
              />
              <button 
                className="quantity-button increase" 
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="cart-button" 
              onClick={addToCart}
              disabled={product.stock <= 0}
              aria-label="Tambahkan ke keranjang"
            >
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="m1 1 4 4 5.5 11h8.5a2 2 0 0 0 2-1.73L23 6H6"></path>
              </svg>
              {product.stock > 0 ? "Masukkan Keranjang" : "Stok Habis"}
            </button>
            {/* <button 
              className="buy-button" 
              onClick={buyNow}
              disabled={product.stock <= 0}
              aria-label="Beli sekarang"
            >
              Beli Sekarang
            </button> */}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}