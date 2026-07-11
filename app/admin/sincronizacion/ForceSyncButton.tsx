'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ForceSyncButton() {
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<string | null>(null)
  const router = useRouter()

  async function handleSync() {
    if (!confirm('¿Iniciar sincronización manual con CT Connect?')) return

    setLoading(true)
    setResult(null)

    try {
      const res  = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (json.success) {
        setResult('✓ Sincronización iniciada correctamente.')
        setTimeout(() => router.refresh(), 2000)
      } else {
        setResult(`Error: ${json.error}`)
      }
    } catch {
      setResult('Error de conexión al iniciar sincronización.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#CC0000] text-white font-bold hover:bg-[#A30000] transition-colors disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Iniciando…' : 'Forzar Sincronización'}
      </button>
      {result && (
        <p className={`text-xs font-medium ${
          result.startsWith('✓') ? 'text-green-700' : 'text-red-700'
        }`}>
          {result}
        </p>
      )}
    </div>
  )
}
