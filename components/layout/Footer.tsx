'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Twitter, X } from 'lucide-react'

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
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
                <button
                  onClick={() => setIsPrivacyOpen(true)}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Aviso de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Términos y Condiciones
                </button>
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

      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-250">
            {/* Cabecera */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-[#1B2B6B] flex items-center gap-2">
                Términos y Condiciones de Uso
              </h2>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-200"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="overflow-y-auto p-6 space-y-5 text-sm leading-relaxed text-gray-600">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">TÉRMINOS Y CONDICIONES DE USO</h3>
                <p className="text-xs text-gray-400">Última actualización: julio de 2026</p>
              </div>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">1. Identificación del sitio</h4>
                <p>Bienvenido a Viccom. Al acceder y utilizar el sitio web <a href="https://viccom.com.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://viccom.com.mx</a>, el usuario acepta los presentes Términos y Condiciones de Uso. Si el usuario no está de acuerdo con estos términos, deberá abstenerse de utilizar el sitio.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">2. Objeto</h4>
                <p>Viccom es un sitio web dedicado a la publicación de información, catálogo y promoción de productos tecnológicos, tales como computadoras, accesorios, componentes y equipos relacionados. Actualmente el sitio tiene fines informativos y de exhibición de productos.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">3. Uso del sitio</h4>
                <p>El usuario se compromete a utilizar el sitio de forma lícita, no realizar actividades que afecten la seguridad del sitio, no intentar acceder a información restringida y no copiar el contenido para fines comerciales sin autorización.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">4. Propiedad intelectual</h4>
                <p>Todo el contenido publicado en este sitio, incluyendo logotipos, diseño, fotografías, textos, iconos, código fuente propio y material gráfico, es propiedad de Viccom o de sus respectivos titulares y está protegido por la legislación aplicable.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">5. Información de productos</h4>
                <p>Viccom procura mantener actualizada la información de los productos. La disponibilidad, especificaciones, imágenes y precios podrán modificarse sin previo aviso. Las imágenes mostradas tienen fines ilustrativos.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">6. Enlaces externos</h4>
                <p>Este sitio puede contener enlaces hacia otros sitios web. Viccom no es responsable del contenido, disponibilidad o políticas de dichos sitios.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">7. Limitación de responsabilidad</h4>
                <p>Viccom no garantiza que el sitio permanezca disponible de forma ininterrumpida y no será responsable por interrupciones del servicio, errores técnicos, fallas de internet o pérdida de información ocasionada por terceros.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">8. Modificaciones</h4>
                <p>Viccom podrá modificar los presentes Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">9. Legislación aplicable</h4>
                <p>Estos términos se regirán conforme a las leyes vigentes de los Estados Unidos Mexicanos.</p>
              </section>
            </div>

            {/* Botón de cierre en el footer del modal */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setIsTermsOpen(false)}
                className="px-5 py-2 bg-[#1B2B6B] hover:bg-[#2A4DA0] text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-250">
            {/* Cabecera */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-[#1B2B6B] flex items-center gap-2">
                Aviso de Privacidad
              </h2>
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-200"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="overflow-y-auto p-6 space-y-5 text-sm leading-relaxed text-gray-600">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">AVISO DE PRIVACIDAD</h3>
                <p className="text-xs text-gray-400">Última actualización: julio de 2026</p>
              </div>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Identidad del responsable</h4>
                <p>Viccom es responsable del tratamiento de los datos personales que, en su caso, sean proporcionados por los usuarios del sitio web.</p>
                <p className="mt-2 text-xs text-gray-500">
                  Sitio web: <a href="https://viccom.com.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://viccom.com.mx</a><br />
                  Correo de contacto: <a href="mailto:vic_computo@hotmail.com" className="text-blue-600 hover:underline">vic_computo@hotmail.com</a>
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Información que actualmente se recopila</h4>
                <p>Actualmente este sitio no solicita registro de usuarios, no solicita datos bancarios ni información personal mediante formularios de compra. Sin embargo, el servidor puede registrar automáticamente información técnica como dirección IP, tipo de navegador, sistema operativo, fecha y hora de acceso y cookies técnicas necesarias para el funcionamiento del sitio.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Uso de la información</h4>
                <p>La información técnica podrá utilizarse únicamente para mejorar el funcionamiento del sitio, generar estadísticas de uso y mantener la seguridad de la plataforma.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Cookies</h4>
                <p>Viccom puede utilizar cookies técnicas necesarias para el funcionamiento del sitio. En caso de implementar herramientas de análisis o publicidad personalizada, este aviso será actualizado oportunamente.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Transferencia de datos</h4>
                <p>Viccom no vende, renta ni comparte datos personales con terceros, salvo cuando exista obligación legal.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Derechos ARCO</h4>
                <p>Cuando el sitio implemente formularios de contacto, registro de usuarios o procesos de compra, los titulares podrán ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición mediante solicitud al correo electrónico de contacto.</p>
              </section>

              <section>
                <h4 className="font-bold text-gray-900 mb-1">Cambios al aviso</h4>
                <p>Viccom podrá actualizar este Aviso de Privacidad cuando sea necesario. Las modificaciones serán publicadas en este mismo sitio web.</p>
              </section>
            </div>

            {/* Botón de cierre en el footer del modal */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="px-5 py-2 bg-[#1B2B6B] hover:bg-[#2A4DA0] text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
