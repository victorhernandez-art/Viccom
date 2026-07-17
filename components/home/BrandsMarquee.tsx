'use client'

import React from 'react'

export default function BrandsMarquee() {
  const brands = [
    {
      name: 'HP',
      color: '#0096D6',
      logo: (
        <svg className="h-7 w-auto fill-current" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M9.5 7v10h1.5v-4h2v4h1.5V7H13v3.5h-2V7H9.5z" />
        </svg>
      )
    },
    {
      name: 'Dell',
      color: '#007DB8',
      logo: (
        <svg className="h-7 w-auto fill-current" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M7.5 8h2.5c1.5 0 2.2.7 2.2 1.8 0 .8-.4 1.4-1.2 1.6.8.2 1.3.8 1.3 1.7 0 1.2-.8 1.9-2.3 1.9H7.5V8zm1.5 3h1c.6 0 1-.3 1-.9 0-.5-.4-.9-1-.9h-1V11zm0 3h1.2c.6 0 1-.3 1-.9 0-.6-.4-.9-1-.9h-1.2V14z" />
        </svg>
      )
    },
    {
      name: 'Lenovo',
      color: '#E2231A',
      logo: (
        <svg className="h-6 w-auto fill-current" viewBox="0 0 36 12">
          <rect x="0" y="0" width="36" height="12" fill="currentColor" rx="2" />
          <text x="18" y="9.5" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Lenovo</text>
        </svg>
      )
    },
    {
      name: 'Asus',
      color: '#00539B',
      logo: (
        <svg className="h-5 w-auto fill-current" viewBox="0 0 40 10">
          <text x="20" y="8.5" fontSize="10" fontWeight="900" fontStyle="italic" letterSpacing="1" textAnchor="middle" fontFamily="sans-serif">ASUS</text>
        </svg>
      )
    },
    {
      name: 'Intel',
      color: '#0071C5',
      logo: (
        <svg className="h-6 w-auto fill-current" viewBox="0 0 28 12">
          <ellipse cx="14" cy="6" rx="13" ry="5.5" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(-10 14 6)" />
          <text x="14" y="9" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">intel</text>
        </svg>
      )
    },
    {
      name: 'Kingston',
      color: '#FF0000',
      logo: (
        <svg className="h-6 w-auto fill-current" viewBox="0 0 40 12">
          <path d="M5 2h2v8H5zm4 0h3c1.5 0 2.5 1 2.5 2.5S13.5 7 12 7H9v3H7.5V2zm1.5 3.5h1.5c.6 0 1-.3 1-.8s-.4-.8-1-.8h-1.5v1.6zm6.5-3.5h2.5l2 3.5 2-3.5h2.5v8H22V5.5l-2.5 4.5h-1L16 5.5v4.5h-1.5V2z" />
          <text x="28" y="10" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Kingston</text>
        </svg>
      )
    },
    {
      name: 'Samsung',
      color: '#0A1172',
      logo: (
        <svg className="h-5 w-auto fill-current" viewBox="0 0 48 10">
          <ellipse cx="24" cy="5" rx="23" ry="4.5" fill="currentColor" />
          <text x="24" y="8" fill="#FFF" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">SAMSUNG</text>
        </svg>
      )
    },
    {
      name: 'Epson',
      color: '#003399',
      logo: (
        <svg className="h-5 w-auto fill-current" viewBox="0 0 32 10">
          <text x="16" y="8.5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">EPSON</text>
        </svg>
      )
    },
    {
      name: 'Logitech',
      color: '#00B8FC',
      logo: (
        <svg className="h-6 w-auto fill-current" viewBox="0 0 36 12">
          <path d="M4 2v8h4.5V8.5H5.5V2H4zm6.5 0c-2.2 0-3.5 1.5-3.5 4s1.3 4 3.5 4 3.5-1.5 3.5-4-1.3-4-3.5-4zm0 6.5c-1.2 0-2-1-2-2.5s.8-2.5 2-2.5 2 1 2 2.5-.8 2.5-2 2.5z" />
          <text x="24" y="10" fontSize="8" fontWeight="bold" fontFamily="sans-serif">logi</text>
        </svg>
      )
    },
    {
      name: 'Acer',
      color: '#83B81A',
      logo: (
        <svg className="h-5 w-auto fill-current" viewBox="0 0 28 10">
          <text x="14" y="8.5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">acer</text>
        </svg>
      )
    },
    {
      name: 'AMD',
      color: '#000000',
      logo: (
        <svg className="h-5 w-auto fill-current" viewBox="0 0 28 10">
          <path d="M2 2h8v2H4v2h6v2H2V2z" fill="currentColor" />
          <text x="19" y="8.5" fontSize="9" fontWeight="bold" fontFamily="sans-serif">AMD</text>
        </svg>
      )
    },
    {
      name: 'TP-Link',
      color: '#19C1D8',
      logo: (
        <svg className="h-5 w-auto fill-current" viewBox="0 0 36 10">
          <text x="18" y="8.5" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">tp-link</text>
        </svg>
      )
    }
  ]

  // Duplicar la lista para lograr un scroll infinito fluido
  const marqueeBrands = [...brands, ...brands, ...brands]

  return (
    <section className="py-12 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
          Trabajamos con las mejores marcas globales
        </h3>
      </div>
      
      <div className="relative w-full flex items-center">
        {/* Degradados laterales para dar profundidad (efecto premium) */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Contenedor del Marquee */}
        <div className="flex w-full overflow-hidden">
          <div className="flex gap-16 md:gap-24 py-4 animate-marquee whitespace-nowrap">
            {marqueeBrands.map((brand, idx) => (
              <div 
                key={idx} 
                className="group flex items-center justify-center text-gray-400 hover:scale-110 transition-all duration-300 cursor-pointer"
                style={{ '--brand-hover-color': brand.color } as React.CSSProperties}
                title={brand.name}
              >
                <div className="group-hover:text-[var(--brand-hover-color)] transition-colors duration-300">
                  {brand.logo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animación del carrusel con CSS embebido para evitar dependencias */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
