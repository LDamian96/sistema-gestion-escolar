'use client'

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
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { stats as mockStats, students, teachers, courses, tasks } from '@/lib/mock-data'

// Eventos proximos (estaticos)
const upcomingEvents = [
  {
    id: 1,
    title: 'Reunion de Padres',
    date: '15 Dic',
    time: '10:00 AM',
    type: 'meeting',
  },
  {
    id: 2,
    title: 'Examenes Finales',
    date: '18 Dic',
    time: '08:00 AM',
    type: 'exam',
  },
  {
    id: 3,
    title: 'Festival Navideno',
    date: '22 Dic',
    time: '06:00 PM',
    type: 'event',
  },
]

// Actividades recientes (ultimos estudiantes)
const recentActivities = students.slice(0, 5).map((student, idx) => ({
  id: student.id,
  user: `${student.firstName} ${student.lastName}`,
  action: 'se matriculo en el sistema',
  time: `Hace ${idx + 1} dia${idx > 0 ? 's' : ''}`,
  avatar: `${student.firstName[0]}${student.lastName[0]}`,
}))

// Estadisticas de genero
const maleCount = students.filter(s => s.gender === 'MALE').length
const femaleCount = students.filter(s => s.gender === 'FEMALE').length
const genderStats = {
  male: maleCount,
  female: femaleCount,
  total: maleCount + femaleCount
}

// Stats para las tarjetas
const statsData = [
  {
    title: 'Total Estudiantes',
    value: mockStats.totalStudents.toLocaleString(),
    change: '+12%',
    trend: 'up' as const,
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Profesores Activos',
    value: mockStats.totalTeachers.toLocaleString(),
    change: '+5%',
    trend: 'up' as const,
    icon: GraduationCap,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Cursos Activos',
    value: mockStats.totalCourses.toLocaleString(),
    change: '+8%',
    trend: 'up' as const,
    icon: BookOpen,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Tareas Pendientes',
    value: mockStats.totalTasks.toLocaleString(),
    change: '+3%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Panel de Administracion</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de vuelta. Aqui esta el resumen de hoy.
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
        {statsData.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    {stat.change}
                    <ArrowUpRight className="h-4 w-4" />
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
            <CardTitle>Distribucion por Genero</CardTitle>
            <CardDescription>Estadisticas de estudiantes por sexo</CardDescription>
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
                  <CardDescription>Ultimas acciones en el sistema</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver todo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
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
                ))}
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
                  <CardTitle>Proximos Eventos</CardTitle>
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
            <CardTitle>Acciones Rapidas</CardTitle>
            <CardDescription>Tareas comunes de administracion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Agregar Estudiante', icon: Users, color: 'bg-blue-500', href: '/admin/usuarios' },
                { label: 'Nuevo Profesor', icon: GraduationCap, color: 'bg-green-500', href: '/admin/usuarios' },
                { label: 'Crear Curso', icon: BookOpen, color: 'bg-purple-500', href: '/admin/cursos' },
                { label: 'Ver Matriculas', icon: Calendar, color: 'bg-orange-500', href: '/admin/matriculas' },
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
