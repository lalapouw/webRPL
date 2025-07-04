"use client";

import { useEffect, useState } from "react";
import "./user.css"; // sesuaikan jika ada file khusus
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
        const filtered = data.filter(user => user.role !== "admin");
        setUsers(filtered);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="judul">
        <h1>Manajemen User</h1>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="user-table">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Email</th>
                <th>No. Telp</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
