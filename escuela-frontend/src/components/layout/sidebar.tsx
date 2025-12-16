'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  CreditCard,
  Settings,
  Menu,
  UserCheck,
  Building2,
  Clock,
  BarChart3,
  Shield,
  Bell,
  BookMarked,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

interface NavGroup {
  title: string
  icon: React.ElementType
  roles: UserRole[]
  items: NavItem[]
}

// Items individuales (sin grupo)
const singleNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
]

// Grupos de navegación con submenús desplegables
const navGroups: NavGroup[] = [
  {
    title: 'Usuarios',
    icon: Users,
    roles: ['ADMIN'],
    items: [
      { title: 'Estudiantes', href: '/estudiantes', icon: GraduationCap, roles: ['ADMIN'] },
      { title: 'Profesores', href: '/profesores', icon: UserCheck, roles: ['ADMIN'] },
      { title: 'Tutores', href: '/tutores', icon: Users, roles: ['ADMIN'] },
    ]
  },
  {
    title: 'Académico',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    items: [
      { title: 'Grado-Sección', href: '/estructura', icon: Building2, roles: ['ADMIN'] },
      { title: 'Grupos', href: '/grupos', icon: Users, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Materias', href: '/materias', icon: BookOpen, roles: ['ADMIN'] },
      { title: 'Malla Curricular', href: '/malla-curricular', icon: BookMarked, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Horarios', href: '/horarios', icon: Clock, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    ]
  },
  {
    title: 'Evaluaciones',
    icon: FileText,
    roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    items: [
      { title: 'Tareas', href: '/tareas', icon: FileText, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { title: 'Exámenes', href: '/examenes', icon: ClipboardList, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { title: 'Asistencia', href: '/asistencia', icon: Calendar, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    ]
  },
  {
    title: 'Comunicación',
    icon: MessageSquare,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
    items: [
      { title: 'Mensajes', href: '/mensajes', icon: MessageSquare, roles: ['ADMIN', 'TEACHER', 'PARENT'] },
      { title: 'Notificaciones', href: '/notificaciones', icon: Bell, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    ]
  },
  {
    title: 'Administración',
    icon: Shield,
    roles: ['ADMIN', 'PARENT'],
    items: [
      { title: 'Pagos', href: '/pagos', icon: CreditCard, roles: ['ADMIN', 'PARENT'] },
      { title: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['ADMIN'] },
      { title: 'Auditoría', href: '/auditoria', icon: Shield, roles: ['ADMIN'] },
    ]
  },
]

interface SidebarProps {
  role: UserRole
  basePath: string
}

export function Sidebar({ role, basePath }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Usuarios', 'Académico', 'Evaluaciones', 'Comunicación', 'Administración'])
  const pathname = usePathname()

  // Filtrar items individuales por rol
  const filteredSingleItems = singleNavItems.filter((item) => item.roles.includes(role))

  // Filtrar grupos y sus items por rol
  const filteredGroups = navGroups
    .filter((group) => group.roles.includes(role))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role))
    }))
    .filter((group) => group.items.length > 0)

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupTitle)
        ? prev.filter((g) => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
  }

  const textVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none' },
  }

  const renderNavItem = (item: NavItem, index: number, isSubItem: boolean = false) => {
    const isActive = pathname === `${basePath}${item.href}` ||
                    pathname.startsWith(`${basePath}${item.href}/`)
    const Icon = item.icon

    const linkContent = (
      <Link
        href={`${basePath}${item.href}`}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90',
          isSubItem && !isCollapsed && 'ml-4'
        )}
      >
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </motion.div>
        <motion.span
          variants={textVariants}
          className="truncate"
        >
          {item.title}
        </motion.span>
      </Link>
    )

    return (
      <motion.div
        key={item.href}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.title}
            </TooltipContent>
          </Tooltip>
        ) : (
          linkContent
        )}
      </motion.div>
    )
  }

  const renderNavGroup = (group: NavGroup, groupIndex: number) => {
    const isExpanded = expandedGroups.includes(group.title)
    const GroupIcon = group.icon

    // Verificar si algún item del grupo está activo
    const hasActiveItem = group.items.some(
      (item) =>
        pathname === `${basePath}${item.href}` ||
        pathname.startsWith(`${basePath}${item.href}/`)
    )

    if (isCollapsed) {
      // En modo colapsado, mostrar solo los iconos de los items
      return (
        <div key={group.title} className="space-y-1">
          {group.items.map((item, index) => renderNavItem(item, index))}
        </div>
      )
    }

    return (
      <motion.div
        key={group.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: groupIndex * 0.1 }}
        className="space-y-1"
      >
        {/* Header del grupo (desplegable) */}
        <button
          onClick={() => toggleGroup(group.title)}
          className={cn(
            'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
            'text-foreground hover:bg-sidebar-accent',
            hasActiveItem && 'text-primary'
          )}
        >
          <div className="flex items-center gap-3">
            <GroupIcon className="h-5 w-5 shrink-0" />
            <span>{group.title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </button>

        {/* Items del grupo */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pt-1">
                {group.items.map((item, index) => renderNavItem(item, index, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative h-screen border-r bg-sidebar-background flex flex-col"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-heading font-semibold text-lg">Escuela</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </motion.div>
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {/* Items individuales primero */}
            {filteredSingleItems.map((item, index) => renderNavItem(item, index))}

            {filteredSingleItems.length > 0 && filteredGroups.length > 0 && (
              <Separator className="my-2" />
            )}

            {/* Grupos desplegables */}
            {filteredGroups.map((group, index) => renderNavGroup(group, index))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          <Separator className="mb-3" />
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Configuración</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-5 w-5" />
              <span>Configuración</span>
            </Button>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
