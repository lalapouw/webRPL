"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style_regis.css"; // Ganti sesuai path CSS-mu
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Register form submitted", form);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registrasi gagal");
        return;
      }

      alert("Registrasi berhasil!");
      // Optional redirect:
      // router.push("/login");

    } catch (err) {
      console.error("Error saat register:", err);
      alert("Terjadi kesalahan server");
    }
  };


  return (
    <div className="container">
      <div className="logo">
        <Image src="/perfume.png" alt="Logo Parfume" width={100} height={100} />
      </div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <i className="fas fa-envelope"></i>
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
        <p className="login-link">
          Sudah Punya Akun? <Link href="/login">Login</Link>
        </p>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
