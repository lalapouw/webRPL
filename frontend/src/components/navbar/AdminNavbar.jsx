"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./admin-navbar.css";

export default function AdminNavbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard Admin";
    if (pathname === "/admin/users") return "User";
    if (pathname === "/admin/orders") return "Orders";
    if (pathname === "/admin/manage-products") return "Kelola Produk";
    return "Admin Panel";
  };

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
    window.location.href = "/login";
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-logo">
          <h2>{getPageTitle()}</h2>
        </div>

        <div className="admin-actions">
          <div className="admin-dropdown">
            <button className="user-btn" aria-label="User Menu">
              <i className="fas fa-user"></i>
            </button>
            <div className="admin-dropdown-content">
              {user?.role === "admin" && (
                <a href="#" onClick={handleLogout}>
                  Logout
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
