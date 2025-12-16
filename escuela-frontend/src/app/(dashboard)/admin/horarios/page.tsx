'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  GraduationCap,
  Filter,
  Eye,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  schedulesService,
  coursesService,
  gradeSectionsService,
  Schedule,
  Course,
  GradeSection
} from '@/services/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toast'
import Link from 'next/link'

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
]

const SUBJECT_COLORS: { [key: string]: string } = {
  'Matemáticas': 'bg-blue-500',
  'Comunicación': 'bg-green-500',
  'Ciencias Naturales': 'bg-purple-500',
  'Ciencias': 'bg-purple-500',
  'Historia': 'bg-orange-500',
  'Geografía': 'bg-cyan-500',
  'Inglés': 'bg-pink-500',
  'Educación Física': 'bg-red-500',
  'Arte': 'bg-yellow-500',
  'Música': 'bg-indigo-500',
  'Computación': 'bg-gray-500',
  'Lenguaje': 'bg-green-600',
  'Física': 'bg-teal-500',
  'Química': 'bg-amber-500',
}

export default function HorariosPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('all')
  const [selectedTurno, setSelectedTurno] = useState<string>('all')

  // View
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { toast, toasts, dismiss } = useToast()

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [schedulesData, coursesData, gradeSectionsData] = await Promise.all([
        schedulesService.getAll(),
        coursesService.getAll(),
        gradeSectionsService.getAll()
      ])
      setSchedules(schedulesData)
      setCourses(coursesData)
      setGradeSections(gradeSectionsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Get available turnos
  const availableTurnos = useMemo(() => {
    const turnos = new Set<string>()
    gradeSections.forEach(gs => {
      if (gs.turno) turnos.add(gs.turno)
    })
    return Array.from(turnos).sort()
  }, [gradeSections])

  // Get filtered grade sections by level and turno
  const filteredGradeSections = useMemo(() => {
    let result = gradeSections
    if (selectedLevel !== 'all') {
      result = result.filter(gs => gs.level === selectedLevel)
    }
    if (selectedTurno !== 'all') {
      result = result.filter(gs => gs.turno === selectedTurno)
    }
    return result
  }, [gradeSections, selectedLevel, selectedTurno])

  // Reset grade section when level or turno changes
  useEffect(() => {
    if (selectedLevel !== 'all' || selectedTurno !== 'all') {
      let validGradeSections = gradeSections
      if (selectedLevel !== 'all') {
        validGradeSections = validGradeSections.filter(gs => gs.level === selectedLevel)
      }
      if (selectedTurno !== 'all') {
        validGradeSections = validGradeSections.filter(gs => gs.turno === selectedTurno)
      }
      if (selectedGradeSection !== 'all') {
        const isValid = validGradeSections.some(gs => `${gs.grade} ${gs.section}` === selectedGradeSection)
        if (!isValid) {
          setSelectedGradeSection('all')
        }
      }
    }
  }, [selectedLevel, selectedTurno, gradeSections, selectedGradeSection])

  // Filter schedules by level, turno and grade section
  const filteredSchedules = useMemo(() => {
    let result = schedules

    if (selectedLevel !== 'all' || selectedTurno !== 'all') {
      // Get grade sections matching filters
      let validGradeSections = gradeSections
      if (selectedLevel !== 'all') {
        validGradeSections = validGradeSections.filter(gs => gs.level === selectedLevel)
      }
      if (selectedTurno !== 'all') {
        validGradeSections = validGradeSections.filter(gs => gs.turno === selectedTurno)
      }
      const validGradeSectionNames = validGradeSections.map(gs => `${gs.grade} ${gs.section}`)
      result = result.filter(s => validGradeSectionNames.includes(s.gradeSection))
    }

    if (selectedGradeSection !== 'all') {
      result = result.filter(s => s.gradeSection === selectedGradeSection)
    }

    return result
  }, [schedules, selectedLevel, selectedTurno, selectedGradeSection, gradeSections])

  // Get current week dates
  const getCurrentWeek = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7))

    const saturday = new Date(monday)
    saturday.setDate(monday.getDate() + 5)

    return {
      start: monday,
      end: saturday,
      display: `${monday.getDate()} al ${saturday.getDate()} de ${monday.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    }
  }

  const currentWeek = getCurrentWeek()

  // Get today's day of week (1-6 for Monday-Saturday)
  const getTodayDayOfWeek = () => {
    const today = new Date()
    const day = today.getDay()
    if (day === 0) return -1 // Sunday
    return day
  }

  const todayDayOfWeek = weekOffset === 0 ? getTodayDayOfWeek() : -1

  // Get today's classes
  const todaysClasses = useMemo(() => {
    if (todayDayOfWeek === -1) return []
    return filteredSchedules
      .filter(s => s.dayOfWeek === todayDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [filteredSchedules, todayDayOfWeek])

  // Calculate stats
  const stats = useMemo(() => {
    const weekClasses = filteredSchedules.length
    const totalHours = filteredSchedules.reduce((sum, schedule) => {
      const start = new Date(`2000-01-01 ${schedule.startTime}`)
      const end = new Date(`2000-01-01 ${schedule.endTime}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return sum + hours
    }, 0)
    const uniqueRooms = new Set(filteredSchedules.map(s => s.room))
    const uniqueTeachers = new Set(filteredSchedules.map(s => s.teacherName))

    return [
      { label: 'Clases Esta Semana', value: weekClasses, icon: Calendar },
      { label: 'Horas Totales', value: `${Math.round(totalHours * 10) / 10}h`, icon: Clock },
      { label: 'Aulas en Uso', value: uniqueRooms.size, icon: MapPin },
      { label: 'Profesores', value: uniqueTeachers.size, icon: Users },
    ]
  }, [filteredSchedules])

  // Get schedule for a specific time slot
  const getScheduleForSlot = (dayOfWeek: number, timeSlot: string) => {
    return filteredSchedules.find(s => {
      if (s.dayOfWeek !== dayOfWeek) return false
      return s.startTime <= timeSlot && s.endTime > timeSlot
    })
  }

  // Check if this is the start of a schedule
  const isScheduleStart = (dayOfWeek: number, timeSlot: string) => {
    const schedule = getScheduleForSlot(dayOfWeek, timeSlot)
    return schedule?.startTime === timeSlot
  }

  // Get schedule height (number of time slots)
  const getScheduleHeight = (schedule: Schedule) => {
    const startIndex = TIME_SLOTS.indexOf(schedule.startTime)
    let endIndex = TIME_SLOTS.findIndex(t => t >= schedule.endTime)
    if (endIndex === -1) endIndex = TIME_SLOTS.length
    return Math.max(1, endIndex - startIndex)
  }

  // View schedule details
  const viewScheduleDetails = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setShowDetailModal(true)
  }

  // Get course for schedule
  const getCourseForSchedule = (schedule: Schedule) => {
    return courses.find(c => c.id === schedule.courseId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Horarios</h1>
          <p className="text-muted-foreground mt-1">Semana del {currentWeek.display}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(weekOffset - 1)}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeekOffset(0)}
            disabled={loading || weekOffset === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Nivel:</Label>
              <Select
                value={selectedLevel}
                onValueChange={setSelectedLevel}
                disabled={loading}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Inicial">Inicial</SelectItem>
                  <SelectItem value="Primaria">Primaria</SelectItem>
                  <SelectItem value="Secundaria">Secundaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Turno:</Label>
              <Select
                value={selectedTurno}
                onValueChange={setSelectedTurno}
                disabled={loading}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableTurnos.map((turno) => (
                    <SelectItem key={turno} value={turno}>
                      {turno}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Grado/Sección:</Label>
              <Select
                value={selectedGradeSection}
                onValueChange={setSelectedGradeSection}
                disabled={loading}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filteredGradeSections.map((gs) => (
                    <SelectItem key={gs.id} value={`${gs.grade} ${gs.section}`}>
                      {gs.grade} {gs.section} ({gs.turno})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto">
              <Link href="/admin/cursos">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gestionar en Cursos
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <GraduationCap className="h-5 w-5" />
            Horario Semanal
            {selectedLevel !== 'all' && (
              <Badge variant="secondary">{selectedLevel}</Badge>
            )}
            {selectedTurno !== 'all' && (
              <Badge variant="outline">{selectedTurno}</Badge>
            )}
            {selectedGradeSection !== 'all' && (
              <Badge variant="default">{selectedGradeSection}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay horarios programados</h3>
              <p className="text-muted-foreground mb-4">
                Los horarios se crean desde la página de Cursos
              </p>
              <Link href="/admin/cursos">
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a Cursos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div className="p-3 text-center text-sm font-medium text-muted-foreground">
                    Hora
                  </div>
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.value}
                      className={`p-3 text-center rounded-lg ${
                        day.value === todayDayOfWeek
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50'
                      }`}
                    >
                      <p className="font-medium">{day.label}</p>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {TIME_SLOTS.map((time, timeIndex) => (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + timeIndex * 0.015 }}
                    className="grid grid-cols-7 gap-2 mb-1"
                  >
                    <div className="p-2 text-center text-sm text-muted-foreground flex items-center justify-center">
                      {time}
                    </div>
                    {DAYS_OF_WEEK.map((day) => {
                      const schedule = getScheduleForSlot(day.value, time)
                      const isStart = isScheduleStart(day.value, time)

                      // Skip if this slot is part of a multi-slot schedule that already started
                      if (schedule && !isStart) {
                        return <div key={`${day.value}-${time}`} />
                      }

                      return (
                        <div key={`${day.value}-${time}`} className="min-h-[40px]">
                          {schedule && isStart ? (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`p-2 rounded-lg ${
                                SUBJECT_COLORS[schedule.courseName] || 'bg-emerald-500'
                              } text-white cursor-pointer relative group`}
                              style={{ height: `${getScheduleHeight(schedule) * 44 - 4}px` }}
                              onClick={() => viewScheduleDetails(schedule)}
                            >
                              <p className="font-medium text-sm truncate">{schedule.courseName}</p>
                              <p className="text-xs opacity-90 truncate">{schedule.gradeSection}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs opacity-80">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{schedule.room}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs opacity-80">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{schedule.teacherName}</span>
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 bg-white/20 hover:bg-white/30"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    viewScheduleDetails(schedule)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="h-full bg-muted/20 rounded-lg min-h-[40px]" />
                          )}
                        </div>
                      )
                    })}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Classes */}
      {todayDayOfWeek !== -1 && todaysClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Clases de Hoy ({DAYS_OF_WEEK[todayDayOfWeek - 1]?.label})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysClasses.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => viewScheduleDetails(schedule)}
                >
                  <div
                    className={`w-2 h-full min-h-[60px] rounded-full ${
                      SUBJECT_COLORS[schedule.courseName] || 'bg-emerald-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{schedule.courseName}</p>
                      <Badge variant="outline" className="shrink-0">
                        {schedule.gradeSection}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {schedule.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {schedule.teacherName}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      viewScheduleDetails(schedule)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${SUBJECT_COLORS[selectedSchedule?.courseName || ''] || 'bg-emerald-500'}`} />
              {selectedSchedule?.courseName}
            </DialogTitle>
            <DialogDescription>
              Detalles del horario
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Día</Label>
                  <p className="font-medium">
                    {DAYS_OF_WEEK.find(d => d.value === selectedSchedule.dayOfWeek)?.label}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Horario</Label>
                  <p className="font-medium">
                    {selectedSchedule.startTime} - {selectedSchedule.endTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Grado/Sección</Label>
                  <p className="font-medium">{selectedSchedule.gradeSection}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Aula</Label>
                  <p className="font-medium">{selectedSchedule.room}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Profesor</Label>
                  <p className="font-medium">{selectedSchedule.teacherName}</p>
                </div>
              </div>

              {getCourseForSchedule(selectedSchedule) && (
                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground mb-2 block">Curso Asociado</Label>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="font-medium">
                      {getCourseForSchedule(selectedSchedule)?.subjectName} - {getCourseForSchedule(selectedSchedule)?.gradeSection}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estado: {getCourseForSchedule(selectedSchedule)?.status === 'active' ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailModal(false)}
            >
              Cerrar
            </Button>
            <Link href="/admin/cursos">
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Editar en Cursos
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
