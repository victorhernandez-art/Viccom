'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Search,
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Category } from '@/types'

interface HeaderProps {
  categories?: Category[]
}

type CategoryNode = Category & {
  children: CategoryNode[]
}

const CT_GROUPS = [
  { id: 'cables', nombre: 'CABLES', slug: 'cables' },
  { id: 'componentes', nombre: 'COMPONENTES', slug: 'componentes' },
  { id: 'computadoras', nombre: 'COMPUTADORAS', slug: 'computadoras' },
  { id: 'conectividad', nombre: 'CONECTIVIDAD', slug: 'conectividad' },
  { id: 'electronica', nombre: 'ELECTRÓNICA', slug: 'electronica' },
  { id: 'energia', nombre: 'ENERGÍA', slug: 'energia' },
  { id: 'gaming', nombre: 'GAMING', slug: 'gaming' },
  { id: 'impresion', nombre: 'IMPRESIÓN', slug: 'impresion' },
  { id: 'punto-de-venta', nombre: 'PUNTO DE VENTA', slug: 'punto-de-venta' },
  { id: 'hogar-y-linea-blanca', nombre: 'HOGAR Y LÍNEA BLANCA', slug: 'hogar-y-linea-blanca' },
  { id: 'accesorios', nombre: 'ACCESORIOS', slug: 'accesorios' }
]

const GROUP_MAPPING: Record<string, string> = {
  // Cables
  'cables': 'CABLES',
  'adaptadores': 'CABLES',
  'modulos-supresores': 'CABLES',
  
  // Componentes
  'ensamble': 'COMPONENTES',
  'tarjetas': 'COMPONENTES',
  'almacenamiento': 'COMPONENTES',
  'almacenamiento-portatil': 'COMPONENTES',
  
  // Computadoras
  'computadoras': 'COMPUTADORAS',
  'computadoras-gaming': 'COMPUTADORAS',
  'workstations': 'COMPUTADORAS',
  'apple': 'COMPUTADORAS',
  'all-in-one': 'COMPUTADORAS',
  'mini-pc': 'COMPUTADORAS',
  
  // Conectividad
  'red-activa': 'CONECTIVIDAD',
  'red-pasiva': 'CONECTIVIDAD',
  'conferencias': 'CONECTIVIDAD',
  'conmutadores-pbx': 'CONECTIVIDAD',
  'telefonos': 'CONECTIVIDAD',
  'centro-de-datos': 'CONECTIVIDAD',
  
  // Electrónica
  'electronica': 'ELECTRÓNICA',
  'senalizacion-digital': 'ELECTRÓNICA',
  'audio': 'ELECTRÓNICA',
  'proyectores': 'ELECTRÓNICA',
  'televisiones': 'ELECTRÓNICA',
  
  // Energía
  'energia': 'ENERGÍA',
  'respaldo-y-regulacion': 'ENERGÍA',
  'energia-solar-y-eolica': 'ENERGÍA',
  
  // Gaming
  'gaming': 'GAMING',
  'accesorios-gaming': 'GAMING',
  
  // Impresión
  'impresion': 'IMPRESIÓN',
  'consumibles': 'IMPRESIÓN',
  'digitalizacion-de-imagenes': 'IMPRESIÓN',
  
  // Punto de Venta
  'perifericos-para-pos': 'PUNTO DE VENTA',
  'accesorios-y-consumibles-pos': 'PUNTO DE VENTA',
  'credencializacion': 'PUNTO DE VENTA',
  'sistemas-de-control': 'PUNTO DE VENTA',
  
  // Hogar y Línea Blanca
  'linea-blanca': 'HOGAR Y LÍNEA BLANCA',
  'domotica': 'HOGAR Y LÍNEA BLANCA',
  'oficina': 'HOGAR Y LÍNEA BLANCA',
  'papeleria': 'HOGAR Y LÍNEA BLANCA',
  'salud': 'HOGAR Y LÍNEA BLANCA',
  
  // Accesorios
  'accesorios-para-componentes': 'ACCESORIOS',
  'accesorios-para-computo': 'ACCESORIOS',
  'accesorios-para-electronica': 'ACCESORIOS',
  'accesorios-para-energia': 'ACCESORIOS',
  'accesorios-para-impresion': 'ACCESORIOS',
  'accesorios-para-servidores': 'ACCESORIOS',
  'esd': 'ACCESORIOS',
  'software': 'ACCESORIOS',
  'software_': 'ACCESORIOS'
}

function sortCategories<T extends Category>(items: T[]) {
  return [...items].sort((a, b) => {
    return a.nombre.localeCompare(b.nombre, 'es')
  })
}

function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>()

  categories.forEach((category) => {
    nodes.set(category.id, { ...category, children: [] })
  })

  const roots: CategoryNode[] = []

  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.children.push(node)
      return
    }

    roots.push(node)
  })

  const sortTree = (items: CategoryNode[]): CategoryNode[] =>
    sortCategories(items).map((item) => ({
      ...item,
      children: sortTree(item.children),
    }))

  return sortTree(roots)
}

function categoryHref(category: Category) {
  return `/categoria/${category.path || category.slug}`
}

function flattenCategoryTree(nodes: CategoryNode[]) {
  const items: CategoryNode[] = []

  const visit = (node: CategoryNode) => {
    items.push(node)
    node.children.forEach(visit)
  }

  nodes.forEach(visit)
  return items
}

export default function Header({ categories = [] }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [activeRootId, setActiveRootId] = useState<string | null>(null)
  const router = useRouter()
  const catRef = useRef<HTMLLIElement>(null)
  const categoryTree = useMemo(() => {
    // 1. Construir el árbol de categorías base
    const rawTree = buildCategoryTree(categories)

    // 2. Agrupar categorías raíz reales en los 11 grupos de CT
    const groupsMap = new Map<string, CategoryNode[]>()
    CT_GROUPS.forEach(g => groupsMap.set(g.nombre, []))

    rawTree.forEach(node => {
      const slugKey = node.slug.toLowerCase().trim()
      const groupName = GROUP_MAPPING[slugKey] ?? 'ACCESORIOS'
      if (groupsMap.has(groupName)) {
        groupsMap.get(groupName)!.push(node)
      }
    })

    // 3. Retornar los 11 grupos como raíces virtuales
    return CT_GROUPS.map(g => {
      const children = groupsMap.get(g.nombre) ?? []
      const sortedChildren = children.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

      return {
        id: g.id,
        nombre: g.nombre,
        slug: g.slug,
        parent_id: null,
        nivel: 1,
        activo: true,
        created_at: '',
        updated_at: '',
        orden: 0,
        path: g.slug,
        children: sortedChildren // Las raíces reales de la DB se vuelven el nivel 2 aquí
      } as CategoryNode
    })
  }, [categories])

  const activeRoot = categoryTree.find((category) => category.id === activeRootId) ?? categoryTree[0]
  const mobileCategories = useMemo(() => flattenCategoryTree(categoryTree).slice(0, 24), [categoryTree])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!activeRootId && categoryTree.length > 0) {
      setActiveRootId(categoryTree[0].id)
    }
  }, [activeRootId, categoryTree])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()

    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  function handleMobileCategoryClick(catId: string) {
    setExpandedMobileCatId(expandedMobileCatId === catId ? null : catId)
  }

  const phoneDisplay = process.env.NEXT_PUBLIC_EMPRESA_TELEFONO ?? '961 120 93 61'
  const phoneHref = phoneDisplay.replace(/\D/g, '')
  const email = process.env.NEXT_PUBLIC_EMPRESA_CORREO ?? 'vic_computo@hotmail.com'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-shadow duration-200 border-b border-gray-200 bg-white',
        scrolled ? 'shadow-md' : 'shadow-sm'
      )}
    >
      <div className="bg-[#1B2B6B] text-white py-1 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-end flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap w-full justify-between sm:justify-end">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <a href={`tel:${phoneHref}`} className="hover:underline">
                {phoneDisplay}
              </a>
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0" onClick={() => setMenuOpen(false)}>
            <Image
              src="/img/logo.png"
              alt="Viccom"
              width={200}
              height={60}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl items-center">
            <div className="flex w-full rounded-lg border border-gray-300 overflow-hidden focus-within:border-[#1B2B6B] transition-colors">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, marcas, SKU..."
                className="flex-1 px-4 py-2 text-sm outline-none bg-white text-gray-800 placeholder:text-gray-400"
                aria-label="Buscar productos"
              />
              <button
                type="submit"
                className="bg-[#CC0000] hover:bg-[#A30000] px-4 text-white transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          <button
            className="md:hidden ml-auto p-2 text-[#1B2B6B]"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0 text-sm font-medium">
            <li>
              <Link
                href="/"
                className="flex items-center px-4 py-3 text-[#1B2B6B] font-semibold hover:bg-gray-100 hover:text-[#CC0000] transition-colors"
              >
                Inicio
              </Link>
            </li>

            <li ref={catRef} className="relative">
              <button
                onClick={() => setCatOpen((value) => !value)}
                className="flex items-center gap-1 px-4 py-3 text-[#1B2B6B] hover:bg-gray-100 hover:text-[#CC0000] transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>Categorías</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', catOpen && 'rotate-180')} />
              </button>

              {catOpen && (
                <div className="absolute left-0 top-full z-50 w-[920px] max-w-[calc(100vw-2rem)] bg-white shadow-xl border border-gray-200 rounded-b-lg overflow-hidden">
                  {categoryTree.length > 0 ? (
                    <div className="grid grid-cols-[240px_1fr_220px] min-h-[360px]">
                      <div className="bg-gray-50 border-r border-gray-200 py-2 max-h-[480px] overflow-y-auto">
                        {categoryTree.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onMouseEnter={() => setActiveRootId(category.id)}
                            onFocus={() => setActiveRootId(category.id)}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors',
                              activeRoot?.id === category.id
                                ? 'bg-white text-[#CC0000] font-semibold'
                                : 'text-gray-700 hover:bg-white hover:text-[#1B2B6B]'
                            )}
                          >
                            <span className="truncate">{category.nombre}</span>
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          </button>
                        ))}
                      </div>

                      <div className="p-5 max-h-[480px] overflow-y-auto">
                        {activeRoot && (
                          <>
                            <Link
                              href={categoryHref(activeRoot)}
                              onClick={() => setCatOpen(false)}
                              className="inline-flex text-base font-semibold text-[#1B2B6B] hover:text-[#CC0000]"
                            >
                              {activeRoot.nombre}
                            </Link>

                            {activeRoot.children.length > 0 ? (
                              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5">
                                {activeRoot.children.map((group) => (
                                  <div key={group.id}>
                                    <Link
                                      href={categoryHref(group)}
                                      onClick={() => setCatOpen(false)}
                                      className="block text-sm font-semibold text-gray-900 hover:text-[#CC0000]"
                                    >
                                      {group.nombre}
                                    </Link>
                                    {group.children.length > 0 && (
                                      <div className="mt-2 space-y-1.5">
                                        {group.children.slice(0, 24).map((child) => (
                                          <Link
                                            key={child.id}
                                            href={categoryHref(child)}
                                            onClick={() => setCatOpen(false)}
                                            className="block text-sm text-gray-600 hover:text-[#CC0000]"
                                          >
                                            {child.nombre}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-4 text-sm text-gray-500">
                                Esta categoría está lista para recibir nuevos productos.
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="bg-[#1B2B6B] p-5 text-white max-h-[480px] overflow-y-auto">
                        <p className="text-xs uppercase tracking-wide text-white/70">VICCOM</p>
                        <p className="mt-2 text-lg font-semibold leading-tight">
                          Equipos de cómputo, componentes y soluciones para tu negocio
                        </p>
                        <div className="mt-5 space-y-2">
                          <Link
                            href="/catalogo"
                            onClick={() => setCatOpen(false)}
                            className="block rounded border border-white/30 px-3 py-2 text-sm hover:bg-white hover:text-[#1B2B6B] transition-colors"
                          >
                            Ver catálogo completo
                          </Link>
                          <Link
                            href="/catalogo?en_oferta=true"
                            onClick={() => setCatOpen(false)}
                            className="block rounded border border-white/30 px-3 py-2 text-sm hover:bg-white hover:text-[#1B2B6B] transition-colors"
                          >
                            Ver ofertas
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-gray-400 text-sm">Sin categorías</p>
                  )}
                </div>
              )}
            </li>

            <li>
              <Link
                href="/catalogo"
                className="flex items-center px-4 py-3 text-[#1B2B6B] font-semibold hover:bg-gray-100 hover:text-[#CC0000] transition-colors"
              >
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo?destacado=true"
                className="flex items-center px-4 py-3 text-[#1B2B6B] font-semibold hover:bg-gray-100 hover:text-[#CC0000] transition-colors"
              >
                Destacados
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo?en_oferta=true"
                className="flex items-center px-4 py-3 text-[#CC0000] font-semibold hover:bg-gray-100 hover:text-[#A30000] transition-colors"
              >
                Ofertas
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-base">Menú Principal</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-50 bg-gray-50">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="flex w-full rounded-lg border border-gray-300 overflow-hidden focus-within:border-[#1B2B6B] bg-white transition-colors">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="flex-1 px-3 py-2 text-sm outline-none bg-white text-gray-800 placeholder:text-gray-400"
                  />
                  <button type="submit" className="bg-[#CC0000] px-3 text-white">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="block py-3 border-b border-gray-100 text-gray-700 font-semibold hover:text-[#CC0000]">Inicio</Link>
              <Link href="/catalogo" onClick={() => setMenuOpen(false)} className="block py-3 border-b border-gray-100 text-gray-700 font-semibold hover:text-[#CC0000]">Catálogo completo</Link>
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categorías</p>
                {categoryTree.map((category) => {
                  const isExpanded = expandedMobileCatId === category.id
                  const hasChildren = category.children && category.children.length > 0
                  return (
                    <div key={category.id} className="border-b border-gray-50">
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => handleMobileCategoryClick(category.id)}
                            className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-gray-700 hover:text-[#CC0000]"
                          >
                            <span>{category.nombre}</span>
                            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', isExpanded && 'rotate-180 text-[#CC0000]')} />
                          </button>
                          {isExpanded && (
                            <div className="pl-3 pb-2 space-y-1.5 bg-gray-50/50 rounded-lg p-2 mb-2">
                              <Link href={categoryHref(category)} onClick={() => setMenuOpen(false)} className="block py-1.5 text-xs text-[#1B2B6B] font-semibold hover:text-[#CC0000]">Ver todo</Link>
                              {category.children.map((subcat) => (
                                <Link key={subcat.id} href={categoryHref(subcat)} onClick={() => setMenuOpen(false)} className="block py-1 text-xs text-gray-600 hover:text-[#CC0000] border-l border-gray-200 pl-2">{subcat.nombre}</Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link href={categoryHref(category)} onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-700 hover:text-[#CC0000]">{category.nombre}</Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">VICCOM Computadoras</p>
              <p>Tel: {phoneDisplay}</p>
              <p>Email: {email}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
