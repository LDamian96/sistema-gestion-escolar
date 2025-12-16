'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
  Save,
  CheckCircle2,
  Target,
  FileText,
  GraduationCap,
  Award,
  MapPin,
  Calendar,
  Circle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  teachers,
  courses,
  students,
  getCoursesByTeacher,
  getCourseFullName,
  getLevelName,
  getGradeName,
  Course,
  getStudentsByClassroom
} from '@/lib/mock-data'

// Interfaces para Malla Curricular
interface Topic {
  id: number
  name: string
  description: string
  hours: number
  completed: boolean
}

interface Unit {
  id: number
  name: string
  description: string
  topics: Topic[]
  order: number
}

interface Curriculum {
  id: number
  courseId: string
  subject: string
  grade: string
  level: string
  year: string
  units: Unit[]
  totalHours: number
  completedHours: number
}

interface NewTopic {
  name: string
  description: string
  hours: string
}

interface NewUnit {
  name: string
  description: string
  topics: NewTopic[]
}

interface NewCurriculum {
  courseId: string
  subject: string
  grade: string
  level: string
  year: string
  totalHours: string
  units: NewUnit[]
}

// Interfaz para horario
interface ScheduleItem {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  subject: string
  gradeSection: string
  level: string
  classroom: string
  courseId: string
  studentsCount: number
}

// Profesor actual (simulado - debería venir del contexto de autenticación)
const currentTeacher = teachers[0] // María García - Matemática

// Obtener cursos asignados al profesor
const teacherCourses = getCoursesByTeacher(currentTeacher.id)

// Obtener estudiantes de los cursos del profesor
const teacherStudents = new Set<string>()
teacherCourses.forEach(course => {
  students.filter(s => s.classroomId === course.classroomId).forEach(s => teacherStudents.add(s.id))
})

// Días de la semana
const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Obtener el día actual
const today = new Date().getDay()
const todayAdjusted = today === 0 ? 7 : today

// Generar horario del profesor
const teacherSchedule: ScheduleItem[] = teacherCourses.flatMap(course => {
  const studentsInClass = getStudentsByClassroom(course.classroomId)
  return course.schedules.map(schedule => ({
    id: schedule.id,
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    subject: course.subject.name,
    gradeSection: `${getGradeName(course.classroom)} ${course.classroom.section.name}`,
    level: getLevelName(course.classroom),
    classroom: course.classroom.name,
    courseId: course.id,
    studentsCount: studentsInClass.length
  }))
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

// Clases de hoy
const todayClasses = teacherSchedule.filter(s => s.dayOfWeek === todayAdjusted)
const totalClassesToday = todayClasses.length
const completedClassesToday = todayClasses.filter(s => getCurrentTimeStatus(s.startTime, s.endTime) === 'completed').length

// Curriculums del profesor (datos mock)
const initialCurriculums: Curriculum[] = [
  {
    id: 1,
    courseId: teacherCourses[0]?.id || '',
    subject: teacherCourses[0]?.subject.name || 'Matemática',
    grade: teacherCourses[0] ? `${getGradeName(teacherCourses[0].classroom)} ${teacherCourses[0].classroom.section.name}` : '',
    level: teacherCourses[0] ? getLevelName(teacherCourses[0].classroom) : '',
    year: '2024',
    totalHours: 180,
    completedHours: 120,
    units: [
      {
        id: 1,
        name: 'Unidad 1: Números y Operaciones',
        description: 'Operaciones básicas y propiedades numéricas',
        order: 1,
        topics: [
          { id: 1, name: 'Números naturales y enteros', description: 'Propiedades y operaciones', hours: 8, completed: true },
          { id: 2, name: 'Fracciones y decimales', description: 'Conversión y operaciones', hours: 10, completed: true },
          { id: 3, name: 'Potencias y raíces', description: 'Propiedades y cálculo', hours: 8, completed: true },
        ]
      },
      {
        id: 2,
        name: 'Unidad 2: Álgebra',
        description: 'Introducción al álgebra y ecuaciones',
        order: 2,
        topics: [
          { id: 4, name: 'Expresiones algebraicas', description: 'Términos y polinomios', hours: 10, completed: true },
          { id: 5, name: 'Ecuaciones lineales', description: 'Resolución de ecuaciones', hours: 12, completed: false },
          { id: 6, name: 'Sistemas de ecuaciones', description: 'Métodos de resolución', hours: 10, completed: false },
        ]
      },
    ]
  },
]

const initialNewCurriculum: NewCurriculum = {
  courseId: '',
  subject: '',
  grade: '',
  level: '',
  year: '2024',
  totalHours: '',
  units: []
}

export default function TeacherDashboardPage() {
  const [selectedDay, setSelectedDay] = useState(todayAdjusted)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(1)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([1])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [curriculums, setCurriculums] = useState<Curriculum[]>(initialCurriculums)
  const [newCurriculum, setNewCurriculum] = useState<NewCurriculum>(initialNewCurriculum)
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState<'schedule' | 'curriculum'>('schedule')

  // Horario del día seleccionado
  const selectedDaySchedule = useMemo(() => {
    return teacherSchedule
      .filter(s => s.dayOfWeek === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [selectedDay])

  // Formatear fecha
  const formatDate = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
    return date.toLocaleDateString('es-ES', options)
  }

  // Estadísticas del profesor
  const stats = [
    {
      title: 'Mis Cursos',
      value: teacherCourses.length.toString(),
      subtitle: `${new Set(teacherCourses.map(c => getLevelName(c.classroom))).size} niveles`,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Mis Estudiantes',
      value: teacherStudents.size.toString(),
      subtitle: 'En todos mis cursos',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Clases Hoy',
      value: totalClassesToday.toString(),
      subtitle: `${completedClassesToday} completadas`,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Mallas Creadas',
      value: curriculums.length.toString(),
      subtitle: `${curriculums.reduce((acc, c) => acc + c.units.length, 0)} unidades`,
      icon: Layers,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  // Niveles y grados únicos de los cursos del profesor
  const uniqueLevels = useMemo(() => {
    return [...new Set(teacherCourses.map(c => getLevelName(c.classroom)))]
  }, [])

  const uniqueGrades = useMemo(() => {
    const gradesWithSections = teacherCourses.map(c => ({
      name: `${getGradeName(c.classroom)} ${c.classroom.section.name}`,
      level: getLevelName(c.classroom)
    }))

    if (selectedLevel) {
      return [...new Set(gradesWithSections.filter(g => g.level === selectedLevel).map(g => g.name))]
    }
    return [...new Set(gradesWithSections.map(g => g.name))]
  }, [selectedLevel])

  // Cursos disponibles para nueva malla (sin malla existente)
  const availableCourses = useMemo(() => {
    const existingCourseIds = new Set(curriculums.map(c => c.courseId))
    return teacherCourses.filter(c => !existingCourseIds.has(c.id))
  }, [curriculums])

  // Filtrar curriculums
  const filteredCurriculums = useMemo(() => {
    return curriculums.filter(c => {
      const matchesSearch = c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.grade.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = !selectedLevel || c.level === selectedLevel
      const matchesGrade = !selectedGrade || c.grade === selectedGrade
      return matchesSearch && matchesLevel && matchesGrade
    })
  }, [curriculums, searchTerm, selectedLevel, selectedGrade])

  // Funciones para el modal
  const addUnit = () => {
    setNewCurriculum({
      ...newCurriculum,
      units: [...newCurriculum.units, { name: '', description: '', topics: [] }]
    })
  }

  const removeUnit = (index: number) => {
    setNewCurriculum({
      ...newCurriculum,
      units: newCurriculum.units.filter((_, i) => i !== index)
    })
  }

  const updateUnit = (index: number, field: keyof NewUnit, value: string) => {
    const updatedUnits = [...newCurriculum.units]
    if (field !== 'topics') {
      updatedUnits[index] = { ...updatedUnits[index], [field]: value }
      setNewCurriculum({ ...newCurriculum, units: updatedUnits })
    }
  }

  const addTopic = (unitIndex: number) => {
    const updatedUnits = [...newCurriculum.units]
    updatedUnits[unitIndex].topics.push({ name: '', description: '', hours: '' })
    setNewCurriculum({ ...newCurriculum, units: updatedUnits })
  }

  const removeTopic = (unitIndex: number, topicIndex: number) => {
    const updatedUnits = [...newCurriculum.units]
    updatedUnits[unitIndex].topics = updatedUnits[unitIndex].topics.filter((_, i) => i !== topicIndex)
    setNewCurriculum({ ...newCurriculum, units: updatedUnits })
  }

  const updateTopic = (unitIndex: number, topicIndex: number, field: keyof NewTopic, value: string) => {
    const updatedUnits = [...newCurriculum.units]
    updatedUnits[unitIndex].topics[topicIndex] = {
      ...updatedUnits[unitIndex].topics[topicIndex],
      [field]: value
    }
    setNewCurriculum({ ...newCurriculum, units: updatedUnits })
  }

  const handleCourseSelect = (courseId: string) => {
    const course = teacherCourses.find(c => c.id === courseId)
    if (course) {
      setNewCurriculum({
        ...newCurriculum,
        courseId: course.id,
        subject: course.subject.name,
        grade: `${getGradeName(course.classroom)} ${course.classroom.section.name}`,
        level: getLevelName(course.classroom)
      })
    }
  }

  const saveCurriculum = () => {
    const totalHours = newCurriculum.units.reduce((acc, unit) =>
      acc + unit.topics.reduce((a, topic) => a + (parseInt(topic.hours) || 0), 0), 0
    )

    const newId = Math.max(...curriculums.map(c => c.id), 0) + 1
    const curriculum: Curriculum = {
      id: newId,
      courseId: newCurriculum.courseId,
      subject: newCurriculum.subject,
      grade: newCurriculum.grade,
      level: newCurriculum.level,
      year: newCurriculum.year,
      totalHours: parseInt(newCurriculum.totalHours) || totalHours,
      completedHours: 0,
      units: newCurriculum.units.map((unit, unitIndex) => ({
        id: unitIndex + 1,
        name: unit.name,
        description: unit.description,
        order: unitIndex + 1,
        topics: unit.topics.map((topic, topicIndex) => ({
          id: topicIndex + 1,
          name: topic.name,
          description: topic.description,
          hours: parseInt(topic.hours) || 0,
          completed: false
        }))
      }))
    }

    setCurriculums([...curriculums, curriculum])
    resetModal()
  }

  const resetModal = () => {
    setNewCurriculum(initialNewCurriculum)
    setCurrentStep(1)
    setShowCreateModal(false)
  }

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const toggleTopicComplete = (curriculumId: number, unitId: number, topicId: number) => {
    setCurriculums(prevCurriculums =>
      prevCurriculums.map(curriculum => {
        if (curriculum.id !== curriculumId) return curriculum

        const updatedUnits = curriculum.units.map(unit => {
          if (unit.id !== unitId) return unit

          const updatedTopics = unit.topics.map(topic => {
            if (topic.id !== topicId) return topic
            return { ...topic, completed: !topic.completed }
          })

          return { ...unit, topics: updatedTopics }
        })

        const completedHours = updatedUnits.reduce((acc, unit) =>
          acc + unit.topics.filter(t => t.completed).reduce((a, t) => a + t.hours, 0), 0
        )

        return { ...curriculum, units: updatedUnits, completedHours }
      })
    )
  }

  const deleteCurriculum = (id: number) => {
    setCurriculums(prevCurriculums => prevCurriculums.filter(c => c.id !== id))
    if (expandedCurriculum === id) {
      setExpandedCurriculum(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con info del profesor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {currentTeacher.firstName[0]}{currentTeacher.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Bienvenido, {currentTeacher.firstName} {currentTeacher.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <GraduationCap className="h-3 w-3 mr-1" />
                Profesor
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                <Award className="h-3 w-3 mr-1" />
                {currentTeacher.specialization}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs para Horario y Malla Curricular */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'schedule' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('schedule')}
          className="rounded-b-none"
        >
          <Clock className="h-4 w-4 mr-2" />
          Mi Horario
        </Button>
        <Button
          variant={activeTab === 'curriculum' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('curriculum')}
          className="rounded-b-none"
        >
          <Layers className="h-4 w-4 mr-2" />
          Malla Curricular
        </Button>
      </div>

      {/* Contenido de Horario */}
      {activeTab === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Horario Semanal */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Mi Horario de Clases
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{item.subject}</p>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                              {item.gradeSection}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600">
                              {item.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.classroom}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.studentsCount} estudiantes
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {status === 'current' && (
                            <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full animate-pulse">
                              En curso
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

          {/* Resumen de cursos */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Cursos Asignados</CardTitle>
              <CardDescription>{teacherCourses.length} cursos en total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacherCourses.map((course, index) => {
                  const studentsInClass = getStudentsByClassroom(course.classroomId)
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{course.subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getGradeName(course.classroom)} {course.classroom.section.name}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {studentsInClass.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.schedules.length} clases/sem
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contenido de Malla Curricular */}
      {activeTab === 'curriculum' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Malla Curricular</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona el plan de estudios de tus cursos asignados
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={availableCourses.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Malla
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por materia o grado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value)
                    setSelectedGrade('')
                  }}
                >
                  <option value="">Todos los niveles</option>
                  {uniqueLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <select
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">Todos los grados</option>
                  {uniqueGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Cursos sin malla curricular */}
          {availableCourses.length > 0 && (
            <Card className="border-dashed border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                  Cursos sin Malla Curricular
                </CardTitle>
                <CardDescription>
                  Estos cursos asignados aún no tienen malla curricular definida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableCourses.map(course => (
                    <Button
                      key={course.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleCourseSelect(course.id)
                        setShowCreateModal(true)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {getCourseFullName(course)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Curriculums */}
          {filteredCurriculums.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {curriculums.length === 0
                    ? 'No has creado ninguna malla curricular aún'
                    : 'No se encontraron mallas con los filtros seleccionados'
                  }
                </p>
                {availableCourses.length > 0 && curriculums.length === 0 && (
                  <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear mi primera malla
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCurriculums.map((curriculum, index) => (
                <motion.div
                  key={curriculum.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card>
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCurriculum(expandedCurriculum === curriculum.id ? null : curriculum.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Layers className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2 flex-wrap">
                              {curriculum.subject}
                              <span className="text-sm font-normal text-muted-foreground">
                                - {curriculum.grade}
                              </span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600">
                                {curriculum.level}
                              </span>
                              <span>{curriculum.units.length} unidades</span>
                              <span>·</span>
                              <span>{curriculum.totalHours} horas</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">
                              {curriculum.totalHours > 0
                                ? Math.round((curriculum.completedHours / curriculum.totalHours) * 100)
                                : 0}% completado
                            </p>
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{
                                  width: `${curriculum.totalHours > 0
                                    ? (curriculum.completedHours / curriculum.totalHours) * 100
                                    : 0}%`
                                }}
                              />
                            </div>
                          </div>
                          {expandedCurriculum === curriculum.id ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {expandedCurriculum === curriculum.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {curriculum.units.map((unit) => (
                                <div key={unit.id} className="border rounded-xl overflow-hidden">
                                  <div
                                    className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => toggleUnit(unit.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {expandedUnits.includes(unit.id) ? (
                                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <div>
                                          <p className="font-medium">{unit.name}</p>
                                          <p className="text-sm text-muted-foreground">{unit.description}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          {unit.topics.filter(t => t.completed).length}/{unit.topics.length} temas
                                        </span>
                                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {expandedUnits.includes(unit.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t"
                                      >
                                        <div className="p-4 space-y-2">
                                          {unit.topics.map((topic, topicIndex) => (
                                            <motion.div
                                              key={topic.id}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: topicIndex * 0.05 }}
                                              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                                            >
                                              <div className="flex items-center gap-3">
                                                <button
                                                  onClick={() => toggleTopicComplete(curriculum.id, unit.id, topic.id)}
                                                  className="focus:outline-none"
                                                >
                                                  {topic.completed ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                  ) : (
                                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                                                  )}
                                                </button>
                                                <div>
                                                  <p className={`font-medium ${topic.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                    {topic.name}
                                                  </p>
                                                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                  <Clock className="h-4 w-4" />
                                                  {topic.hours}h
                                                </span>
                                                <Button variant="ghost" size="icon">
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </motion.div>
                                          ))}
                                          <Button variant="outline" size="sm" className="w-full mt-2">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Tema
                                          </Button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}

                              <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Unidad
                              </Button>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Malla
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => deleteCurriculum(curriculum.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl shadow-xl w-full max-w-2xl my-8"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Nueva Malla Curricular</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solo puedes crear mallas para tus cursos asignados
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {step}
                        </div>
                        {step < 3 && <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={resetModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Step 1: Select Course */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Seleccionar Curso</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecciona uno de tus cursos asignados para crear su malla curricular
                    </p>

                    {availableCourses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="font-medium text-foreground">Todos tus cursos tienen malla curricular</p>
                        <p className="text-sm">No hay más cursos disponibles para asignar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableCourses.map(course => (
                          <div
                            key={course.id}
                            className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                              newCurriculum.courseId === course.id
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => handleCourseSelect(course.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{course.subject.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getGradeName(course.classroom)} {course.classroom.section.name} · {getLevelName(course.classroom)}
                                </p>
                              </div>
                              {newCurriculum.courseId === course.id && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {newCurriculum.courseId && (
                      <div className="pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Año</label>
                            <select
                              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                              value={newCurriculum.year}
                              onChange={(e) => setNewCurriculum({ ...newCurriculum, year: e.target.value })}
                            >
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Horas Totales (opcional)</label>
                            <Input
                              type="number"
                              placeholder="Se calcula automáticamente"
                              value={newCurriculum.totalHours}
                              onChange={(e) => setNewCurriculum({ ...newCurriculum, totalHours: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Units */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg">Unidades</h3>
                        <p className="text-sm text-muted-foreground">
                          {newCurriculum.subject} - {newCurriculum.grade}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addUnit}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Unidad
                      </Button>
                    </div>
                    {newCurriculum.units.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay unidades agregadas</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={addUnit}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar primera unidad
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newCurriculum.units.map((unit, index) => (
                          <div key={index} className="p-4 border rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-muted-foreground">Unidad {index + 1}</span>
                              <Button variant="ghost" size="icon" onClick={() => removeUnit(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Nombre de la unidad (ej: Números y Operaciones)"
                              value={unit.name}
                              onChange={(e) => updateUnit(index, 'name', e.target.value)}
                            />
                            <Input
                              placeholder="Descripción breve"
                              value={unit.description}
                              onChange={(e) => updateUnit(index, 'description', e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Topics */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Temas por Unidad</h3>
                    {newCurriculum.units.map((unit, unitIndex) => (
                      <div key={unitIndex} className="border rounded-xl overflow-hidden">
                        <div className="p-3 bg-muted/50 font-medium flex items-center justify-between">
                          <span>{unit.name || `Unidad ${unitIndex + 1}`}</span>
                          <Button variant="ghost" size="sm" onClick={() => addTopic(unitIndex)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Tema
                          </Button>
                        </div>
                        <div className="p-3 space-y-2">
                          {unit.topics.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              Sin temas. Haz clic en &quot;Tema&quot; para agregar.
                            </p>
                          ) : (
                            unit.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex gap-2 items-start p-2 bg-muted/20 rounded-lg">
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Nombre del tema"
                                    value={topic.name}
                                    onChange={(e) => updateTopic(unitIndex, topicIndex, 'name', e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Descripción"
                                      value={topic.description}
                                      onChange={(e) => updateTopic(unitIndex, topicIndex, 'description', e.target.value)}
                                      className="h-8 text-sm flex-1"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Horas"
                                      value={topic.hours}
                                      onChange={(e) => updateTopic(unitIndex, topicIndex, 'hours', e.target.value)}
                                      className="h-8 text-sm w-20"
                                    />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => removeTopic(unitIndex, topicIndex)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex gap-3 justify-between">
                <Button
                  variant="outline"
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : resetModal()}
                >
                  {currentStep > 1 ? 'Anterior' : 'Cancelar'}
                </Button>
                <Button
                  onClick={() => {
                    if (currentStep < 3) {
                      setCurrentStep(currentStep + 1)
                    } else {
                      saveCurriculum()
                    }
                  }}
                  disabled={
                    (currentStep === 1 && !newCurriculum.courseId) ||
                    (currentStep === 2 && newCurriculum.units.length === 0)
                  }
                >
                  {currentStep < 3 ? (
                    <>Siguiente</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Malla
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
