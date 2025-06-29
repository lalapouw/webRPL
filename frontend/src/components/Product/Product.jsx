"use client";

import { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./product.css";

export default function Product() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="products">
      <div className="container">
        <h2 className="section-title">Produk Terbaru</h2>

        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div
                    className="product-placeholder"
                    style={{
                      background: "linear-gradient(135deg, #ddd, #aaa)",
                      height: "200px",
                    }}
                  ></div>
                )}
                <div className="product-overlay">
                  <button className="quick-view-btn">Lihat Cepat</button>
                </div>
              </div>

              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">
                  Rp {Number(product.price).toLocaleString()}
                </p>
                <button className="add-to-cart-btn">
                  <i className="fas fa-shopping-cart"></i>
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
