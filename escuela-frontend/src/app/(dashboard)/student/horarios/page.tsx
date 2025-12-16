'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { schedulesService, type Schedule } from '@/services/mock-data'

interface ScheduleDetail extends Schedule {
  duration: string
}

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const timeSlots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30']

const colors: { [key: string]: string } = {
  'Matemáticas': 'bg-blue-500',
  'Comunicación': 'bg-green-500',
  'Ciencias Naturales': 'bg-purple-500',
  'Historia': 'bg-orange-500',
  'Inglés': 'bg-pink-500',
  'Educación Física': 'bg-red-500',
  'Arte': 'bg-yellow-500',
  'Computación': 'bg-gray-500',
  'Música': 'bg-indigo-500',
  'Geografía': 'bg-cyan-500'
}

export default function StudentHorarioPage() {
  const [schedules, setSchedules] = useState<ScheduleDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ScheduleDetail | null>(null)
  const { toast } = useToast()

  // Simular que el estudiante está en 5to A
  const studentGradeSection = '5to A'

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const allSchedules = await schedulesService.getAll()

      // Filtrar solo los horarios del grado/sección del estudiante
      const mySchedules = allSchedules
        .filter(schedule => schedule.gradeSection === studentGradeSection)
        .map(schedule => {
          // Calcular duración
          const [startHour, startMin] = schedule.startTime.split(':').map(Number)
          const [endHour, endMin] = schedule.endTime.split(':').map(Number)
          const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin)
          const duration = `${durationMin} min`

          return {
            ...schedule,
            duration
          }
        })

      setSchedules(mySchedules)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los horarios',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const todayName = today.toLocaleDateString('es-ES', { weekday: 'long' })
  const todayCapitalized = todayName.charAt(0).toUpperCase() + todayName.slice(1)
  const currentDay = weekDays.includes(todayCapitalized) ? todayCapitalized : 'Lunes'

  // Organizar horarios por día y hora
  const scheduleByDay = useMemo(() => {
    const organized: { [key: string]: { [key: string]: ScheduleDetail | null } } = {}

    weekDays.forEach(day => {
      organized[day] = {}
      timeSlots.forEach(time => {
        organized[day][time] = null
      })
    })

    schedules.forEach(schedule => {
      const dayName = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][schedule.dayOfWeek]
      if (dayName && organized[dayName]) {
        organized[dayName][schedule.startTime] = schedule
      }
    })

    return organized
  }, [schedules])

  // Clases de hoy
  const todayClasses = useMemo(() => {
    return schedules
      .filter(s => {
        const dayName = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][s.dayOfWeek]
        return dayName === currentDay
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [schedules, currentDay])

  // Estadísticas
  const stats = useMemo(() => {
    const uniqueSubjects = new Set(schedules.map(s => s.courseName))
    const totalWeeklyHours = schedules.reduce((acc, s) => {
      const [startHour, startMin] = s.startTime.split(':').map(Number)
      const [endHour, endMin] = s.endTime.split(':').map(Number)
      const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60
      return acc + hours
    }, 0)

    return [
      { label: 'Clases Hoy', value: todayClasses.length, icon: Calendar },
      { label: 'Horas Semanales', value: `${Math.round(totalWeeklyHours)}h`, icon: Clock },
      { label: 'Materias', value: uniqueSubjects.size, icon: BookOpen },
    ]
  }, [schedules, todayClasses])

  const handleViewClass = (classItem: ScheduleDetail) => {
    setSelectedClass(classItem)
    setViewModalOpen(true)
  }

  const getWeekDates = () => {
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() + selectedWeek * 7)
    const monday = new Date(baseDate)
    const day = monday.getDay()
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1)
    monday.setDate(diff)

    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)

    return {
      start: monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
      end: friday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }

  const weekDates = getWeekDates()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando horarios...</p>
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
            Semana del {weekDates.start} al {weekDates.end} - {studentGradeSection}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedWeek(selectedWeek - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(0)}
            disabled={selectedWeek === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedWeek(selectedWeek + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
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

      {/* Horario Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Horario Semanal - {studentGradeSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header de días */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground">
                  Hora
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className={`p-3 text-center rounded-lg transition-colors ${
                      day === currentDay && selectedWeek === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="font-medium">{day}</p>
                  </div>
                ))}
              </div>

              {/* Grid de horarios */}
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
                    const classItem = scheduleByDay[day]?.[time]

                    return (
                      <div key={`${day}-${time}`} className="min-h-[80px]">
                        {classItem ? (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleViewClass(classItem)}
                            className={`h-full p-3 rounded-lg ${
                              colors[classItem.courseName] || 'bg-gray-500'
                            } text-white cursor-pointer transition-shadow hover:shadow-lg`}
                          >
                            <p className="font-medium text-sm leading-tight">
                              {classItem.courseName}
                            </p>
                            <p className="text-xs opacity-90 mt-0.5">
                              {classItem.teacherName}
                            </p>
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

      {/* Clases de Hoy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Clases de Hoy ({currentDay}) - {todayClasses.length} clases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayClasses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay clases programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((classItem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => handleViewClass(classItem)}
                >
                  <div
                    className={`w-2 h-full min-h-[60px] rounded-full ${
                      colors[classItem.courseName] || 'bg-gray-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{classItem.courseName}</p>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full text-white ${
                          colors[classItem.courseName] || 'bg-gray-500'
                        }`}
                      >
                        {classItem.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {classItem.startTime} - {classItem.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {classItem.teacherName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {classItem.room}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Ver Detalles */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Clase</DialogTitle>
          </DialogHeader>

          {selectedClass && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <Label className="text-sm text-muted-foreground">Materia</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      colors[selectedClass.courseName] || 'bg-gray-500'
                    }`}
                  />
                  <p className="font-medium text-lg">{selectedClass.courseName}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Profesor</Label>
                <p className="text-sm font-medium flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-primary" />
                  {selectedClass.teacherName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Día</Label>
                  <p className="text-sm font-medium">
                    {['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][
                      selectedClass.dayOfWeek
                    ]}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Duración</Label>
                  <p className="text-sm font-medium">{selectedClass.duration}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Horario</Label>
                <p className="text-sm font-medium flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-primary" />
                  {selectedClass.startTime} - {selectedClass.endTime}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Aula</Label>
                <p className="text-sm font-medium flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedClass.room}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-700">
                  Recuerda llegar puntual a todas tus clases y traer los materiales necesarios para la materia.
                </p>
              </div>
            </motion.div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
