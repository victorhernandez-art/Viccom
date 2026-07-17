'use client'

import React from 'react'

export default function BrandsMarquee() {
  const brands = [
    {
      name: 'HP',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
      width: 'w-10'
    },
    {
      name: 'Dell',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg',
      width: 'w-16'
    },
    {
      name: 'Lenovo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
      width: 'w-20'
    },
    {
      name: 'Asus',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Asus_Logo.svg',
      width: 'w-24'
    },
    {
      name: 'Samsung',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
      width: 'w-24'
    },
    {
      name: 'Intel',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg',
      width: 'w-16'
    },
    {
      name: 'AMD',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
      width: 'w-16'
    },
    {
      name: 'Epson',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Epson_logo.svg',
      width: 'w-20'
    },
    {
      name: 'Logitech',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Logitech_logo_and_wordmark.svg',
      width: 'w-24'
    },
    {
      name: 'Kingston',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Kingston_Technology_logo.svg',
      width: 'w-24'
    },
    {
      name: 'TP-Link',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/TP-Link_logo.svg',
      width: 'w-24'
    },
    {
      name: 'Acer',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg',
      width: 'w-20'
    },
    {
      name: 'Western Digital',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Western_Digital_logo.svg',
      width: 'w-20'
    },
    {
      name: 'ADATA',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/ADATA_Logo.svg',
      width: 'w-24'
    },
    {
      name: 'Gigabyte',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Gigabyte_Technology_logo.svg',
      width: 'w-28'
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
                className="group flex items-center justify-center filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer"
                title={brand.name}
              >
                <img 
                  src={brand.logoUrl} 
                  alt={`${brand.name} logo`}
                  className={`h-8 ${brand.width} object-contain`}
                  loading="lazy"
                />
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
