'use client'

import React from 'react'

export default function BrandsMarquee() {
  const brands = [
    { name: 'HP', slug: 'hp' },
    { name: 'Dell', slug: 'dell' },
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'Asus', slug: 'asus-business' },
    { name: 'Intel', slug: 'intel' },
    { name: 'AMD', slug: 'amd' },
    { name: 'Epson', slug: 'epson' },
    { name: 'Logitech', slug: 'logitech' },
    { name: 'Kingston Technology', slug: 'kingston technology' },
    { name: 'TP-Link', slug: 'tp-link' },
    { name: 'Acer', slug: 'acer' },
    { name: 'ADATA', slug: 'adata' },
    { name: 'Gigabyte', slug: 'gigabyte' },
    { name: 'Xerox', slug: 'xerox' },
    { name: 'Canon', slug: 'canon' },
    { name: 'Brother', slug: 'brother' },
    { name: 'Cisco', slug: 'cisco' },
    { name: 'APC', slug: 'apc' },
    { name: 'Dahua', slug: 'dahua technology' },
    { name: 'Hikvision', slug: 'hikvision' },
    { name: 'LG', slug: 'lg' },
    { name: 'Hisense', slug: 'hisense' },
    { name: 'Microsoft', slug: 'microsoft' },
    { name: 'Vorago', slug: 'vorago' },
    { name: 'Acteck', slug: 'acteck' },
    { name: 'BenQ', slug: 'benq' },
    { name: 'CDP', slug: 'cdp' },
    { name: 'Koblenz', slug: 'koblenz' },
    { name: 'Kyocera', slug: 'kyocera' },
    { name: 'Manhattan', slug: 'manhattan' }
  ]

  return (
    <section className="py-12 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
          Trabajamos con las mejores marcas globales
        </h3>
      </div>
      
      <div className="relative w-full flex items-center overflow-hidden">
        {/* Degradados laterales para dar profundidad */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Carrusel de doble pista con min-w-full y shrink-0 para evitar colapso a 0 de ancho */}
        <div className="flex w-full overflow-hidden select-none">
          {/* Pista 1 */}
          <div className="flex shrink-0 items-center justify-around gap-16 md:gap-24 py-4 animate-marquee min-w-full">
            {brands.map((brand, idx) => (
              <div 
                key={`p1-${idx}`} 
                className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
                title={brand.name}
              >
                <img 
                  src={`/img/marcas/${brand.slug}.png`} 
                  alt={`${brand.name} logo`}
                  style={{ height: '44px', width: 'auto', display: 'block' }}
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Pista 2 (Copia idéntica para bucle continuo) */}
          <div className="flex shrink-0 items-center justify-around gap-16 md:gap-24 py-4 animate-marquee min-w-full" aria-hidden="true">
            {brands.map((brand, idx) => (
              <div 
                key={`p2-${idx}`} 
                className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
                title={brand.name}
              >
                <img 
                  src={`/img/marcas/${brand.slug}.png`} 
                  alt={`${brand.name} logo`}
                  style={{ height: '44px', width: 'auto', display: 'block' }}
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animación del carrusel con CSS embebido */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 55s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
