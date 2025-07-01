'use client';

import React, { useState } from 'react';
import './checkoutInfo.css';

export default function CheckoutBuyerInfo() {
  const [showForm, setShowForm] = useState(false);
  const [buyer, setBuyer] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBuyer(form);
    setShowForm(false);
  };

  return (
    <div className="buyer-info-box">
      <h3>Informasi Pembeli</h3>
      <hr />
      <div className="buyer-content">
        {buyer ? (
          <div>
            <p><strong>Nama:</strong> {buyer.name}</p>
            <p><strong>Alamat:</strong> {buyer.address}</p>
            <p><strong>No. Telepon:</strong> {buyer.phone}</p>
          </div>
        ) : (
          <p>Belum ada data</p>
        )}
        <button className="btn-ubah" onClick={() => setShowForm(true)}>Ubah</button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Edit Informasi Pembeli</h4>
            <form onSubmit={handleSubmit}>
              <label>Nama:</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />

              <label>Alamat:</label>
              <textarea name="address" value={form.address} onChange={handleChange} required />

              <label>No. Telepon:</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} required />

              <div className="modal-buttons">
                <button type="submit" className="btn-simpan">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-batal">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
