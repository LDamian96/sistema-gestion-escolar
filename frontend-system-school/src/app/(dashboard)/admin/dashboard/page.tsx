'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Bell,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'

// Interfaces para la respuesta del API
interface DashboardAnalytics {
  totals: {
    students: number
    teachers: number
    parents: number
    courses: number
    pendingPayments: number
  }
  demographics: {
    studentsByGender: Array<{ gender: string; count: number }>
  }
  recent: {
    enrollments: Array<{
      id: string
      enrollmentDate: string
      student: {
        firstName: string
        lastName: string
      }
    }>
  }
}

interface StatItem {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: typeof Users
  color: string
  bgColor: string
}

// Datos por defecto para eventos (estos podrían venir de otra API)
const upcomingEvents = [
  {
    id: 1,
    title: 'Reunión de Padres',
    date: '15 Dic',
    time: '10:00 AM',
    type: 'meeting',
  },
  {
    id: 2,
    title: 'Exámenes Finales',
    date: '18 Dic',
    time: '08:00 AM',
    type: 'exam',
  },
  {
    id: 3,
    title: 'Festival Navideño',
    date: '22 Dic',
    time: '06:00 PM',
    type: 'event',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatItem[]>([])
  const [genderStats, setGenderStats] = useState({ male: 0, female: 0, total: 0 })
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string
    user: string
    action: string
    time: string
    avatar: string
  }>>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await api.get<DashboardAnalytics>('/analytics/dashboard')

        // Construir stats desde los totales
        const newStats: StatItem[] = [
          {
            title: 'Total Estudiantes',
            value: data.totals.students.toLocaleString(),
            change: '+0%',
            trend: 'up',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Profesores Activos',
            value: data.totals.teachers.toLocaleString(),
            change: '+0%',
            trend: 'up',
            icon: GraduationCap,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Cursos Activos',
            value: data.totals.courses.toLocaleString(),
            change: '+0%',
            trend: 'up',
            icon: BookOpen,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Pagos Pendientes',
            value: data.totals.pendingPayments.toLocaleString(),
            change: data.totals.pendingPayments > 0 ? '-' : '+0%',
            trend: data.totals.pendingPayments > 0 ? 'down' : 'up',
            icon: DollarSign,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
          },
        ]
        setStats(newStats)

        // Procesar estadísticas de género
        const maleCount = data.demographics.studentsByGender.find(g => g.gender === 'MALE')?.count || 0
        const femaleCount = data.demographics.studentsByGender.find(g => g.gender === 'FEMALE')?.count || 0
        setGenderStats({
          male: maleCount,
          female: femaleCount,
          total: maleCount + femaleCount
        })

        // Procesar matrículas recientes como actividades
        const activities = data.recent.enrollments.map((enrollment) => ({
          id: enrollment.id,
          user: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          action: 'se matriculó en el sistema',
          time: formatTimeAgo(new Date(enrollment.enrollmentDate)),
          avatar: `${enrollment.student.firstName[0]}${enrollment.student.lastName[0]}`,
        }))
        setRecentActivities(activities)

        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Error al cargar los datos del dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Función para formatear tiempo relativo
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de vuelta. Aquí está el resumen de hoy.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Gender Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Género</CardTitle>
            <CardDescription>Estadísticas de estudiantes por sexo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10">
                <div className="p-3 rounded-full bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{genderStats.male}</p>
                  <p className="text-sm text-muted-foreground">Estudiantes Masculinos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/10">
                <div className="p-3 rounded-full bg-pink-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-600">{genderStats.female}</p>
                  <p className="text-sm text-muted-foreground">Estudiantes Femeninas</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">Porcentaje</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Masculino</span>
                      <span className="font-medium">{genderStats.total > 0 ? Math.round((genderStats.male / genderStats.total) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${genderStats.total > 0 ? (genderStats.male / genderStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Femenino</span>
                      <span className="font-medium">{genderStats.total > 0 ? Math.round((genderStats.female / genderStats.total) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${genderStats.total > 0 ? (genderStats.female / genderStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en el sistema</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver todo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay actividades recientes
                  </p>
                ) : (
                  recentActivities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {activity.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{' '}
                          <span className="text-muted-foreground">{activity.action}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>Esta semana</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium">{event.date.split(' ')[1]}</span>
                      <span className="text-lg font-bold">{event.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground/50" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas comunes de administración</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Agregar Estudiante', icon: Users, color: 'bg-blue-500', href: '/admin/usuarios' },
                { label: 'Nuevo Profesor', icon: GraduationCap, color: 'bg-green-500', href: '/admin/usuarios' },
                { label: 'Crear Curso', icon: BookOpen, color: 'bg-purple-500', href: '/admin/cursos' },
                { label: 'Ver Matrículas', icon: Calendar, color: 'bg-orange-500', href: '/admin/matriculas' },
              ].map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
