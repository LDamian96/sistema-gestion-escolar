'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  X,
  Users,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { studentsService, gradeSectionsService, parentsService, Student, GradeSection, Parent, Status } from '@/services/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toast'

type ModalMode = 'view' | 'create' | 'edit' | 'delete' | null

export default function EstudiantesPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  // Filtros
  const [filterLevel, setFilterLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [filterGradeSection, setFilterGradeSection] = useState('all')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast, toasts, dismiss } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    level: '' as '' | 'Inicial' | 'Primaria' | 'Secundaria',
    gradeSectionId: '',
    gradeSection: '',
    birthDate: '',
    address: '',
    parentId: '',
    parentName: '',
    status: 'active' as Status,
  })

  // Para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)

  // Para el autocompletado de tutor
  const [tutorSearch, setTutorSearch] = useState('')
  const [showTutorSuggestions, setShowTutorSuggestions] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsData, gradeSectionsData, parentsData] = await Promise.all([
        studentsService.getAll(),
        gradeSectionsService.getAll(),
        parentsService.getAll()
      ])
      setStudents(studentsData)
      setGradeSections(gradeSectionsData)
      setParents(parentsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar grado/secciones por nivel seleccionado
  const filteredGradeSections = useMemo(() => {
    if (!formData.level) return []
    return gradeSections.filter(gs => gs.level === formData.level)
  }, [gradeSections, formData.level])

  // Filtrar tutores por búsqueda
  const filteredParents = useMemo(() => {
    if (!tutorSearch.trim()) return []
    const search = tutorSearch.toLowerCase()
    return parents.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search)
    ).slice(0, 5) // Limitar a 5 sugerencias
  }, [parents, tutorSearch])

  // Obtener grado/secciones filtrados por nivel
  const availableGradeSections = useMemo(() => {
    return gradeSections
      .filter(gs => filterLevel === 'all' || gs.level === filterLevel)
      .sort((a, b) => {
        // Ordenar por grado y sección
        const gradeCompare = a.grade.localeCompare(b.grade)
        if (gradeCompare !== 0) return gradeCompare
        return a.section.localeCompare(b.section)
      })
  }, [gradeSections, filterLevel])

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())

      // Encontrar el gradeSection del estudiante
      const studentGS = gradeSections.find(gs => `${gs.grade} ${gs.section}` === student.gradeSection)

      const matchesLevel = filterLevel === 'all' || studentGS?.level === filterLevel
      const matchesGradeSection = filterGradeSection === 'all' || student.gradeSection === filterGradeSection

      return matchesSearch && matchesLevel && matchesGradeSection
    })
  }, [students, gradeSections, searchTerm, filterLevel, filterGradeSection])

  // Calculate stats
  const stats = useMemo(() => {
    const total = students.length
    const active = students.filter(s => s.status === 'active').length
    const inactive = students.filter(s => s.status === 'inactive').length

    // Count by grade
    const gradeCount: Record<string, number> = {}
    students.forEach(s => {
      const grade = s.gradeSection.split(' ')[0]
      gradeCount[grade] = (gradeCount[grade] || 0) + 1
    })

    return [
      {
        label: 'Total Estudiantes',
        value: total,
        icon: GraduationCap,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
      },
      {
        label: 'Activos',
        value: active,
        icon: UserCheck,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
      },
      {
        label: 'Inactivos',
        value: inactive,
        icon: UserX,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10'
      },
      {
        label: 'Por Grado',
        value: Object.keys(gradeCount).length,
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
      },
    ]
  }, [students])

  // Handler para cambiar filtro de nivel (resetea grado/sección)
  const handleFilterLevelChange = (level: 'all' | 'Inicial' | 'Primaria' | 'Secundaria') => {
    setFilterLevel(level)
    setFilterGradeSection('all')
  }

  // Modal handlers
  const openModal = (mode: ModalMode, student?: Student) => {
    setModalMode(mode)
    setSelectedStudent(student || null)

    if (mode === 'edit' && student) {
      // Encontrar el gradeSection correspondiente para obtener el nivel
      const gs = gradeSections.find(g => `${g.grade} ${g.section}` === student.gradeSection)
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        password: (student as any).password || '',
        level: gs?.level || '',
        gradeSectionId: gs?.id || '',
        gradeSection: student.gradeSection,
        birthDate: student.birthDate,
        address: student.address,
        parentId: student.parentId || '',
        parentName: student.parentName || '',
        status: student.status,
      })
      setTutorSearch(student.parentName || '')
      setShowPassword(false)
    } else if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        level: '',
        gradeSectionId: '',
        gradeSection: '',
        birthDate: '',
        address: '',
        parentId: '',
        parentName: '',
        status: 'active',
      })
      setTutorSearch('')
      setShowPassword(false)
    }
    setShowTutorSuggestions(false)
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedStudent(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      level: '',
      gradeSectionId: '',
      gradeSection: '',
      birthDate: '',
      address: '',
      parentId: '',
      parentName: '',
      status: 'active',
    })
    setTutorSearch('')
    setShowTutorSuggestions(false)
    setShowPassword(false)
  }

  // Handlers para nivel y grado/sección
  const handleLevelChange = (level: 'Inicial' | 'Primaria' | 'Secundaria') => {
    setFormData({
      ...formData,
      level,
      gradeSectionId: '',
      gradeSection: ''
    })
  }

  const handleGradeSectionChange = (gradeSectionId: string) => {
    const gs = gradeSections.find(g => g.id === gradeSectionId)
    if (gs) {
      setFormData({
        ...formData,
        gradeSectionId,
        gradeSection: `${gs.grade} ${gs.section}`
      })
    }
  }

  // Handler para seleccionar tutor
  const handleSelectTutor = (parent: Parent) => {
    setFormData({
      ...formData,
      parentId: parent.id,
      parentName: `${parent.firstName} ${parent.lastName}`
    })
    setTutorSearch(`${parent.firstName} ${parent.lastName}`)
    setShowTutorSuggestions(false)
  }

  // Handler para limpiar tutor
  const handleClearTutor = () => {
    setFormData({
      ...formData,
      parentId: '',
      parentName: ''
    })
    setTutorSearch('')
  }

  // CRUD operations
  const handleCreate = async () => {
    if (!formData.gradeSectionId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar nivel y grado/sección',
        type: 'error',
      })
      return
    }

    if (!formData.password) {
      toast({
        title: 'Error',
        description: 'La contraseña es requerida',
        type: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      // Preparar datos para enviar (sin level y gradeSectionId extras)
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gradeSection: formData.gradeSection,
        birthDate: formData.birthDate,
        address: formData.address,
        parentId: formData.parentId || undefined,
        parentName: formData.parentName || undefined,
        status: formData.status,
      }
      await studentsService.create(studentData)
      await loadData()
      toast({
        title: 'Éxito',
        description: 'Estudiante creado correctamente',
        type: 'success',
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el estudiante',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedStudent) return

    if (!formData.gradeSectionId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar nivel y grado/sección',
        type: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gradeSection: formData.gradeSection,
        birthDate: formData.birthDate,
        address: formData.address,
        parentId: formData.parentId || undefined,
        parentName: formData.parentName || undefined,
        status: formData.status,
      }
      await studentsService.update(selectedStudent.id, studentData)
      await loadData()
      toast({
        title: 'Éxito',
        description: 'Estudiante actualizado correctamente',
        type: 'success',
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estudiante',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedStudent) return

    try {
      setIsSubmitting(true)
      await studentsService.delete(selectedStudent.id)
      await loadData()
      toast({
        title: 'Éxito',
        description: 'Estudiante eliminado correctamente',
        type: 'success',
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el estudiante',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = () => {
    if (modalMode === 'create') {
      handleCreate()
    } else if (modalMode === 'edit') {
      handleUpdate()
    } else if (modalMode === 'delete') {
      handleDelete()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Estudiantes</h1>
          <p className="text-muted-foreground mt-1">Administra los estudiantes matriculados</p>
        </div>
        <Button onClick={() => openModal('create')} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

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

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o email..."
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
                  <X className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron estudiantes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.firstName[0]}{student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{student.firstName} {student.lastName}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        student.status === 'active'
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-red-500/20 text-red-600'
                      }`}>
                        {student.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{student.code}</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                        {student.gradeSection}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal('view', student)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal('edit', student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => openModal('delete', student)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={modalMode !== null} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'view' && 'Detalles del Estudiante'}
              {modalMode === 'create' && 'Nuevo Estudiante'}
              {modalMode === 'edit' && 'Editar Estudiante'}
              {modalMode === 'delete' && 'Eliminar Estudiante'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'view' && 'Información completa del estudiante'}
              {modalMode === 'create' && 'Completa los datos del nuevo estudiante'}
              {modalMode === 'edit' && 'Modifica los datos del estudiante'}
              {modalMode === 'delete' && '¿Estás seguro de que deseas eliminar este estudiante?'}
            </DialogDescription>
          </DialogHeader>

          {modalMode === 'delete' ? (
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Esta acción no se puede deshacer. Se eliminará permanentemente el estudiante{' '}
                <span className="font-semibold text-foreground">
                  {selectedStudent?.firstName} {selectedStudent?.lastName}
                </span>
                .
              </p>
            </div>
          ) : modalMode === 'view' && selectedStudent ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedStudent.code}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    selectedStudent.status === 'active'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-red-500/20 text-red-600'
                  }`}>
                    {selectedStudent.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Grado y Sección</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.gradeSection}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Fecha de Nacimiento</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(selectedStudent.birthDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label className="text-muted-foreground">Dirección</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.address}</span>
                  </div>
                </div>

                {selectedStudent.parentName && (
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-muted-foreground">Padre/Tutor</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent.parentName}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Fecha de Matrícula</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(selectedStudent.enrollmentDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Nombre del estudiante"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Apellido del estudiante"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="999-999-999"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Contraseña del estudiante"
                      className="pl-10 pr-10"
                      disabled={isSubmitting}
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
                    El estudiante usará esta contraseña para iniciar sesión
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nivel *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(v) => handleLevelChange(v as 'Inicial' | 'Primaria' | 'Secundaria')}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inicial">Inicial</SelectItem>
                      <SelectItem value="Primaria">Primaria</SelectItem>
                      <SelectItem value="Secundaria">Secundaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeSection">Grado/Sección *</Label>
                  <Select
                    value={formData.gradeSectionId}
                    onValueChange={handleGradeSectionChange}
                    disabled={isSubmitting || !formData.level}
                  >
                    <SelectTrigger id="gradeSection">
                      <SelectValue placeholder={formData.level ? "Seleccionar" : "Primero selecciona nivel"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGradeSections.map(gs => (
                        <SelectItem key={gs.id} value={gs.id}>
                          {gs.grade} - Sección {gs.section} ({gs.turno})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2 md:col-span-2 relative">
                  <Label htmlFor="tutor">Tutor (Opcional)</Label>
                  <div className="relative">
                    <Input
                      id="tutor"
                      value={tutorSearch}
                      onChange={(e) => {
                        setTutorSearch(e.target.value)
                        setShowTutorSuggestions(true)
                        // Si borra el texto, limpiar el parentId
                        if (!e.target.value) {
                          setFormData({ ...formData, parentId: '', parentName: '' })
                        }
                      }}
                      onFocus={() => setShowTutorSuggestions(true)}
                      placeholder="Buscar tutor por nombre..."
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                    {formData.parentId && (
                      <button
                        type="button"
                        onClick={handleClearTutor}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {/* Lista de sugerencias */}
                  {showTutorSuggestions && filteredParents.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                      {filteredParents.map(parent => (
                        <button
                          key={parent.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between"
                          onClick={() => handleSelectTutor(parent)}
                        >
                          <span>{parent.firstName} {parent.lastName}</span>
                          <span className="text-xs text-muted-foreground">{parent.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.parentId && (
                    <p className="text-xs text-green-600 mt-1">
                      Tutor seleccionado: {formData.parentName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {modalMode !== 'view' && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                variant={modalMode === 'delete' ? 'destructive' : 'default'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {modalMode === 'create' && 'Crear Estudiante'}
                    {modalMode === 'edit' && 'Guardar Cambios'}
                    {modalMode === 'delete' && 'Eliminar'}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
