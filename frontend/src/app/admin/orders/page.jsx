"use client";
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Daftar Pesanan</h1>
      <table border="1" cellPadding={10}>
        <thead>
            <tr>
            <th>ID Order</th>
            <th>Nama</th>
            <th>No Telp</th>
            <th>Alamat</th>
            <th>Produk</th>
            <th>Jumlah</th>
            <th>Harga Satuan</th>
            <th>Status</th>
            <th>Waktu</th>
            </tr>
        </thead>
        <tbody>
            {orders.map((o, idx) => (
            <tr key={idx}>
                <td>{o.order_id}</td>
                <td>{o.name}</td>
                <td>{o.phone}</td>
                <td>{o.address}</td>
                <td>{o.product_name}</td>
                {/* <td>{o.price}</td> */}
                <td>{o.quantity}</td>
                <td>{`Rp ${Number(o.price).toLocaleString()}`}</td>
                <td>{o.status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
