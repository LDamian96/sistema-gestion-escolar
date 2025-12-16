'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Target,
  Loader2,
  GraduationCap,
  Clock,
  User,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  studentsService,
  gradeSectionsService,
  curriculumService,
  Student,
  GradeSection,
  CurriculumTopic
} from '@/services/mock-data'

// Interfaces para la malla curricular (read-only view)
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
}

// Datos de ejemplo para la malla curricular
const getCurriculumsForGradeSection = (gradeSection: string, level: string, turno: string): Curriculum[] => {
  // Filtrar por grado-sección, nivel y turno
  if (gradeSection === '5to A' && level === 'Primaria' && turno === 'Mañana') {
    return [
      {
        id: 1,
        subjectId: '1',
        subjectName: 'Matemáticas',
        gradeSectionId: '1',
        gradeSection: '5to A',
        level: 'Primaria',
        turno: 'Mañana',
        year: '2024',
        completedUnits: 2,
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
      },
      {
        id: 2,
        subjectId: '2',
        subjectName: 'Comunicación',
        gradeSectionId: '1',
        gradeSection: '5to A',
        level: 'Primaria',
        turno: 'Mañana',
        year: '2024',
        completedUnits: 1,
        units: [
          {
            id: 1,
            name: 'Unidad 1: Comunicación Oral',
            description: 'Habilidades comunicativas orales',
            order: 1,
            topics: [
              { id: 1, name: 'Comprensión lectora', description: 'Técnicas de lectura', completed: true },
              { id: 2, name: 'Expresión oral', description: 'Técnicas de exposición', completed: true },
            ]
          },
          {
            id: 2,
            name: 'Unidad 2: Redacción',
            description: 'Técnicas de escritura',
            order: 2,
            topics: [
              { id: 3, name: 'Tipos de texto', description: 'Narrativo, descriptivo, expositivo', completed: false },
              { id: 4, name: 'Ortografía', description: 'Reglas ortográficas', completed: false },
            ]
          },
        ]
      },
      {
        id: 3,
        subjectId: '3',
        subjectName: 'Ciencias Naturales',
        gradeSectionId: '1',
        gradeSection: '5to A',
        level: 'Primaria',
        turno: 'Mañana',
        year: '2024',
        completedUnits: 1,
        units: [
          {
            id: 1,
            name: 'Unidad 1: Seres Vivos',
            description: 'Clasificación y características de los seres vivos',
            order: 1,
            topics: [
              { id: 1, name: 'Reino animal', description: 'Clasificación de animales', completed: true },
              { id: 2, name: 'Reino vegetal', description: 'Las plantas y sus partes', completed: true },
            ]
          },
        ]
      },
    ]
  }
  return []
}

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [gradeSection, setGradeSection] = useState<GradeSection | null>(null)
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(null)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simular obtener el estudiante actual (en producción vendría de la sesión)
      const students = await studentsService.getAll()
      const currentStudent = students.find(s => s.id === 's1') // Estudiante de ejemplo: Juan Pérez

      if (currentStudent) {
        setStudent(currentStudent)

        // Obtener información del grado-sección
        const gradeSections = await gradeSectionsService.getAll()
        const gs = gradeSections.find(g => `${g.grade} ${g.section}` === currentStudent.gradeSection)

        if (gs) {
          setGradeSection(gs)
          // Obtener mallas curriculares para este grado-sección
          const curriculumData = getCurriculumsForGradeSection(
            currentStudent.gradeSection,
            gs.level,
            gs.turno
          )
          setCurriculums(curriculumData)
          if (curriculumData.length > 0) {
            setExpandedCurriculum(curriculumData[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  // Estadísticas
  const stats = useMemo(() => {
    const totalUnits = curriculums.reduce((acc, c) => acc + c.units.length, 0)
    const completedUnits = curriculums.reduce((acc, c) => acc + c.completedUnits, 0)
    const totalTopics = curriculums.reduce((acc, c) =>
      acc + c.units.reduce((a, u) => a + u.topics.length, 0), 0)
    const completedTopics = curriculums.reduce((acc, c) =>
      acc + c.units.reduce((a, u) => a + u.topics.filter(t => t.completed).length, 0), 0)

    return [
      { label: 'Materias', value: curriculums.length, icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
      { label: 'Unidades', value: totalUnits, icon: Layers, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Temas Vistos', value: `${completedTopics}/${totalTopics}`, icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
      { label: 'Progreso', value: `${totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0}%`, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    ]
  }, [curriculums])

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

  if (!student || !gradeSection) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se pudo cargar la información del estudiante</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con información del estudiante */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            Bienvenido, {student.firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí puedes ver tu malla curricular y el progreso de tus materias
          </p>
        </div>
      </div>

      {/* Info Card del Estudiante */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{student.firstName} {student.lastName}</h2>
                <p className="text-sm text-muted-foreground">{student.code}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 sm:ml-auto">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Grado/Sección</p>
                  <p className="font-medium">{gradeSection.grade} {gradeSection.section}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nivel</p>
                  <p className="font-medium">{gradeSection.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Turno</p>
                  <p className="font-medium">{gradeSection.turno} ({gradeSection.turnoStartTime} - {gradeSection.turnoEndTime})</p>
                </div>
              </div>
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

      {/* Título de Malla Curricular */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Mi Malla Curricular</h2>
          <p className="text-sm text-muted-foreground">
            Plan de estudios para {gradeSection.grade} {gradeSection.section} - {gradeSection.level}
          </p>
        </div>
      </div>

      {/* Curriculums */}
      <div className="space-y-4">
        {curriculums.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay mallas curriculares disponibles para tu grado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          curriculums.map((curriculum, index) => (
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
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          {curriculum.subjectName}
                          <Badge variant="outline" className="font-normal">
                            {curriculum.year}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="text-muted-foreground">
                            {curriculum.units.length} unidades
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {curriculum.units.reduce((a, u) => a + u.topics.length, 0)} temas
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">
                          {Math.round((curriculum.completedUnits / curriculum.units.length) * 100)}% completado
                        </p>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(curriculum.completedUnits / curriculum.units.length) * 100}%` }}
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
                                          className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                                        >
                                          <div className="flex items-center gap-3">
                                            {topic.completed ? (
                                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                            )}
                                            <div>
                                              <p className={`font-medium ${topic.completed ? 'text-muted-foreground' : ''}`}>
                                                {topic.name}
                                              </p>
                                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                                            </div>
                                          </div>
                                          {topic.completed && (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                              Completado
                                            </Badge>
                                          )}
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
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
    </div>
  )
}
