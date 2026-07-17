'use client'

import React from 'react'

export default function BrandsMarquee() {
  const brands = [
    {
      name: 'HP',
      color: '#0096D6',
      svgPath: 'M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm-1.56 16.56H8.76V7.44h1.68v3.84h3.12V7.44h1.68v9.12h-1.68v-3.6h-3.12v3.6z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Dell',
      color: '#007DB8',
      svgPath: 'M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm-.24 16.56H8.76V7.44h2.76c1.68 0 2.52.84 2.52 2.16 0 .96-.48 1.56-1.32 1.8.96.24 1.44.84 1.44 1.92 0 1.44-.96 2.16-2.64 2.16zm.12-5.76h1.2c.48 0 .84-.24.84-.72 0-.48-.36-.72-.84-.72h-1.2v1.44zm0 3.84h1.32c.48 0 .84-.24.84-.72 0-.48-.36-.72-.84-.72h-1.32V14.64z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Lenovo',
      color: '#E2231A',
      svgPath: 'M0 0v24h24V0H0zm20.4 17.5c-.3.4-.8.7-1.4.7-.9 0-1.5-.7-1.5-1.7V9.7h-2.1v6.8c0 1.9 1.2 3.1 3.1 3.1 1.2 0 2.2-.6 2.7-1.5l-0.8-0.6zm-5.7-1.3c0 .8-.5 1.4-1.3 1.4s-1.3-.6-1.3-1.4V9.7H10v6.4c0 1.9 1.2 3 3.1 3s3.1-1.1 3.1-3V9.7h-2.1v6.5zm-8.8.8c.3.4.8.7 1.4.7.9 0 1.5-.7 1.5-1.7V9.7H6.7v6.8c0 1.9 1.2 3.1 3.1 3.1 1.2 0 2.2-.6 2.7-1.5L11.7 17.5z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Intel',
      color: '#0071C5',
      svgPath: 'M24 8.715v8.79a3.176 3.176 0 0 1-3.172 3.172H3.172A3.176 3.176 0 0 1 0 17.505v-11.01A3.176 3.176 0 0 1 3.172 3.323h17.656A3.176 3.176 0 0 1 24 6.495V7.47h-1.63v-.975c0-.853-.691-1.544-1.544-1.544H3.172c-.853 0-1.544.691-1.544 1.544v11.01c0 .853.691 1.544 1.544 1.544h17.656c.853 0 1.544-.691 1.544-1.544v-8.79H24zM6.924 16.14H5.35V9.458h1.574V16.14zm4.568-3.79c.277.297.416.71.416 1.238v2.552H9.334v-2.552c0-.528.139-.94.416-1.238.277-.297.683-.446 1.218-.446.535 0 .941.149 1.218.446zm6.208 3.79h-1.574V11.23h-1.3v-1.33h2.874v6.24zm3.924 0h-2.128v-3.79c0-.495.109-.863.327-1.104.218-.24.535-.361.95-.361s.733.12.95.361c.218.24.327.609.327 1.104v3.79zm-7.668-1.574h1.238V12.14H14.15v2.426z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Samsung',
      color: '#0A1172',
      svgPath: 'M24 10.7c0 3.2-10.7 5.8-24 5.8S0 13.9 0 10.7s10.7-5.8 24-5.8 24 2.6 24 5.8zM6.8 9.3c.4-.3.9-.4 1.4-.4.8 0 1.4.3 1.8.8.4.5.6 1.2.6 2s-.2 1.5-.6 2c-.4.5-1 .8-1.8.8-.5 0-1-.1-1.4-.4V16H5.2V8.4h1.6v.9zm4.2-.4h1.6v5c0 .7-.2 1.2-.6 1.6-.4.4-1 .6-1.8.6-.8 0-1.4-.2-1.8-.6-.4-.4-.6-.9-.6-1.6V12h1.6v1.9c0 .3.1.6.3.8.2.2.4.3.7.3.3 0 .5-.1.7-.3.2-.2.3-.5.3-.8V8.9zm5.3.8c-.3-.3-.7-.5-1.2-.5-.5 0-.9.2-1.2.5s-.5.7-.5 1.2.2.9.5 1.2.7.5 1.2.5 1-.2 1.2-.5.5-.7.5-1.2-.2-.9-.5-1.2zM21.2 12c0-.5-.2-.9-.5-1.2-.3-.3-.7-.5-1.2-.5-.5 0-.9.2-1.2.5s-.5.7-.5 1.2.2.9.5 1.2.7.5 1.2.5 1-.2 1.2-.5c.3-.3.5-.7.5-1.2z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'AMD',
      color: '#000000',
      svgPath: 'M12 0H0v12h4v8h8v4h12V12h-4V4h-8V0zm-1 9H8v3h3v-3zm3-3h-3v3h3V6zm3-3h-3v3h3V3z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Logitech',
      color: '#00B8FC',
      svgPath: 'M12 0a6 6 0 0 0-6 6v3h3V6a3 3 0 0 1 3-3 3 3 0 0 1 3 3v3h3V6a6 6 0 0 0-6-6zm0 10a6 6 0 0 0-6 6v3h3v-3a3 3 0 0 1 3-3 3 3 0 0 1 3 3v3h3v-3a6 6 0 0 0-6-6z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'TP-Link',
      color: '#19C1D8',
      svgPath: 'M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 19a7 7 0 1 1 7-7 7 7 0 0 1-7 7zm-3-8h6v2H9v-2z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Acer',
      color: '#83B81A',
      svgPath: 'M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm-2 15H8V9h2v6zm4-6h-2v6h2v-6zm4 2h-2v4h2v-4z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Asus',
      color: '#00539B',
      svgPath: 'M2 6h20v2H2V6zm0 5h20v2H2v-2zm0 5h20v2H2v-2z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Kingston',
      color: '#FF0000',
      svgPath: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 17h-2v-4h2v4zm0-6h-2V7h2v4z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    },
    {
      name: 'Western Digital',
      color: '#005A9C',
      svgPath: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4 14H8v-2h8v2zm0-4H8V8h8v2z',
      viewBox: '0 0 24 24',
      size: 'h-10 w-10'
    }
  ]

  // Duplicar la lista para lograr un scroll infinito fluido sin cortes
  const marqueeBrands = [...brands, ...brands, ...brands]

  return (
    <section className="py-12 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
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
                className="group flex flex-col items-center justify-center gap-2 cursor-pointer"
                title={brand.name}
              >
                {/* Logo vectorial inline 100% inmune a bloqueos CORS/hotlink */}
                <div 
                  className="text-gray-400 hover:scale-115 transition-all duration-300 fill-current"
                  style={{ '--brand-hover-color': brand.color } as React.CSSProperties}
                >
                  <svg 
                    viewBox={brand.viewBox}
                    className={`${brand.size} transition-colors duration-300 group-hover:text-[var(--brand-hover-color)]`}
                  >
                    <path d={brand.svgPath} />
                  </svg>
                </div>
                
                {/* Nombre de la marca abajo */}
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors duration-300">
                  {brand.name}
                </span>
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
