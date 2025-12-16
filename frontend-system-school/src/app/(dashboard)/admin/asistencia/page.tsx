'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Save,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  UserCheck,
  AlertCircle,
  Check,
  X,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  students,
  courses,
  classrooms,
  getCoursesByClassroom,
  getStudentsByClassroom,
  getLevelName,
  getGradeName,
  Course,
  Student
} from '@/lib/mock-data'

// Tipos
type AttendanceStatus = 'present' | 'absent' | 'late' | 'pending'

interface StudentAttendance {
  student: Student
  status: AttendanceStatus
}

// Días de la semana
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Generar fechas de la semana
const getWeekDates = (offset: number = 0) => {
  const today = new Date()
  const monday = new Date(today)
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  monday.setDate(today.getDate() + diff + (offset * 7))

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return {
      dayIndex: i + 1,
      dayShort: dayNames[date.getDay()],
      dayFull: dayNamesFull[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleDateString('es', { month: 'short' }),
      monthFull: date.toLocaleDateString('es', { month: 'long' }),
      fullDate: date.toISOString().split('T')[0],
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today && date.toDateString() !== today.toDateString(),
      isFuture: date > today
    }
  })
}

// Agrupar aulas por nivel
const classroomsByLevel = classrooms.reduce((acc, classroom) => {
  const level = getLevelName(classroom)
  if (!acc[level]) acc[level] = []
  acc[level].push(classroom)
  return acc
}, {} as Record<string, typeof classrooms>)

const levels = Object.keys(classroomsByLevel)

export default function AdminAsistenciaPage() {
  // Estados
  const [selectedLevel, setSelectedLevel] = useState<string>(levels[0] || '')
  const [selectedClassroom, setSelectedClassroom] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceStatus>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)

  const weekDates = getWeekDates(weekOffset)

  // Inicializar fecha seleccionada
  useState(() => {
    const today = weekDates.find(d => d.isToday)
    if (today) setSelectedDate(today.fullDate)
    else setSelectedDate(weekDates[0].fullDate)
  })

  // Aulas del nivel seleccionado
  const levelClassrooms = useMemo(() => {
    return classroomsByLevel[selectedLevel] || []
  }, [selectedLevel])

  // Cursos del aula seleccionada
  const classroomCourses = useMemo(() => {
    if (!selectedClassroom) return []
    return getCoursesByClassroom(selectedClassroom)
  }, [selectedClassroom])

  // Estudiantes del aula seleccionada
  const classroomStudents = useMemo(() => {
    if (!selectedClassroom) return []
    return getStudentsByClassroom(selectedClassroom)
  }, [selectedClassroom])

  // Estudiantes con asistencia
  const studentsWithAttendance: StudentAttendance[] = useMemo(() => {
    return classroomStudents.map(student => ({
      student,
      status: attendanceData.get(`${student.id}-${selectedDate}`) || 'pending'
    }))
  }, [classroomStudents, attendanceData, selectedDate])

  // Estudiantes filtrados
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentsWithAttendance
    const term = searchTerm.toLowerCase()
    return studentsWithAttendance.filter(({ student }) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(term) ||
      student.enrollmentCode.toLowerCase().includes(term)
    )
  }, [studentsWithAttendance, searchTerm])

  // Estadísticas
  const stats = useMemo(() => {
    const present = studentsWithAttendance.filter(s => s.status === 'present').length
    const absent = studentsWithAttendance.filter(s => s.status === 'absent').length
    const late = studentsWithAttendance.filter(s => s.status === 'late').length
    const pending = studentsWithAttendance.filter(s => s.status === 'pending').length
    const total = studentsWithAttendance.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, late, pending, total, percentage }
  }, [studentsWithAttendance])

  // Info del curso seleccionado
  const selectedCourseData = classroomCourses.find(c => c.id === selectedCourse)
  const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom)
  const selectedDateInfo = weekDates.find(d => d.fullDate === selectedDate)

  // Marcar asistencia
  const markAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const newData = new Map(prev)
      const key = `${studentId}-${selectedDate}`
      if (status === 'pending') {
        newData.delete(key)
      } else {
        newData.set(key, status)
      }
      return newData
    })
    setHasChanges(true)
  }

  // Marcar todos
  const markAll = (status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const newData = new Map(prev)
      classroomStudents.forEach(student => {
        const key = `${student.id}-${selectedDate}`
        if (status === 'pending') {
          newData.delete(key)
        } else {
          newData.set(key, status)
        }
      })
      return newData
    })
    setHasChanges(true)
  }

  // Guardar asistencia
  const saveAttendance = () => {
    // Simular guardado
    console.log('Saving attendance:', Object.fromEntries(attendanceData))
    setHasChanges(false)
    // toast.success('Asistencia guardada correctamente')
  }

  // Seleccionar nivel
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level)
    setSelectedClassroom('')
    setSelectedCourse('')
  }

  // Seleccionar aula
  const handleClassroomSelect = (classroomId: string) => {
    setSelectedClassroom(classroomId)
    setSelectedCourse('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Registra la asistencia diaria de los estudiantes
          </p>
        </div>
        {hasChanges && (
          <Button onClick={saveAttendance}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        )}
      </div>

      {/* Paso 1: Seleccionar Nivel y Aula */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
            Seleccionar Aula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de Nivel */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Nivel Educativo</label>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLevelSelect(level)}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Selector de Aula */}
          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Grado y Sección</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {levelClassrooms.map(classroom => {
                  const studentsCount = getStudentsByClassroom(classroom.id).length
                  const isSelected = selectedClassroom === classroom.id

                  return (
                    <motion.button
                      key={classroom.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleClassroomSelect(classroom.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                        {getGradeName(classroom)} {classroom.section.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {studentsCount} estudiantes
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Paso 2: Seleccionar Fecha */}
      <AnimatePresence>
        {selectedClassroom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  Seleccionar Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Navegación de semana */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <p className="font-medium">
                      {weekDates[0].date} {weekDates[0].month} - {weekDates[4].date} {weekDates[4].month}
                    </p>
                    {weekOffset !== 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto"
                        onClick={() => setWeekOffset(0)}
                      >
                        Ir a esta semana
                      </Button>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-5 gap-2">
                  {weekDates.map(day => {
                    const isSelected = selectedDate === day.fullDate
                    const dayStats = {
                      present: Array.from(attendanceData.entries())
                        .filter(([key, status]) => key.endsWith(day.fullDate) && status === 'present').length,
                      total: classroomStudents.length
                    }
                    const hasData = dayStats.present > 0

                    return (
                      <motion.button
                        key={day.fullDate}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDate(day.fullDate)}
                        disabled={day.isFuture}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : day.isToday
                            ? 'border-primary/50 bg-primary/5'
                            : day.isFuture
                            ? 'border-transparent bg-muted/30 opacity-50 cursor-not-allowed'
                            : 'border-transparent bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                          {day.dayShort}
                        </p>
                        <p className={`text-2xl font-bold ${isSelected ? 'text-primary' : ''}`}>
                          {day.date}
                        </p>
                        {day.isToday && (
                          <span className="text-xs text-primary font-medium">Hoy</span>
                        )}
                        {hasData && !day.isToday && (
                          <div className="mt-1">
                            <span className="text-xs text-green-500 font-medium">
                              {dayStats.present}/{dayStats.total}
                            </span>
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 3: Registrar Asistencia */}
      <AnimatePresence>
        {selectedClassroom && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                { label: 'Presentes', value: stats.present, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
                { label: 'Ausentes', value: stats.absent, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
                { label: 'Tardanzas', value: stats.late, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
                { label: 'Sin registrar', value: stats.pending, icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Lista de Estudiantes */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                      Registrar Asistencia
                    </CardTitle>
                    <CardDescription>
                      {selectedClassroomData && (
                        <>
                          {getGradeName(selectedClassroomData)} {selectedClassroomData.section.name} · {selectedLevel}
                          {selectedDateInfo && (
                            <> · {selectedDateInfo.dayFull}, {selectedDateInfo.date} de {selectedDateInfo.monthFull}</>
                          )}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar estudiante..."
                        className="pl-10 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                  <Button size="sm" variant="outline" onClick={() => markAll('present')}>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Todos Presentes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => markAll('absent')}>
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Todos Ausentes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => markAll('pending')}>
                    <Minus className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay estudiantes en esta aula</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map(({ student, status }, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          status === 'present'
                            ? 'bg-green-500/10 border border-green-500/20'
                            : status === 'absent'
                            ? 'bg-red-500/10 border border-red-500/20'
                            : status === 'late'
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${
                            status === 'present'
                              ? 'bg-green-500/20 text-green-700'
                              : status === 'absent'
                              ? 'bg-red-500/20 text-red-700'
                              : status === 'late'
                              ? 'bg-yellow-500/20 text-yellow-700'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.enrollmentCode}
                          </p>
                        </div>

                        {/* Botones de asistencia */}
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant={status === 'present' ? 'default' : 'outline'}
                            className={status === 'present' ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-green-500/10 hover:text-green-600 hover:border-green-500'}
                            onClick={() => markAttendance(student.id, status === 'present' ? 'pending' : 'present')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant={status === 'late' ? 'default' : 'outline'}
                            className={status === 'late' ? 'bg-yellow-500 hover:bg-yellow-600' : 'hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-500'}
                            onClick={() => markAttendance(student.id, status === 'late' ? 'pending' : 'late')}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant={status === 'absent' ? 'default' : 'outline'}
                            className={status === 'absent' ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-red-500/10 hover:text-red-600 hover:border-red-500'}
                            onClick={() => markAttendance(student.id, status === 'absent' ? 'pending' : 'absent')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progreso de asistencia */}
            {stats.total > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso de registro</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.total - stats.pending} de {stats.total} registrados
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats.total - stats.pending) / stats.total) * 100}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  {stats.pending === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-green-500 mt-2 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Todos los estudiantes han sido registrados
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado inicial - Sin selección */}
      {!selectedClassroom && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Selecciona un nivel y aula para comenzar a registrar la asistencia
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
