'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Save,
  CheckCircle2,
  ChevronDown,
  Filter,
  LockKeyhole
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { tasksService, coursesService, gradeSectionsService, studentsService, type Task, type Course, type GradeSection, type Student } from '@/services/mock-data'

// Simulamos el ID del profesor actual
const CURRENT_TEACHER_ID = 't1'

type TaskFormData = {
  title: string
  description: string
  courseId: string
  dueDate: string
  maxScore: number
}

type StudentGrade = {
  studentId: string
  studentName: string
  studentCode: string
  score: number | null
  comment: string
}

export default function TeacherTareasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedLevel, setSelectedLevel] = useState<'Inicial' | 'Primaria' | 'Secundaria' | ''>('')
  const [filterLevel, setFilterLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [filterGradeSection, setFilterGradeSection] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'closed' | 'not_submitted'>('all')
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxScore: 20
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [allGradeSections, allCourses, teacherTasks, allStudents] = await Promise.all([
        gradeSectionsService.getAll(),
        coursesService.getAll(),
        tasksService.getByTeacher(CURRENT_TEACHER_ID),
        studentsService.getAll()
      ])

      setGradeSections(allGradeSections)
      const teacherCourses = allCourses.filter(c => c.teacherId === CURRENT_TEACHER_ID && c.status === 'active')
      setCourses(teacherCourses)
      setTasks(teacherTasks)
      setStudents(allStudents)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar cursos por nivel seleccionado
  const filteredCoursesByLevel = useMemo(() => {
    if (!selectedLevel) return courses

    const gradeSectionsOfLevel = gradeSections
      .filter(gs => gs.level === selectedLevel)
      .map(gs => `${gs.grade} ${gs.section}`)

    return courses.filter(c => gradeSectionsOfLevel.includes(c.gradeSection))
  }, [courses, gradeSections, selectedLevel])

  // Obtener grado/secciones únicas de los cursos del profesor
  const teacherGradeSections = useMemo(() => {
    const unique = [...new Set(courses.map(c => c.gradeSection))]
    return unique.sort()
  }, [courses])

  // Filtrar grado/secciones por nivel seleccionado
  const filteredGradeSectionsForFilter = useMemo(() => {
    if (filterLevel === 'all') return teacherGradeSections
    const gsOfLevel = gradeSections
      .filter(gs => gs.level === filterLevel)
      .map(gs => `${gs.grade} ${gs.section}`)
    return teacherGradeSections.filter(gs => gsOfLevel.includes(gs))
  }, [teacherGradeSections, gradeSections, filterLevel])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.courseName.toLowerCase().includes(searchTerm.toLowerCase())

      let matchesLevel = true
      if (filterLevel !== 'all') {
        const gsOfLevel = gradeSections
          .filter(gs => gs.level === filterLevel)
          .map(gs => `${gs.grade} ${gs.section}`)
        matchesLevel = gsOfLevel.includes(task.gradeSection)
      }

      const matchesGradeSection = filterGradeSection === 'all' || task.gradeSection === filterGradeSection
      // 'not_submitted' filtra tareas cerradas (cuando se cierra, los que no entregaron pasan a no_entrego)
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'not_submitted' ? task.status === 'closed' : task.status === filterStatus)

      return matchesSearch && matchesLevel && matchesGradeSection && matchesStatus
    })
  }, [searchTerm, tasks, filterLevel, filterGradeSection, filterStatus, gradeSections])

  // Agrupar tareas por materia y grado-sección
  const groupedTasks = useMemo(() => {
    const groups: Record<string, {
      key: string
      courseName: string
      gradeSection: string
      level: string
      turno: string
      tasks: Task[]
    }> = {}

    filteredTasks.forEach(task => {
      const gs = gradeSections.find(g => `${g.grade} ${g.section}` === task.gradeSection)
      const turno = gs?.turno || 'Sin turno'
      const key = `${task.courseName}-${task.gradeSection}-${turno}`

      if (!groups[key]) {
        groups[key] = {
          key,
          courseName: task.courseName,
          gradeSection: task.gradeSection,
          level: task.level,
          turno,
          tasks: []
        }
      }
      groups[key].tasks.push(task)
    })

    return Object.values(groups).sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level)
      if (a.gradeSection !== b.gradeSection) return a.gradeSection.localeCompare(b.gradeSection)
      return a.courseName.localeCompare(b.courseName)
    })
  }, [filteredTasks, gradeSections])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedGroups(new Set(groupedTasks.map(g => g.key)))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  const handleCreate = () => {
    setSelectedLevel('')
    setFormData({
      title: '',
      description: '',
      courseId: '',
      dueDate: '',
      maxScore: 20
    })
    setIsCreateModalOpen(true)
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    const taskCourse = courses.find(c => c.id === task.courseId)
    if (taskCourse) {
      const gs = gradeSections.find(g => `${g.grade} ${g.section}` === taskCourse.gradeSection)
      setSelectedLevel(gs?.level as 'Inicial' | 'Primaria' | 'Secundaria' || '')
    }
    setFormData({
      title: task.title,
      description: task.description,
      courseId: task.courseId,
      dueDate: task.dueDate,
      maxScore: task.maxScore
    })
    setIsEditModalOpen(true)
  }

  const handleView = (task: Task) => {
    router.push(`/teacher/tareas/${task.id}`)
  }

  const handleDelete = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseTask = async (task: Task) => {
    try {
      setSubmitting(true)
      await tasksService.update(task.id, { status: 'closed' })
      await loadData()
      toast({
        title: 'Tarea cerrada',
        description: 'La tarea ha sido cerrada exitosamente'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la tarea'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGrade = (task: Task) => {
    setSelectedTask(task)
    const taskStudentsList = students.filter(s => s.gradeSection === task.gradeSection && s.status === 'active')
    const initialGrades: StudentGrade[] = taskStudentsList.map((student) => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentCode: student.code,
      score: task.status === 'closed' ? Math.floor(Math.random() * 6) + 14 : null,
      comment: ''
    }))
    setStudentGrades(initialGrades)
    setIsGradeModalOpen(true)
  }

  const handleScoreChange = (studentId: string, score: number | null) => {
    setStudentGrades(prev => prev.map(sg =>
      sg.studentId === studentId ? { ...sg, score } : sg
    ))
  }

  const saveGrades = async () => {
    if (!selectedTask) return

    const incompleteGrades = studentGrades.filter(sg => sg.score === null)
    if (incompleteGrades.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Calificaciones incompletas',
        description: `Faltan ${incompleteGrades.length} estudiantes por calificar`
      })
      return
    }

    try {
      setIsSavingGrades(true)
      const totalScore = studentGrades.reduce((sum, sg) => sum + (sg.score || 0), 0)
      const averageScore = Math.round((totalScore / studentGrades.length) * 10) / 10

      await tasksService.update(selectedTask.id, {
        status: 'closed',
        averageScore
      })

      await loadData()

      toast({
        title: 'Calificaciones guardadas',
        description: `Se han guardado las calificaciones de ${studentGrades.length} estudiantes. Promedio: ${averageScore}`
      })
      setIsGradeModalOpen(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron guardar las calificaciones'
      })
    } finally {
      setIsSavingGrades(false)
    }
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.courseId || !formData.dueDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos'
      })
      return
    }

    try {
      setSubmitting(true)
      const selectedCourse = courses.find(c => c.id === formData.courseId)
      if (!selectedCourse) return

      const gs = gradeSections.find(g => `${g.grade} ${g.section}` === selectedCourse.gradeSection)

      await tasksService.create({
        ...formData,
        courseName: selectedCourse.subjectName,
        gradeSection: selectedCourse.gradeSection,
        level: gs?.level || 'Primaria',
        teacherId: CURRENT_TEACHER_ID,
        teacherName: selectedCourse.teacherName,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        totalStudents: students.filter(s => s.gradeSection === selectedCourse.gradeSection && s.status === 'active').length
      })

      await loadData()
      setIsCreateModalOpen(false)
      toast({
        title: 'Tarea creada',
        description: 'La tarea ha sido creada exitosamente'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la tarea'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTask || !formData.title || !formData.courseId || !formData.dueDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos'
      })
      return
    }

    try {
      setSubmitting(true)
      const selectedCourse = courses.find(c => c.id === formData.courseId)
      if (!selectedCourse) return

      await tasksService.update(selectedTask.id, {
        ...formData,
        courseName: selectedCourse.subjectName,
        gradeSection: selectedCourse.gradeSection,
      })

      await loadData()
      setIsEditModalOpen(false)
      toast({
        title: 'Tarea actualizada',
        description: 'La tarea ha sido actualizada exitosamente'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar la tarea'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedTask) return

    try {
      setSubmitting(true)
      await tasksService.delete(selectedTask.id)
      await loadData()
      setIsDeleteDialogOpen(false)
      toast({
        title: 'Tarea eliminada',
        description: 'La tarea ha sido eliminada exitosamente'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la tarea'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const stats = [
    { label: 'Pendientes', value: tasks.filter(t => t.status === 'pending').length, icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Cerradas', value: tasks.filter(t => t.status === 'closed').length, icon: LockKeyhole, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { label: 'Total', value: tasks.length, icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Primaria': return 'bg-blue-500/20 text-blue-600'
      case 'Secundaria': return 'bg-purple-500/20 text-purple-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/20 text-blue-600'
      case 'closed': return 'bg-amber-500/20 text-amber-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'closed': return 'Cerrada'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Tareas</h1>
          <p className="text-muted-foreground mt-1">Gestiona las tareas de tus cursos</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">Mis Tareas</h1>
            <p className="text-muted-foreground mt-1">Gestiona las tareas de tus cursos</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Stats */}
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tareas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nivel:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'Inicial', 'Primaria', 'Secundaria'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={filterLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setFilterLevel(level)
                          setFilterGradeSection('all')
                        }}
                      >
                        {level === 'all' ? 'Todos' : level}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Grado/Sección:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterGradeSection === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterGradeSection('all')}
                    >
                      Todos
                    </Button>
                    {filteredGradeSectionsForFilter.map((gs) => (
                      <Button
                        key={gs}
                        variant={filterGradeSection === gs ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterGradeSection(gs)}
                      >
                        {gs}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Estado:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'closed', 'not_submitted'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                    >
                      {status === 'all' ? 'Todas' : status === 'not_submitted' ? 'No Entregó' : getStatusText(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tareas agrupadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tareas por Materia y Grado ({filteredTasks.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expandir todo
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Colapsar todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {groupedTasks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron tareas' : 'No hay tareas creadas'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedTasks.map((group, groupIndex) => {
                  const isExpanded = expandedGroups.has(group.key)
                  const pendingCount = group.tasks.filter(t => t.status === 'pending').length
                  const closedCount = group.tasks.filter(t => t.status === 'closed').length

                  return (
                    <motion.div
                      key={group.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.03 }}
                      className="border rounded-xl overflow-hidden"
                    >
                      {/* Header del grupo */}
                      <button
                        onClick={() => toggleGroup(group.key)}
                        className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30 hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/30 transition-colors text-left"
                      >
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                          group.level === 'Primaria' ? 'from-blue-500 to-blue-600' :
                          group.level === 'Secundaria' ? 'from-purple-500 to-purple-600' :
                          'from-emerald-500 to-emerald-600'
                        } shadow-lg`}>
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{group.courseName}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelColor(group.level)}`}>
                              {group.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {group.gradeSection}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {group.turno}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            {pendingCount > 0 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {pendingCount} pendientes
                              </span>
                            )}
                            {closedCount > 0 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {closedCount} cerradas
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {group.tasks.length} {group.tasks.length === 1 ? 'tarea' : 'tareas'}
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </div>
                      </button>

                      {/* Contenido expandible */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t bg-muted/20 divide-y">
                              {group.tasks.map((task, taskIndex) => (
                                <motion.div
                                  key={task.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: taskIndex * 0.03 }}
                                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{task.title}</p>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                                        {getStatusText(task.status)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Vence: {task.dueDate}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Award className="h-3 w-3" />
                                        {task.maxScore} pts
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {task.totalStudents} estudiantes
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleView(task)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGrade(task)}
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      title="Calificar"
                                    >
                                      <GraduationCap className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                    {task.status === 'pending' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCloseTask(task)}
                                        disabled={submitting}
                                      >
                                        <LockKeyhole className="h-4 w-4 mr-1" />
                                        Cerrar
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Crear Tarea */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
            <DialogDescription>
              Crea una nueva tarea para tus estudiantes
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Ejercicios de álgebra"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada de la tarea..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Nivel</Label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value as 'Inicial' | 'Primaria' | 'Secundaria' | '')
                      setFormData({ ...formData, courseId: '' })
                    }}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="courseId">Curso *</Label>
                  <select
                    id="courseId"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Seleccionar curso</option>
                    {filteredCoursesByLevel.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.subjectName} - {course.gradeSection}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Fecha de Entrega *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxScore">Puntaje Máximo</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear Tarea'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Tarea */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la tarea
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-level">Nivel</Label>
                  <select
                    id="edit-level"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value as 'Inicial' | 'Primaria' | 'Secundaria' | '')
                      setFormData({ ...formData, courseId: '' })
                    }}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-courseId">Curso *</Label>
                  <select
                    id="edit-courseId"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Seleccionar curso</option>
                    {filteredCoursesByLevel.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.subjectName} - {course.gradeSection}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dueDate">Fecha de Entrega *</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxScore">Puntaje Máximo</Label>
                  <Input
                    id="edit-maxScore"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Calificar */}
      <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Calificar Tarea</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              {/* Info de la tarea */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTask.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTask.courseName} - {selectedTask.gradeSection}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm mt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Vence: {selectedTask.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    Máx: {selectedTask.maxScore} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {studentGrades.length} estudiantes
                  </span>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStudentGrades(prev => prev.map(sg => ({ ...sg, score: selectedTask.maxScore })))
                  }}
                  className="text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Todos {selectedTask.maxScore}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStudentGrades(prev => prev.map(sg => ({ ...sg, score: Math.round(selectedTask.maxScore * 0.5) })))
                  }}
                >
                  Todos 50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStudentGrades(prev => prev.map(sg => ({ ...sg, score: null })))
                  }}
                >
                  Limpiar todo
                </Button>
              </div>

              {/* Lista de estudiantes para calificar */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Estudiante</span>
                  <span className="text-sm font-medium">Nota (0-{selectedTask.maxScore})</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y">
                  {studentGrades.map((sg, index) => (
                    <motion.div
                      key={sg.studentId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-4 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sg.studentName}</p>
                        <p className="text-xs text-muted-foreground">{sg.studentCode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={selectedTask.maxScore}
                          step="0.5"
                          value={sg.score ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseFloat(e.target.value)
                            if (value === null || (value >= 0 && value <= selectedTask.maxScore)) {
                              handleScoreChange(sg.studentId, value)
                            }
                          }}
                          className={`w-20 text-center font-medium ${
                            sg.score !== null
                              ? sg.score >= selectedTask.maxScore * 0.6
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : sg.score >= selectedTask.maxScore * 0.4
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-rose-300 bg-rose-50 text-rose-700'
                              : ''
                          }`}
                          placeholder="--"
                        />
                        {sg.score !== null && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            sg.score >= selectedTask.maxScore * 0.6
                              ? 'bg-emerald-100 text-emerald-700'
                              : sg.score >= selectedTask.maxScore * 0.4
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {sg.score >= selectedTask.maxScore * 0.6 ? 'Aprobado' : 'Desaprobado'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Resumen */}
              {studentGrades.some(sg => sg.score !== null) && (
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm">Resumen de calificaciones</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                      <p className="text-emerald-600 font-medium">
                        {studentGrades.filter(sg => sg.score !== null && sg.score >= selectedTask.maxScore * 0.6).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Aprobados</p>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/30">
                      <p className="text-rose-600 font-medium">
                        {studentGrades.filter(sg => sg.score !== null && sg.score < selectedTask.maxScore * 0.6).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Desaprobados</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950/30">
                      <p className="text-slate-600 font-medium">
                        {studentGrades.filter(sg => sg.score === null).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sin calificar</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                      <p className="text-blue-600 font-medium">
                        {(() => {
                          const gradedStudents = studentGrades.filter(sg => sg.score !== null)
                          if (gradedStudents.length === 0) return '--'
                          const avg = gradedStudents.reduce((sum, sg) => sum + (sg.score || 0), 0) / gradedStudents.length
                          return avg.toFixed(1)
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">Promedio</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsGradeModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={saveGrades}
                  disabled={isSavingGrades || studentGrades.every(sg => sg.score === null)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSavingGrades ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Calificaciones
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarea será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={submitting}>
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
