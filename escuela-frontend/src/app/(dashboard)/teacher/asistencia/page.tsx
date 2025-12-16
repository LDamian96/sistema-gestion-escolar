'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Save,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  Minus,
  Loader2,
  Calendar,
  BookOpen,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  gradeSectionsService,
  studentsService,
  coursesService,
  type GradeSection,
  type Student,
  type Course
} from '@/services/mock-data'

// Tipos
type AttendanceStatus = 'present' | 'absent' | 'late' | 'pending'

// ID del profesor actual (simulado - en producción vendría del contexto de auth)
const CURRENT_TEACHER_ID = 't1' // Carlos López - tiene varios cursos

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

// Datos estáticos de asistencia para demostración
const generateStaticAttendance = (students: Student[], date: string): Map<string, AttendanceStatus> => {
  const data = new Map<string, AttendanceStatus>()

  students.forEach((student, index) => {
    let status: AttendanceStatus
    if (index % 10 === 0) {
      status = 'absent'
    } else if (index % 7 === 0) {
      status = 'late'
    } else if (index % 5 === 0) {
      status = 'pending'
    } else {
      status = 'present'
    }
    data.set(`${student.id}-${date}`, status)
  })

  return data
}

export default function TeacherAsistenciaPage() {
  // Estados de datos
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados de selección - Primero fecha, luego aula
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Estado de asistencia
  const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceStatus>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const weekDates = getWeekDates(weekOffset)

  // Cursos del profesor actual
  const teacherCourses = useMemo(() => {
    return allCourses.filter(c => c.teacherId === CURRENT_TEACHER_ID && c.status === 'active')
  }, [allCourses])

  // GradeSections únicos a los que el profesor tiene acceso
  const teacherGradeSectionIds = useMemo(() => {
    return [...new Set(teacherCourses.map(c => c.gradeSectionId))]
  }, [teacherCourses])

  // GradeSections filtrados (solo los del profesor)
  const teacherGradeSections = useMemo(() => {
    return gradeSections.filter(gs => teacherGradeSectionIds.includes(gs.id))
  }, [gradeSections, teacherGradeSectionIds])

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, gsData, studentsData] = await Promise.all([
          coursesService.getAll(),
          gradeSectionsService.getAll(),
          studentsService.getAll()
        ])
        setAllCourses(coursesData)
        setGradeSections(gsData)
        setAllStudents(studentsData)

        // Seleccionar fecha de hoy por defecto
        const today = weekDates.find(d => d.isToday)
        const defaultDate = today?.fullDate || weekDates[0].fullDate
        setSelectedDate(defaultDate)

      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Cargar datos estáticos cuando se selecciona un aula
  useEffect(() => {
    if (selectedGradeSection && selectedDate && allStudents.length > 0 && !dataLoaded) {
      const gs = gradeSections.find(g => g.id === selectedGradeSection)
      if (gs) {
        const students = allStudents.filter(s =>
          s.gradeSection === `${gs.grade} ${gs.section}` && s.status === 'active'
        )
        const staticData = generateStaticAttendance(students, selectedDate)
        setAttendanceData(staticData)
        setDataLoaded(true)
      }
    }
  }, [selectedGradeSection, selectedDate, allStudents, gradeSections, dataLoaded])

  // Reset dataLoaded cuando cambia el grado/sección o fecha
  useEffect(() => {
    setDataLoaded(false)
  }, [selectedGradeSection, selectedDate])

  // Niveles disponibles (solo del profesor)
  const levels = useMemo(() => {
    return [...new Set(teacherGradeSections.map(gs => gs.level))]
  }, [teacherGradeSections])

  // Grados/Secciones del nivel seleccionado (o todos si no hay nivel seleccionado)
  const levelGradeSections = useMemo(() => {
    if (!selectedLevel || selectedLevel === 'all') return teacherGradeSections
    return teacherGradeSections.filter(gs => gs.level === selectedLevel)
  }, [teacherGradeSections, selectedLevel])

  // Estudiantes del grado/sección seleccionado
  const gradeSectionStudents = useMemo(() => {
    if (!selectedGradeSection) return []
    const gs = gradeSections.find(g => g.id === selectedGradeSection)
    if (!gs) return []
    return allStudents.filter(s =>
      s.gradeSection === `${gs.grade} ${gs.section}` && s.status === 'active'
    )
  }, [allStudents, gradeSections, selectedGradeSection])

  // Estudiantes con asistencia
  const studentsWithAttendance = useMemo(() => {
    return gradeSectionStudents.map(student => ({
      student,
      status: attendanceData.get(`${student.id}-${selectedDate}`) || 'pending' as AttendanceStatus
    }))
  }, [gradeSectionStudents, attendanceData, selectedDate])

  // Estudiantes filtrados
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentsWithAttendance
    const term = searchTerm.toLowerCase()
    return studentsWithAttendance.filter(({ student }) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(term) ||
      student.code.toLowerCase().includes(term)
    )
  }, [studentsWithAttendance, searchTerm])

  // Estadísticas
  const stats = useMemo(() => {
    const present = studentsWithAttendance.filter(s => s.status === 'present').length
    const absent = studentsWithAttendance.filter(s => s.status === 'absent').length
    const late = studentsWithAttendance.filter(s => s.status === 'late').length
    const pending = studentsWithAttendance.filter(s => s.status === 'pending').length
    const total = studentsWithAttendance.length

    return { present, absent, late, pending, total }
  }, [studentsWithAttendance])

  // Info seleccionada
  const selectedGradeSectionData = gradeSections.find(gs => gs.id === selectedGradeSection)
  const selectedDateInfo = weekDates.find(d => d.fullDate === selectedDate)

  // Materias que enseña el profesor en el grado seleccionado
  const teacherSubjectsInGrade = useMemo(() => {
    if (!selectedGradeSection) return []
    return teacherCourses
      .filter(c => c.gradeSectionId === selectedGradeSection)
      .map(c => c.subjectName)
  }, [teacherCourses, selectedGradeSection])

  // Marcar asistencia individual
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
      gradeSectionStudents.forEach(student => {
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
  const saveAttendance = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Saving attendance:', Object.fromEntries(attendanceData))
      setHasChanges(false)
      toast.success('Asistencia guardada correctamente')
    } catch {
      toast.error('Error al guardar asistencia')
    } finally {
      setIsSaving(false)
    }
  }

  // Cambiar nivel
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    setSelectedGradeSection('')
  }

  // Cambiar grado/sección
  const handleGradeSectionChange = (gsId: string) => {
    setSelectedGradeSection(gsId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mi Control de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Registra la asistencia de tus cursos asignados
          </p>
        </div>
        {selectedGradeSection && selectedDate && (
          <Button
            onClick={saveAttendance}
            disabled={isSaving || !hasChanges}
            className={hasChanges ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {hasChanges ? 'Guardar Asistencia' : 'Sin cambios'}
          </Button>
        )}
      </div>

      {/* Info de cursos asignados */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Tienes {teacherCourses.length} cursos asignados</p>
              <p className="text-sm text-muted-foreground">
                en {teacherGradeSections.length} aulas diferentes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paso 1: Seleccionar Fecha */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
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
              <p className="font-medium flex items-center gap-2 justify-center">
                <Calendar className="h-4 w-4" />
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
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Paso 2: Seleccionar Aula (Solo las asignadas) */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  Seleccionar Aula
                </CardTitle>
                <CardDescription>
                  {selectedDateInfo && (
                    <>Fecha seleccionada: {selectedDateInfo.dayFull}, {selectedDateInfo.date} de {selectedDateInfo.monthFull}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector de Nivel */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Nivel Educativo</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!selectedLevel || selectedLevel === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLevelChange('all')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Todos
                    </Button>
                    {levels.map(level => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleLevelChange(level)}
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selector de Grado/Sección */}
                {levelGradeSections.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Mis Aulas Asignadas</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {levelGradeSections.map(gs => {
                        const studentsCount = allStudents.filter(
                          s => s.gradeSection === `${gs.grade} ${gs.section}` && s.status === 'active'
                        ).length
                        const isSelected = selectedGradeSection === gs.id
                        const coursesInGrade = teacherCourses.filter(c => c.gradeSectionId === gs.id)

                        return (
                          <motion.button
                            key={gs.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleGradeSectionChange(gs.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-transparent bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                              {gs.grade} {gs.section}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {studentsCount} estudiantes
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {coursesInGrade.length} {coursesInGrade.length === 1 ? 'materia' : 'materias'}
                            </p>
                            {gs.turno && (
                              <p className="text-xs text-muted-foreground">
                                {gs.turno}
                              </p>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {levelGradeSections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes aulas asignadas en este nivel</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 3: Registrar Asistencia */}
      <AnimatePresence>
        {selectedGradeSection && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Info de materias */}
            {teacherSubjectsInGrade.length > 0 && (
              <Card className="border-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Materias que impartes en este grado: {teacherSubjectsInGrade.join(', ')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards - Diseño moderno */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total', value: stats.total, icon: Users, gradient: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-900/50' },
                { label: 'Presentes', value: stats.present, icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { label: 'Ausentes', value: stats.absent, icon: XCircle, gradient: 'from-rose-500 to-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-950/30' },
                { label: 'Tardanzas', value: stats.late, icon: Clock, gradient: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
                { label: 'Sin registrar', value: stats.pending, icon: AlertCircle, gradient: 'from-slate-400 to-slate-500', bgColor: 'bg-slate-50 dark:bg-slate-900/30' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className={`border-0 ${stat.bgColor} hover:shadow-lg transition-all duration-300`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                          <stat.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                          <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
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
                      {selectedGradeSectionData && (
                        <>
                          {selectedGradeSectionData.grade} {selectedGradeSectionData.section} · {selectedGradeSectionData.level}
                          {selectedGradeSectionData.turno && ` · ${selectedGradeSectionData.turno}`}
                          {selectedDateInfo && (
                            <> · {selectedDateInfo.dayFull}, {selectedDateInfo.date} de {selectedDateInfo.monthFull}</>
                          )}
                        </>
                      )}
                    </CardDescription>
                  </div>
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

                {/* Acciones rápidas - Diseño moderno */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markAll('present')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Todos Presentes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markAll('late')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50 transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    Todos Tarde
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markAll('absent')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Todos Ausentes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markAll('pending')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                    Limpiar Todo
                  </motion.button>
                </div>
              </CardHeader>

              <CardContent>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay estudiantes en este grado/sección</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map(({ student, status }, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.015, duration: 0.2 }}
                        className="group relative flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-300"
                      >
                        {/* Indicador lateral de estado */}
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-colors duration-300 ${
                            status === 'present'
                              ? 'bg-emerald-400'
                              : status === 'absent'
                              ? 'bg-rose-400'
                              : status === 'late'
                              ? 'bg-amber-400'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />

                        <Avatar className="h-11 w-11 ml-2">
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-muted-foreground/70">
                            {student.code}
                          </p>
                        </div>

                        {/* Selector de asistencia moderno */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAttendance(student.id, status === 'present' ? 'pending' : 'present')}
                            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              status === 'present'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                            title="Presente"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Presente</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAttendance(student.id, status === 'late' ? 'pending' : 'late')}
                            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              status === 'late'
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                                : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            }`}
                            title="Tardanza"
                          >
                            <Clock className="h-4 w-4" />
                            <span className="hidden sm:inline">Tarde</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAttendance(student.id, status === 'absent' ? 'pending' : 'absent')}
                            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              status === 'absent'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            }`}
                            title="Ausente"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Falta</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progreso de asistencia - Diseño moderno */}
            {stats.total > 0 && (
              <Card className="border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/30">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Resumen del día</span>
                    <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                      {stats.total - stats.pending} de {stats.total} registrados
                    </span>
                  </div>

                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.present / stats.total) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.late / stats.total) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.absent / stats.total) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm" />
                      <span className="text-muted-foreground">Presentes</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.present}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm" />
                      <span className="text-muted-foreground">Tardanzas</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.late}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 shadow-sm" />
                      <span className="text-muted-foreground">Ausentes</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.absent}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 shadow-sm" />
                      <span className="text-muted-foreground">Pendientes</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{stats.pending}</span>
                    </span>
                  </div>

                  {stats.pending === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                    >
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        ¡Excelente! Todos los estudiantes han sido registrados
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Botón de guardar al final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={saveAttendance}
                disabled={isSaving || !hasChanges}
                size="lg"
                className={`px-8 py-6 text-lg ${
                  hasChanges
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                    : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Guardando...
                  </>
                ) : hasChanges ? (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    Guardar Asistencia del Día
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-3" />
                    Asistencia Guardada
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado inicial - Sin selección */}
      {!selectedDate && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Selecciona una fecha para comenzar
            </p>
          </CardContent>
        </Card>
      )}

      {selectedDate && !selectedGradeSection && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Selecciona una de tus aulas asignadas para registrar la asistencia
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
