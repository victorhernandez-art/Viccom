const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vrrwtefwtkkfgmmouvnx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycnd0ZWZ3dGtrZmdtbW91dm54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUwNjM4OSwiZXhwIjoyMDk2MDgyMzg5fQ.Xa1OtU-GtAdbygHOQB9iwAVN-QZEj0nWN_NUDKSc72w'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching logs:', error)
    return
  }
  
  console.log('Last sync logs:')
  data.forEach((log, idx) => {
    console.log(`\n--- Log #${idx + 1} ---`)
    console.log(`Proceso: ${log.proceso}`)
    console.log(`Estado: ${log.estado}`)
    console.log(`Mensaje: ${log.mensaje}`)
    console.log(`Error Detalle: ${log.error_detalle}`)
    console.log(`Fecha: ${log.created_at}`)
  })
}

check()
