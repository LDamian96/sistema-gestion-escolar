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
  FileText,
  Filter,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { gradeSectionsService, subjectsService, GradeSection, Subject } from '@/services/mock-data'

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

// Datos de ejemplo
const initialCurriculums: Curriculum[] = [
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
    ]
  },
]

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
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  gradeSectionId: string
  subjectId: string
  year: string
  units: NewUnit[]
}

const initialNewCurriculum: NewCurriculum = {
  level: 'Inicial',
  gradeSectionId: '',
  subjectId: '',
  year: '2024',
  units: []
}

export default function AdminMallaCurricularPage() {
  // Data states
  const [curriculums, setCurriculums] = useState<Curriculum[]>(initialCurriculums)
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [selectedTurno, setSelectedTurno] = useState<string>('all')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // UI states
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(1)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([1])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCurriculum, setNewCurriculum] = useState<NewCurriculum>(initialNewCurriculum)
  const [currentStep, setCurrentStep] = useState(1)

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [gsData, subjectsData] = await Promise.all([
        gradeSectionsService.getAll(),
        subjectsService.getAll()
      ])
      setGradeSections(gsData)
      setSubjects(subjectsData)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // Turnos disponibles
  const availableTurnos = useMemo(() => {
    const turnos = new Set<string>()
    gradeSections.forEach(gs => {
      if (gs.turno) turnos.add(gs.turno)
    })
    return Array.from(turnos).sort()
  }, [gradeSections])

  // Filtrar grados/secciones por nivel y turno
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

  // Grado-secciones para el formulario
  const filteredGradeSectionsForForm = useMemo(() => {
    return gradeSections.filter(gs => gs.level === newCurriculum.level)
  }, [gradeSections, newCurriculum.level])

  // Materias filtradas para el formulario (basado en el grado-sección seleccionado)
  const filteredSubjectsForForm = useMemo(() => {
    if (!newCurriculum.gradeSectionId) return []
    const gs = gradeSections.find(g => g.id === newCurriculum.gradeSectionId)
    if (!gs) return []
    return subjects.filter(s => s.gradeSection === `${gs.grade} ${gs.section}`)
  }, [subjects, gradeSections, newCurriculum.gradeSectionId])

  // Materias disponibles para el filtro
  const availableSubjects = useMemo(() => {
    const subjectNames = new Set<string>()
    curriculums.forEach(c => subjectNames.add(c.subjectName))
    return Array.from(subjectNames).sort()
  }, [curriculums])

  // Filtrar mallas curriculares
  const filteredCurriculums = useMemo(() => {
    return curriculums.filter(c => {
      const matchesSearch = c.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.gradeSection.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel

      let matchesTurno = true
      if (selectedTurno !== 'all') {
        matchesTurno = c.turno === selectedTurno
      }

      const matchesGradeSection = selectedGradeSection === 'all' || c.gradeSection === selectedGradeSection
      const matchesSubject = selectedSubject === 'all' || c.subjectName === selectedSubject

      return matchesSearch && matchesLevel && matchesTurno && matchesGradeSection && matchesSubject
    })
  }, [curriculums, searchTerm, selectedLevel, selectedTurno, selectedGradeSection, selectedSubject])

  // Stats
  const stats = useMemo(() => [
    { label: 'Mallas Activas', value: curriculums.length, icon: Layers, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Unidades Totales', value: curriculums.reduce((acc, c) => acc + c.units.length, 0), icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Temas Totales', value: curriculums.reduce((acc, c) => acc + c.units.reduce((a, u) => a + u.topics.length, 0), 0), icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Unidades Completadas', value: curriculums.reduce((acc, c) => acc + c.completedUnits, 0), icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ], [curriculums])

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

  const handleLevelChange = (level: 'Inicial' | 'Primaria' | 'Secundaria') => {
    setNewCurriculum({
      ...newCurriculum,
      level,
      gradeSectionId: '',
      subjectId: ''
    })
  }

  const handleGradeSectionChange = (gsId: string) => {
    setNewCurriculum({
      ...newCurriculum,
      gradeSectionId: gsId,
      subjectId: ''
    })
  }

  const handleCreateCurriculum = () => {
    const gs = gradeSections.find(g => g.id === newCurriculum.gradeSectionId)
    const subject = subjects.find(s => s.id === newCurriculum.subjectId)

    if (!gs || !subject) {
      toast.error('Datos inválidos')
      return
    }

    const newCurriculumData: Curriculum = {
      id: curriculums.length + 1,
      subjectId: subject.id,
      subjectName: subject.name,
      gradeSectionId: gs.id,
      gradeSection: `${gs.grade} ${gs.section}`,
      level: gs.level,
      turno: gs.turno,
      year: newCurriculum.year,
      completedUnits: 0,
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

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando malla curricular...</p>
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
          <p className="text-muted-foreground mt-1">Gestiona el plan de estudios por materia y grado</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Malla
        </Button>
      </div>

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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Nivel */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nivel:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'Inicial', 'Primaria', 'Secundaria'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedLevel(level)
                          setSelectedGradeSection('all')
                        }}
                      >
                        {level === 'all' ? 'Todos' : level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Turno */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Turno:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedTurno === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedTurno('all')
                        setSelectedGradeSection('all')
                      }}
                    >
                      Todos
                    </Button>
                    {availableTurnos.map((turno) => (
                      <Button
                        key={turno}
                        variant={selectedTurno === turno ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedTurno(turno)
                          setSelectedGradeSection('all')
                        }}
                      >
                        {turno}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

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
                    {filteredGradeSections.map((gs) => (
                      <Button
                        key={gs.id}
                        variant={selectedGradeSection === `${gs.grade} ${gs.section}` ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGradeSection(`${gs.grade} ${gs.section}`)}
                      >
                        {gs.grade} {gs.section}
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
            </div>

            <p className="text-sm text-muted-foreground pt-2 border-t">
              Mostrando {filteredCurriculums.length} de {curriculums.length} mallas curriculares
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Curriculums */}
      <div className="space-y-4">
        {filteredCurriculums.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron mallas curriculares</p>
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
                          {Math.round((curriculum.completedUnits / curriculum.units.length) * 100)}% completado
                        </p>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
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
                                      {unit.topics.length} temas
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
                                            {topic.completed ? (
                                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                            )}
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
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Exportar PDF
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
                {/* Step 1: Selección de Nivel, Grado-Sección y Materia */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Información Básica</h3>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Nivel *</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={newCurriculum.level}
                        onChange={(e) => handleLevelChange(e.target.value as 'Inicial' | 'Primaria' | 'Secundaria')}
                      >
                        <option value="Inicial">Inicial</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Grado/Sección *</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={newCurriculum.gradeSectionId}
                        onChange={(e) => handleGradeSectionChange(e.target.value)}
                      >
                        <option value="">Seleccionar grado/sección...</option>
                        {filteredGradeSectionsForForm.map(gs => (
                          <option key={gs.id} value={gs.id}>
                            {gs.grade} {gs.section} ({gs.turno})
                          </option>
                        ))}
                      </select>
                      {filteredGradeSectionsForForm.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          No hay grado-secciones para el nivel {newCurriculum.level}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Materia *</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={newCurriculum.subjectId}
                        onChange={(e) => setNewCurriculum({ ...newCurriculum, subjectId: e.target.value })}
                        disabled={!newCurriculum.gradeSectionId}
                      >
                        <option value="">Seleccionar materia...</option>
                        {filteredSubjectsForForm.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {newCurriculum.gradeSectionId && filteredSubjectsForForm.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          No hay materias asignadas a este grado-sección
                        </p>
                      )}
                    </div>

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

                    {newCurriculum.gradeSectionId && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                        <p><strong>Turno:</strong> {(() => {
                          const gs = filteredGradeSectionsForForm.find(g => g.id === newCurriculum.gradeSectionId)
                          return gs?.turno || ''
                        })()}</p>
                        <p><strong>Horario:</strong> {(() => {
                          const gs = filteredGradeSectionsForForm.find(g => g.id === newCurriculum.gradeSectionId)
                          return gs ? `${gs.turnoStartTime} - ${gs.turnoEndTime}` : ''
                        })()}</p>
                      </div>
                    )}
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
                    (currentStep === 1 && (!newCurriculum.gradeSectionId || !newCurriculum.subjectId)) ||
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
