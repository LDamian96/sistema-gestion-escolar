'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  GraduationCap,
  Check,
  Clock,
  LockKeyhole
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  subjectsService,
  gradeSectionsService,
  coursesService,
  Subject,
  GradeSection,
  Course
} from '@/services/mock-data'

// Simulamos el ID del profesor actual
const CURRENT_TEACHER_ID = 't1'

// Colores predefinidos para las materias
const PREDEFINED_COLORS = [
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Verde', value: 'bg-green-500' },
  { name: 'Purpura', value: 'bg-purple-500' },
  { name: 'Naranja', value: 'bg-orange-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
  { name: 'Rojo', value: 'bg-red-500' },
  { name: 'Amarillo', value: 'bg-yellow-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Gris', value: 'bg-gray-500' },
  { name: 'Esmeralda', value: 'bg-emerald-500' },
  { name: 'Violeta', value: 'bg-violet-500' },
]

// Sistema de notificaciones Toast
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {toast.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Tipos de modal
type ModalMode = 'view' | 'create' | 'edit' | 'delete' | null

// Asignacion de nivel con sus grados-seccion
interface LevelAssignment {
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  gradeSectionIds: string[]
}

interface FormData {
  name: string
  code: string
  description: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  gradeSectionId: string
  gradeSection: string
  selectedGradeSections: string[]
  levelAssignments: LevelAssignment[]
}

const emptyFormData: FormData = {
  name: '',
  code: '',
  description: '',
  level: 'Primaria',
  gradeSectionId: '',
  gradeSection: '',
  selectedGradeSections: [],
  levelAssignments: []
}

// Funcion para obtener color aleatorio
const getRandomColor = () => {
  const colors = PREDEFINED_COLORS.map(c => c.value)
  return colors[Math.floor(Math.random() * colors.length)]
}

export default function TeacherMateriasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [allGradeSections, setAllGradeSections] = useState<GradeSection[]>([])
  const [teacherGradeSections, setTeacherGradeSections] = useState<GradeSection[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('all')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Toast functions
  const showToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [subjectsData, gradeSectionsData, coursesData] = await Promise.all([
        subjectsService.getAll(),
        gradeSectionsService.getAll(),
        coursesService.getAll()
      ])

      // Filtrar cursos del profesor
      const teacherCourses = coursesData.filter(c => c.teacherId === CURRENT_TEACHER_ID && c.status === 'active')
      setCourses(teacherCourses)

      // Obtener los grado-secciones donde el profesor tiene cursos
      const teacherGradeSectionNames = [...new Set(teacherCourses.map(c => c.gradeSection))]
      const teacherGS = gradeSectionsData.filter(gs =>
        teacherGradeSectionNames.includes(`${gs.grade} ${gs.section}`)
      )
      setTeacherGradeSections(teacherGS)
      setAllGradeSections(gradeSectionsData)

      // Filtrar materias que pertenecen a los grado-secciones del profesor
      const teacherSubjects = subjectsData.filter(s =>
        teacherGradeSectionNames.includes(s.gradeSection)
      )
      setSubjects(teacherSubjects)
    } catch (error) {
      showToast('error', 'Error al cargar los datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Niveles disponibles basados en los grado-secciones del profesor
  const availableLevels = useMemo(() => {
    const levels = [...new Set(teacherGradeSections.map(gs => gs.level))]
    return levels as ('Inicial' | 'Primaria' | 'Secundaria')[]
  }, [teacherGradeSections])

  // Filtrar grado/secciones por nivel seleccionado en el filtro
  const filteredGradeSectionsForFilter = useMemo(() => {
    if (selectedLevel === 'all') return teacherGradeSections
    return teacherGradeSections.filter(gs => gs.level === selectedLevel)
  }, [teacherGradeSections, selectedLevel])

  // Filtrar grado/secciones por nivel seleccionado en el formulario (solo los del profesor)
  const filteredGradeSectionsForForm = useMemo(() => {
    return teacherGradeSections.filter(gs => gs.level === formData.level)
  }, [teacherGradeSections, formData.level])

  // Filtrar materias
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = selectedLevel === 'all' || subject.level === selectedLevel
      const matchesGradeSection = selectedGradeSection === 'all' || subject.gradeSection === selectedGradeSection
      return matchesSearch && matchesLevel && matchesGradeSection
    })
  }, [subjects, searchTerm, selectedLevel, selectedGradeSection])

  // Calcular estadisticas
  const stats = useMemo(() => {
    const initialCount = subjects.filter(s => s.level === 'Inicial').length
    const primaryCount = subjects.filter(s => s.level === 'Primaria').length
    const secondaryCount = subjects.filter(s => s.level === 'Secundaria').length

    return [
      { label: 'Mis Materias', value: subjects.length, icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Inicial', value: initialCount, icon: GraduationCap, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      { label: 'Primaria', value: primaryCount, icon: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Secundaria', value: secondaryCount, icon: GraduationCap, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ]
  }, [subjects])

  // Manejadores de modal
  const openModal = (mode: ModalMode, subject?: Subject) => {
    setModalMode(mode)
    if (subject) {
      setSelectedSubject(subject)
      if (mode === 'edit') {
        setFormData({
          name: subject.name,
          code: subject.code,
          description: subject.description,
          level: subject.level,
          gradeSectionId: subject.gradeSectionId,
          gradeSection: subject.gradeSection,
          selectedGradeSections: [],
          levelAssignments: []
        })
      }
    } else {
      setSelectedSubject(null)
      // Establecer el primer nivel disponible
      const defaultLevel = availableLevels[0] || 'Primaria'
      setFormData({ ...emptyFormData, level: defaultLevel })
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedSubject(null)
    setFormData(emptyFormData)
  }

  // Actualizar formData cuando cambia el grado/seccion
  const handleGradeSectionChange = (gradeSectionId: string) => {
    const gs = allGradeSections.find(g => g.id === gradeSectionId)
    if (gs) {
      setFormData({
        ...formData,
        gradeSectionId,
        gradeSection: `${gs.grade} ${gs.section}`
      })
    }
  }

  // Actualizar formData cuando cambia el nivel
  const handleLevelChange = (level: 'Inicial' | 'Primaria' | 'Secundaria') => {
    setFormData({
      ...formData,
      level,
      gradeSectionId: '',
      gradeSection: '',
      selectedGradeSections: []
    })
  }

  // Toggle seleccion de grado-seccion
  const toggleGradeSectionSelection = (gsId: string) => {
    setFormData(prev => {
      const selected = prev.selectedGradeSections
      if (selected.includes(gsId)) {
        return { ...prev, selectedGradeSections: selected.filter(id => id !== gsId) }
      } else {
        return { ...prev, selectedGradeSections: [...selected, gsId] }
      }
    })
  }

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    const availableIds = filteredGradeSectionsForForm.map(gs => gs.id)
    const allSelected = availableIds.every(id => formData.selectedGradeSections.includes(id))

    if (allSelected) {
      setFormData(prev => ({ ...prev, selectedGradeSections: [] }))
    } else {
      setFormData(prev => ({ ...prev, selectedGradeSections: availableIds }))
    }
  }

  // Agregar nivel con sus grados-seccion a la lista
  const addLevelAssignment = () => {
    if (formData.selectedGradeSections.length === 0) {
      showToast('error', 'Selecciona al menos un grado-seccion antes de agregar')
      return
    }

    const existingIndex = formData.levelAssignments.findIndex(la => la.level === formData.level)

    if (existingIndex >= 0) {
      const existingIds = formData.levelAssignments[existingIndex].gradeSectionIds
      const newIds = formData.selectedGradeSections.filter(id => !existingIds.includes(id))

      if (newIds.length === 0) {
        showToast('info', 'Los grados-seccion seleccionados ya estan agregados')
        return
      }

      setFormData(prev => ({
        ...prev,
        levelAssignments: prev.levelAssignments.map((la, idx) =>
          idx === existingIndex
            ? { ...la, gradeSectionIds: [...la.gradeSectionIds, ...newIds] }
            : la
        ),
        selectedGradeSections: []
      }))
      showToast('success', `Se agregaron ${newIds.length} grado-seccion(es) a ${formData.level}`)
    } else {
      setFormData(prev => ({
        ...prev,
        levelAssignments: [
          ...prev.levelAssignments,
          { level: prev.level, gradeSectionIds: prev.selectedGradeSections }
        ],
        selectedGradeSections: []
      }))
      showToast('success', `Nivel ${formData.level} agregado con ${formData.selectedGradeSections.length} grado-seccion(es)`)
    }
  }

  // Eliminar un nivel completo de la lista
  const removeLevelAssignment = (level: string) => {
    setFormData(prev => ({
      ...prev,
      levelAssignments: prev.levelAssignments.filter(la => la.level !== level)
    }))
  }

  // Eliminar un grado-seccion especifico de un nivel
  const removeGradeSectionFromLevel = (level: string, gsId: string) => {
    setFormData(prev => ({
      ...prev,
      levelAssignments: prev.levelAssignments
        .map(la => la.level === level
          ? { ...la, gradeSectionIds: la.gradeSectionIds.filter(id => id !== gsId) }
          : la
        )
        .filter(la => la.gradeSectionIds.length > 0)
    }))
  }

  // Obtener el total de grados-seccion seleccionados
  const getTotalSelectedCount = () => {
    return formData.levelAssignments.reduce((acc, la) => acc + la.gradeSectionIds.length, 0)
  }

  // Verificar si un grado-seccion ya esta en la lista de asignaciones
  const isGradeSectionInAssignments = (gsId: string) => {
    return formData.levelAssignments.some(la => la.gradeSectionIds.includes(gsId))
  }

  // CRUD Operations
  const handleCreate = async () => {
    const allAssignments: LevelAssignment[] = [...formData.levelAssignments]

    if (formData.selectedGradeSections.length > 0) {
      const existingIndex = allAssignments.findIndex(la => la.level === formData.level)
      if (existingIndex >= 0) {
        const newIds = formData.selectedGradeSections.filter(
          id => !allAssignments[existingIndex].gradeSectionIds.includes(id)
        )
        if (newIds.length > 0) {
          allAssignments[existingIndex] = {
            ...allAssignments[existingIndex],
            gradeSectionIds: [...allAssignments[existingIndex].gradeSectionIds, ...newIds]
          }
        }
      } else {
        allAssignments.push({
          level: formData.level,
          gradeSectionIds: formData.selectedGradeSections
        })
      }
    }

    if (allAssignments.length === 0) {
      showToast('error', 'Debes agregar al menos un nivel con grados-seccion')
      return
    }

    try {
      setIsSubmitting(true)
      const createdSubjects: Subject[] = []

      for (const assignment of allAssignments) {
        for (const gsId of assignment.gradeSectionIds) {
          const gs = allGradeSections.find(g => g.id === gsId)
          if (gs) {
            const dataWithColor = {
              name: formData.name,
              code: formData.code,
              description: formData.description,
              level: assignment.level,
              gradeSectionId: gsId,
              gradeSection: `${gs.grade} ${gs.section}`,
              color: getRandomColor()
            }
            const newSubject = await subjectsService.create(dataWithColor)
            createdSubjects.push(newSubject)
          }
        }
      }

      setSubjects(prev => [...prev, ...createdSubjects])

      const levelsCount = allAssignments.length
      if (createdSubjects.length === 1) {
        showToast('success', `Materia "${formData.name}" creada exitosamente`)
      } else {
        showToast('success', `Materia "${formData.name}" creada para ${createdSubjects.length} grado-secciones en ${levelsCount} nivel(es)`)
      }

      closeModal()
    } catch (error) {
      showToast('error', 'Error al crear la materia')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedSubject) return

    if (!formData.gradeSectionId) {
      showToast('error', 'Debes seleccionar un grado/seccion')
      return
    }

    try {
      setIsSubmitting(true)
      const dataWithColor = {
        ...formData,
        color: selectedSubject.color
      }
      const updatedSubject = await subjectsService.update(selectedSubject.id, dataWithColor)
      setSubjects(prev => prev.map(s => s.id === selectedSubject.id ? updatedSubject : s))
      showToast('success', `Materia "${updatedSubject.name}" actualizada exitosamente`)
      closeModal()
    } catch (error) {
      showToast('error', 'Error al actualizar la materia')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSubject) return

    try {
      setIsSubmitting(true)
      await subjectsService.delete(selectedSubject.id)
      setSubjects(prev => prev.filter(s => s.id !== selectedSubject.id))
      showToast('success', `Materia "${selectedSubject.name}" eliminada exitosamente`)
      closeModal()
    } catch (error) {
      showToast('error', 'Error al eliminar la materia')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      handleCreate()
    } else if (modalMode === 'edit') {
      handleUpdate()
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Materias</h1>
          <p className="text-muted-foreground mt-1">
            <span className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4" />
              Solo puedes gestionar materias en tus grados-secciones asignados
            </span>
          </p>
        </div>
        <Button onClick={() => openModal('create')} disabled={teacherGradeSections.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      {/* Info sobre grados asignados */}
      {teacherGradeSections.length > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">
              Grados-Secciones asignados:
            </p>
            <div className="flex flex-wrap gap-2">
              {teacherGradeSections.map(gs => (
                <Badge key={gs.id} variant="outline" className="bg-background">
                  {gs.grade} {gs.section} - {gs.level}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {teacherGradeSections.length === 0 && (
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6 pb-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Sin grados asignados</h3>
            <p className="text-muted-foreground">
              No tienes cursos asignados. Contacta al administrador para que te asigne cursos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materias..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLevel} onValueChange={(v) => {
                setSelectedLevel(v as 'all' | 'Inicial' | 'Primaria' | 'Secundaria')
                setSelectedGradeSection('all')
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedGradeSection} onValueChange={setSelectedGradeSection}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Grado/Seccion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filteredGradeSectionsForFilter.map(gs => (
                    <SelectItem key={gs.id} value={`${gs.grade} ${gs.section}`}>
                      {gs.grade} {gs.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={subject.level === 'Primaria' ? 'default' : 'secondary'}>
                        {subject.level}
                      </Badge>
                      <Badge variant="outline">
                        {subject.gradeSection}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Codigo: {subject.code}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subject.description}</p>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openModal('view', subject)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openModal('edit', subject)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => openModal('delete', subject)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSubjects.length === 0 && teacherGradeSections.length > 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron materias</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Intenta con otros terminos de busqueda' : 'Comienza creando una nueva materia'}
          </p>
        </div>
      )}

      {/* Modal Ver Detalles */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Materia</DialogTitle>
          </DialogHeader>
          {selectedSubject && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${selectedSubject.color} flex items-center justify-center`}>
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSubject.name}</h3>
                  <p className="text-sm text-muted-foreground">Codigo: {selectedSubject.code}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Descripcion</Label>
                  <p className="mt-1">{selectedSubject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nivel</Label>
                    <p className="mt-1">
                      <Badge variant={selectedSubject.level === 'Primaria' ? 'default' : 'secondary'}>
                        {selectedSubject.level}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Grado/Seccion</Label>
                    <p className="mt-1">
                      <Badge variant="outline">{selectedSubject.gradeSection}</Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    closeModal()
                    openModal('edit', selectedSubject)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={closeModal} className="flex-1">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'Nueva Materia' : 'Editar Materia'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Ingresa los datos y selecciona los grado-secciones para crear la materia'
                : 'Modifica los datos de la materia'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Matematicas"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Codigo *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ej: MAT-5A"
                  required
                  maxLength={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripcion *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el contenido de la materia"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="level">Nivel *</Label>
              <Select
                value={formData.level}
                onValueChange={(v) => handleLevelChange(v as 'Inicial' | 'Primaria' | 'Secundaria')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modo Crear: Lista de checkboxes para seleccion multiple con soporte de varios niveles */}
            {modalMode === 'create' && (
              <div className="space-y-4">
                {/* Lista de niveles ya agregados */}
                {formData.levelAssignments.length > 0 && (
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Niveles agregados ({getTotalSelectedCount()} grado-secciones)</Label>
                    </div>
                    <div className="space-y-2">
                      {formData.levelAssignments.map(la => (
                        <div key={la.level} className="bg-background rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={la.level === 'Primaria' ? 'default' : 'secondary'}>
                              {la.level}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-destructive hover:text-destructive"
                              onClick={() => removeLevelAssignment(la.level)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {la.gradeSectionIds.map(gsId => {
                              const gs = allGradeSections.find(g => g.id === gsId)
                              return gs ? (
                                <Badge
                                  key={gsId}
                                  variant="outline"
                                  className="text-xs cursor-pointer hover:bg-destructive/10"
                                  onClick={() => removeGradeSectionFromLevel(la.level, gsId)}
                                >
                                  {gs.grade} {gs.section}
                                  <X className="h-3 w-3 ml-1" />
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selector de grado-secciones para el nivel actual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Grado-Secciones de {formData.level}</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-xs h-7"
                      >
                        {filteredGradeSectionsForForm.length > 0 &&
                        filteredGradeSectionsForForm.every(gs => formData.selectedGradeSections.includes(gs.id) || isGradeSectionInAssignments(gs.id))
                          ? 'Deseleccionar'
                          : 'Seleccionar todos'}
                      </Button>
                    </div>
                  </div>

                  {filteredGradeSectionsForForm.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground border rounded-lg bg-muted/50">
                      No tienes grado-secciones asignados en el nivel {formData.level}
                    </div>
                  ) : (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {filteredGradeSectionsForForm.map(gs => {
                        const isSelected = formData.selectedGradeSections.includes(gs.id)
                        const isAlreadyAdded = isGradeSectionInAssignments(gs.id)
                        return (
                          <div
                            key={gs.id}
                            className={`flex items-center gap-3 p-3 border-b last:border-b-0 transition-colors ${
                              isAlreadyAdded
                                ? 'bg-green-500/10 cursor-default'
                                : isSelected
                                  ? 'bg-primary/5 cursor-pointer hover:bg-muted/50'
                                  : 'cursor-pointer hover:bg-muted/50'
                            }`}
                            onClick={() => !isAlreadyAdded && toggleGradeSectionSelection(gs.id)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isAlreadyAdded
                                ? 'bg-green-500 border-green-500'
                                : isSelected
                                  ? 'bg-primary border-primary'
                                  : 'border-muted-foreground/30'
                            }`}>
                              {(isSelected || isAlreadyAdded) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {gs.grade} {gs.section}
                                {isAlreadyAdded && (
                                  <span className="text-xs text-green-600 font-normal">(Agregado)</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{gs.turno} ({gs.turnoStartTime} - {gs.turnoEndTime})</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {gs.currentStudents}/{gs.capacity}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Boton para agregar nivel */}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">
                      {formData.selectedGradeSections.length > 0
                        ? `${formData.selectedGradeSections.length} seleccionado(s) en ${formData.level}`
                        : 'Selecciona grado-secciones para agregar'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLevelAssignment}
                      disabled={formData.selectedGradeSections.length === 0}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar {formData.level}
                    </Button>
                  </div>
                </div>

                {/* Resumen total */}
                {(getTotalSelectedCount() > 0 || formData.selectedGradeSections.length > 0) && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Total:</strong> Se creara la materia para{' '}
                      <strong>{getTotalSelectedCount() + formData.selectedGradeSections.filter(id => !isGradeSectionInAssignments(id)).length}</strong>{' '}
                      grado-seccion(es) en{' '}
                      <strong>{
                        formData.levelAssignments.length +
                        (formData.selectedGradeSections.some(id => !isGradeSectionInAssignments(id)) &&
                         !formData.levelAssignments.some(la => la.level === formData.level) ? 1 : 0)
                      }</strong>{' '}
                      nivel(es)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Modo Editar: Selector unico */}
            {modalMode === 'edit' && (
              <div>
                <Label htmlFor="gradeSection">Grado/Seccion *</Label>
                <Select
                  value={formData.gradeSectionId}
                  onValueChange={handleGradeSectionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGradeSectionsForForm.map(gs => (
                      <SelectItem key={gs.id} value={gs.id}>
                        {gs.grade} {gs.section} - {gs.turno}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || (modalMode === 'create' && getTotalSelectedCount() === 0 && formData.selectedGradeSections.length === 0)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  modalMode === 'create'
                    ? (() => {
                        const totalCount = getTotalSelectedCount() + formData.selectedGradeSections.filter(id => !isGradeSectionInAssignments(id)).length
                        return `Crear Materia${totalCount > 1 ? ` (${totalCount})` : totalCount === 0 ? '' : ''}`
                      })()
                    : 'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={modalMode === 'delete'} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Materia</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${selectedSubject.color} flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedSubject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubject.level} - {selectedSubject.gradeSection}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
