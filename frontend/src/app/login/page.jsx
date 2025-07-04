"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./style_log.css"; // pastikan path sesuai
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType?.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.message || "Login gagal");

      // Simpan user ke localStorage (opsional)
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirect berdasarkan role
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <div className="logo">
        <Image src="/perfume.png" alt="Logo Parfum" width={100} height={100} />
      </div>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <p className="register-link">
          Belum punya akun? <Link href="/register">Daftar di sini</Link>
        </p>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
