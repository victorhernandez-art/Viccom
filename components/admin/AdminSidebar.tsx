'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  Settings,
  RefreshCw,
  History,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos',    icon: Package,         label: 'Productos' },
  { href: '/admin/marcas',       icon: Tag,             label: 'Marcas' },
  { href: '/admin/categorias',   icon: Layers,          label: 'Categorías' },
  { href: '/admin/precios',      icon: History,         label: 'Historial de Precios' },
  { href: '/admin/sincronizacion', icon: RefreshCw,     label: 'Sincronización' },
  { href: '/admin/configuracion', icon: Settings,       label: 'Configuración' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-[#1B2B6B] text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-blue-800">
        <Link href="/" className="block">
          <Image
            src="/img/logo.png"
            alt="VICCOM"
            width={150}
            height={45}
            className="h-10 w-auto object-contain brightness-0 invert"
          />
        </Link>
        <p className="text-blue-300 text-xs mt-1 font-medium">Panel Administrativo</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-blue-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-all mb-1"
        >
          <ChevronRight className="w-5 h-5" />
          Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
