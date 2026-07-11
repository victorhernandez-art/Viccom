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

function sortCategories<T extends Category>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderA = a.orden ?? 0
    const orderB = b.orden ?? 0

    if (orderA !== orderB) return orderA - orderB
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
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories])
  const activeRoot = categoryTree.find((category) => category.id === activeRootId) ?? categoryTree[0]
  const mobileCategories = useMemo(() => flattenCategoryTree(categoryTree).slice(0, 18), [categoryTree])

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

  const phoneDisplay = process.env.NEXT_PUBLIC_EMPRESA_TELEFONO ?? '961 120 93 61'
  const phoneHref = phoneDisplay.replace(/\D/g, '')
  const email = process.env.NEXT_PUBLIC_EMPRESA_CORREO ?? 'vic_computo@hotmail.com'
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-shadow duration-300',
        scrolled ? 'shadow-lg' : 'shadow-sm'
      )}
    >
      <div className="bg-gray-100 border-b border-gray-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${phoneHref}`}
              className="flex items-center gap-1 text-gray-600 hover:text-[#CC0000] transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-[#CC0000] transition-colors"
            >
              <Mail className="w-3 h-3" />
              <span>{email}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-white transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/img/logo.png"
              alt="VICCOM - Distribuidor de equipos de computo"
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
                      <div className="bg-gray-50 border-r border-gray-200 py-2">
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

                      <div className="p-5">
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
                                        {group.children.slice(0, 8).map((child) => (
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

                      <div className="bg-[#1B2B6B] p-5 text-white">
                        <p className="text-xs uppercase tracking-wide text-white/70">VICCOM</p>
                        <p className="mt-2 text-lg font-semibold leading-tight">
                          Equipos de computo, componentes y soluciones para tu negocio
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
                    <p className="px-4 py-3 text-gray-400 text-sm">Sin categorias</p>
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
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 border-b border-gray-100">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="flex w-full rounded-lg border border-gray-300 overflow-hidden focus-within:border-[#1B2B6B] transition-colors">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  aria-label="Buscar"
                />
                <button type="submit" className="bg-[#CC0000] px-3 text-white" aria-label="Buscar">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <nav className="px-4 py-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block py-3 border-b border-gray-100 text-gray-700 font-medium hover:text-[#CC0000]"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              onClick={() => setMenuOpen(false)}
              className="block py-3 border-b border-gray-100 text-gray-700 font-medium hover:text-[#CC0000]"
            >
              Catálogo completo
            </Link>
            {mobileCategories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(category)}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 border-b border-gray-50 text-gray-600 text-sm hover:text-[#CC0000]"
                style={{ paddingLeft: `${12 + Math.min(category.nivel ?? 0, 3) * 14}px` }}
              >
                {category.nombre}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
