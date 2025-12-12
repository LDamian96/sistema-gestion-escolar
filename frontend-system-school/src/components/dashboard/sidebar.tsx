'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  FileText,
  CreditCard,
  PenTool,
  Layers,
  Library,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

const menuItems: Record<Role, Array<{ href: string; icon: typeof LayoutDashboard; label: string }>> = {
  ADMIN: [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { href: '/admin/grados-secciones', icon: GraduationCap, label: 'Grados y Secciones' },
    { href: '/admin/cursos', icon: BookOpen, label: 'Cursos' },
    { href: '/admin/materias', icon: Library, label: 'Materias' },
    { href: '/admin/malla-curricular', icon: Layers, label: 'Malla Curricular' },
    { href: '/admin/matriculas', icon: FileText, label: 'Matrículas' },
    { href: '/admin/examenes', icon: PenTool, label: 'Exámenes' },
    { href: '/admin/pagos', icon: CreditCard, label: 'Pagos' },
    { href: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  ],
  TEACHER: [
    { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/teacher/cursos', icon: BookOpen, label: 'Mis Cursos' },
    { href: '/teacher/materias', icon: Library, label: 'Materias' },
    { href: '/teacher/horario', icon: Calendar, label: 'Mi Horario' },
    { href: '/teacher/asistencia', icon: ClipboardCheck, label: 'Asistencia' },
    { href: '/teacher/tareas', icon: FileText, label: 'Tareas' },
    { href: '/teacher/examenes', icon: PenTool, label: 'Exámenes' },
    { href: '/teacher/calificaciones', icon: BarChart3, label: 'Calificaciones' },
    { href: '/teacher/malla-curricular', icon: Layers, label: 'Malla Curricular' },
  ],
  STUDENT: [
    { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/horario', icon: Calendar, label: 'Mi Horario' },
    { href: '/student/materias', icon: Library, label: 'Mis Materias' },
    { href: '/student/malla-curricular', icon: Layers, label: 'Malla Curricular' },
    { href: '/student/tareas', icon: FileText, label: 'Mis Tareas' },
    { href: '/student/examenes', icon: PenTool, label: 'Mis Exámenes' },
    { href: '/student/calificaciones', icon: BarChart3, label: 'Mis Calificaciones' },
    { href: '/student/asistencia', icon: ClipboardCheck, label: 'Asistencia' },
  ],
  PARENT: [
    { href: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/parent/hijos', icon: Users, label: 'Mis Hijos' },
    { href: '/parent/calificaciones', icon: BarChart3, label: 'Calificaciones' },
    { href: '/parent/examenes', icon: PenTool, label: 'Exámenes' },
    { href: '/parent/asistencia', icon: ClipboardCheck, label: 'Asistencia' },
  ],
}

const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Profesor',
  STUDENT: 'Estudiante',
  PARENT: 'Padre de Familia',
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  // Use role from auth context, fallback to URL detection
  const role: Role = user?.role || (
    pathname.startsWith('/admin') ? 'ADMIN'
    : pathname.startsWith('/teacher') ? 'TEACHER'
    : pathname.startsWith('/student') ? 'STUDENT'
    : pathname.startsWith('/parent') ? 'PARENT'
    : 'ADMIN'
  )

  const items = menuItems[role] || []

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.profile) {
      return `${user.profile.firstName?.[0] || ''}${user.profile.lastName?.[0] || ''}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getUserName = () => {
    if (user?.profile) {
      return `${user.profile.firstName} ${user.profile.lastName}`
    }
    return user?.email || 'Usuario'
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-card border-r flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-heading font-bold text-lg"
            >
              San José
            </motion.span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="shrink-0"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar>
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-primary text-white">{getInitials()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="font-medium text-sm truncate">{getUserName()}</p>
              <p className="text-xs text-muted-foreground truncate">
                {roleLabels[role]}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-1">
        {role === 'ADMIN' && (
          <Link
            href="/admin/configuracion"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all',
              collapsed && 'justify-center'
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="text-sm">Configuración</span>}
          </Link>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full disabled:opacity-50',
            collapsed && 'justify-center'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </motion.aside>
  )
}
