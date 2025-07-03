"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import './my-order.css'
import Navbar from "@/components/Navbar/Navbar";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/list");
        if (!res.ok) throw new Error("Gagal memuat data pesanan");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("❌ Error ambil pesanan:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <div>Memuat pesanan...</div>;

  return (
    <>
    <Navbar />
    <main className="my-orders">
      <h1>Daftar Pesanan Saya</h1>
      {orders.length === 0 ? (
        <p>Tidak ada pesanan yang ditemukan.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <h2>Pesanan #{order.id}</h2>
              <p>Tanggal: {new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              <p>Total: Rp {Number(order.total_amount).toLocaleString("id-ID")}</p>
              <p>Status: {order.status}</p>
              <button onClick={() => router.push(`/orders/${order.id}`)}>
                Lihat Detail
              </button>
            </li>
          ))}
        </ul>
      )}
    </main></>
  );
}
