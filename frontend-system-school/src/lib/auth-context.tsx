'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authenticateUser } from './mock-data';

// Tipo de usuario para el contexto
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  firstName: string;
  lastName: string;
  relatedId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rutas publicas que no requieren autenticacion
const publicPaths = ['/', '/login', '/contacto', '/recuperar'];

// Mapeo de roles a rutas permitidas
const roleRoutes: Record<string, string[]> = {
  ADMIN: ['/admin'],
  TEACHER: ['/teacher'],
  STUDENT: ['/student'],
  PARENT: ['/parent'],
};

// Clave para localStorage
const STORAGE_KEY = 'school_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Cargar usuario de localStorage al montar
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Login con datos estaticos
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser = authenticateUser(email, password);

    if (!mockUser) {
      setIsLoading(false);
      throw new Error('Credenciales incorrectas');
    }

    const authUser: User = {
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      relatedId: mockUser.relatedId,
    };

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);

    // Redirigir segun el rol
    const defaultRoute = roleRoutes[authUser.role]?.[0] || '/';
    router.push(`${defaultRoute}/dashboard`);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  // Proteger rutas
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname.startsWith('/recuperar')
    );

    // Si no esta autenticado y la ruta no es publica, redirigir a login
    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    // Si esta autenticado y esta en una ruta publica (login, etc), redirigir al dashboard
    if (user && (pathname === '/login' || pathname === '/')) {
      const defaultRoute = roleRoutes[user.role]?.[0] || '/';
      router.push(`${defaultRoute}/dashboard`);
      return;
    }

    // Verificar que el usuario tenga acceso a la ruta actual
    if (user && !isPublicPath) {
      const allowedPrefixes = roleRoutes[user.role] || [];
      const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!hasAccess) {
        // Redirigir a su dashboard
        const defaultRoute = roleRoutes[user.role]?.[0] || '/';
        router.push(`${defaultRoute}/dashboard`);
      }
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
