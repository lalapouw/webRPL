'use client';

import React, { useEffect, useState } from 'react';
import './style_check.css';
import Navbar from '@/components/Navbar/Navbar';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const router = useRouter();


  const searchParams = useSearchParams();
  const ids = searchParams.getAll('ids');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat pesanan');

      setMessage('✅ Pesanan berhasil dibuat!');
      setShowModal(false);
      setForm({ name: '', address: '', phone: '' });
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Gagal checkout');

      alert('✅ Checkout berhasil!');
      router.push('/my-orders'); // atau halaman sukses lainnya

    } catch (err) {
      console.error('❌ Checkout error:', err);
      alert(`Gagal: ${err.message}`);
    }
  };



  useEffect(() => {
    const ids = new URLSearchParams(window.location.search).getAll('ids'); // Ambil langsung dari URL

    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Gagal ambil data pembeli');
        const data = await res.json();
        setForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
        });
        setIsEdit(true);
      } catch (err) {
        console.error('❌ Error ambil pembeli:', err.message);
      }
    };

    const fetchSelectedProducts = async () => {
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        const filtered = data.filter(item => ids.includes(item.id.toString()));
        setSelectedProducts(filtered);
      } catch (err) {
        console.error("Gagal ambil produk terpilih", err);
      }
    };

    fetchOrder();
    fetchSelectedProducts();
  }, []); // Kosongkan dependency supaya tidak looping

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>

        <main className="checkout-container">
          {/* LEFT: Informasi Pembeli */}
          <section className="left-section">
            <div className="alamat-box">
              <h3>Informasi Pembeli</h3>
              <hr />
              {form.name || form.address || form.phone ? (
                <div className="alamat-content">
                  <p>Nama: {form.name}</p>
                  <p>Alamat: {form.address}</p>
                  <p>No. Telepon: {form.phone}</p>
                </div>
              ) : (
                <p>Belum ada data</p>
              )}
              <button onClick={() => setShowModal(true)} className='ubah-button'>Ubah</button>
            </div>

            {/* Modal Pop-up */}
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Ubah Informasi Pembeli</h3>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <textarea
                      name="address"
                      placeholder="Alamat"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="No. Telepon"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                    <div className='modal-buttons'>
                      <button type="submit">Simpan</button>
                      <button type="button" onClick={() => setShowModal(false)}>
                        Batal
                      </button>
                    </div>
                  </form>
                  {message && <p>{message}</p>}
                </div>
              </div>
            )}

            {/* Pesanan dari produk yang dipilih */}
            <div className="pesanan-box">
              <h3>Pesanan Anda</h3>
              {selectedProducts.map((item) => (
                <div className="pesanan-item" key={item.id}>
                  <img src={item.images?.[0] || '/img/placeholder.jpg'} alt={item.name} />
                  <div className="info">
                    <p>{item.name}<br /><span>{item.quantity}x</span></p>
                  </div>
                  <div className="harga">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: Ringkasan */}
          <section className="right-section">
            <div className="summary-box">
              <p><strong>Sub Total:</strong> Rp {selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString('id-ID')}</p>
              <p>Shipping: <span className="shipping-type">Regular (Rp9.000)</span></p>
              <h4>Order Total</h4>
              <div className="order-detail">
                <p>Total Harga</p><span>Rp {selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString('id-ID')}</span>
                <p>Total Ongkos Kirim</p><span>Rp9.000</span>
                <p>Total Asuransi Pengiriman</p><span>Rp800</span>
                <p>Total Lainnya</p><span>-</span>
              </div>
              <h4>Payment Options</h4>
              <ul className="payment-options">
                <li>COD</li>
              </ul>
              <hr />
              <div className="total-final">
                <p>Total</p>
                <p><strong>Rp {(selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0) + 9000 + 800).toLocaleString('id-ID')}</strong></p>
              </div>
              <button className="btn-bayar" onClick={handleCheckout}>Checkout</button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}