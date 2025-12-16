'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { schedulesService, coursesService, type Schedule, type Course } from '@/services/mock-data'

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const timeSlots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30']

// Simulamos el ID del profesor actual
const CURRENT_TEACHER_ID = 't1'
const CURRENT_TEACHER_NAME = 'Carlos López'

const colors: { [key: string]: string } = {
  'Matemáticas': 'bg-blue-500',
  'Álgebra': 'bg-purple-500',
  'Geometría': 'bg-orange-500',
  'Comunicación': 'bg-green-500',
  'Ciencias Naturales': 'bg-teal-500',
  'Inglés': 'bg-pink-500',
  'Historia': 'bg-yellow-500',
}

export default function TeacherHorarioPage() {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar horarios del profesor
      const teacherSchedules = await schedulesService.getByTeacher(CURRENT_TEACHER_NAME)
      setSchedules(teacherSchedules)

      // Cargar cursos del profesor
      const allCourses = await coursesService.getAll()
      const teacherCourses = allCourses.filter(c => c.teacherId === CURRENT_TEACHER_ID && c.status === 'active')
      setCourses(teacherCourses)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el horario'
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener el día actual
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' })
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1)
  const currentDay = weekDays.includes(todayCapitalized) ? todayCapitalized : 'Lunes'

  // Organizar horarios por día
  const scheduleByDay: { [key: string]: Schedule[] } = {}
  weekDays.forEach(day => {
    scheduleByDay[day] = schedules.filter(s => {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      return dayNames[s.dayOfWeek] === day
    })
  })

  // Calcular estadísticas
  const totalWeeklyClasses = schedules.length
  const totalWeeklyHours = schedules.reduce((acc, schedule) => {
    const start = schedule.startTime.split(':')
    const end = schedule.endTime.split(':')
    const hours = parseInt(end[0]) - parseInt(start[0])
    const minutes = (parseInt(end[1]) - parseInt(start[1])) / 60
    return acc + hours + minutes
  }, 0)

  // Obtener estudiantes únicos de todos los cursos
  const uniqueStudents = new Set(courses.map(c => c.gradeSection))
  const totalStudents = uniqueStudents.size * 25 // Aproximado

  const stats = [
    { label: 'Clases Esta Semana', value: totalWeeklyClasses, icon: Calendar },
    { label: 'Horas Totales', value: `${totalWeeklyHours.toFixed(1)}h`, icon: Clock },
    { label: 'Estudiantes', value: totalStudents, icon: Users },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mi Horario</h1>
          <p className="text-muted-foreground mt-1">Horario semanal de clases</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mi Horario</h1>
          <p className="text-muted-foreground mt-1">
            Semana del {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Horario Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground">
                  Hora
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className={`p-3 text-center rounded-lg ${
                      day === currentDay
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="font-medium">{day}</p>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time, timeIndex) => (
                <motion.div
                  key={time}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + timeIndex * 0.05 }}
                  className="grid grid-cols-6 gap-2 mb-2"
                >
                  <div className="p-3 text-center text-sm text-muted-foreground flex items-center justify-center">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const daySchedules = scheduleByDay[day] || []
                    const classItem = daySchedules.find(c => c.startTime === time)

                    return (
                      <div key={`${day}-${time}`} className="min-h-[80px]">
                        {classItem ? (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`h-full p-3 rounded-lg ${
                              colors[classItem.courseName] || 'bg-gray-500'
                            } text-white cursor-pointer`}
                          >
                            <p className="font-medium text-sm">{classItem.courseName}</p>
                            <p className="text-xs opacity-90">{classItem.gradeSection}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                              <MapPin className="h-3 w-3" />
                              {classItem.room}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full bg-muted/30 rounded-lg" />
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Clases de Hoy ({currentDay})</CardTitle>
        </CardHeader>
        <CardContent>
          {(scheduleByDay[currentDay] || []).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes clases programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(scheduleByDay[currentDay] || []).map((classItem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-2 h-full min-h-[60px] rounded-full ${
                    colors[classItem.courseName] || 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{classItem.courseName}</p>
                      <span className="text-sm text-muted-foreground">- {classItem.gradeSection}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {classItem.startTime} - {classItem.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {classItem.room}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">Iniciar Clase</Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg ${
                  colors[course.subjectName] || 'bg-gray-500'
                } flex items-center justify-center`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{course.subjectName}</p>
                  <p className="text-sm text-muted-foreground">{course.gradeSection}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
