"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./navbar.css"; // Atau '@/styles/navbar.css'

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search triggered:", searchKeyword);
    if (searchKeyword.trim() !== "") {
      router.push(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // Redirect setelah logout
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link href="/"><img src="/perfume.png" alt="" /></Link>
          </div>

          <form className="search-bar"  onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Cari parfum favorit Anda..."
              className="search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button className="search-btn" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>

          <div className="header-actions">
            <button
              className="cart-btn"
              onClick={() => router.push('/cart')}
              aria-label="Lihat Keranjang"
            >
              <i className="fas fa-shopping-cart"></i>
            </button>

            <div className="dropdown">
              <button className="user-btn">
                <i className="fas fa-user"></i>
              </button>
              <div className="dropdown-content">
                {user ? (
                  user.role === "admin" ? (
                    <>
                      <Link href="/Dashboard">Kelola Produk</Link>
                      <a href="#" onClick={handleLogout}>Logout</a>
                    </>
                  ) : (
                    <>
                      <Link href="/profile">Profil Saya</Link>
                      <Link href="/my-orders">Pesanan Saya</Link>
                      <a href="#" onClick={handleLogout}>Logout</a>
                    </>
                  )
                ) : (
                  <>
                    <Link href="/login">Login</Link>
                    <Link href="/register">Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
