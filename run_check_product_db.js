const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vrrwtefwtkkfgmmouvnx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycnd0ZWZ3dGtrZmdtbW91dm54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUwNjM4OSwiZXhwIjoyMDk2MDgyMzg5fQ.Xa1OtU-GtAdbygHOQB9iwAVN-QZEj0nWN_NUDKSc72w'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase
    .from('products')
    .select('sku_ct, nombre, costo_ct, costo_promocion, precio_publico, precio_antes, en_oferta, margen_aplicado, fecha_fin_oferta')
    .eq('sku_ct', 'COMDDL9040')
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return
  }
  
  console.log('Product in DB:', data)
}

check()
