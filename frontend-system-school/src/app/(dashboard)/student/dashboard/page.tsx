'use client'

import { useState, useMemo } from 'react'
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
  GraduationCap,
  MapPin,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import {
  students,
  courses,
  getCoursesByClassroom,
  getLevelName,
  getGradeName,
  Course,
  Schedule
} from '@/lib/mock-data'

// Estudiante actual (simulado - debería venir del contexto de autenticación)
const currentStudent = students[0]
const studentClassroom = currentStudent.classroom

// Obtener cursos del aula del estudiante
const studentCourses = studentClassroom ? getCoursesByClassroom(studentClassroom.id) : []

// Días de la semana
const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Obtener el día actual (1-7)
const today = new Date().getDay()
const todayAdjusted = today === 0 ? 7 : today // Domingo = 7

// Generar horario semanal
interface ScheduleItem {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  subject: string
  teacherName: string
  classroom: string
  courseId: string
}

const weeklySchedule: ScheduleItem[] = studentCourses.flatMap(course =>
  course.schedules.map(schedule => ({
    id: schedule.id,
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    subject: course.subject.name,
    teacherName: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Sin asignar',
    classroom: course.classroom.name,
    courseId: course.id
  }))
).sort((a, b) => {
  if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
  return a.startTime.localeCompare(b.startTime)
})

// Horario de hoy
const todaySchedule = weeklySchedule
  .filter(s => s.dayOfWeek === todayAdjusted)
  .sort((a, b) => a.startTime.localeCompare(b.startTime))

// Determinar estado de cada clase (completada, actual, próxima)
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

const attendanceByCourse: Record<string, number> = {
  all: 98,
}
studentCourses.forEach(course => {
  attendanceByCourse[course.id] = 95 + Math.floor(Math.random() * 6)
})

const stats = [
  {
    title: 'Tareas Pendientes',
    value: '5',
    subtitle: 'Esta semana',
    icon: ClipboardCheck,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Materias Inscritas',
    value: studentCourses.length.toString(),
    subtitle: 'Este período',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
]

const pendingAssignments = [
  { id: 1, title: 'Ejercicios de Álgebra Cap. 5', subject: studentCourses[0]?.subject.name || 'Matemáticas', deadline: 'Hoy 11:59 PM', progress: 60 },
  { id: 2, title: 'Ensayo sobre la Revolución', subject: studentCourses[1]?.subject.name || 'Historia', deadline: 'Mañana', progress: 30 },
  { id: 3, title: 'Reporte de Laboratorio', subject: studentCourses[2]?.subject.name || 'Ciencias', deadline: 'Vie 13 Dic', progress: 0 },
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

export default function StudentDashboardPage() {
  const [attendanceCourse, setAttendanceCourse] = useState('all')
  const [selectedDay, setSelectedDay] = useState(todayAdjusted)
  const attendanceValue = attendanceByCourse[attendanceCourse] || 98

  // Horario del día seleccionado
  const selectedDaySchedule = useMemo(() => {
    return weeklySchedule
      .filter(s => s.dayOfWeek === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [selectedDay])

  // Formatear fecha
  const formatDate = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
    return date.toLocaleDateString('es-ES', options)
  }

  return (
    <div className="space-y-8">
      {/* Header con info del estudiante */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {currentStudent.firstName[0]}{currentStudent.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              ¡Hola, {currentStudent.firstName}!
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <GraduationCap className="h-3 w-3 mr-1" />
                {studentClassroom ? `${getGradeName(studentClassroom)} ${studentClassroom.section.name}` : 'Sin aula'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                {studentClassroom ? getLevelName(studentClassroom) : ''}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600">
                <MapPin className="h-3 w-3 mr-1" />
                {studentClassroom?.location || ''}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Código: {currentStudent.enrollmentCode}
            </p>
          </div>
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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

        {/* Attendance Card with Filter */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{attendanceValue}%</p>
                <p className="text-sm font-medium mt-1">Asistencia</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    onClick={() => setAttendanceCourse('all')}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      attendanceCourse === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Todos
                  </button>
                  {studentCourses.slice(0, 5).map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setAttendanceCourse(course.id)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        attendanceCourse === course.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {course.subject.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Horario Semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Mi Horario
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
              <div className="space-y-3">
                {selectedDaySchedule.map((item, index) => {
                  const status = selectedDay === todayAdjusted
                    ? getCurrentTimeStatus(item.startTime, item.endTime)
                    : selectedDay < todayAdjusted ? 'completed' : 'upcoming'

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        status === 'current'
                          ? 'bg-primary/10 border-2 border-primary'
                          : status === 'completed'
                          ? 'bg-muted/50 opacity-60'
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center w-20 shrink-0">
                        <Clock className={`h-4 w-4 mb-1 ${
                          status === 'current' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className={`text-sm font-bold ${
                          status === 'current' ? 'text-primary' : ''
                        }`}>
                          {item.startTime}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.endTime}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.subject}</p>
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
                      <div className="flex items-center gap-2 shrink-0">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen de materias */}
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
                  <CardTitle>Mis Materias</CardTitle>
                  <CardDescription>{studentCourses.length} materias inscritas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studentCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{course.subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Sin profesor'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.schedules.length} clases/semana
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                  {pendingAssignments.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAssignments.map((task, index) => (
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
                        <p className="text-xs text-muted-foreground">{task.subject}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${
                        task.deadline.includes('Hoy') ? 'text-red-500 font-medium' : 'text-muted-foreground'
                      }`}>
                        {task.deadline}
                      </span>
                      <span className="text-muted-foreground">{task.progress}% completado</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
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
    </div>
  )
}
