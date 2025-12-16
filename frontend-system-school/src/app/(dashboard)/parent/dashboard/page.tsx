'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  AlertCircle,
  Clock,
  MapPin,
  User,
  GraduationCap,
  ChevronDown,
  PenTool,
  XCircle,
  Layers,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import {
  parents,
  students,
  getCoursesByClassroom,
  getLevelName,
  getGradeName,
  Student,
  Course
} from '@/lib/mock-data'

// Padre actual (simulado - debería venir del contexto de autenticación)
const currentParent = parents[0]

// Obtener los hijos del padre
const childrenData = currentParent.studentIds
  .map(studentId => students.find(s => s.id === studentId))
  .filter((s): s is Student => s !== undefined)

// Días de la semana
const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Obtener el día actual
const today = new Date().getDay()
const todayAdjusted = today === 0 ? 7 : today

// Interfaz para horario
interface ScheduleItem {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  subject: string
  teacherName: string
  classroom: string
  courseId: string
  studentId: string
  studentName: string
  gradeSection: string
}

// Generar horarios de todos los hijos
const allChildrenSchedules: ScheduleItem[] = childrenData.flatMap(child => {
  if (!child.classroom) return []
  const courses = getCoursesByClassroom(child.classroom.id)
  return courses.flatMap(course =>
    course.schedules.map(schedule => ({
      id: `${child.id}-${schedule.id}`,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      subject: course.subject.name,
      teacherName: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Sin asignar',
      classroom: course.classroom.name,
      courseId: course.id,
      studentId: child.id,
      studentName: `${child.firstName} ${child.lastName}`,
      gradeSection: child.classroom ? `${getGradeName(child.classroom)} ${child.classroom.section.name}` : ''
    }))
  )
}).sort((a, b) => {
  if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
  return a.startTime.localeCompare(b.startTime)
})

// Determinar estado de cada clase
const getCurrentTimeStatus = (startTime: string, endTime: string) => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeMinutes = currentHour * 60 + currentMinute

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const startTimeMinutes = startHour * 60 + startMinute
  const endTimeMinutes = endHour * 60 + endMinute

  if (currentTimeMinutes > endTimeMinutes) return 'completed'
  if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) return 'current'
  return 'upcoming'
}

// Datos de tareas por hijo
interface Task {
  id: number
  title: string
  subject: string
  dueDate: string
  status: 'pending' | 'graded' | 'not_submitted'
  grade?: number
  childId: string
  childName: string
}

const allTasks: Task[] = childrenData.flatMap((child, childIndex) => [
  {
    id: childIndex * 10 + 1,
    title: 'Ejercicios de Álgebra',
    subject: 'Matemáticas',
    dueDate: '2024-12-15',
    status: 'pending' as const,
    childId: child.id,
    childName: `${child.firstName} ${child.lastName}`
  },
  {
    id: childIndex * 10 + 2,
    title: 'Ensayo sobre Historia',
    subject: 'Historia',
    dueDate: '2024-12-14',
    status: 'pending' as const,
    childId: child.id,
    childName: `${child.firstName} ${child.lastName}`
  },
  {
    id: childIndex * 10 + 3,
    title: 'Lectura Comprensiva',
    subject: 'Español',
    dueDate: '2024-12-10',
    status: 'graded' as const,
    grade: 18,
    childId: child.id,
    childName: `${child.firstName} ${child.lastName}`
  },
])

// Datos de exámenes por hijo
interface Exam {
  id: number
  title: string
  subject: string
  date: string
  time: string
  status: 'upcoming' | 'graded'
  grade?: number
  childId: string
  childName: string
}

const allExams: Exam[] = childrenData.flatMap((child, childIndex) => [
  {
    id: childIndex * 10 + 1,
    title: 'Examen Parcial',
    subject: 'Matemáticas',
    date: '2024-12-18',
    time: '08:00 AM',
    status: 'upcoming' as const,
    childId: child.id,
    childName: `${child.firstName} ${child.lastName}`
  },
  {
    id: childIndex * 10 + 2,
    title: 'Examen Final',
    subject: 'Ciencias',
    date: '2024-12-20',
    time: '10:00 AM',
    status: 'upcoming' as const,
    childId: child.id,
    childName: `${child.firstName} ${child.lastName}`
  },
  {
    id: childIndex * 10 + 3,
    title: 'Examen de Unidad',
    subject: 'Historia',
    date: '2024-12-05',
    time: '09:00 AM',
    status: 'graded' as const,
    grade: 17,
    childId: child.id,
    childName: `${child.firstName} ${child.lastName}`
  },
])

// Datos de asistencia por hijo
const attendanceData: Record<string, { present: number; absent: number; late: number; rate: number }> = {}
childrenData.forEach(child => {
  attendanceData[child.id] = {
    present: 42 + Math.floor(Math.random() * 6),
    absent: Math.floor(Math.random() * 3),
    late: Math.floor(Math.random() * 4),
    rate: 92 + Math.floor(Math.random() * 8)
  }
})

// Preparar datos de hijos con estadísticas
const childrenWithStats = childrenData.map(child => {
  const courses = child.classroom ? getCoursesByClassroom(child.classroom.id) : []
  const childTasks = allTasks.filter(t => t.childId === child.id)
  const childExams = allExams.filter(e => e.childId === child.id)
  const attendance = attendanceData[child.id] || { present: 0, absent: 0, late: 0, rate: 0 }

  return {
    ...child,
    avatar: `${child.firstName[0]}${child.lastName[0]}`,
    grade: child.classroom ? `${getGradeName(child.classroom)} ${child.classroom.section.name}` : 'Sin aula',
    level: child.classroom ? getLevelName(child.classroom) : '',
    location: child.classroom?.location || '',
    average: 85 + Math.floor(Math.random() * 15),
    attendance: attendance.rate,
    pendingTasks: childTasks.filter(t => t.status === 'pending').length,
    pendingExams: childExams.filter(e => e.status === 'upcoming').length,
    coursesCount: courses.length,
    schedulesCount: courses.reduce((acc, c) => acc + c.schedules.length, 0)
  }
})

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
  const [selectedDay, setSelectedDay] = useState(todayAdjusted)
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [expandedChild, setExpandedChild] = useState<string | null>(childrenData[0]?.id || null)

  // Horario del día seleccionado (filtrado por hijo si está seleccionado)
  const selectedDaySchedule = useMemo(() => {
    let schedules = allChildrenSchedules.filter(s => s.dayOfWeek === selectedDay)
    if (selectedChild !== 'all') {
      schedules = schedules.filter(s => s.studentId === selectedChild)
    }
    return schedules.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [selectedDay, selectedChild])

  // Tareas filtradas
  const filteredTasks = useMemo(() => {
    if (selectedChild === 'all') return allTasks.filter(t => t.status === 'pending')
    return allTasks.filter(t => t.childId === selectedChild && t.status === 'pending')
  }, [selectedChild])

  // Exámenes filtrados
  const filteredExams = useMemo(() => {
    if (selectedChild === 'all') return allExams.filter(e => e.status === 'upcoming')
    return allExams.filter(e => e.childId === selectedChild && e.status === 'upcoming')
  }, [selectedChild])

  // Stats generales
  const stats = useMemo(() => {
    const children = selectedChild === 'all' ? childrenWithStats : childrenWithStats.filter(c => c.id === selectedChild)
    return {
      totalChildren: childrenData.length,
      totalPendingTasks: children.reduce((acc, c) => acc + c.pendingTasks, 0),
      totalPendingExams: children.reduce((acc, c) => acc + c.pendingExams, 0),
      averageAttendance: Math.round(children.reduce((acc, c) => acc + c.attendance, 0) / children.length),
      averageGrade: Math.round(children.reduce((acc, c) => acc + c.average, 0) / children.length),
    }
  }, [selectedChild])

  // Formatear fecha
  const formatDate = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
    return date.toLocaleDateString('es-ES', options)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {currentParent.firstName[0]}{currentParent.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Bienvenido, {currentParent.firstName} {currentParent.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Users className="h-3 w-3 mr-1" />
                {currentParent.relationship}
              </span>
              <span className="text-sm text-muted-foreground">
                {childrenData.length} {childrenData.length === 1 ? 'hijo registrado' : 'hijos registrados'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/parent/pagos">
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Pagos
            </Button>
          </Link>
        </div>
      </div>

      {/* Child Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedChild === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChild('all')}
            >
              <Users className="h-4 w-4 mr-2" />
              Todos mis hijos
            </Button>
            {childrenData.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChild(child.id)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className={`text-[10px] ${selectedChild === child.id ? 'bg-primary-foreground text-primary' : 'bg-primary/10 text-primary'}`}>
                    {child.firstName[0]}{child.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {child.firstName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {[
          { title: 'Hijos', value: stats.totalChildren.toString(), icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { title: 'Tareas Pendientes', value: stats.totalPendingTasks.toString(), icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { title: 'Exámenes Próximos', value: stats.totalPendingExams.toString(), icon: PenTool, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
          { title: 'Asistencia Prom.', value: `${stats.averageAttendance}%`, icon: Calendar, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { title: 'Promedio General', value: `${stats.averageGrade}%`, icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childrenWithStats.map((child, index) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className={`hover:shadow-lg transition-all ${selectedChild === child.id ? 'border-primary' : 'hover:border-primary/50'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {child.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{child.firstName} {child.lastName}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {child.grade}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600">
                              {child.level}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="p-2 rounded-lg bg-muted/50 text-center">
                          <p className="text-lg font-bold text-green-500">{child.average}%</p>
                          <p className="text-[10px] text-muted-foreground">Promedio</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50 text-center">
                          <p className="text-lg font-bold text-blue-500">{child.attendance}%</p>
                          <p className="text-[10px] text-muted-foreground">Asistencia</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50 text-center">
                          <p className="text-lg font-bold text-orange-500">{child.pendingTasks}</p>
                          <p className="text-[10px] text-muted-foreground">Tareas</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50 text-center">
                          <p className="text-lg font-bold text-purple-500">{child.pendingExams}</p>
                          <p className="text-[10px] text-muted-foreground">Exámenes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setSelectedChild(child.id)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Todo
                    </Button>
                    <Link href="/parent/calificaciones">
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Notas
                      </Button>
                    </Link>
                    <Link href="/parent/asistencia">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        Asistencia
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Horario de los hijos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horario {selectedChild === 'all' ? 'de mis Hijos' : `de ${childrenData.find(c => c.id === selectedChild)?.firstName}`}
                </CardTitle>
                <CardDescription className="capitalize">{formatDate()}</CardDescription>
              </div>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 4, 5].map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                    className={`${day === todayAdjusted ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {dayNames[day].substring(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDaySchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay clases programadas para {dayNames[selectedDay]}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedDaySchedule.map((item, index) => {
                  const status = selectedDay === todayAdjusted
                    ? getCurrentTimeStatus(item.startTime, item.endTime)
                    : selectedDay < todayAdjusted ? 'completed' : 'upcoming'

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        status === 'current'
                          ? 'bg-primary/10 border-2 border-primary'
                          : status === 'completed'
                          ? 'bg-muted/50 opacity-60'
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center w-16 shrink-0">
                        <span className={`text-sm font-bold ${status === 'current' ? 'text-primary' : ''}`}>
                          {item.startTime}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.endTime}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{item.subject}</p>
                          {selectedChild === 'all' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                              {item.studentName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.teacherName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.classroom}
                          </span>
                        </div>
                      </div>
                      {status === 'current' && (
                        <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full animate-pulse">
                          Ahora
                        </span>
                      )}
                      {status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid - Tareas, Exámenes, Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tareas Pendientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tareas Pendientes
                </CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full">
                  {filteredTasks.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No hay tareas pendientes</p>
                  </div>
                ) : (
                  filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="p-3 rounded-xl border hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.subject}</p>
                          {selectedChild === 'all' && (
                            <span className="text-xs text-blue-600">{task.childName}</span>
                          )}
                        </div>
                        <span className="text-xs text-orange-500 font-medium">{task.dueDate}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <Link href="/parent/tareas" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Ver todas las tareas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exámenes Próximos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Exámenes Próximos
                </CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-600 rounded-full">
                  {filteredExams.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {filteredExams.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No hay exámenes próximos</p>
                  </div>
                ) : (
                  filteredExams.map((exam, index) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="p-3 rounded-xl border hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{exam.title}</p>
                          <p className="text-xs text-muted-foreground">{exam.subject}</p>
                          {selectedChild === 'all' && (
                            <span className="text-xs text-blue-600">{exam.childName}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-purple-500 font-medium">{exam.date}</p>
                          <p className="text-xs text-muted-foreground">{exam.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <Link href="/parent/examenes" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Ver todos los exámenes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { href: '/parent/tareas', label: 'Ver Tareas', icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
                  { href: '/parent/examenes', label: 'Ver Exámenes', icon: PenTool, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
                  { href: '/parent/asistencia', label: 'Ver Asistencia', icon: Calendar, color: 'text-green-500', bgColor: 'bg-green-500/10' },
                  { href: '/parent/calificaciones', label: 'Ver Calificaciones', icon: TrendingUp, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                  { href: '/parent/pagos', label: 'Ver Pagos', icon: CreditCard, color: 'text-red-500', bgColor: 'bg-red-500/10' },
                  { href: '/parent/hijos', label: 'Ver Mis Hijos', icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
                ].map((link, index) => (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${link.bgColor}`}>
                        <link.icon className={`h-4 w-4 ${link.color}`} />
                      </div>
                      <span className="font-medium text-sm">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Resumen de Asistencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Resumen de Asistencia
                </CardTitle>
                <CardDescription>Este mes</CardDescription>
              </div>
              <Link href="/parent/asistencia">
                <Button variant="outline" size="sm">
                  Ver Detalle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {childrenWithStats.map((child, index) => {
                const attendance = attendanceData[child.id] || { present: 0, absent: 0, late: 0, rate: 0 }
                return (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {child.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{child.firstName} {child.lastName}</p>
                        <p className="text-xs text-muted-foreground">{child.grade}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className={`text-2xl font-bold ${attendance.rate >= 95 ? 'text-green-500' : attendance.rate >= 90 ? 'text-blue-500' : 'text-orange-500'}`}>
                          {attendance.rate}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <p className="text-sm font-bold text-green-500">{attendance.present}</p>
                        <p className="text-[10px] text-muted-foreground">Presentes</p>
                      </div>
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <p className="text-sm font-bold text-red-500">{attendance.absent}</p>
                        <p className="text-[10px] text-muted-foreground">Ausencias</p>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <p className="text-sm font-bold text-yellow-500">{attendance.late}</p>
                        <p className="text-[10px] text-muted-foreground">Tardanzas</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
