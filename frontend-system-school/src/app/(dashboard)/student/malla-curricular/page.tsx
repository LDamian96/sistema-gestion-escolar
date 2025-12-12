'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Layers,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const courses = [
  { id: 'mat', name: 'Matemáticas' },
  { id: 'esp', name: 'Español' },
  { id: 'cie', name: 'Ciencias' },
  { id: 'his', name: 'Historia' },
  { id: 'ing', name: 'Inglés' },
  { id: 'edf', name: 'Educación Física' },
]

interface Topic {
  id: number
  title: string
  status: 'completed' | 'current' | 'pending'
  description: string
}

interface Unit {
  id: number
  title: string
  topics: Topic[]
}

interface Curriculum {
  id: string
  course: string
  courseId: string
  units: Unit[]
}

const curriculums: Curriculum[] = [
  {
    id: '1',
    course: 'Matemáticas',
    courseId: 'mat',
    units: [
      {
        id: 1,
        title: 'Unidad 1: Números y Operaciones',
        topics: [
          { id: 1, title: 'Números naturales y enteros', status: 'completed', description: 'Propiedades y operaciones básicas' },
          { id: 2, title: 'Fracciones y decimales', status: 'completed', description: 'Conversión y operaciones' },
          { id: 3, title: 'Potencias y raíces', status: 'completed', description: 'Propiedades y cálculo' },
        ]
      },
      {
        id: 2,
        title: 'Unidad 2: Álgebra',
        topics: [
          { id: 4, title: 'Expresiones algebraicas', status: 'completed', description: 'Simplificación y operaciones' },
          { id: 5, title: 'Ecuaciones lineales', status: 'current', description: 'Resolución de ecuaciones de primer grado' },
          { id: 6, title: 'Sistemas de ecuaciones', status: 'pending', description: 'Métodos de resolución' },
        ]
      },
      {
        id: 3,
        title: 'Unidad 3: Geometría',
        topics: [
          { id: 7, title: 'Figuras geométricas', status: 'pending', description: 'Propiedades y clasificación' },
          { id: 8, title: 'Perímetros y áreas', status: 'pending', description: 'Cálculo de medidas' },
          { id: 9, title: 'Volúmenes', status: 'pending', description: 'Cálculo de volúmenes' },
        ]
      },
    ]
  },
  {
    id: '2',
    course: 'Español',
    courseId: 'esp',
    units: [
      {
        id: 1,
        title: 'Unidad 1: Gramática',
        topics: [
          { id: 1, title: 'Categorías gramaticales', status: 'completed', description: 'Sustantivos, verbos, adjetivos' },
          { id: 2, title: 'Sintaxis', status: 'completed', description: 'Análisis de oraciones' },
          { id: 3, title: 'Ortografía', status: 'current', description: 'Reglas de acentuación' },
        ]
      },
      {
        id: 2,
        title: 'Unidad 2: Literatura',
        topics: [
          { id: 4, title: 'Géneros literarios', status: 'pending', description: 'Narrativa, lírica, dramática' },
          { id: 5, title: 'Análisis de textos', status: 'pending', description: 'Comprensión lectora' },
          { id: 6, title: 'Producción textual', status: 'pending', description: 'Ensayos y composiciones' },
        ]
      },
    ]
  },
  {
    id: '3',
    course: 'Ciencias',
    courseId: 'cie',
    units: [
      {
        id: 1,
        title: 'Unidad 1: Biología',
        topics: [
          { id: 1, title: 'La célula', status: 'completed', description: 'Estructura y funciones' },
          { id: 2, title: 'Sistemas del cuerpo', status: 'completed', description: 'Sistema digestivo, circulatorio' },
          { id: 3, title: 'Genética básica', status: 'current', description: 'ADN y herencia' },
        ]
      },
      {
        id: 2,
        title: 'Unidad 2: Química',
        topics: [
          { id: 4, title: 'Tabla periódica', status: 'pending', description: 'Elementos y propiedades' },
          { id: 5, title: 'Reacciones químicas', status: 'pending', description: 'Tipos de reacciones' },
        ]
      },
    ]
  },
  {
    id: '4',
    course: 'Historia',
    courseId: 'his',
    units: [
      {
        id: 1,
        title: 'Unidad 1: Historia Antigua',
        topics: [
          { id: 1, title: 'Civilizaciones antiguas', status: 'completed', description: 'Mesopotamia, Egipto' },
          { id: 2, title: 'Grecia y Roma', status: 'current', description: 'Culturas clásicas' },
        ]
      },
      {
        id: 2,
        title: 'Unidad 2: Edad Media',
        topics: [
          { id: 3, title: 'Feudalismo', status: 'pending', description: 'Sistema feudal europeo' },
          { id: 4, title: 'El Renacimiento', status: 'pending', description: 'Arte y ciencia' },
        ]
      },
    ]
  },
  {
    id: '5',
    course: 'Inglés',
    courseId: 'ing',
    units: [
      {
        id: 1,
        title: 'Unit 1: Grammar',
        topics: [
          { id: 1, title: 'Present Tenses', status: 'completed', description: 'Simple and continuous' },
          { id: 2, title: 'Past Tenses', status: 'completed', description: 'Simple, continuous, perfect' },
          { id: 3, title: 'Future Forms', status: 'current', description: 'Will, going to, present continuous' },
        ]
      },
      {
        id: 2,
        title: 'Unit 2: Vocabulary',
        topics: [
          { id: 4, title: 'Travel and Tourism', status: 'pending', description: 'Vocabulary and expressions' },
          { id: 5, title: 'Technology', status: 'pending', description: 'Modern technology terms' },
        ]
      },
    ]
  },
  {
    id: '6',
    course: 'Educación Física',
    courseId: 'edf',
    units: [
      {
        id: 1,
        title: 'Unidad 1: Deportes de Equipo',
        topics: [
          { id: 1, title: 'Fútbol', status: 'completed', description: 'Reglas y técnicas básicas' },
          { id: 2, title: 'Voleibol', status: 'completed', description: 'Fundamentos del juego' },
          { id: 3, title: 'Baloncesto', status: 'current', description: 'Técnicas y jugadas' },
        ]
      },
    ]
  },
]

export default function StudentMallaCurricularPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([])

  const filteredCurriculum = selectedCourse
    ? curriculums.filter(c => c.courseId === selectedCourse)
    : curriculums

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const getStatusIcon = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'current':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-600">Completado</span>
      case 'current':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-600">En curso</span>
      case 'pending':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">Pendiente</span>
    }
  }

  const calculateProgress = (curriculum: Curriculum) => {
    const allTopics = curriculum.units.flatMap(u => u.topics)
    const completed = allTopics.filter(t => t.status === 'completed').length
    return Math.round((completed / allTopics.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Malla Curricular</h1>
        <p className="text-muted-foreground mt-1">Revisa los temas de tus cursos para repasar</p>
      </div>

      {/* Course Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por curso:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCourse === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCourse(null)}
              >
                Todos
              </Button>
              {courses.map((course) => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  {course.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Cards */}
      <div className="space-y-6">
        {filteredCurriculum.map((curriculum, index) => (
          <motion.div
            key={curriculum.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{curriculum.course}</CardTitle>
                      <CardDescription>
                        {curriculum.units.length} unidades • {curriculum.units.flatMap(u => u.topics).length} temas
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{calculateProgress(curriculum)}%</p>
                      <p className="text-xs text-muted-foreground">Progreso</p>
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress(curriculum)}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {curriculum.units.map((unit) => (
                    <div key={unit.id} className="border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedUnits.includes(unit.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{unit.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {unit.topics.filter(t => t.status === 'completed').length}/{unit.topics.length} completados
                        </span>
                      </button>

                      {expandedUnits.includes(unit.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t"
                        >
                          {unit.topics.map((topic, topicIndex) => (
                            <motion.div
                              key={topic.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: topicIndex * 0.05 }}
                              className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors border-b last:border-b-0"
                            >
                              <div className="mt-1">
                                {getStatusIcon(topic.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className="font-medium">{topic.title}</h4>
                                  {getStatusBadge(topic.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">{topic.description}</p>
                              </div>
                              {topic.status === 'completed' && (
                                <Button variant="outline" size="sm">
                                  Repasar
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
