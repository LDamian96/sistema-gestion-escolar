'use client'

import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Clock,
  ChevronRight,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const stats = [
  {
    title: 'Mis Estudiantes',
    value: '156',
    subtitle: 'En 4 cursos',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Clases Hoy',
    value: '4',
    subtitle: '2 completadas',
    icon: BookOpen,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Tareas Pendientes',
    value: '23',
    subtitle: 'Por revisar',
    icon: ClipboardCheck,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Próximo Evento',
    value: '2h',
    subtitle: 'Reunión padres',
    icon: Calendar,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

const todaySchedule = [
  { time: '08:00', subject: 'Matemáticas', grade: '5to A', status: 'completed', students: 32 },
  { time: '09:30', subject: 'Matemáticas', grade: '5to B', status: 'completed', students: 28 },
  { time: '11:00', subject: 'Álgebra', grade: '6to A', status: 'current', students: 30 },
  { time: '14:00', subject: 'Geometría', grade: '6to B', status: 'upcoming', students: 31 },
]

const pendingTasks = [
  { id: 1, title: 'Calificar examen parcial - 5to A', deadline: 'Hoy', priority: 'high' },
  { id: 2, title: 'Subir material de clase - Álgebra', deadline: 'Mañana', priority: 'medium' },
  { id: 3, title: 'Revisar tareas - 6to B', deadline: 'Esta semana', priority: 'low' },
]

const topStudents = [
  { name: 'Laura Méndez', grade: '5to A', average: 98, avatar: 'LM' },
  { name: 'Carlos Ruiz', grade: '6to A', average: 96, avatar: 'CR' },
  { name: 'Ana López', grade: '5to B', average: 95, avatar: 'AL' },
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

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Buenos días, Profesor</h1>
          <p className="text-muted-foreground mt-1">
            Tienes 4 clases programadas para hoy.
          </p>
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
                  <p className="text-sm font-medium mt-1">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
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
                  <CardTitle>Horario de Hoy</CardTitle>
                  <CardDescription>Martes, 10 de Diciembre</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver semana
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      item.status === 'current'
                        ? 'bg-primary/10 border-2 border-primary'
                        : item.status === 'completed'
                        ? 'bg-muted/50 opacity-60'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center w-16">
                      <Clock className={`h-4 w-4 mb-1 ${
                        item.status === 'current' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className={`text-sm font-bold ${
                        item.status === 'current' ? 'text-primary' : ''
                      }`}>
                        {item.time}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.grade} • {item.students} estudiantes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'current' && (
                        <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                          En curso
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-600 rounded-full">
                          Completada
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
                  <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full">
                    {pendingTasks.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.deadline}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Mejores Estudiantes</CardTitle>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <motion.div
                      key={student.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.grade}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{student.average}%</span>
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
