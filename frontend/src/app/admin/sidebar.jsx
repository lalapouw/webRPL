"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/perfume.png" alt="Parfum Logo" />
        <span>Parfumy</span>
      </div>
      <ul className="menu">
        <li className={pathname === "/admin" ? "active" : ""}>
          <Link href="/admin">
            <i className="fas fa-palette"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={pathname === "/admin/users" ? "active" : ""}>
          <Link href="/admin/users">
            <i className="fas fa-user"></i>
            <span>User</span>
          </Link>
        </li>
        <li className={pathname === "/admin/orders" ? "active" : ""}>
          <Link href="/admin/orders">
            <i className="fas fa-receipt"></i>
            <span>Orders</span>
          </Link>
        </li>
        <li className={pathname === "/admin/manage-products" ? "active" : ""}>
          <Link href="/admin/manage-products">
            <i className="fas fa-clipboard-list"></i>
            <span>Kelola Produk</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}