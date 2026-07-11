import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VICCOM — Distribuidor de Equipos de Cómputo',
    template: '%s | VICCOM',
  },
  description:
    'VICCOM — Tu distribuidor confiable de equipos de cómputo, impresoras, accesorios y tecnología. Cotiza en línea.',
  keywords: [
    'equipos de computo',
    'laptops',
    'impresoras',
    'accesorios',
    'tecnología',
    'distribuidora',
    'VICCOM',
    'México',
  ],
  authors: [{ name: 'VICCOM' }],
  creator: 'VICCOM',
  publisher: 'VICCOM',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.viccom.mx'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'VICCOM',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/img/logo.png',
    apple: '/img/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B2B6B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
