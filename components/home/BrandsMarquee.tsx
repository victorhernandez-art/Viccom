'use client'

import React from 'react'

export default function BrandsMarquee() {
  const brands = [
    { name: 'HP', slug: 'hp', width: 'w-14' },
    { name: 'Dell', slug: 'dell', width: 'w-14' },
    { name: 'Lenovo', slug: 'lenovo', width: 'w-18' },
    { name: 'Asus', slug: 'asus-business', width: 'w-20' },
    { name: 'Intel', slug: 'intel', width: 'w-16' },
    { name: 'AMD', slug: 'amd', width: 'w-16' },
    { name: 'Epson', slug: 'epson', width: 'w-18' },
    { name: 'Logitech', slug: 'logitech', width: 'w-18' },
    { name: 'Kingston Technology', slug: 'kingston technology', width: 'w-24' },
    { name: 'TP-Link', slug: 'tp-link', width: 'w-20' },
    { name: 'Acer', slug: 'acer', width: 'w-16' },
    { name: 'ADATA', slug: 'adata', width: 'w-20' },
    { name: 'Gigabyte', slug: 'gigabyte', width: 'w-20' },
    { name: 'Xerox', slug: 'xerox', width: 'w-20' },
    { name: 'Canon', slug: 'canon', width: 'w-16' },
    { name: 'Brother', slug: 'brother', width: 'w-20' },
    { name: 'Cisco', slug: 'cisco', width: 'w-16' },
    { name: 'APC', slug: 'apc', width: 'w-16' },
    { name: 'Dahua', slug: 'dahua technology', width: 'w-24' },
    { name: 'Hikvision', slug: 'hikvision', width: 'w-24' },
    { name: 'LG', slug: 'lg', width: 'w-12' },
    { name: 'Hisense', slug: 'hisense', width: 'w-20' },
    { name: 'Microsoft', slug: 'microsoft', width: 'w-20' },
    { name: 'Vorago', slug: 'vorago', width: 'w-16' },
    { name: 'Acteck', slug: 'acteck', width: 'w-16' },
    { name: 'BenQ', slug: 'benq', width: 'w-16' },
    { name: 'CDP', slug: 'cdp', width: 'w-16' },
    { name: 'Koblenz', slug: 'koblenz', width: 'w-20' },
    { name: 'Kyocera', slug: 'kyocera', width: 'w-20' },
    { name: 'Manhattan', slug: 'manhattan', width: 'w-20' }
  ]

  // Duplicar la lista para lograr un scroll infinito fluido
  const marqueeBrands = [...brands, ...brands, ...brands]

  return (
    <section className="py-12 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
          Trabajamos con las mejores marcas globales
        </h3>
      </div>
      
      <div className="relative w-full flex items-center">
        {/* Degradados laterales para dar profundidad */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Contenedor del Marquee */}
        <div className="flex w-full overflow-hidden">
          <div className="flex gap-16 md:gap-24 py-4 animate-marquee whitespace-nowrap">
            {marqueeBrands.map((brand, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300"
                title={brand.name}
              >
                <img 
                  src={`/img/marcas/${brand.slug}.png`} 
                  alt={`${brand.name} logo`}
                  className={`h-8 ${brand.width} object-contain`}
                  loading="lazy"
                />
                
                {/* Nombre de la marca abajo */}
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors duration-300">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animación del carrusel con CSS embebido */}
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
          animation: marquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
