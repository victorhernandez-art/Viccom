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
    <section className="bg-white py-4">
      <div className="max-w-7xl mx-auto px-4">
      {/* Imagen con márgenes acordes al contenido de la página */}
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '3/1' }}>
        {/* Slides apilados con fade */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Badge VICCOM - top left */}
        <div className="absolute top-4 left-4 z-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white shadow"
            style={{ backgroundColor: slide.accent }}
          >
            <Tag className="w-3 h-3" />
            <span>VICCOM — Distribuidora</span>
          </div>
        </div>

        {/* Flechas de navegación */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/55 text-white rounded-full p-2 transition-all"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/55 text-white rounded-full p-2 transition-all"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
              aria-label={`Diapositiva ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Zona inferior: subtítulo + descripción + botones */}
      <div className="pt-4 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-[#1B2B6B]">{slide.subtitle}</p>
            <p className="text-sm text-gray-500 mt-0.5">{slide.description}</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Link
              href={slide.link}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:scale-105 hover:shadow-md"
              style={{ backgroundColor: slide.accent }}
            >
              {slide.cta}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-[#1B2B6B] border-2 border-[#1B2B6B]/30 hover:border-[#1B2B6B] transition-all"
            >
              Ver Catálogo Completo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
