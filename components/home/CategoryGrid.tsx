import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  Apple,
  Cable,
  ChevronRight,
  CircuitBoard,
  Computer,
  Cpu,
  Gamepad2,
  HardDrive,
  Headphones,
  Home,
  Keyboard,
  Laptop,
  MemoryStick,
  Monitor,
  Package,
  Plug,
  Printer,
  Server,
  Store,
  Tablet,
  Usb,
  Wifi,
  Zap,
} from 'lucide-react'
import { type Category } from '@/types'

const iconClass = 'w-8 h-8'

const CATEGORY_ICONS: Record<string, ReactNode> = {
  'computadoras': <Computer className={iconClass} />,
  'equipos-de-computo': <Monitor className={iconClass} />,
  'laptops': <Laptop className={iconClass} />,
  'tabletas': <Tablet className={iconClass} />,
  'pcs-de-escritorio': <Computer className={iconClass} />,
  'all-in-one': <Monitor className={iconClass} />,
  'mini-pc': <Computer className={iconClass} />,
  'workstations': <Server className={iconClass} />,
  'apple': <Apple className={iconClass} />,
  'macbook': <Laptop className={iconClass} />,
  'ipad': <Tablet className={iconClass} />,
  'audio': <Headphones className={iconClass} />,

  'impresion': <Printer className={iconClass} />,
  'impresoras': <Printer className={iconClass} />,
  'multifuncionales': <Printer className={iconClass} />,
  'toner': <Printer className={iconClass} />,
  'cartuchos': <Printer className={iconClass} />,
  'consumibles': <Package className={iconClass} />,

  'electronica': <CircuitBoard className={iconClass} />,
  'componentes': <Cpu className={iconClass} />,
  'memorias-ram': <MemoryStick className={iconClass} />,
  'discos-ssd': <HardDrive className={iconClass} />,
  'tarjetas-madre': <CircuitBoard className={iconClass} />,
  'procesadores': <Cpu className={iconClass} />,
  'gabinetes': <Package className={iconClass} />,

  'cables': <Cable className={iconClass} />,
  'adaptadores': <Plug className={iconClass} />,
  'cables-hdmi': <Cable className={iconClass} />,
  'cables-displayport': <Cable className={iconClass} />,
  'cables-vga': <Cable className={iconClass} />,
  'cables-usb': <Usb className={iconClass} />,

  'almacenamiento': <HardDrive className={iconClass} />,
  'almacenamiento-portatil': <HardDrive className={iconClass} />,
  'gabinetes-para-discos-duros': <HardDrive className={iconClass} />,
  'memorias-usb': <Usb className={iconClass} />,
  'discos-duros-externos': <HardDrive className={iconClass} />,
  'memorias-flash': <MemoryStick className={iconClass} />,
  'almacenamiento-optico': <HardDrive className={iconClass} />,

  'conectividad': <Wifi className={iconClass} />,
  'redes': <Wifi className={iconClass} />,
  'energia': <Zap className={iconClass} />,
  'gaming': <Gamepad2 className={iconClass} />,
  'punto-de-venta': <Store className={iconClass} />,
  'hogar-y-linea-blanca': <Home className={iconClass} />,
  'accesorios': <Keyboard className={iconClass} />,
  'servidores': <Server className={iconClass} />,
}

function getIcon(slug: string) {
  return CATEGORY_ICONS[slug] ?? <Package className={iconClass} />
}

function categoryHref(category: Category) {
  return `/categoria/${category.path || category.slug}`
}

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const visible = categories.slice(0, 8)

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B2B6B]">
              Categorías
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Encuentra exactamente lo que necesitas
            </p>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:flex items-center gap-1 text-[#CC0000] hover:underline text-sm font-medium"
          >
            Ver todo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {visible.map((cat) => (
            <Link
              key={cat.id}
              href={categoryHref(cat)}
              className="group flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50/60 p-6 text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-600 hover:text-white hover:shadow-md"
            >
              <span className="text-current transition-transform duration-200 group-hover:scale-110">
                {getIcon(cat.slug)}
              </span>
              <span className="font-semibold text-sm text-center leading-tight text-current">
                {cat.nombre}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 text-[#CC0000] font-medium hover:underline"
          >
            Ver todas las categorías
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
