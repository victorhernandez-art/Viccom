'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, Loader2 } from 'lucide-react'

interface IcecatImage {
  Pic: string
  Thumb?: string
  IsMain?: string
  Width?: number
  Height?: number
}

interface IcecatGalleryProps {
  upc: string | null | undefined
  imagenFallback: string
  nombreProducto: string
}

export default function IcecatGallery({ upc, imagenFallback, nombreProducto }: IcecatGalleryProps) {
  const [images, setImages] = useState<string[]>([imagenFallback])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    // Si no hay UPC/GTIN, nos quedamos con el fallback principal
    if (!upc) return

    // Limpiar caracteres no numéricos del UPC (algunos códigos traen espacios o guiones)
    const cleanUpc = upc.replace(/\D/g, '')
    if (cleanUpc.length < 8) return

    const username = process.env.NEXT_PUBLIC_ICECAT_USERNAME ?? 'openicecat-free'
    
    async function fetchIcecatData() {
      setLoading(true)
      try {
        const res = await fetch(`https://live.icecat.biz/api/?UserName=${username}&Language=es&GTIN=${cleanUpc}`)
        if (!res.ok) throw new Error('Icecat response error')
        
        const data = await res.json()
        
        // Si el producto existe y tiene galería de fotos en Open Icecat
        if (data && data.Gallery && Array.isArray(data.Gallery) && data.Gallery.length > 0) {
          const icecatPics = data.Gallery.map((item: IcecatImage) => item.Pic).filter(Boolean)
          
          if (icecatPics.length > 0) {
            // Unir la imagen fallback inicial con las de Icecat para asegurar que no perdemos ninguna,
            // pero eliminando duplicados por si acaso.
            const uniqueImages = Array.from(new Set([imagenFallback, ...icecatPics]))
            setImages(uniqueImages)
          }
        }
      } catch (err) {
        console.warn('No se pudieron cargar imágenes adicionales de Open Icecat:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchIcecatData()
  }, [upc, imagenFallback])

  const handlePrev = () => {
    setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ─── Contenedor Imagen Principal ─── */}
      <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-center aspect-square group overflow-hidden">
        
        {/* Indicador de carga discreto de Icecat */}
        {loading && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1B2B6B] text-xs font-semibold animate-pulse z-10">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Buscando ángulos...</span>
          </div>
        )}

        {/* Imagen principal */}
        <div className="relative w-full h-full max-w-md aspect-square">
          <Image
            src={images[activeIndex]}
            alt={`${nombreProducto} - Vista ${activeIndex + 1}`}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            priority={activeIndex === 0}
          />
        </div>

        {/* Botones de navegación (solo si hay más de 1 imagen) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#1B2B6B] hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 focus:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#1B2B6B] hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 focus:opacity-100"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Botón de pantalla completa */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute bottom-4 right-4 p-2 rounded-lg bg-gray-50/80 shadow border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10 focus:opacity-100"
          aria-label="Pantalla completa"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Tira de Miniaturas (solo si hay más de 1 imagen) ─── */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden bg-white p-1 flex-shrink-0 transition-all ${
                idx === activeIndex
                  ? 'border-[#1B2B6B] shadow-md scale-95'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ─── Modal de Pantalla Completa ─── */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 font-bold text-lg p-2"
          >
            Cerrar [Esc]
          </button>
          
          <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <div className="relative w-full h-full max-w-3xl">
              <Image
                src={images[activeIndex]}
                alt={nombreProducto}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
          
          {/* Contador de imágenes en modal */}
          <p className="text-gray-400 text-sm mt-4">
            Imagen {activeIndex + 1} de {images.length}
          </p>

          {/* Escucha de la tecla ESC para cerrar el modal */}
          <ModalEscListener onClose={() => setFullscreen(false)} />
        </div>
      )}
    </div>
  )
}

// Pequeño componente auxiliar para escuchar la tecla escape en el cliente
function ModalEscListener({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return null
}
