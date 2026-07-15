'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Tag } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: 'Equipos de Cómputo',
    subtitle: 'Laptops, Desktops y más',
    description: 'Los mejores equipos al mejor precio. Encuentra tu equipo ideal.',
    cta: 'Ver Laptops',
    link: '/categoria/laptops',
    accent: '#CC0000',
    image: '/img/slider/1.png',
  },
  {
    id: 2,
    title: 'Impresoras y Consumibles',
    subtitle: 'Soluciones de impresión profesional',
    description: 'Impresoras de inyección, láser, tóners y cartuchos al mejor precio.',
    cta: 'Ver Impresoras',
    link: '/categoria/impresoras',
    accent: '#CC0000',
    image: '/img/slider/2.png',
  },
  {
    id: 3,
    title: 'Accesorios y Periféricos',
    subtitle: 'Todo para tu equipo de trabajo',
    description: 'Teclados, ratones, monitores, audífonos y mucho más.',
    cta: 'Ver Accesorios',
    link: '/categoria/accesorios',
    accent: '#CC0000',
    image: '/img/slider/3.png',
  },
  {
    id: 4,
    title: 'Soluciones Empresariales',
    subtitle: 'Infraestructura para tu negocio',
    description: 'Servidores, redes, almacenamiento y soluciones TI para empresas.',
    cta: 'Ver Soluciones',
    link: '/catalogo',
    accent: '#CC0000',
    image: '/img/slider/4.png',
  },
  {
    id: 5,
    title: 'Gráficos y Procesadores AMD',
    subtitle: 'Temporada Legendaria AMD Radeon',
    description: 'Experimenta el máximo rendimiento con los componentes y procesadores AMD.',
    cta: 'Ver Componentes',
    link: '/catalogo?buscar=amd',
    accent: '#E61C24',
    image: '/img/slider/5.png',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent(c => (c + 1) % slides.length)

  return (
    <section className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Contenedor del Slider con aspecto responsivo */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg aspect-[16/9] md:aspect-[3/1]">
          
          {/* Slides apilados con fade */}
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Imagen de fondo */}
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={i === 0}
                className="object-cover object-center select-none"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              
              {/* Capa de degradado oscuro para legibilidad superior */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />

              {/* Contenido de la diapositiva superpuesto */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 text-white z-20 select-none">
                <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-red-400 mb-1.5 animate-pulse">
                  {s.subtitle}
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-2 md:mb-4 max-w-xs sm:max-w-md md:max-w-xl">
                  {s.title}
                </h2>
                <p className="text-[11px] sm:text-sm md:text-base text-gray-200 line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 max-w-xs sm:max-w-md md:max-w-lg leading-relaxed font-medium">
                  {s.description}
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href={s.link}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm text-white hover:scale-105 hover:shadow-lg transition-all focus:outline-none"
                    style={{ backgroundColor: s.accent }}
                  >
                    {s.cta}
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                  <Link
                    href="/catalogo"
                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold text-xs md:text-sm bg-white/10 hover:bg-white/20 border border-white/10 hover:scale-105 transition-all text-white focus:outline-none"
                  >
                    Ver Catálogo
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Badge de la Marca - top left */}
          <div className="absolute top-4 left-4 z-30">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-sm border border-white/10"
              style={{ backgroundColor: `${slide.accent}d0` }} // Opacidad ligera para integrarse mejor
            >
              <Tag className="w-3 h-3" />
              <span>VICCOM — Distribuidora</span>
            </div>
          </div>

          {/* Flechas de navegación (visibles solo en hover del contenedor) */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/60 text-white rounded-full p-2 sm:p-2.5 transition-all border border-white/5 opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/60 text-white rounded-full p-2 sm:p-2.5 transition-all border border-white/5 opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Indicadores en la parte inferior */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                  i === current ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
                aria-label={`Diapositiva ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
