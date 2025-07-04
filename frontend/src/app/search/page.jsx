'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './search.css';
import Navbar from '@/components/Navbar/Navbar';

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") || '';
  const keyword = searchParams.get("keyword") || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "/api/products/search";

        if (brand) {
          url += `?brand=${encodeURIComponent(brand)}`;
        } else if (keyword) {
          url += `?keyword=${encodeURIComponent(keyword)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brand, keyword]);

  return (
    <>
      <Navbar />
      <section className="products">
        <h4 className="section-title">
          Hasil Pencarian: "{brand || keyword}"
        </h4>
        {loading ? (
          <div className="loading-products">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="no-products">Tidak ada produk ditemukan.</div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="product-card">
                <div className="product-image">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} />
                  ) : (
                    <div className="product-placeholder">Tidak ada gambar</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{p.name}</h3>
                  <div className="product-price">
                    Rp{Number(p.price).toLocaleString("id-ID")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
