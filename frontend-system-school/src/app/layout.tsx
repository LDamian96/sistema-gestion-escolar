import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'Sistema de Gestión Escolar | San José',
    template: '%s | Sistema Escolar San José',
  },
  description: 'Plataforma completa de gestión escolar. Administra estudiantes, profesores, tareas, calificaciones, asistencia y más. Optimiza la gestión de tu institución educativa.',
  keywords: ['gestión escolar', 'sistema educativo', 'plataforma escolar', 'administración educativa', 'colegio', 'escuela'],
  authors: [{ name: 'Colegio San José' }],
  creator: 'Sistema Escolar San José',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'Sistema Escolar San José',
    title: 'Sistema de Gestión Escolar San José',
    description: 'Plataforma completa de gestión escolar',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
