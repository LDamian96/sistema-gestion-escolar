'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  X,
  Save,
  CheckCircle2,
  Target,
  Loader2,
  GraduationCap,
  User,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  teachersService,
  coursesService,
  gradeSectionsService,
  Teacher,
  Course,
  GradeSection
} from '@/services/mock-data'

// Interfaces para la malla curricular
interface Topic {
  id: number
  name: string
  description: string
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
  subjectId: string
  subjectName: string
  gradeSectionId: string
  gradeSection: string
  level: string
  turno: string
  year: string
  units: Unit[]
  completedUnits: number
  teacherId: string
  teacherName: string
}

interface NewTopic {
  name: string
  description: string
}

interface NewUnit {
  name: string
  description: string
  topics: NewTopic[]
}

interface NewCurriculum {
  courseId: string
  year: string
  units: NewUnit[]
}

// Datos de ejemplo para mallas del profesor
const getTeacherCurriculums = (teacherId: string, courses: Course[]): Curriculum[] => {
  const teacherCourses = courses.filter(c => c.teacherId === teacherId)

  // Simular mallas existentes para los cursos del profesor
  const curriculums: Curriculum[] = []
  let id = 1

  for (const course of teacherCourses) {
    if (course.gradeSection === '5to A' && course.subjectName === 'Matemáticas') {
      curriculums.push({
        id: id++,
        subjectId: course.subjectId,
        subjectName: course.subjectName,
        gradeSectionId: course.gradeSectionId,
        gradeSection: course.gradeSection,
        level: 'Primaria',
        turno: 'Mañana',
        year: '2024',
        completedUnits: 2,
        teacherId: course.teacherId,
        teacherName: course.teacherName,
        units: [
          {
            id: 1,
            name: 'Unidad 1: Números y Operaciones',
            description: 'Operaciones básicas y propiedades numéricas',
            order: 1,
            topics: [
              { id: 1, name: 'Números naturales y enteros', description: 'Propiedades y operaciones', completed: true },
              { id: 2, name: 'Fracciones y decimales', description: 'Conversión y operaciones', completed: true },
              { id: 3, name: 'Potencias y raíces', description: 'Propiedades y cálculo', completed: true },
            ]
          },
          {
            id: 2,
            name: 'Unidad 2: Álgebra',
            description: 'Introducción al álgebra y ecuaciones',
            order: 2,
            topics: [
              { id: 4, name: 'Expresiones algebraicas', description: 'Términos y polinomios', completed: true },
              { id: 5, name: 'Ecuaciones lineales', description: 'Resolución de ecuaciones', completed: true },
              { id: 6, name: 'Sistemas de ecuaciones', description: 'Métodos de resolución', completed: false },
            ]
          },
          {
            id: 3,
            name: 'Unidad 3: Geometría',
            description: 'Figuras geométricas y medidas',
            order: 3,
            topics: [
              { id: 7, name: 'Polígonos', description: 'Clasificación y propiedades', completed: false },
              { id: 8, name: 'Áreas y perímetros', description: 'Cálculo de medidas', completed: false },
              { id: 9, name: 'Volúmenes', description: 'Cuerpos geométricos', completed: false },
            ]
          },
        ]
      })
    }
  }

  return curriculums
}

const initialNewCurriculum: NewCurriculum = {
  courseId: '',
  year: '2024',
  units: []
}

export default function TeacherDashboardPage() {
  // Data states
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // UI states
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(null)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCurriculum, setNewCurriculum] = useState<NewCurriculum>(initialNewCurriculum)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simular obtener el profesor actual (en producción vendría de la sesión)
      const teachers = await teachersService.getAll()
      const currentTeacher = teachers.find(t => t.id === 't1') // Profesor de ejemplo: Carlos López

      if (currentTeacher) {
        setTeacher(currentTeacher)

        const [coursesData, gsData] = await Promise.all([
          coursesService.getAll(),
          gradeSectionsService.getAll()
        ])

        // Filtrar solo los cursos asignados al profesor
        const teacherCourses = coursesData.filter(c => c.teacherId === currentTeacher.id)
        setCourses(teacherCourses)
        setGradeSections(gsData)

        // Cargar mallas curriculares del profesor
        const curriculumData = getTeacherCurriculums(currentTeacher.id, coursesData)
        setCurriculums(curriculumData)

        if (curriculumData.length > 0) {
          setExpandedCurriculum(curriculumData[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // Grado-secciones disponibles (solo del profesor)
  const availableGradeSections = useMemo(() => {
    const gsNames = new Set<string>()
    courses.forEach(c => gsNames.add(c.gradeSection))
    return Array.from(gsNames).sort()
  }, [courses])

  // Materias disponibles (solo del profesor)
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>()
    courses.forEach(c => subjects.add(c.subjectName))
    return Array.from(subjects).sort()
  }, [courses])

  // Cursos disponibles para crear malla (sin malla existente)
  const availableCoursesForCurriculum = useMemo(() => {
    const existingCourseIds = new Set(curriculums.map(c => `${c.subjectName}-${c.gradeSection}`))
    return courses.filter(c => !existingCourseIds.has(`${c.subjectName}-${c.gradeSection}`))
  }, [courses, curriculums])

  // Filtrar mallas curriculares
  const filteredCurriculums = useMemo(() => {
    return curriculums.filter(c => {
      const matchesSearch = c.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.gradeSection.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGradeSection = selectedGradeSection === 'all' || c.gradeSection === selectedGradeSection
      const matchesSubject = selectedSubject === 'all' || c.subjectName === selectedSubject

      return matchesSearch && matchesGradeSection && matchesSubject
    })
  }, [curriculums, searchTerm, selectedGradeSection, selectedSubject])

  // Stats
  const stats = useMemo(() => [
    { label: 'Mis Cursos', value: courses.length, icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Mallas Creadas', value: curriculums.length, icon: Layers, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Unidades Totales', value: curriculums.reduce((acc, c) => acc + c.units.length, 0), icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Temas Completados', value: curriculums.reduce((acc, c) => acc + c.units.reduce((a, u) => a + u.topics.filter(t => t.completed).length, 0), 0), icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ], [courses, curriculums])

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

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
    updatedUnits[unitIndex].topics.push({ name: '', description: '' })
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

  const resetModal = () => {
    setNewCurriculum(initialNewCurriculum)
    setCurrentStep(1)
    setShowCreateModal(false)
  }

  const handleCreateCurriculum = () => {
    const course = courses.find(c => c.id === newCurriculum.courseId)
    if (!course) {
      toast.error('Selecciona un curso válido')
      return
    }

    const gs = gradeSections.find(g => g.id === course.gradeSectionId)

    const newCurriculumData: Curriculum = {
      id: curriculums.length + 1,
      subjectId: course.subjectId,
      subjectName: course.subjectName,
      gradeSectionId: course.gradeSectionId,
      gradeSection: course.gradeSection,
      level: gs?.level || 'Primaria',
      turno: gs?.turno || 'Mañana',
      year: newCurriculum.year,
      completedUnits: 0,
      teacherId: course.teacherId,
      teacherName: course.teacherName,
      units: newCurriculum.units.map((unit, idx) => ({
        id: idx + 1,
        name: unit.name,
        description: unit.description,
        order: idx + 1,
        topics: unit.topics.map((topic, tidx) => ({
          id: tidx + 1,
          name: topic.name,
          description: topic.description,
          completed: false
        }))
      }))
    }

    setCurriculums([...curriculums, newCurriculumData])
    toast.success('Malla curricular creada exitosamente')
    resetModal()
  }

  const toggleTopicComplete = (curriculumId: number, unitId: number, topicId: number) => {
    setCurriculums(prev => prev.map(c => {
      if (c.id === curriculumId) {
        const updatedUnits = c.units.map(u => {
          if (u.id === unitId) {
            return {
              ...u,
              topics: u.topics.map(t =>
                t.id === topicId ? { ...t, completed: !t.completed } : t
              )
            }
          }
          return u
        })
        const completedUnits = updatedUnits.filter(u =>
          u.topics.length > 0 && u.topics.every(t => t.completed)
        ).length
        return { ...c, units: updatedUnits, completedUnits }
      }
      return c
    }))
    toast.success('Estado del tema actualizado')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando tu información...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se pudo cargar la información del profesor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Malla Curricular</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el plan de estudios de tus cursos asignados
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={availableCoursesForCurriculum.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Malla
        </Button>
      </div>

      {/* Info del Profesor */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{teacher.firstName} {teacher.lastName}</h2>
                <p className="text-sm text-muted-foreground">{teacher.code} - {teacher.specialization}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto items-center">
              {teacher.subjects.map(subject => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
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
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por materia o grado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Grado/Sección */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Grado/Sección:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedGradeSection === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGradeSection('all')}
                  >
                    Todos
                  </Button>
                  {availableGradeSections.map((gs) => (
                    <Button
                      key={gs}
                      variant={selectedGradeSection === gs ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGradeSection(gs)}
                    >
                      {gs}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Materia */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Materia:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedSubject === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSubject('all')}
                  >
                    Todas
                  </Button>
                  {availableSubjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={selectedSubject === subject ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pt-2 border-t">
              Mostrando {filteredCurriculums.length} de {curriculums.length} mallas curriculares
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mis Cursos Asignados */}
      {courses.length > 0 && curriculums.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Cursos Asignados
            </CardTitle>
            <CardDescription>
              Puedes crear una malla curricular para cada uno de tus cursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => {
                const gs = gradeSections.find(g => g.id === course.gradeSectionId)
                return (
                  <div
                    key={course.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{course.subjectName}</p>
                        <p className="text-sm text-muted-foreground">{course.gradeSection}</p>
                        {gs && (
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {gs.level}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {gs.turno}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Curriculums */}
      <div className="space-y-4">
        {filteredCurriculums.length === 0 && curriculums.length > 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron mallas con los filtros seleccionados</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCurriculums.map((curriculum, index) => (
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
                          {curriculum.subjectName}
                          <span className="text-sm font-normal text-muted-foreground">
                            - {curriculum.gradeSection} ({curriculum.year})
                          </span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            curriculum.level === 'Inicial' ? 'bg-orange-500/20 text-orange-600' :
                            curriculum.level === 'Primaria' ? 'bg-blue-500/20 text-blue-600' :
                            'bg-purple-500/20 text-purple-600'
                          }`}>
                            {curriculum.level}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            curriculum.turno === 'Mañana'
                              ? 'bg-yellow-500/20 text-yellow-600'
                              : 'bg-indigo-500/20 text-indigo-600'
                          }`}>
                            {curriculum.turno}
                          </span>
                          <span className="text-muted-foreground">
                            {curriculum.units.length} unidades
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">
                          {curriculum.units.length > 0
                            ? Math.round((curriculum.completedUnits / curriculum.units.length) * 100)
                            : 0}% completado
                        </p>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: curriculum.units.length > 0 ? `${(curriculum.completedUnits / curriculum.units.length) * 100}%` : '0%' }}
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
                                                <CheckCircle2 className="h-5 w-5 text-green-500 cursor-pointer hover:text-green-600" />
                                              ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary cursor-pointer" />
                                              )}
                                            </button>
                                            <div>
                                              <p className={`font-medium ${topic.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                {topic.name}
                                              </p>
                                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                                            </div>
                                          </div>
                                          <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                          </Button>
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

                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Malla
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
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
          ))
        )}
      </div>

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
                  <div className="flex items-center gap-2 mt-2">
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
                {/* Step 1: Selección de Curso */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Seleccionar Curso</h3>
                    <p className="text-sm text-muted-foreground">
                      Solo puedes crear mallas para los cursos que tienes asignados
                    </p>

                    {availableCoursesForCurriculum.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Ya tienes mallas curriculares para todos tus cursos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableCoursesForCurriculum.map(course => {
                          const gs = gradeSections.find(g => g.id === course.gradeSectionId)
                          const isSelected = newCurriculum.courseId === course.id
                          return (
                            <div
                              key={course.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:border-primary/50'
                              }`}
                              onClick={() => setNewCurriculum({ ...newCurriculum, courseId: course.id })}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{course.subjectName}</p>
                                  <p className="text-sm text-muted-foreground">{course.gradeSection}</p>
                                </div>
                                {gs && (
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{gs.level}</Badge>
                                    <Badge variant="secondary">{gs.turno}</Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

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
                  </div>
                )}

                {/* Step 2: Unidades */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">Unidades</h3>
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

                {/* Step 3: Temas */}
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
                                  <Input
                                    placeholder="Descripción"
                                    value={topic.description}
                                    onChange={(e) => updateTopic(unitIndex, topicIndex, 'description', e.target.value)}
                                    className="h-8 text-sm"
                                  />
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
                      handleCreateCurriculum()
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
