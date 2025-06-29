import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Parfumeyuu</h3>
                    <p>Toko parfum online terpercaya dengan koleksi lengkap dan harga terbaik.</p>
                </div>
                <div className="footer-section">
                    <h4>Layanan</h4>
                    <ul>
                        <li><a href="#">Bantuan</a></li>
                        <li><a href="#">Kebijakan Privasi</a></li>
                        <li><a href="#">Syarat & Ketentuan</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Kontak</h4>
                    <ul>
                        <li><i className="fas fa-envelope"></i> info@parfumeyuu.com</li>
                        <li><i className="fas fa-phone"></i> +62 123 456 7890</li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
    );
}