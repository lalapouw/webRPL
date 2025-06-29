import React from "react";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./hero.css"; // Ubah path ini kalau file CSS kamu berada di folder lain

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h2>Buy Perfume in Large Quantities</h2>
          <p>
            Dapatkan parfum berkualitas tinggi dengan harga terbaik untuk
            pembelian dalam jumlah besar
          </p>
          <button className="cta-button">Jelajahi Koleksi</button>
        </div>
      </div>
      <div className="hero-image">
        <div className="perfume-bottles">
          <div className="bottle bottle-1"></div>
          <div className="bottle bottle-2"></div>
          <div className="bottle bottle-3"></div>
          <div className="bottle bottle-4"></div>
          <div className="bottle bottle-5"></div>
        </div>
      </div>
    </section>
  );
}
