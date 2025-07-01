'use client';
import React, { useEffect } from 'react';
import './brand.css';

export default function Brand() {
  useEffect(() => {
    const container = document.getElementById('storesGrid');
    const prevBtn = document.querySelector('.scroll-button.prev');
    const nextBtn = document.querySelector('.scroll-button.next');

    function scrollStores(direction) {
      const scrollAmount = 200;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }

    function updateScrollButtons() {
      if (container.scrollLeft <= 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
      } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
      }

      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
      } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
      }
    }

    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('load', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('load', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <div className="brand-container">
      <header className="brand-header">
        <h1>Official Store</h1>
      </header>

      <div className="stores-container">
        <button className="scroll-button prev" onClick={() => scrollStores('left')}>
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <div className="stores-grid" id="storesGrid">
          {[
            { name: 'HMNS', logo: 'hmns.png', className: 'gramedia-utama' },
            { name: 'SAFF & Co.', logo: 'saff n co.png', className: 'gramedia-widiasarana' },
            { name: 'My Konos', logo: 'mykonos.png', className: 'bip' },
            { name: 'ONIX', logo: 'onix.png', className: 'elex' },
            { name: 'Lilith & Eve', logo: 'lilithneve.png', className: 'mcl' },
            { name: 'Carl & Claire', logo: 'carlnclaire.png', className: 'kpg' },
            { name: 'Hint', logo: 'PG', className: 'phoenix' }
          ].map((store, index) => (
            <div key={index} className={`store-card ${store.className}`}>
              <div className="store-logo"><img src={`/logos/${store.logo}`} alt={store.name} /></div>
              <div className="store-name">{store.name}</div>
              <div className="store-category"></div>
            </div>
          ))}
        </div>

        <button className="scroll-button next" onClick={() => scrollStores('right')}>
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );

  function scrollStores(direction) {
    const container = document.getElementById('storesGrid');
    const scrollAmount = 200;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
