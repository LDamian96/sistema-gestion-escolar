'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  X,
  Save,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

interface Subject {
  id: string
  name: string
  code: string
  description: string
  hoursPerWeek: number
  credits: number
  gradeLevel: string
  coursesCount: number
  color: string
}

// Colores para las materias
const subjectColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
  'bg-red-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
  'bg-indigo-500', 'bg-teal-500'
]

// Interface para respuesta de API
interface SubjectResponse {
  id: string
  name: string
  code: string
  description: string
  hoursPerWeek: number
  credits: number
  gradeLevel: { id: string; name: string; level: { name: string } }
  _count: { courses: number; curriculum: number }
}

interface GradeLevelResponse {
  id: string
  name: string
  order: number
  level: { id: string; name: string }
}

export default function AdminMateriasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [gradeLevels, setGradeLevels] = useState<GradeLevelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSubject, setNewSubject] = useState({
    gradeLevelId: '',
    name: '',
    code: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subjectsData, gradeLevelsData] = await Promise.all([
        api.get<SubjectResponse[]>('/subjects'),
        api.get<GradeLevelResponse[]>('/grade-levels')
      ])

      const transformedSubjects: Subject[] = subjectsData.map((s, index) => ({
        id: s.id,
        name: s.name,
        code: s.code || '',
        description: s.description || '',
        hoursPerWeek: s.hoursPerWeek || 0,
        credits: s.credits || 0,
        gradeLevel: s.gradeLevel ? `${s.gradeLevel.name} - ${s.gradeLevel.level.name}` : '',
        coursesCount: s._count?.courses || 0,
        color: subjectColors[index % subjectColors.length],
      }))

      setSubjects(transformedSubjects)
      setGradeLevels(gradeLevelsData)

      // Set default gradeLevelId si hay grados disponibles
      if (gradeLevelsData.length > 0 && !newSubject.gradeLevelId) {
        setNewSubject(prev => ({ ...prev, gradeLevelId: gradeLevelsData[0].id }))
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: subjects.length,
    totalHours: subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0),
    totalCredits: subjects.reduce((acc, s) => acc + s.credits, 0),
  }

  const handleCreateSubject = async () => {
    if (!newSubject.name || !newSubject.gradeLevelId) {
      console.log('Validación fallida - nombre y grado requeridos')
      return
    }

    try {
      setCreating(true)

      // Crear materia en la API
      const createdSubject = await api.post<SubjectResponse>('/subjects', {
        gradeLevelId: newSubject.gradeLevelId,
        name: newSubject.name,
        code: newSubject.code || undefined,
        description: newSubject.description || undefined
      })

      console.log('Materia creada en BD:', createdSubject)

      // Refrescar los datos
      await fetchData()

      resetModal()
    } catch (err) {
      console.error('Error al crear materia:', err)
      setError('Error al crear la materia')
    } finally {
      setCreating(false)
    }
  }

  const resetModal = () => {
    setNewSubject({
      gradeLevelId: gradeLevels.length > 0 ? gradeLevels[0].id : '',
      name: '',
      code: '',
      description: ''
    })
    setShowCreateModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando materias...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Materias</h1>
          <p className="text-muted-foreground mt-1">Administra las asignaturas del plan de estudios</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Materias', value: stats.total, icon: Library, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Horas Semanales', value: stats.totalHours, icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Total Créditos', value: stats.totalCredits, icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${subject.color}/20`}>
                    <Library className={`h-6 w-6 ${subject.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.code || 'Sin código'}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {subject.description || 'Sin descripción'}
                </p>

                {subject.gradeLevel && (
                  <p className="text-xs text-muted-foreground mb-4 px-2 py-1 bg-muted rounded-full inline-block">
                    {subject.gradeLevel}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Horas/Semana</p>
                    <p className="font-semibold">{subject.hoursPerWeek}h</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Créditos</p>
                    <p className="font-semibold">{subject.credits}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground">
                    Cursos asociados: {subject.coursesCount}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl shadow-xl w-full max-w-lg"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Nueva Materia</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Grado</label>
                  <select
                    value={newSubject.gradeLevelId}
                    onChange={(e) => setNewSubject({ ...newSubject, gradeLevelId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    {gradeLevels.map(gl => (
                      <option key={gl.id} value={gl.id}>
                        {gl.name} - {gl.level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre de la Materia</label>
                  <Input
                    placeholder="Ej: Matemáticas"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Código (opcional)</label>
                  <Input
                    placeholder="Ej: MAT-001"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción (opcional)</label>
                  <textarea
                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="Descripción de la materia..."
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={resetModal} disabled={creating}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSubject} disabled={!newSubject.name || !newSubject.gradeLevelId || creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {creating ? 'Creando...' : 'Crear Materia'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
