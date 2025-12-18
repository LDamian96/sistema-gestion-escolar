'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Loader2,
  X,
  Calendar,
  Filter,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  coursesService,
  subjectsService,
  teachersService,
  gradeSectionsService,
  studentsService,
  schedulesService,
  type Course,
  type Subject,
  type Teacher,
  type GradeSection,
  type Student,
  type Schedule,
  type Status
} from '@/services/mock-data'

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null

interface ScheduleEntry {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
}

interface CourseFormData {
  subjectId: string
  gradeSectionId: string
  teacherId: string
  status: Status
  schedules: ScheduleEntry[]
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

export default function CursosPage() {
  // Estado principal
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Estado de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')

  // Estado del modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<CourseFormData>({
    subjectId: '',
    gradeSectionId: '',
    teacherId: '',
    status: 'active',
    schedules: []
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, subjectsData, teachersData, gradeSectionsData, studentsData, schedulesData] = await Promise.all([
        coursesService.getAll(),
        subjectsService.getAll(),
        teachersService.getAll(),
        gradeSectionsService.getAll(),
        studentsService.getAll(),
        schedulesService.getAll()
      ])
      setCourses(coursesData)
      setSubjects(subjectsData.filter(s => s.status === 'active'))
      setTeachers(teachersData.filter(t => t.status === 'active'))
      setGradeSections(gradeSectionsData.filter(gs => gs.status === 'active'))
      setStudents(studentsData.filter(s => s.status === 'active'))
      setSchedules(schedulesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar grados/secciones por nivel
  const filteredGradeSections = useMemo(() => {
    if (levelFilter === 'all') return gradeSections
    return gradeSections.filter(gs => gs.level === levelFilter)
  }, [gradeSections, levelFilter])

  // Filtrado de cursos
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch =
        course.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.gradeSection.toLowerCase().includes(searchTerm.toLowerCase())

      const gs = gradeSections.find(g => `${g.grade} ${g.section}` === course.gradeSection)
      const matchesLevel = levelFilter === 'all' || gs?.level === levelFilter
      const matchesGrade = gradeFilter === 'all' || course.gradeSection === gradeFilter

      return matchesSearch && matchesLevel && matchesGrade
    })
  }, [courses, searchTerm, levelFilter, gradeFilter, gradeSections])

  // Obtener horarios de un curso
  const getCourseSchedules = (courseId: string) => {
    return schedules.filter(s => s.courseId === courseId)
  }

  // Obtener estudiantes de un grado/sección
  const getStudentsByGradeSection = (gradeSection: string) => {
    return students.filter(s => s.gradeSection === gradeSection)
  }

  // Formatear horario para mostrar
  const formatScheduleDisplay = (courseId: string) => {
    const courseSchedules = getCourseSchedules(courseId)
    if (courseSchedules.length === 0) return 'Sin horario'

    const grouped = courseSchedules.reduce((acc, s) => {
      const day = DAYS_OF_WEEK.find(d => d.value === s.dayOfWeek)?.short || ''
      if (!acc[`${s.startTime}-${s.endTime}`]) {
        acc[`${s.startTime}-${s.endTime}`] = []
      }
      acc[`${s.startTime}-${s.endTime}`].push(day)
      return acc
    }, {} as Record<string, string[]>)

    return Object.entries(grouped)
      .map(([time, days]) => `${days.join('-')} ${time}`)
      .join(' | ')
  }

  // Estadísticas
  const stats = [
    {
      label: 'Total Cursos',
      value: courses.length,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Activos',
      value: courses.filter(c => c.status === 'active').length,
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Estudiantes',
      value: students.length,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Profesores',
      value: teachers.length,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
  ]

  // Handlers del modal
  const openModal = (mode: ModalMode, course?: Course) => {
    setModalMode(mode)
    setSelectedCourse(course || null)

    if (mode === 'create') {
      setFormData({
        subjectId: '',
        gradeSectionId: '',
        teacherId: '',
        status: 'active',
        schedules: []
      })
    } else if ((mode === 'edit' || mode === 'view') && course) {
      const courseSchedules = getCourseSchedules(course.id)
      setFormData({
        subjectId: course.subjectId,
        gradeSectionId: course.gradeSectionId,
        teacherId: course.teacherId,
        status: course.status,
        schedules: courseSchedules.map(s => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room
        }))
      })
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedCourse(null)
    setFormData({
      subjectId: '',
      gradeSectionId: '',
      teacherId: '',
      status: 'active',
      schedules: []
    })
  }

  // Agregar horario
  const addScheduleEntry = () => {
    setFormData({
      ...formData,
      schedules: [
        ...formData.schedules,
        { dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: '' }
      ]
    })
  }

  // Eliminar horario
  const removeScheduleEntry = (index: number) => {
    setFormData({
      ...formData,
      schedules: formData.schedules.filter((_, i) => i !== index)
    })
  }

  // Actualizar horario
  const updateScheduleEntry = (index: number, field: keyof ScheduleEntry, value: string | number) => {
    const newSchedules = [...formData.schedules]
    newSchedules[index] = { ...newSchedules[index], [field]: value }
    setFormData({ ...formData, schedules: newSchedules })
  }

  // CRUD Operations
  const handleCreate = async () => {
    if (!formData.subjectId || !formData.gradeSectionId || !formData.teacherId) {
      toast.error('Materia, Grado/Sección y Profesor son obligatorios')
      return
    }

    if (formData.schedules.length === 0) {
      toast.error('Debe agregar al menos un horario')
      return
    }

    // Validar que todos los horarios tengan aula
    if (formData.schedules.some(s => !s.room)) {
      toast.error('Todos los horarios deben tener un aula asignada')
      return
    }

    try {
      setSubmitting(true)
      const subject = subjects.find(s => s.id === formData.subjectId)
      const gradeSection = gradeSections.find(gs => gs.id === formData.gradeSectionId)
      const teacher = teachers.find(t => t.id === formData.teacherId)

      // Crear curso
      const newCourse = await coursesService.create({
        subjectId: formData.subjectId,
        subjectName: subject?.name || '',
        gradeSectionId: formData.gradeSectionId,
        gradeSection: `${gradeSection?.grade} ${gradeSection?.section}`,
        teacherId: formData.teacherId,
        teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
        schedule: '', // Dejamos vacío, usaremos la tabla de horarios
        room: formData.schedules[0]?.room || '',
        status: formData.status
      })

      // Crear horarios
      const newSchedules: Schedule[] = []
      for (const schedule of formData.schedules) {
        const newSchedule = await schedulesService.create({
          courseId: newCourse.id,
          courseName: subject?.name || '',
          teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
          gradeSection: `${gradeSection?.grade} ${gradeSection?.section}`,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room
        })
        newSchedules.push(newSchedule)
      }

      setCourses([...courses, newCourse])
      setSchedules([...schedules, ...newSchedules])
      closeModal()
      toast.success(`Curso ${newCourse.subjectName} creado exitosamente`)
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('No se pudo crear el curso')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedCourse) return

    if (!formData.subjectId || !formData.gradeSectionId || !formData.teacherId) {
      toast.error('Materia, Grado/Sección y Profesor son obligatorios')
      return
    }

    if (formData.schedules.length === 0) {
      toast.error('Debe agregar al menos un horario')
      return
    }

    if (formData.schedules.some(s => !s.room)) {
      toast.error('Todos los horarios deben tener un aula asignada')
      return
    }

    try {
      setSubmitting(true)
      const subject = subjects.find(s => s.id === formData.subjectId)
      const gradeSection = gradeSections.find(gs => gs.id === formData.gradeSectionId)
      const teacher = teachers.find(t => t.id === formData.teacherId)

      // Actualizar curso
      const updatedCourse = await coursesService.update(selectedCourse.id, {
        subjectId: formData.subjectId,
        subjectName: subject?.name || '',
        gradeSectionId: formData.gradeSectionId,
        gradeSection: `${gradeSection?.grade} ${gradeSection?.section}`,
        teacherId: formData.teacherId,
        teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
        room: formData.schedules[0]?.room || '',
        status: formData.status
      })

      // Eliminar horarios anteriores
      const oldSchedules = getCourseSchedules(selectedCourse.id)
      for (const schedule of oldSchedules) {
        await schedulesService.delete(schedule.id)
      }

      // Crear nuevos horarios
      const newSchedules: Schedule[] = []
      for (const schedule of formData.schedules) {
        const newSchedule = await schedulesService.create({
          courseId: selectedCourse.id,
          courseName: subject?.name || '',
          teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
          gradeSection: `${gradeSection?.grade} ${gradeSection?.section}`,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room
        })
        newSchedules.push(newSchedule)
      }

      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c))
      setSchedules([...schedules.filter(s => s.courseId !== selectedCourse.id), ...newSchedules])
      closeModal()
      toast.success(`Curso ${updatedCourse.subjectName} actualizado exitosamente`)
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('No se pudo actualizar el curso')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCourse) return

    try {
      setSubmitting(true)

      // Eliminar horarios del curso
      const courseSchedules = getCourseSchedules(selectedCourse.id)
      for (const schedule of courseSchedules) {
        await schedulesService.delete(schedule.id)
      }

      // Eliminar curso
      await coursesService.delete(selectedCourse.id)

      setCourses(courses.filter(c => c.id !== selectedCourse.id))
      setSchedules(schedules.filter(s => s.courseId !== selectedCourse.id))
      closeModal()
      toast.success(`Curso ${selectedCourse.subjectName} eliminado exitosamente`)
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('No se pudo eliminar el curso')
    } finally {
      setSubmitting(false)
    }
  }

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.color || 'bg-gray-500'
  }

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
          <h1 className="font-heading text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-muted-foreground mt-1">Administra cursos y asigna horarios</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
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
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v as typeof levelFilter); setGradeFilter('all') }}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="Inicial">Inicial</SelectItem>
                <SelectItem value="Primaria">Primaria</SelectItem>
                <SelectItem value="Secundaria">Secundaria</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Grado/Sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grados</SelectItem>
                {filteredGradeSections.map((gs) => (
                  <SelectItem key={gs.id} value={`${gs.grade} ${gs.section}`}>
                    {gs.grade} {gs.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setLevelFilter('all'); setGradeFilter('all') }}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, index) => {
            const courseStudents = getStudentsByGradeSection(course.gradeSection)
            const courseSchedules = getCourseSchedules(course.id)

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${getSubjectColor(course.subjectId)} flex items-center justify-center`}>
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.status === 'active'
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-red-500/20 text-red-600'
                      }`}>
                        {course.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{course.subjectName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{course.gradeSection}</p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="truncate">{course.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{courseStudents.length} estudiantes</span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="text-xs">{formatScheduleDisplay(course.id)}</span>
                      </div>
                      {courseSchedules.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{[...new Set(courseSchedules.map(s => s.room))].join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openModal('view', course)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openModal('edit', course)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal('delete', course)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron cursos</p>
        </div>
      )}

      {/* Modal Create/Edit */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Crear Nuevo Curso' : 'Editar Curso'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Complete los datos y asigne horarios al curso'
                : 'Modifique los datos y horarios del curso'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Datos básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Materia *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeSection">Grado/Sección *</Label>
                <Select
                  value={formData.gradeSectionId}
                  onValueChange={(value) => setFormData({ ...formData, gradeSectionId: value })}
                >
                  <SelectTrigger id="gradeSection">
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeSections.map((gs) => (
                      <SelectItem key={gs.id} value={gs.id}>
                        {gs.grade} {gs.section} - {gs.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Profesor *</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                >
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="Seleccionar profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
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
            </div>

            {/* Info de estudiantes */}
            {formData.gradeSectionId && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {getStudentsByGradeSection(
                      (() => {
                        const gs = gradeSections.find(g => g.id === formData.gradeSectionId)
                        return gs ? `${gs.grade} ${gs.section}` : ''
                      })()
                    ).length} estudiantes en este grado/sección
                  </span>
                </div>
              </div>
            )}

            {/* Horarios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Horarios del Curso
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addScheduleEntry}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Horario
                </Button>
              </div>

              {formData.schedules.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No hay horarios asignados</p>
                  <p className="text-xs text-muted-foreground">Haga clic en &quot;Agregar Horario&quot; para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.schedules.map((schedule, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-12 gap-2 p-3 rounded-lg bg-muted/30 border items-end"
                    >
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Día</Label>
                        <Select
                          value={String(schedule.dayOfWeek)}
                          onValueChange={(v) => updateScheduleEntry(index, 'dayOfWeek', parseInt(v))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day.value} value={String(day.value)}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Inicio</Label>
                        <Input
                          type="time"
                          className="h-9"
                          value={schedule.startTime}
                          onChange={(e) => updateScheduleEntry(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Fin</Label>
                        <Input
                          type="time"
                          className="h-9"
                          value={schedule.endTime}
                          onChange={(e) => updateScheduleEntry(index, 'endTime', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs">Aula</Label>
                        <Input
                          className="h-9"
                          placeholder="Ej: Aula 101"
                          value={schedule.room}
                          onChange={(e) => updateScheduleEntry(index, 'room', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => removeScheduleEntry(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              onClick={modalMode === 'create' ? handleCreate : handleUpdate}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {modalMode === 'create' ? 'Crear Curso' : 'Actualizar Curso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal View */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Curso</DialogTitle>
            <DialogDescription>
              Información completa del curso y estudiantes asignados
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6 py-4">
              {/* Info básica */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${getSubjectColor(selectedCourse.subjectId)} flex items-center justify-center`}>
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">{selectedCourse.subjectName}</h3>
                  <p className="text-muted-foreground">{selectedCourse.gradeSection}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedCourse.status === 'active'
                    ? 'bg-green-500/20 text-green-600'
                    : 'bg-red-500/20 text-red-600'
                }`}>
                  {selectedCourse.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">Profesor</Label>
                  <p className="font-medium">{selectedCourse.teacherName}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Label className="text-xs text-muted-foreground">Estudiantes</Label>
                  <p className="font-medium">{getStudentsByGradeSection(selectedCourse.gradeSection).length}</p>
                </div>
              </div>

              {/* Horarios */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.schedules.map((schedule, index) => {
                    const day = DAYS_OF_WEEK.find(d => d.value === schedule.dayOfWeek)
                    return (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{day?.short}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{day?.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime} • {schedule.room}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lista de Estudiantes */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estudiantes Asignados ({getStudentsByGradeSection(selectedCourse.gradeSection).length})
                </Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {getStudentsByGradeSection(selectedCourse.gradeSection).map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground">{student.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cerrar
            </Button>
            {selectedCourse && (
              <Button onClick={() => openModal('edit', selectedCourse)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Delete */}
      <Dialog open={modalMode === 'delete'} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Curso</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también los horarios asociados.
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                ¿Está seguro que desea eliminar el curso:
              </p>
              <p className="font-semibold mt-2">
                {selectedCourse.subjectName} - {selectedCourse.gradeSection}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Profesor: {selectedCourse.teacherName}
              </p>
              <p className="text-sm text-muted-foreground">
                Horarios: {getCourseSchedules(selectedCourse.id).length}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
