"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./product.css";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error('Failed to fetch products');
        
        const data = await res.json();
        
        // Normalize product data to always use first image as thumbnail
        const normalizedProducts = data.map(product => {
          // Handle both array and single image cases
          let thumbnail = "/placeholder.jpg";
          if (Array.isArray(product.images) && product.images.length > 0) {
            thumbnail = product.images[0];
          } else if (product.image) {
            thumbnail = product.image;
          }
          
          return {
            ...product,
            thumbnail
          };
        });
        
        setProducts(normalizedProducts);
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateToProductDetail = (productId) => {
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <section className="products">
        <div className="container">
          <h2 className="section-title">Produk Terbaru</h2>
          <div className="loading-products">Memuat produk...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="products">
      <div className="container">
        <h2 className="section-title">Produk Terbaru</h2>

        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div 
                className="product-card" 
                key={product.id}
                onClick={() => navigateToProductDetail(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                  <div className="product-overlay">
                    <button 
                      className="quick-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToProductDetail(product.id);
                      }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-price">
                    Rp {Number(product.price).toLocaleString()}
                  </p>
                  {/* <button 
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic here
                      alert(`${product.name} ditambahkan ke keranjang`);
                    }}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Tambah ke Keranjang
                  </button> */}
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">Tidak ada produk tersedia</div>
          )}
        </div>
      </div>
    </section>
  );
}