'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/services/api'

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface User {
  id: string
  email: string
  code: string
  role: UserRole
  firstName: string
  lastName: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Rutas públicas que no requieren autenticación
const publicPaths = ['/', '/login', '/recuperar']

// Mapeo de roles a rutas base
const roleRoutes: Record<UserRole, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
}

// Clave para localStorage
const STORAGE_KEY = 'school_access_token'
const USER_STORAGE_KEY = 'school_user'

// ============================================
// CREDENCIALES DE PRUEBA (MOCK)
// Eliminar cuando el backend esté listo
// ============================================
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@escuela.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@escuela.com',
      code: 'ADM001',
      role: 'ADMIN',
      firstName: 'Administrador',
      lastName: 'Sistema',
      isActive: true,
    },
  },
  'profesor@escuela.com': {
    password: 'profesor123',
    user: {
      id: '2',
      email: 'profesor@escuela.com',
      code: 'DOC001',
      role: 'TEACHER',
      firstName: 'Juan',
      lastName: 'Pérez',
      isActive: true,
    },
  },
  'estudiante@escuela.com': {
    password: 'estudiante123',
    user: {
      id: '3',
      email: 'estudiante@escuela.com',
      code: 'EST001',
      role: 'STUDENT',
      firstName: 'María',
      lastName: 'García',
      isActive: true,
    },
  },
  'padre@escuela.com': {
    password: 'padre123',
    user: {
      id: '4',
      email: 'padre@escuela.com',
      code: 'TUT001',
      role: 'PARENT',
      firstName: 'Carlos',
      lastName: 'García',
      isActive: true,
    },
  },
}

// Cambiar a false cuando el backend esté listo
const USE_MOCK_AUTH = true

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Verificar si la ruta es pública
  const isPublicPath = useCallback((path: string) => {
    return publicPaths.some(
      (publicPath) => path === publicPath || path.startsWith('/recuperar')
    )
  }, [])

  // Obtener ruta base según el rol
  const getBaseRoute = useCallback((role: UserRole) => {
    return roleRoutes[role] || '/admin'
  }, [])

  // Cargar usuario de localStorage al montar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEY)
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } catch {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(USER_STORAGE_KEY)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  // Proteger rutas
  useEffect(() => {
    if (isLoading) return

    const currentIsPublic = isPublicPath(pathname)

    // Si no está autenticado y la ruta no es pública, redirigir a login
    if (!user && !currentIsPublic) {
      router.push('/login')
      return
    }

    // Si está autenticado y está en login o home, redirigir al dashboard
    if (user && (pathname === '/login' || pathname === '/')) {
      const baseRoute = getBaseRoute(user.role)
      router.push(`${baseRoute}/dashboard`)
      return
    }

    // Verificar que el usuario tenga acceso a la ruta actual
    if (user && !currentIsPublic) {
      const baseRoute = getBaseRoute(user.role)
      const hasAccess = pathname.startsWith(baseRoute)

      if (!hasAccess) {
        router.push(`${baseRoute}/dashboard`)
      }
    }
  }, [user, isLoading, pathname, router, isPublicPath, getBaseRoute])

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Usar autenticación mock si está habilitada
      if (USE_MOCK_AUTH) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular delay

        const mockUser = MOCK_USERS[email.toLowerCase()]
        if (!mockUser || mockUser.password !== password) {
          setIsLoading(false)
          throw new Error('Credenciales inválidas')
        }

        const fakeToken = 'mock-token-' + Date.now()
        localStorage.setItem(STORAGE_KEY, fakeToken)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser.user))
        setUser(mockUser.user)

        const baseRoute = getBaseRoute(mockUser.user.role)
        router.push(`${baseRoute}/dashboard`)
        setIsLoading(false)
        return
      }

      // Autenticación real con el backend
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, user: userData } = response.data

      // Guardar token y usuario
      localStorage.setItem(STORAGE_KEY, accessToken)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)

      // Redirigir según el rol
      const baseRoute = getBaseRoute(userData.role)
      router.push(`${baseRoute}/dashboard`)
    } catch (error: unknown) {
      setIsLoading(false)
      if (error instanceof Error) {
        throw error
      }
      const err = error as { response?: { data?: { message?: string } } }
      throw new Error(err.response?.data?.message || 'Error al iniciar sesión')
    }

    setIsLoading(false)
  }

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    router.push('/login')
  }, [router])

  // Refrescar usuario
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      const userData = response.data
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
