'use client';

import React, { useEffect, useState } from 'react';
import './Cart.css';
import Navbar from '@/components/Navbar/Navbar';
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        setCartItems(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Gagal memuat data keranjang:', err);
        setIsLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  const handleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const updateQuantity = async (productId, delta) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (!res.ok) throw new Error('Failed to update quantity');

      setCartItems((prevItems) =>
        prevItems.map((i) =>
          i.product_id === productId ? { ...i, quantity: newQuantity } : i
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const deleteItem = async (productId, userId) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId }),
      });

      if (!res.ok) throw new Error('Gagal menghapus item');

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product_id !== productId)
      );

      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    } catch (err) {
      console.error('Error saat menghapus item:', err);
    }
  };

  const subtotal = cartItems
    .filter((item) => selectedItems.includes(item.product_id))
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Pilih minimal 1 produk untuk checkout');
      return;
    }

    const query = selectedItems.map(id => `ids=${id}`).join('&');
    router.push(`/checkout?${query}`);
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  if (isLoading)
    return <p style={{ textAlign: 'center' }}>Memuat keranjang...</p>;

  return (
    <>
      <Navbar />
      <div className='body-cart'>
        <section className="cart-section container">
          <h2 className="cart-title">Keranjang</h2>
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product_id)}
                    onChange={() => handleSelectItem(item.product_id)}
                  />
                  <img
                    src={item.images?.[0] || '/images/placeholder.jpg'}
                    className="cart-image"
                    alt={item.name}
                  />
                  <div className="cart-details">
                    <p className="cart-product-name">{item.name}</p>
                  </div>
                  <div className="cart-price">
                    Rp{item.price.toLocaleString('id-ID')}
                  </div>
                  <div className="cart-quantity">
                    <button onClick={() => updateQuantity(item.product_id, -1)} className="qty-btn">-</button>
                    <span className="qty-count">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, 1)} className="qty-btn">+</button>
                    <div className="cart-total">
                      Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                    <button onClick={() => deleteItem(item.product_id, item.user_id)} className="delete-btn">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Ringkasan Belanja</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="summary-row">
                  <span>Ongkos Kirim</span>
                  <span>Gratis</span>
                </div>
                <hr />
                <div className="summary-total">
                  <strong>Total</strong>
                  <strong>Rp{subtotal.toLocaleString('id-ID')}</strong>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => {
                    const params = selectedItems.map((id) => `ids=${id}`).join('&');
                    router.push(`/checkout?${params}`);
                  }}
                >Checkout</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
