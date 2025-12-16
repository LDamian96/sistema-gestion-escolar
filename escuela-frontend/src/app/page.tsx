'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirigir según el rol del usuario
        switch (user.role) {
          case 'ADMIN':
            router.replace('/admin/dashboard')
            break
          case 'TEACHER':
            router.replace('/teacher/dashboard')
            break
          case 'STUDENT':
            router.replace('/student/dashboard')
            break
          case 'TUTOR':
            router.replace('/tutor/dashboard')
            break
          default:
            router.replace('/login')
        }
      } else {
        router.replace('/login')
      }
    }
  }, [user, isLoading, router])

  // Mostrar loading mientras se verifica la autenticación
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
