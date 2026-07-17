import Link from 'next/link'
import { Truck, Shield, Phone, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Entrega Rápida',
    desc: 'En Tuxtla Gutiérrez el envío es gratis a partir de $600 MXN. Para otros municipios de Chiapas, el costo se calcula según el destino.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Productos Originales',
    desc: 'Garantía de fábrica en todos los equipos',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Soporte Dedicado',
    desc: 'Asesoría personalizada para tu negocio',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Catálogo Actualizado',
    desc: 'Precios y existencias actualizados cada 15 min',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
]

export default function ValueProposition() {
  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <div className={`${f.bg} ${f.color} p-3 rounded-xl flex-shrink-0`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
