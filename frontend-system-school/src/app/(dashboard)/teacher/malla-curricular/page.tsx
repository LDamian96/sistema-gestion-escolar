'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle2,
  Target,
  Calendar,
  TrendingUp,
  Plus,
  X,
  Save,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Topic {
  id: number
  name: string
  description: string
  hours: number
  completed: boolean
  scheduledDate?: string
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
  subject: string
  grade: string
  year: string
  units: Unit[]
  totalHours: number
  completedHours: number
}

const myCurriculums: Curriculum[] = [
  {
    id: 1,
    subject: 'Matemáticas',
    grade: '5to Grado A',
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
          { id: 1, name: 'Números naturales y enteros', description: 'Propiedades y operaciones', hours: 8, completed: true, scheduledDate: '2024-09-01' },
          { id: 2, name: 'Fracciones y decimales', description: 'Conversión y operaciones', hours: 10, completed: true, scheduledDate: '2024-09-15' },
          { id: 3, name: 'Potencias y raíces', description: 'Propiedades y cálculo', hours: 8, completed: true, scheduledDate: '2024-09-30' },
        ]
      },
      {
        id: 2,
        name: 'Unidad 2: Álgebra',
        description: 'Introducción al álgebra y ecuaciones',
        order: 2,
        topics: [
          { id: 4, name: 'Expresiones algebraicas', description: 'Términos y polinomios', hours: 10, completed: true, scheduledDate: '2024-10-15' },
          { id: 5, name: 'Ecuaciones lineales', description: 'Resolución de ecuaciones', hours: 12, completed: true, scheduledDate: '2024-11-01' },
          { id: 6, name: 'Sistemas de ecuaciones', description: 'Métodos de resolución', hours: 10, completed: false, scheduledDate: '2024-12-15' },
        ]
      },
      {
        id: 3,
        name: 'Unidad 3: Geometría',
        description: 'Figuras geométricas y medidas',
        order: 3,
        topics: [
          { id: 7, name: 'Polígonos', description: 'Clasificación y propiedades', hours: 8, completed: false, scheduledDate: '2025-01-15' },
          { id: 8, name: 'Áreas y perímetros', description: 'Cálculo de medidas', hours: 10, completed: false, scheduledDate: '2025-02-01' },
          { id: 9, name: 'Volúmenes', description: 'Cuerpos geométricos', hours: 8, completed: false, scheduledDate: '2025-02-20' },
        ]
      },
    ]
  },
  {
    id: 2,
    subject: 'Matemáticas',
    grade: '5to Grado B',
    year: '2024',
    totalHours: 180,
    completedHours: 110,
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
  course: string
  totalHours: string
  units: NewUnit[]
}

const initialNewCurriculum: NewCurriculum = {
  course: '',
  totalHours: '',
  units: []
}

export default function TeacherMallaCurricularPage() {
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(1)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([1, 2])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCurriculum, setNewCurriculum] = useState<NewCurriculum>(initialNewCurriculum)
  const [currentStep, setCurrentStep] = useState(1)

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

  const totalTopics = myCurriculums.reduce((acc, c) => acc + c.units.reduce((a, u) => a + u.topics.length, 0), 0)
  const completedTopics = myCurriculums.reduce((acc, c) => acc + c.units.reduce((a, u) => a + u.topics.filter(t => t.completed).length, 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Malla Curricular</h1>
          <p className="text-muted-foreground mt-1">Visualiza y gestiona el progreso de tus materias</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Malla
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Mis Cursos', value: myCurriculums.length, icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Temas Totales', value: totalTopics, icon: Target, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Completados', value: completedTopics, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Progreso Gral.', value: `${Math.round((completedTopics / totalTopics) * 100)}%`, icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        ].map((stat, index) => (
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

      {/* Curriculums */}
      <div className="space-y-4">
        {myCurriculums.map((curriculum, index) => {
          const completedInCurriculum = curriculum.units.reduce((a, u) => a + u.topics.filter(t => t.completed).length, 0)
          const totalInCurriculum = curriculum.units.reduce((a, u) => a + u.topics.length, 0)
          const progressPercent = Math.round((completedInCurriculum / totalInCurriculum) * 100)

          return (
            <motion.div
              key={curriculum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedCurriculum(expandedCurriculum === curriculum.id ? null : curriculum.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-2">
                          {curriculum.subject}
                          <span className="text-sm font-normal text-muted-foreground">
                            - {curriculum.grade}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {curriculum.units.length} unidades · {curriculum.totalHours} horas
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 sm:w-48">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className={`font-medium ${progressPercent >= 70 ? 'text-green-500' : progressPercent >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className={`h-full rounded-full ${progressPercent >= 70 ? 'bg-green-500' : progressPercent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          />
                        </div>
                      </div>
                      {expandedCurriculum === curriculum.id ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
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
                          {curriculum.units.map((unit, unitIndex) => {
                            const unitCompleted = unit.topics.filter(t => t.completed).length
                            const unitTotal = unit.topics.length
                            const unitProgress = Math.round((unitCompleted / unitTotal) * 100)

                            return (
                              <div key={unit.id} className="border rounded-xl overflow-hidden">
                                <div
                                  className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => toggleUnit(unit.id)}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      {expandedUnits.includes(unit.id) ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                      )}
                                      <div>
                                        <p className="font-medium">{unit.name}</p>
                                        <p className="text-sm text-muted-foreground">{unit.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-7 sm:ml-0">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        unitProgress === 100 ? 'bg-green-500/20 text-green-600' :
                                        unitProgress >= 50 ? 'bg-yellow-500/20 text-yellow-600' :
                                        'bg-gray-500/20 text-gray-600'
                                      }`}>
                                        {unitCompleted}/{unitTotal} temas
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
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0"
                                              >
                                                {topic.completed ? (
                                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                                )}
                                              </Button>
                                              <div>
                                                <p className={`font-medium ${topic.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                  {topic.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{topic.description}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-11 sm:ml-0">
                                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {topic.hours}h
                                              </span>
                                              {topic.scheduledDate && (
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                  <Calendar className="h-4 w-4" />
                                                  {topic.scheduledDate}
                                                </span>
                                              )}
                                            </div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
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
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Seleccionar Curso</h3>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Curso</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={newCurriculum.course}
                        onChange={(e) => setNewCurriculum({ ...newCurriculum, course: e.target.value })}
                      >
                        <option value="">Seleccionar curso...</option>
                        <option value="5to A - Matemáticas">5to A - Matemáticas</option>
                        <option value="5to B - Matemáticas">5to B - Matemáticas</option>
                        <option value="6to A - Álgebra">6to A - Álgebra</option>
                        <option value="6to B - Geometría">6to B - Geometría</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Horas Totales</label>
                      <Input
                        type="number"
                        placeholder="180"
                        value={newCurriculum.totalHours}
                        onChange={(e) => setNewCurriculum({ ...newCurriculum, totalHours: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Units */}
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
                      resetModal()
                    }
                  }}
                  disabled={
                    (currentStep === 1 && !newCurriculum.course) ||
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
