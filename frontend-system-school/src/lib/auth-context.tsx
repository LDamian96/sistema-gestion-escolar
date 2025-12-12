'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, User, ApiError } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rutas públicas que no requieren autenticación
const publicPaths = ['/', '/login', '/contacto', '/recuperar'];

// Mapeo de roles a rutas permitidas
const roleRoutes: Record<string, string[]> = {
  ADMIN: ['/admin'],
  TEACHER: ['/teacher'],
  STUDENT: ['/student'],
  PARENT: ['/parent'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verificar autenticación al cargar
  const checkAuth = useCallback(async () => {
    try {
      const response = await authApi.check();
      if (response.authenticated) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      // Si es 401, intentar refresh
      if (error instanceof ApiError && error.status === 401) {
        try {
          await authApi.refresh();
          const retryResponse = await authApi.check();
          if (retryResponse.authenticated) {
            setUser(retryResponse.user);
            return;
          }
        } catch {
          // Refresh falló, usuario no autenticado
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);

      // Redirigir según el rol
      const role = response.user.role;
      const defaultRoute = roleRoutes[role]?.[0] || '/';
      router.push(`${defaultRoute}/dashboard`);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores de logout
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Proteger rutas
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname.startsWith('/recuperar')
    );

    // Si no está autenticado y la ruta no es pública, redirigir a login
    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    // Si está autenticado y está en una ruta pública (login, etc), redirigir al dashboard
    if (user && (pathname === '/login' || pathname === '/')) {
      const role = user.role;
      const defaultRoute = roleRoutes[role]?.[0] || '/';
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

  // Configurar refresh automático del token
  useEffect(() => {
    if (!user) return;

    // Refresh cada 10 minutos (antes de que expire el access token de 15 min)
    const interval = setInterval(async () => {
      try {
        await authApi.refresh();
      } catch {
        // Si falla el refresh, hacer logout
        logout();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
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
