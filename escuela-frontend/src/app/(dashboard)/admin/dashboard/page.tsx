'use client'

import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const stats = [
  {
    title: 'Total Estudiantes',
    value: '1,234',
    change: '+12%',
    icon: GraduationCap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Profesores Activos',
    value: '56',
    change: '+3%',
    icon: UserCheck,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Cursos Activos',
    value: '48',
    change: '+5%',
    icon: BookOpen,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Ingresos del Mes',
    value: 'S/ 45,200',
    change: '+18%',
    icon: CreditCard,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
]

const recentActivities = [
  { action: 'Nuevo estudiante registrado', user: 'María García', time: 'Hace 5 min', type: 'student' },
  { action: 'Pago recibido', user: 'Juan Pérez (Tutor)', time: 'Hace 15 min', type: 'payment' },
  { action: 'Tarea calificada', user: 'Prof. Rodríguez', time: 'Hace 30 min', type: 'task' },
  { action: 'Asistencia registrada', user: 'Prof. López', time: 'Hace 1 hora', type: 'attendance' },
  { action: 'Nuevo examen creado', user: 'Prof. Martínez', time: 'Hace 2 horas', type: 'exam' },
]

const pendingTasks = [
  { title: 'Aprobar solicitudes de inscripción', count: 5, priority: 'high' },
  { title: 'Revisar reportes de asistencia', count: 3, priority: 'medium' },
  { title: 'Actualizar horarios del período', count: 1, priority: 'low' },
  { title: 'Verificar pagos pendientes', count: 8, priority: 'high' },
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
  visible: { opacity: 1, y: 0 },
}

export default function AdminDashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al panel de administración
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas acciones en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Tareas Pendientes
              </CardTitle>
              <CardDescription>
                Acciones que requieren atención
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'destructive'
                            : task.priority === 'medium'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="w-16 justify-center"
                      >
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <Badge variant="outline">{task.count}</Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Attendance Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Asistencia - Hoy</CardTitle>
            <CardDescription>
              Estado de asistencia por nivel educativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { level: 'Primaria', present: 95, total: 100 },
                { level: 'Secundaria', present: 88, total: 100 },
                { level: 'Preparatoria', present: 92, total: 100 },
              ].map((item, index) => (
                <div key={item.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.present}% asistencia
                    </span>
                  </div>
                  <Progress value={item.present} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
