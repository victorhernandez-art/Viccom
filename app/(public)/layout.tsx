import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { type Category } from '@/types'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('activo', true)
    .order('nivel', { ascending: true })
    .order('orden', { ascending: true })
    .order('nombre', { ascending: true })

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={(categories ?? []) as Category[]} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
