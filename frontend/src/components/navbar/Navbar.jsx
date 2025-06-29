"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./navbar.css"; // Atau '@/styles/navbar.css'

export default function Navbar() {
  const [user, setUser] = useState(null);

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

          <div className="search-bar">
            <input
              type="text"
              placeholder="Cari parfum favorit Anda..."
              className="search-input"
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="header-actions">
            <button className="cart-btn">
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
                      <Link href="/orders">Pesanan Saya</Link>
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
