'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Phone,
  Loader2,
  Calendar,
  GraduationCap,
  Lock,
  X as XIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { teachersService, subjectsService, gradeSectionsService, Teacher, Subject, GradeSection } from '@/services/mock-data'

// Interfaz para asignaciones del profesor
interface TeacherAssignment {
  id: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  gradeSectionId: string
  gradeSection: string
  subjectId: string
  subjectName: string
}

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null

export default function ProfesoresPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  // Filtros
  const [filterLevel, setFilterLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [filterGradeSection, setFilterGradeSection] = useState('all')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    hireDate: ''
  })
  // Para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)
  // Estado para las asignaciones (nivel, grado/sección, materia)
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  // Estado temporal para agregar nueva asignación
  const [newAssignment, setNewAssignment] = useState({
    level: '' as '' | 'Inicial' | 'Primaria' | 'Secundaria',
    gradeSectionId: ''
  })
  // Materias seleccionadas (múltiples)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [teachersData, subjectsData, gradeSectionsData] = await Promise.all([
        teachersService.getAll(),
        subjectsService.getAll(),
        gradeSectionsService.getAll()
      ])
      setTeachers(teachersData)
      setSubjects(subjectsData)
      setGradeSections(gradeSectionsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener grado/secciones filtrados por nivel para los filtros
  const availableGradeSections = useMemo(() => {
    return gradeSections
      .filter(gs => filterLevel === 'all' || gs.level === filterLevel)
      .sort((a, b) => {
        const gradeCompare = a.grade.localeCompare(b.grade)
        if (gradeCompare !== 0) return gradeCompare
        return a.section.localeCompare(b.section)
      })
  }, [gradeSections, filterLevel])

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // Filtro de búsqueda
      const matchesSearch =
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.code.toLowerCase().includes(searchTerm.toLowerCase())

      // Si no hay filtros de nivel/grado, solo aplicar búsqueda
      if (filterLevel === 'all' && filterGradeSection === 'all') {
        return matchesSearch
      }

      // Obtener las materias del profesor y verificar si alguna coincide con los filtros
      const teacherSubjectNames = teacher.subjects

      // Buscar materias que coincidan con los filtros
      const matchingSubjects = subjects.filter(subject => {
        const matchesSubjectName = teacherSubjectNames.includes(subject.name)
        const matchesSubjectLevel = filterLevel === 'all' || subject.level === filterLevel
        const matchesSubjectGradeSection = filterGradeSection === 'all' || subject.gradeSection === filterGradeSection
        return matchesSubjectName && matchesSubjectLevel && matchesSubjectGradeSection
      })

      const matchesFilters = matchingSubjects.length > 0

      return matchesSearch && matchesFilters
    })
  }, [teachers, subjects, searchTerm, filterLevel, filterGradeSection])

  // Handler para cambiar filtro de nivel (resetea grado/sección)
  const handleFilterLevelChange = (level: 'all' | 'Inicial' | 'Primaria' | 'Secundaria') => {
    setFilterLevel(level)
    setFilterGradeSection('all')
  }

  // Filtrar grado/secciones por nivel seleccionado
  const filteredGradeSectionsForAssignment = useMemo(() => {
    if (!newAssignment.level) return []
    return gradeSections.filter(gs => gs.level === newAssignment.level)
  }, [gradeSections, newAssignment.level])

  // Filtrar materias por grado/sección seleccionado
  const filteredSubjectsForAssignment = useMemo(() => {
    if (!newAssignment.gradeSectionId) return []
    return subjects.filter(s => s.gradeSectionId === newAssignment.gradeSectionId)
  }, [subjects, newAssignment.gradeSectionId])

  const stats = useMemo(() => {
    const totalSubjectsAssigned = teachers.reduce((acc, t) => acc + t.subjects.length, 0)

    return [
      { label: 'Total Profesores', value: teachers.length, icon: UserCheck, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Materias Asignadas', value: totalSubjectsAssigned, icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Grados/Secciones', value: gradeSections.length, icon: GraduationCap, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ]
  }, [teachers, gradeSections])

  const openModal = (mode: ModalMode, teacher?: Teacher) => {
    setModalMode(mode)
    setSelectedTeacher(teacher || null)

    if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        hireDate: new Date().toISOString().split('T')[0]
      })
      setAssignments([])
      setNewAssignment({ level: '', gradeSectionId: '' })
      setSelectedSubjectIds([])
      setShowPassword(false)
    } else if (mode === 'edit' && teacher) {
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        password: (teacher as any).password || '',
        hireDate: teacher.hireDate
      })
      // Convertir subjects a assignments (por ahora dejamos vacío, se puede mejorar)
      setAssignments([])
      setNewAssignment({ level: '', gradeSectionId: '' })
      setSelectedSubjectIds([])
      setShowPassword(false)
    }
  }

  // Agregar asignaciones (múltiples materias)
  const addAssignment = () => {
    if (!newAssignment.level || !newAssignment.gradeSectionId || selectedSubjectIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona nivel, grado/sección y al menos una materia',
        type: 'error'
      })
      return
    }

    const gs = gradeSections.find(g => g.id === newAssignment.gradeSectionId)
    if (!gs) return

    const newAssignments: TeacherAssignment[] = []
    let duplicatesCount = 0

    selectedSubjectIds.forEach(subjectId => {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) return

      // Verificar si ya existe la asignación
      const exists = assignments.some(a =>
        a.gradeSectionId === newAssignment.gradeSectionId &&
        a.subjectId === subjectId
      )

      if (exists) {
        duplicatesCount++
        return
      }

      newAssignments.push({
        id: `assign-${Date.now()}-${subjectId}`,
        level: newAssignment.level as 'Inicial' | 'Primaria' | 'Secundaria',
        gradeSectionId: newAssignment.gradeSectionId,
        gradeSection: `${gs.grade} ${gs.section}`,
        subjectId: subjectId,
        subjectName: subject.name
      })
    })

    if (duplicatesCount > 0 && newAssignments.length === 0) {
      toast({
        title: 'Error',
        description: 'Todas las materias seleccionadas ya están asignadas',
        type: 'error'
      })
      return
    }

    if (newAssignments.length > 0) {
      setAssignments([...assignments, ...newAssignments])
      toast({
        title: 'Asignaciones agregadas',
        description: `Se agregaron ${newAssignments.length} materia(s)`,
        type: 'success'
      })
    }

    // Resetear selección
    setNewAssignment({ level: '', gradeSectionId: '' })
    setSelectedSubjectIds([])
  }

  // Toggle selección de materia
  const toggleSubjectSelection = (subjectId: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  // Eliminar una asignación
  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id))
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTeacher(null)
    setAssignments([])
    setNewAssignment({ level: '', gradeSectionId: '' })
    setSelectedSubjectIds([])
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.password) {
      toast({
        title: 'Error',
        description: 'La contraseña es requerida',
        type: 'error'
      })
      return
    }

    setSubmitting(true)

    try {
      // Convertir assignments a array de subjects
      const subjectsArray = assignments.map(a => a.subjectName)

      const teacherData = {
        ...formData,
        subjects: subjectsArray,
        specialization: subjectsArray.length > 0 ? subjectsArray[0] : 'General',
        status: 'active' as const
      }

      if (modalMode === 'create') {
        await teachersService.create(teacherData)
        toast({
          title: 'Profesor creado',
          description: 'El profesor ha sido registrado exitosamente'
        })
      } else if (modalMode === 'edit' && selectedTeacher) {
        await teachersService.update(selectedTeacher.id, teacherData)
        toast({
          title: 'Profesor actualizado',
          description: 'Los datos del profesor han sido actualizados'
        })
      }

      await loadData()
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el profesor',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTeacher) return

    setSubmitting(true)
    try {
      await teachersService.delete(selectedTeacher.id)
      toast({
        title: 'Profesor eliminado',
        description: 'El profesor ha sido eliminado exitosamente'
      })
      await loadData()
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el profesor',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Profesores</h1>
          <p className="text-muted-foreground mt-1">Administra el personal docente</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Profesor
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar profesores por nombre, email o código..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Filtrar por:</span>

              {/* Nivel */}
              <Select
                value={filterLevel}
                onValueChange={(v) => handleFilterLevelChange(v as 'all' | 'Inicial' | 'Primaria' | 'Secundaria')}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="Inicial">Inicial</SelectItem>
                  <SelectItem value="Primaria">Primaria</SelectItem>
                  <SelectItem value="Secundaria">Secundaria</SelectItem>
                </SelectContent>
              </Select>

              {/* Grado/Sección */}
              <Select
                value={filterGradeSection}
                onValueChange={setFilterGradeSection}
                disabled={loading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Grado/Sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados/secciones</SelectItem>
                  {availableGradeSections.map((gs) => (
                    <SelectItem key={gs.id} value={`${gs.grade} ${gs.section}`}>
                      {gs.grade} {gs.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botón limpiar filtros */}
              {(filterLevel !== 'all' || filterGradeSection !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterLevel('all')
                    setFilterGradeSection('all')
                  }}
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profesores ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron profesores
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="font-mono">{teacher.code}</span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {teacher.phone}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs">
                          {teacher.subjects.length} {teacher.subjects.length === 1 ? 'materia' : 'materias'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal('view', teacher)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openModal('edit', teacher)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => openModal('delete', teacher)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Ver */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Profesor</DialogTitle>
            <DialogDescription>Información completa del profesor</DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedTeacher.firstName} {selectedTeacher.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedTeacher.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedTeacher.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedTeacher.phone}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Fecha de Contratación</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(selectedTeacher.hireDate).toLocaleDateString('es-PE')}</p>
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <Label className="text-muted-foreground">Materias Asignadas</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.subjects.length > 0 ? (
                      selectedTeacher.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin materias asignadas</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cerrar
                </Button>
                <Button onClick={() => openModal('edit', selectedTeacher)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Crear/Editar */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Nuevo Profesor' : 'Editar Profesor'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Ingresa los datos del nuevo profesor'
                : 'Actualiza los datos del profesor'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombres *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder="Ej: Carlos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder="Ej: López García"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="ejemplo@escuela.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="999-999-999"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contraseña del profesor"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  El profesor usará esta contraseña para iniciar sesión
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Fecha de Contratación *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Sección de asignación de materias (opcional) */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-medium">Asignación de Materias (Opcional)</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona nivel, grado/sección y las materias a asignar
                </p>
              </div>

              {/* Paso 1: Seleccionar Nivel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">1. Nivel</Label>
                  <Select
                    value={newAssignment.level}
                    onValueChange={(v) => {
                      setNewAssignment({ level: v as 'Inicial' | 'Primaria' | 'Secundaria', gradeSectionId: '' })
                      setSelectedSubjectIds([])
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inicial">Inicial</SelectItem>
                      <SelectItem value="Primaria">Primaria</SelectItem>
                      <SelectItem value="Secundaria">Secundaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Paso 2: Seleccionar Grado/Sección */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">2. Grado/Sección</Label>
                  <Select
                    value={newAssignment.gradeSectionId}
                    onValueChange={(v) => {
                      setNewAssignment({ ...newAssignment, gradeSectionId: v })
                      setSelectedSubjectIds([])
                    }}
                    disabled={!newAssignment.level}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={newAssignment.level ? "Seleccionar grado/sección" : "Primero selecciona nivel"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGradeSectionsForAssignment.map(gs => (
                        <SelectItem key={gs.id} value={gs.id}>
                          {gs.grade} {gs.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Paso 3: Seleccionar Materias (checkboxes) */}
              {newAssignment.gradeSectionId && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">3. Seleccionar Materias</Label>
                  {filteredSubjectsForAssignment.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No hay materias disponibles para este grado/sección
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30 max-h-40 overflow-y-auto">
                      {filteredSubjectsForAssignment.map(subject => {
                        // Verificar si ya está asignada
                        const isAlreadyAssigned = assignments.some(
                          a => a.gradeSectionId === newAssignment.gradeSectionId && a.subjectId === subject.id
                        )
                        return (
                          <label
                            key={subject.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                              isAlreadyAssigned ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Checkbox
                              checked={selectedSubjectIds.includes(subject.id)}
                              onCheckedChange={() => !isAlreadyAssigned && toggleSubjectSelection(subject.id)}
                              disabled={isAlreadyAssigned}
                            />
                            <span className="text-sm">
                              {subject.name}
                              {isAlreadyAssigned && <span className="text-xs text-muted-foreground ml-1">(asignada)</span>}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {selectedSubjectIds.length > 0 && (
                    <p className="text-sm text-primary">
                      {selectedSubjectIds.length} materia(s) seleccionada(s)
                    </p>
                  )}
                </div>
              )}

              {/* Botón Guardar Asignación */}
              <Button
                type="button"
                variant="outline"
                onClick={addAssignment}
                disabled={!newAssignment.gradeSectionId || selectedSubjectIds.length === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Guardar Asignación ({selectedSubjectIds.length} materia{selectedSubjectIds.length !== 1 ? 's' : ''})
              </Button>

              {/* Lista de asignaciones agregadas */}
              {assignments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Asignaciones agregadas ({assignments.length}):</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-green-500/5 max-h-32 overflow-y-auto">
                    {assignments.map(assignment => (
                      <Badge
                        key={assignment.id}
                        variant="secondary"
                        className="flex items-center gap-1 py-1"
                      >
                        <span className="text-xs">{assignment.level} - {assignment.gradeSection} - {assignment.subjectName}</span>
                        <button
                          type="button"
                          onClick={() => removeAssignment(assignment.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    {modalMode === 'create' ? 'Crear Profesor' : 'Actualizar Profesor'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Eliminar */}
      <Dialog open={modalMode === 'delete'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Profesor</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El profesor será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm">
                  ¿Estás seguro de que deseas eliminar a{' '}
                  <span className="font-bold">
                    {selectedTeacher.firstName} {selectedTeacher.lastName}
                  </span>
                  ?
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Código: {selectedTeacher.code}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal} disabled={submitting}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                  {submitting ? (
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
