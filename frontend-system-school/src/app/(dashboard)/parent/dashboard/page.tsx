'use client'

import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  TrendingUp,
  FileText,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const children = [
  {
    id: 1,
    name: 'María García',
    grade: '5to Grado',
    avatar: 'MG',
    average: 92,
    attendance: 98,
    pendingPayment: false,
  },
  {
    id: 2,
    name: 'José García',
    grade: '3er Grado',
    avatar: 'JG',
    average: 88,
    attendance: 95,
    pendingPayment: true,
  },
]

const stats = [
  {
    title: 'Hijos Registrados',
    value: '2',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Promedio General',
    value: '90%',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Eventos del Mes',
    value: '4',
    icon: Calendar,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Pagos Pendientes',
    value: '1',
    icon: CreditCard,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

const recentGrades = [
  { child: 'María', subject: 'Matemáticas', grade: 95, date: 'Hoy' },
  { child: 'José', subject: 'Español', grade: 85, date: 'Ayer' },
  { child: 'María', subject: 'Ciencias', grade: 92, date: 'Hace 2 días' },
  { child: 'José', subject: 'Historia', grade: 88, date: 'Hace 3 días' },
]

const upcomingEvents = [
  { title: 'Reunión de Padres - 5to', date: '15 Dic', time: '10:00 AM', child: 'María' },
  { title: 'Presentación Navidad', date: '20 Dic', time: '06:00 PM', child: 'Ambos' },
  { title: 'Entrega de Boletines', date: '22 Dic', time: '09:00 AM', child: 'Ambos' },
]

const notifications = [
  { id: 1, message: 'Nueva calificación registrada para María', time: 'Hace 1 hora', read: false },
  { id: 2, message: 'Recordatorio: Pago de mensualidad pendiente', time: 'Hace 3 horas', read: false },
  { id: 3, message: 'José ha sido premiado por su participación', time: 'Ayer', read: true },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ParentDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Portal de Padres</h1>
          <p className="text-muted-foreground mt-1">
            Seguimiento académico de sus hijos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contactar Profesor
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Realizar Pago
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

      {/* Children Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-heading text-xl font-semibold mb-4">Mis Hijos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {child.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{child.name}</h3>
                          <p className="text-sm text-muted-foreground">{child.grade}</p>
                        </div>
                        {child.pendingPayment && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Pago pendiente
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Promedio</p>
                          <p className="text-xl font-bold text-green-500">{child.average}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Asistencia</p>
                          <p className="text-xl font-bold text-blue-500">{child.attendance}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Calificaciones
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Horario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Calificaciones Recientes</CardTitle>
                  <CardDescription>Últimas evaluaciones de sus hijos</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGrades.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      item.grade >= 90 ? 'bg-green-500/20 text-green-600' :
                      item.grade >= 80 ? 'bg-blue-500/20 text-blue-600' :
                      item.grade >= 70 ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'
                    }`}>
                      {item.grade}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">{item.child}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                        <span className="text-xs">{event.date.split(' ')[1]}</span>
                        <span className="text-lg font-bold">{event.date.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time} • {event.child}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notificaciones</CardTitle>
                  <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-600 rounded-full">
                    {notifications.filter(n => !n.read).length} nuevas
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        notif.read ? 'bg-muted/30' : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full ${
                        notif.read ? 'bg-muted-foreground' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
