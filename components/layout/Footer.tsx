import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  const phoneDisplay = '961 120 93 61'
  const phoneHref = '9611209361'
  const email = 'vic_computo@hotmail.com'

  return (
    <footer className="bg-[#2A4DA0] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image
              src="/img/logoblanco.png"
              alt="VICCOM"
              width={180}
              height={55}
              className="h-14 w-auto object-contain"
            />
            <p className="text-blue-100 text-sm leading-relaxed">
              Distribuidor de equipos de cómputo, impresoras, accesorios y tecnología.
              Proveemos soluciones tecnológicas a empresas y particulares.
            </p>

          </div>

          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Categorías
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              {[
                ['Laptops', 'computadoras/equipos-de-computo/laptops'],
                ['PCs de Escritorio', 'computadoras/equipos-de-computo/pcs-de-escritorio'],
                ['Impresión', 'impresion'],
                ['Electrónica', 'electronica'],
                ['Cables', 'cables'],
                ['Componentes', 'componentes'],
                ['Conectividad', 'conectividad'],
                ['Accesorios', 'accesorios'],
              ].map(([name, slug]) => (
                <li key={slug}>
                  <Link
                    href={`/categoria/${slug}`}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>
                <Link href="/catalogo" className="hover:text-white hover:underline transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/catalogo?destacado=true" className="hover:text-white hover:underline transition-colors">
                  Productos Destacados
                </Link>
              </li>
              <li>
                <Link href="/catalogo?en_oferta=true" className="hover:text-white hover:underline transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="/aviso-privacidad" className="hover:text-white hover:underline transition-colors">
                  Aviso de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white hover:underline transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3 text-blue-100 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Teléfono</p>
                  <a href={`tel:${phoneHref}`} className="hover:text-white transition-colors">
                    {phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Dirección</p>
                  <p>Fracc. las Águilas, calle Aguiluchos #364. Tuxtla Gutiérrez, Chiapas</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-700 hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter/X"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-700 hover:bg-sky-600 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-400/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-blue-100 text-xs gap-2">
          <p>© {year} VICCOM - Distribuidor de Equipos de Cómputo. Todos los derechos reservados.</p>
          <p>Precios en MXN. Precios sujetos a cambio sin previo aviso.</p>
        </div>
      </div>
    </footer>
  )
}
