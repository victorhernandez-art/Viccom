import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Tailwind class merge ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Formateo de moneda MXN ───────────────────────────────────────────────────
export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// ─── Slug generador ───────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')   // quitar caracteres especiales
    .trim()
    .replace(/\s+/g, '-')           // espacios → guiones
    .replace(/-+/g, '-')            // guiones múltiples → uno
    .substring(0, 100)              // límite de longitud
}

// ─── Formato de fecha ─────────────────────────────────────────────────────────
export function formatDate(dateStr: string, short = false): string {
  const date = new Date(dateStr)
  if (short) {
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Tiempo relativo ─────────────────────────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)   return 'hace un momento'
  if (minutes < 60)  return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} día${days === 1 ? '' : 's'}`
}

// ─── Truncar texto ────────────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trimEnd() + '…'
}

// ─── URL de imagen con fallback ───────────────────────────────────────────────
export function getProductImageUrl(url?: string | null): string {
  const fallback = '/img/product-placeholder.svg'
  const value = url?.trim()

  if (!value) return fallback
  if (!value.startsWith('http')) return value

  try {
    const imageUrl = new URL(value)
    const host = imageUrl.hostname.replace(/^www\./, '')

    if (host === 'ctonline.mx' && !imageUrl.pathname.startsWith('/images/')) {
      return fallback
    }

    return imageUrl.toString()
  } catch {
    return fallback
  }
}

// ─── Número con separador de miles ───────────────────────────────────────────
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-MX').format(n)
}

// ─── Mensaje WhatsApp ─────────────────────────────────────────────────────────
export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

// ─── Calcular ahorro porcentual ───────────────────────────────────────────────
export function calcDiscount(original: number, final: number): number {
  if (original <= 0) return 0
  return Math.round(((original - final) / original) * 100)
}

// ─── Disponibilidad ───────────────────────────────────────────────────────────
export function getAvailabilityLabel(existencia: number): {
  label: string
  color: string
} {
  if (existencia <= 0)  return { label: 'Sin existencia',  color: 'text-red-600' }
  if (existencia <= 5)  return { label: 'Pocas unidades',  color: 'text-amber-600' }
  return { label: 'En existencia', color: 'text-green-600' }
}

// ─── Stock de exhibición ─────────────────────────────────────────────────────
export function getDisplayStock(slug: string, totalStock: number, tuxtlaStock: number) {
  const demoSeed = Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const useDemoStock = totalStock > 0 && tuxtlaStock === 0 && demoSeed % 4 !== 0
  const displayTuxtlaStock = useDemoStock ? Math.min(6 + (demoSeed % 8), totalStock) : tuxtlaStock
  const displayOtherStock = useDemoStock ? Math.max(totalStock - displayTuxtlaStock, 0) : Math.max(totalStock - tuxtlaStock, 0)

  return {
    useDemoStock,
    displayTuxtlaStock,
    displayOtherStock,
    hasTuxtlaStock: displayTuxtlaStock > 0,
    hasOtherStock: displayOtherStock > 0,
    stockTone: displayTuxtlaStock > 0 ? 'green' : displayOtherStock > 0 ? 'amber' : 'gray',
  }
}

// ─── Construir query string ───────────────────────────────────────────────────
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}
