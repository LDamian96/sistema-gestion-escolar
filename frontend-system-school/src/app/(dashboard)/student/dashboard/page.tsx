'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ClipboardCheck,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Schedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  course: {
    subject: { name: string }
    teacher: { firstName: string; lastName: string }
    classroom: {
      name: string
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
  description: string
  type: string
  dueDate: string
  course: {
    subject: { name: string }
  }
}

interface Grade {
  id: string
  score: number
  course: {
    subject: { name: string }
  }
  period: {
    name: string
  }
}

interface Enrollment {
  id: string
  status: string
  classroom: {
    name: string
    section: {
      name: string
      gradeLevel: { name: string }
    }
  }
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

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [schedulesData, tasksData, gradesData, enrollmentsData] = await Promise.all([
        api.get<Schedule[]>('/schedules'),
        api.get<Task[]>('/tasks'),
        api.get<Grade[]>('/grades'),
        api.get<Enrollment[]>('/enrollments')
      ])
      setSchedules(schedulesData)
      setTasks(tasksData)
      setGrades(gradesData)
      setEnrollments(enrollmentsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().getDay()
  const todaySchedule = schedules
    .filter(s => s.dayOfWeek === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const pendingTasks = tasks.filter(t => new Date(t.dueDate) >= new Date())
  const averageGrade = grades.length > 0
    ? grades.reduce((acc, g) => acc + g.score, 0) / grades.length
    : 0

  const stats = [
    {
      title: 'Tareas Pendientes',
      value: pendingTasks.length.toString(),
      subtitle: 'Por entregar',
      icon: ClipboardCheck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Clases Hoy',
      value: todaySchedule.length.toString(),
      subtitle: dayNames[today],
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Promedio General',
      value: averageGrade.toFixed(1),
      subtitle: 'Este período',
      icon: GraduationCap,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
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
            Hola, {user?.profile?.firstName || 'Estudiante'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {todaySchedule.length > 0
              ? `Tienes ${todaySchedule.length} clase(s) hoy. ¡Éxito!`
              : 'No tienes clases programadas para hoy.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/student/tareas">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Mis Tareas
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
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
                  <CardTitle>Mi Horario de Hoy</CardTitle>
                  <CardDescription>{dayNames[today]}, {new Date().toLocaleDateString()}</CardDescription>
                </div>
                <Link href="/student/horario">
                  <Button variant="ghost" size="sm">
                    Ver completo
                  </Button>
                </Link>
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
                            Prof. {item.course.teacher.firstName} {item.course.teacher.lastName} - {item.course.classroom.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === 'current' && (
                            <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full animate-pulse">
                              Ahora
                            </span>
                          )}
                          {status === 'completed' && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {status === 'upcoming' && (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tareas Pendientes</CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full">
                  {pendingTasks.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                  <p>No tienes tareas pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTasks.slice(0, 4).map((task, index) => {
                    const dueDate = new Date(task.dueDate)
                    const isToday = dueDate.toDateString() === new Date().toDateString()
                    const isOverdue = dueDate < new Date()

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.course.subject.name}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${
                            isOverdue ? 'text-red-500 font-medium' :
                            isToday ? 'text-orange-500 font-medium' : 'text-muted-foreground'
                          }`}>
                            {isOverdue ? 'Vencida' : isToday ? 'Hoy' : dueDate.toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.type === 'EXAM' ? 'bg-red-500/20 text-red-600' : 'bg-blue-500/20 text-blue-600'
                          }`}>
                            {task.type === 'EXAM' ? 'Examen' : 'Tarea'}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
              <div className="mt-4">
                <Link href="/student/tareas">
                  <Button variant="outline" className="w-full">
                    Ver todas las tareas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Grades Summary */}
      {grades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mis Notas Recientes</CardTitle>
              <CardDescription>Últimas calificaciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {grades.slice(0, 4).map((grade, index) => (
                  <div
                    key={grade.id}
                    className="p-4 rounded-xl bg-muted/50 text-center"
                  >
                    <p className={`text-2xl font-bold ${
                      grade.score >= 16 ? 'text-green-500' :
                      grade.score >= 11 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {grade.score.toFixed(1)}
                    </p>
                    <p className="text-sm font-medium mt-1">{grade.course.subject.name}</p>
                    <p className="text-xs text-muted-foreground">{grade.period.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
