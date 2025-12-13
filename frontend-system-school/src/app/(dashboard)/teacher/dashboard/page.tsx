'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Course {
  id: string
  subject: { name: string }
  classroom: {
    name: string
    section: {
      name: string
      gradeLevel: { name: string }
    }
  }
  _count?: { enrollments: number }
}

interface Schedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  course: {
    subject: { name: string }
    classroom: {
      section: {
        name: string
        gradeLevel: { name: string }
      }
    }
  }
}

interface Task {
  id: string
  title: string
  dueDate: string
  course: {
    subject: { name: string }
    classroom: {
      section: {
        name: string
        gradeLevel: { name: string }
      }
    }
  }
  _count: { submissions: number }
}

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

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesData, schedulesData, tasksData] = await Promise.all([
        api.get<Course[]>('/courses'),
        api.get<Schedule[]>('/schedules'),
        api.get<Task[]>('/tasks')
      ])
      setCourses(coursesData)
      setSchedules(schedulesData)
      setTasks(tasksData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Obtener el día actual (0-6)
  const today = new Date().getDay()
  const todaySchedule = schedules
    .filter(s => s.dayOfWeek === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Calcular estadísticas
  const totalStudents = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0)
  const pendingTasks = tasks.filter(t => new Date(t.dueDate) >= new Date())

  const stats = [
    {
      title: 'Mis Estudiantes',
      value: totalStudents.toString(),
      subtitle: `En ${courses.length} cursos`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Mis Cursos',
      value: courses.length.toString(),
      subtitle: 'Asignados',
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Clases Hoy',
      value: todaySchedule.length.toString(),
      subtitle: dayNames[today],
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Tareas Activas',
      value: pendingTasks.length.toString(),
      subtitle: 'Pendientes',
      icon: ClipboardCheck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            Bienvenido, {user?.profile?.firstName || 'Profesor'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {todaySchedule.length > 0
              ? `Tienes ${todaySchedule.length} clase(s) programada(s) para hoy.`
              : 'No tienes clases programadas para hoy.'}
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
                  <CardDescription>{dayNames[today]}, {new Date().toLocaleDateString()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes clases programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((item, index) => {
                    const now = new Date()
                    const [startHour, startMin] = item.startTime.split(':').map(Number)
                    const [endHour, endMin] = item.endTime.split(':').map(Number)
                    const startTime = new Date()
                    startTime.setHours(startHour, startMin, 0)
                    const endTime = new Date()
                    endTime.setHours(endHour, endMin, 0)

                    let status = 'upcoming'
                    if (now >= startTime && now <= endTime) status = 'current'
                    else if (now > endTime) status = 'completed'

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          status === 'current'
                            ? 'bg-primary/10 border-2 border-primary'
                            : status === 'completed'
                            ? 'bg-muted/50 opacity-60'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center w-16">
                          <Clock className={`h-4 w-4 mb-1 ${
                            status === 'current' ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm font-bold ${
                            status === 'current' ? 'text-primary' : ''
                          }`}>
                            {item.startTime}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.course.subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.course.classroom.section.gradeLevel.name} {item.course.classroom.section.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === 'current' && (
                            <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                              En curso
                            </span>
                          )}
                          {status === 'completed' && (
                            <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-600 rounded-full">
                              Completada
                            </span>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Mis Cursos</CardTitle>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-600 rounded-full">
                    {courses.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No tienes cursos asignados</p>
                ) : (
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{course.subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.classroom.section.gradeLevel.name} {course.classroom.section.name}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tareas Recientes</CardTitle>
                  <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full">
                    {tasks.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No hay tareas creadas</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 4).map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full ${
                          new Date(task.dueDate) < new Date() ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.course.subject.name} - {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
