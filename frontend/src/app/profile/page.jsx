"use client";
import React, { useEffect, useState } from "react";
import "./style_user.css";
import Navbar from "@/components/Navbar/Navbar";

export default function UserProfile() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const error = await res.json();
          console.error("Server error:", error.message || "Unknown");
        } else {
          console.error("Server error: Respon bukan JSON");
        }
        return;
      }

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setForm({
          name: data.name ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          photo: data.photo ?? "",
        });
      } else {
        console.warn("Respon bukan JSON");
      }
    } catch (err) {
      console.error("Gagal ambil profile:", err);
    }
  };

  // Fetch data saat load pertama kali
  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input teks
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input file
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    if (selectedFile) {
      formData.append("photo", selectedFile);
    }

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        body: formData,
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        if (contentType?.includes("application/json")) {
          const error = await res.json();
          throw new Error(error.message || "Gagal menyimpan profil");
        } else {
          throw new Error("Gagal menyimpan profil (bukan JSON)");
        }
      }

      if (contentType?.includes("application/json")) {
        const result = await res.json();
        alert(result.message || "Profil berhasil diperbarui");

        // ✅ Ambil data terbaru agar gambar dan data diperbarui
        fetchProfile();
        setSelectedFile(null); // Reset file
      } else {
        alert("Profil berhasil diperbarui");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="profile-container">
          <h1>Profil Saya</h1>
          <form onSubmit={handleSubmit} className="profile-content">
            <div className="form-section">
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nama" />
              <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Nomor Telp" />
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Alamat" />
              <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
              <button className="save-button" type="submit">Simpan</button>
            </div>

            <div className="profile-picture">
              <div className="">
                {form.photo ? (
                  <img className="foto-profile"
                    src={form.photo.startsWith("/") ? form.photo : `/uploads/profile/${form.photo}`}
                    alt="Profile"
                    style={{ width: "180px", borderRadius: "50%" }}
                  />
                ) : (
                  <div className="avatar-placeholder">No Foto</div>
                )}
              </div>
              <div className="username">{form.username}</div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
