const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vrrwtefwtkkfgmmouvnx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycnd0ZWZ3dGtrZmdtbW91dm54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUwNjM4OSwiZXhwIjoyMDk2MDgyMzg5fQ.Xa1OtU-GtAdbygHOQB9iwAVN-QZEj0nWN_NUDKSc72w'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Invocando recalcular_precios_masivo...')
  const { data, error } = await supabase.rpc('recalcular_precios_masivo', {
    p_motivo: 'sync_ct_test',
    p_usuario: 'sync-test-service'
  })
  
  if (error) {
    console.error('Error al ejecutar RPC:', error)
  } else {
    console.log('Éxito! Precios actualizados:', data)
  }
}

test()
