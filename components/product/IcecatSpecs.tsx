'use client'

import { useState, useEffect } from 'react'
import { FileText, Cpu, ListCollapse, Database } from 'lucide-react'

interface Feature {
  Feature: {
    Name: {
      Value: string
    }
  }
  Value: string | number | boolean
}

interface FeatureGroup {
  ID: string
  FeatureGroup: {
    Name: {
      Value: string
    }
  }
  Features: Feature[]
}

interface IcecatSpecsProps {
  upc: string | null | undefined
  fichaTecnicaCt?: { tipo: string, valor: string }[] | null
}

export default function IcecatSpecs({ upc, fichaTecnicaCt }: IcecatSpecsProps) {
  const [groups, setGroups] = useState<FeatureGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [isIcecatData, setIsIcecatData] = useState(false)

  useEffect(() => {
    // Cargar ficha técnica de CT como fallback/inicial
    if (fichaTecnicaCt && Array.isArray(fichaTecnicaCt) && fichaTecnicaCt.length > 0) {
      const ctGroup: FeatureGroup = {
        ID: 'ct-group-1',
        FeatureGroup: { Name: { Value: 'Características del Producto' } },
        Features: fichaTecnicaCt.map((item: any) => ({
          Feature: { Name: { Value: item.tipo ?? item.Name?.Value ?? '' } },
          Value: item.valor ?? item.Value ?? ''
        }))
      }
      setGroups([ctGroup])
      setHasData(true)
      setIsIcecatData(false)
    } else {
      setGroups([])
      setHasData(false)
      setIsIcecatData(false)
    }

    if (!upc) return

    const cleanUpc = upc.replace(/\D/g, '')
    if (cleanUpc.length < 8) return

    const username = process.env.NEXT_PUBLIC_ICECAT_USERNAME ?? 'openicecat-free'

    async function fetchSpecs() {
      setLoading(true)
      try {
        const res = await fetch(`https://live.icecat.biz/api/?UserName=${username}&Language=es&GTIN=${cleanUpc}`)
        if (!res.ok) throw new Error('Specs response error')

        const data = await res.json()
        
        if (data && data.FeaturesGroups && Array.isArray(data.FeaturesGroups) && data.FeaturesGroups.length > 0) {
          // Filtrar grupos vacíos o sin características válidas
          const validGroups = data.FeaturesGroups.filter((g: FeatureGroup) => 
            g.Features && Array.isArray(g.Features) && g.Features.length > 0
          )
          
          if (validGroups.length > 0) {
            setGroups(validGroups)
            setHasData(true)
            setIsIcecatData(true)
          }
        }
      } catch (err) {
        console.warn('No se pudieron obtener especificaciones extendidas de Open Icecat:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpecs()
  }, [upc, fichaTecnicaCt])

  if (loading && groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
        <Cpu className="w-8 h-8 text-[#1B2B6B]/40 animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Cargando ficha técnica extendida...</p>
      </div>
    )
  }

  if (!hasData || groups.length === 0) return null

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2 rounded-xl bg-blue-50 text-[#1B2B6B]">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2B6B]">Ficha Técnica Detallada</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isIcecatData 
              ? 'Información técnica certificada provista por Open Icecat' 
              : 'Especificaciones técnicas de referencia provistas por CT'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div 
            key={group.ID} 
            className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {/* Cabecera del grupo */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-[#1B2B6B]" />
              <h3 className="font-bold text-[#1B2B6B] text-sm md:text-base">
                {group.FeatureGroup.Name.Value}
              </h3>
            </div>

            {/* Tabla de características */}
            <div className="divide-y divide-gray-100">
              {group.Features.map((feat, fidx) => {
                const valueStr = typeof feat.Value === 'boolean' 
                  ? (feat.Value ? 'Sí' : 'No') 
                  : String(feat.Value)

                return (
                  <div 
                    key={fidx} 
                    className="flex px-4 py-2.5 text-xs md:text-sm hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="w-1/2 text-gray-500 font-medium pr-2">
                      {feat.Feature.Name.Value}
                    </span>
                    <span className="w-1/2 text-gray-900 font-semibold break-all">
                      {valueStr}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
