// app/login/page.jsx (Next.js App Router)
"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/style_log.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Kirim ke API login
    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login gagal");
        }

        // ✅ Simpan session / redirect
        console.log("Login berhasil:", data);
        // redirect ke dashboard
        // router.push("/dashboard");

      } catch (err) {
        alert(err.message);
      }
    };

  };

  return (
    <div className="container">
      <div className="logo">
        <Image src="/img/perfume.png" alt="Logo Parfum" width={100} height={100} />
      </div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            type="text"
            name="username"
            placeholder="Username/Email"
            required
            value={form.username}
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
          Belum Punya Akun? <Link href="/register">Register</Link>
        </p>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
