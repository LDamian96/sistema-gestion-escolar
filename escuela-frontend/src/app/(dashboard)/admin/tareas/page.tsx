'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Save,
  BookOpen,
  Users,
  LockKeyhole,
  Filter,
  Paperclip,
  X,
  Upload,
  GraduationCap,
  CheckCircle2,
  Award,
  ChevronDown
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'
import { tasksService, coursesService, gradeSectionsService, studentsService, type Task, type Course, type GradeSection, type Student } from '@/services/mock-data'

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | 'close' | 'grade' | null

// Tipo para calificaciones de estudiantes
type StudentGrade = {
  studentId: string
  studentName: string
  studentCode: string
  score: number | null
  comment: string
}

export default function TareasPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [selectedTurno, setSelectedTurno] = useState<string>('all')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'closed' | 'not_submitted'>('all')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    gradeSectionId: '',
    level: 'Inicial' as 'Inicial' | 'Primaria' | 'Secundaria',
    dueDate: '',
    assignedDate: '',
    maxScore: 20,
    status: 'pending' as 'pending' | 'closed',
    totalStudents: 0,
    attachmentName: '' as string,
    attachmentUrl: '' as string
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tasksData, coursesData, gradeSectionsData, studentsData] = await Promise.all([
        tasksService.getAll(),
        coursesService.getAll(),
        gradeSectionsService.getAll(),
        studentsService.getAll()
      ])
      setTasks(tasksData)
      setCourses(coursesData.filter(c => c.status === 'active'))
      setGradeSections(gradeSectionsData)
      setStudents(studentsData)
    } catch (error) {
      toast.error('Error al cargar los datos')
      console.error(error)
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

  const allGradeSectionNames = useMemo(() => {
    const unique = [...new Set(tasks.map(t => t.gradeSection))]
    return unique.sort()
  }, [tasks])

  const filteredGradeSectionsForFilter = useMemo(() => {
    let result = gradeSections
    if (selectedLevel !== 'all') {
      result = result.filter(gs => gs.level === selectedLevel)
    }
    if (selectedTurno !== 'all') {
      result = result.filter(gs => gs.turno === selectedTurno)
    }
    const names = result.map(gs => `${gs.grade} ${gs.section}`)
    return allGradeSectionNames.filter(gs => names.includes(gs) || selectedLevel === 'all')
  }, [allGradeSectionNames, gradeSections, selectedLevel, selectedTurno])

  // Grado-secciones para el formulario
  const filteredGradeSectionsForForm = useMemo(() => {
    return gradeSections.filter(gs => gs.level === formData.level)
  }, [gradeSections, formData.level])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = selectedLevel === 'all' || task.level === selectedLevel

      // Filtrar por turno usando los grado-secciones
      let matchesTurno = true
      if (selectedTurno !== 'all') {
        const gsWithTurno = gradeSections
          .filter(gs => gs.turno === selectedTurno)
          .map(gs => `${gs.grade} ${gs.section}`)
        matchesTurno = gsWithTurno.includes(task.gradeSection)
      }

      const matchesGradeSection = selectedGradeSection === 'all' || task.gradeSection === selectedGradeSection
      // 'not_submitted' filtra tareas cerradas (cuando se cierra, los que no entregaron pasan a no_entrego)
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'not_submitted' ? task.status === 'closed' : task.status === selectedStatus)
      return matchesSearch && matchesLevel && matchesTurno && matchesGradeSection && matchesStatus
    })
  }, [tasks, searchTerm, selectedLevel, selectedTurno, selectedGradeSection, selectedStatus, gradeSections])

  // Agrupar tareas por materia y grado-sección
  const groupedTasks = useMemo(() => {
    const groups: Record<string, {
      key: string
      courseName: string
      gradeSection: string
      level: string
      turno: string
      teacherName: string
      tasks: Task[]
    }> = {}

    filteredTasks.forEach(task => {
      // Encontrar el turno del grado-sección
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
          teacherName: task.teacherName,
          tasks: []
        }
      }
      groups[key].tasks.push(task)
    })

    // Ordenar por nivel, grado-sección y materia
    return Object.values(groups).sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level)
      if (a.gradeSection !== b.gradeSection) return a.gradeSection.localeCompare(b.gradeSection)
      return a.courseName.localeCompare(b.courseName)
    })
  }, [filteredTasks, gradeSections])

  // Toggle grupo expandido
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

  // Expandir/Colapsar todos
  const expandAll = () => {
    setExpandedGroups(new Set(groupedTasks.map(g => g.key)))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  const filteredCourses = useMemo(() => {
    const gradeSectionNames = gradeSections
      .filter(gs => gs.level === formData.level)
      .map(gs => `${gs.grade} ${gs.section}`)
    return courses.filter(c => gradeSectionNames.includes(c.gradeSection))
  }, [courses, gradeSections, formData.level])

  const stats = useMemo(() => {
    return [
      { label: 'Total Tareas', value: tasks.length, icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Pendientes', value: tasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
      { label: 'Cerradas', value: tasks.filter(t => t.status === 'closed').length, icon: LockKeyhole, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      { label: 'Total Estudiantes', value: tasks.reduce((sum, task) => sum + task.totalStudents, 0), icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ]
  }, [tasks])

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      gradeSectionId: '',
      level: 'Inicial',
      dueDate: '',
      assignedDate: new Date().toISOString().split('T')[0],
      maxScore: 20,
      status: 'pending',
      totalStudents: 0,
      attachmentName: '',
      attachmentUrl: ''
    })
    setSelectedTask(null)
    setModalMode('create')
  }

  const handleEdit = (task: Task) => {
    // Buscar el gradeSectionId basado en el gradeSection
    const gs = gradeSections.find(g => `${g.grade} ${g.section}` === task.gradeSection)
    setFormData({
      title: task.title,
      description: task.description,
      courseId: task.courseId,
      gradeSectionId: gs?.id || '',
      level: task.level as 'Inicial' | 'Primaria' | 'Secundaria',
      dueDate: task.dueDate,
      assignedDate: task.assignedDate,
      maxScore: task.maxScore,
      status: task.status,
      totalStudents: task.totalStudents,
      attachmentName: (task as Task & { attachmentName?: string }).attachmentName || '',
      attachmentUrl: (task as Task & { attachmentUrl?: string }).attachmentUrl || ''
    })
    setSelectedTask(task)
    setModalMode('edit')
  }

  const handleView = (task: Task) => {
    router.push(`/admin/tareas/${task.id}`)
  }

  const handleDelete = (task: Task) => {
    setSelectedTask(task)
    setModalMode('delete')
  }

  const handleCloseTask = (task: Task) => {
    setSelectedTask(task)
    setModalMode('close')
  }

  const handleGrade = (task: Task) => {
    setModalMode('grade')
    setSelectedTask(task)
    // Cargar estudiantes del grado/sección de la tarea
    const taskStudentsList = students.filter(s => s.gradeSection === task.gradeSection && s.status === 'active')
    // Inicializar calificaciones
    const initialGrades: StudentGrade[] = taskStudentsList.map((student) => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentCode: student.code,
      score: null,
      comment: ''
    }))
    setStudentGrades(initialGrades)
  }

  const handleScoreChange = (studentId: string, score: number | null) => {
    setStudentGrades(prev => prev.map(sg =>
      sg.studentId === studentId ? { ...sg, score } : sg
    ))
  }

  const handleCommentChange = (studentId: string, comment: string) => {
    setStudentGrades(prev => prev.map(sg =>
      sg.studentId === studentId ? { ...sg, comment } : sg
    ))
  }

  const saveGrades = async () => {
    if (!selectedTask) return

    // Validar que todas las notas estén completas
    const incompleteGrades = studentGrades.filter(sg => sg.score === null)
    if (incompleteGrades.length > 0) {
      toast.error(`Faltan ${incompleteGrades.length} estudiantes por calificar`)
      return
    }

    try {
      setIsSavingGrades(true)
      // Calcular promedio
      const totalScore = studentGrades.reduce((sum, sg) => sum + (sg.score || 0), 0)
      const averageScore = Math.round((totalScore / studentGrades.length) * 10) / 10

      // Actualizar la tarea con el estado cerrado
      const updatedTask = await tasksService.update(selectedTask.id, {
        status: 'closed'
      })

      setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))

      toast.success(`Calificaciones guardadas. Promedio: ${averageScore}`)
      setModalMode(null)
      setSelectedTask(null)
    } catch (error) {
      toast.error('Error al guardar las calificaciones')
    } finally {
      setIsSavingGrades(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.gradeSectionId || !formData.dueDate) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    try {
      setIsSubmitting(true)
      const selectedGradeSection = gradeSections.find(gs => gs.id === formData.gradeSectionId)

      if (!selectedGradeSection) {
        toast.error('Grado/Sección no encontrado')
        return
      }

      // Buscar un curso asociado al grado-sección si existe
      const associatedCourse = courses.find(c => c.gradeSection === `${selectedGradeSection.grade} ${selectedGradeSection.section}`)

      if (modalMode === 'create') {
        const newTask = await tasksService.create({
          title: formData.title,
          description: formData.description,
          courseId: associatedCourse?.id || '',
          courseName: associatedCourse?.subjectName || 'General',
          gradeSection: `${selectedGradeSection.grade} ${selectedGradeSection.section}`,
          level: formData.level,
          teacherId: associatedCourse?.teacherId || '',
          teacherName: associatedCourse?.teacherName || 'Sin asignar',
          dueDate: formData.dueDate,
          assignedDate: formData.assignedDate,
          maxScore: formData.maxScore,
          status: formData.status,
          totalStudents: selectedGradeSection.currentStudents || 30,
          attachmentName: formData.attachmentName,
          attachmentUrl: formData.attachmentUrl
        } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
        setTasks([...tasks, newTask])
        toast.success('Tarea creada exitosamente')
      } else if (modalMode === 'edit' && selectedTask) {
        const updatedTask = await tasksService.update(selectedTask.id, {
          title: formData.title,
          description: formData.description,
          courseId: associatedCourse?.id || selectedTask.courseId,
          courseName: associatedCourse?.subjectName || selectedTask.courseName,
          gradeSection: `${selectedGradeSection.grade} ${selectedGradeSection.section}`,
          level: formData.level,
          teacherId: associatedCourse?.teacherId || selectedTask.teacherId,
          teacherName: associatedCourse?.teacherName || selectedTask.teacherName,
          dueDate: formData.dueDate,
          assignedDate: formData.assignedDate,
          maxScore: formData.maxScore,
          status: formData.status,
          totalStudents: formData.totalStudents,
          attachmentName: formData.attachmentName,
          attachmentUrl: formData.attachmentUrl
        } as Partial<Task>)
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))
        toast.success('Tarea actualizada exitosamente')
      }

      setModalMode(null)
      setSelectedTask(null)
    } catch (error) {
      toast.error('Error al guardar la tarea')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedTask) return

    try {
      setIsSubmitting(true)
      await tasksService.delete(selectedTask.id)
      setTasks(tasks.filter(t => t.id !== selectedTask.id))
      toast.success('Tarea eliminada exitosamente')
      setModalMode(null)
      setSelectedTask(null)
    } catch (error) {
      toast.error('Error al eliminar la tarea')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmCloseTask = async () => {
    if (!selectedTask) return

    try {
      setIsSubmitting(true)
      const updatedTask = await tasksService.update(selectedTask.id, { status: 'closed' })
      setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))
      toast.success('Tarea cerrada exitosamente')
      setModalMode(null)
      setSelectedTask(null)
    } catch (error) {
      toast.error('Error al cerrar la tarea')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600'
      case 'closed': return 'bg-orange-500/20 text-orange-600'
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Primaria': return 'bg-blue-500/20 text-blue-600'
      case 'Secundaria': return 'bg-purple-500/20 text-purple-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestion de Tareas</h1>
          <p className="text-muted-foreground mt-1">Administra las tareas asignadas a los estudiantes</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

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

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por titulo, materia o profesor..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4">
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Grado/Seccion:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedGradeSection === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGradeSection('all')}
                    >
                      Todos
                    </Button>
                    {filteredGradeSectionsForFilter.map((gs) => (
                      <Button
                        key={gs}
                        variant={selectedGradeSection === gs ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGradeSection(gs)}
                      >
                        {gs}
                      </Button>
                    ))}
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
                        variant={selectedStatus === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStatus(status)}
                      >
                        {status === 'all' ? 'Todas' : status === 'not_submitted' ? 'No Entregó' : getStatusText(status)}
                      </Button>
                    ))}
                  </div>
                </div>
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
            Tareas por Materia y Grado
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
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No se encontraron tareas</p>
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
                    {/* Header del grupo - Clickeable */}
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
                          <span>{group.teacherName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Badges de estado */}
                        <div className="flex gap-2">
                          {pendingCount > 0 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              {pendingCount} pendientes
                            </span>
                          )}
                          {closedCount > 0 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
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

                    {/* Contenido expandible - Lista de tareas */}
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
                                      Vence: {new Date(task.dueDate).toLocaleDateString()}
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
                                  {task.status === 'pending' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCloseTask(task)}
                                      className="text-orange-600 hover:text-orange-700"
                                      title="Cerrar tarea"
                                    >
                                      <LockKeyhole className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(task)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
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

      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={() => setModalMode(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Complete los datos para crear una nueva tarea'
                : 'Modifique los datos de la tarea'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Ejercicios de Algebra"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los detalles de la tarea..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nivel *</Label>
                <Select value={formData.level} onValueChange={(value: 'Inicial' | 'Primaria' | 'Secundaria') => setFormData({ ...formData, level: value, gradeSectionId: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inicial">Inicial</SelectItem>
                    <SelectItem value="Primaria">Primaria</SelectItem>
                    <SelectItem value="Secundaria">Secundaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeSectionId">Grado/Sección *</Label>
                <Select value={formData.gradeSectionId} onValueChange={(value) => setFormData({ ...formData, gradeSectionId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grado/sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGradeSectionsForForm.map((gs) => (
                      <SelectItem key={gs.id} value={gs.id}>
                        {gs.grade} {gs.section} ({gs.turno})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedDate">Fecha de Asignacion *</Label>
                <Input
                  id="assignedDate"
                  type="date"
                  value={formData.assignedDate}
                  onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Puntaje Maximo *</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="100"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Archivo opcional */}
            <div className="space-y-2">
              <Label>Archivo Adjunto (opcional)</Label>
              {formData.attachmentName ? (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Paperclip className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-sm truncate">{formData.attachmentName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, attachmentName: '', attachmentUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormData({
                          ...formData,
                          attachmentName: file.name,
                          attachmentUrl: URL.createObjectURL(file)
                        })
                      }
                    }}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">PDF, Word, PPT o imágenes (máx. 10MB)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === 'view'} onOpenChange={() => setModalMode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Tarea</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Titulo</Label>
                  <p className="font-medium mt-1">{selectedTask.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nivel</Label>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getLevelColor(selectedTask.level)}`}>
                    {selectedTask.level}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Descripcion</Label>
                <p className="mt-1">{selectedTask.description || 'Sin descripcion'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Curso</Label>
                  <p className="mt-1">{selectedTask.courseName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grado/Seccion</Label>
                  <p className="mt-1">{selectedTask.gradeSection}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Profesor</Label>
                  <p className="mt-1">{selectedTask.teacherName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getStatusColor(selectedTask.status)}`}>
                    {getStatusText(selectedTask.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha de Asignacion</Label>
                  <p className="mt-1">{new Date(selectedTask.assignedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Vencimiento</Label>
                  <p className="mt-1">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Puntaje Maximo</Label>
                  <p className="mt-1">{selectedTask.maxScore} puntos</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Estudiantes</Label>
                  <p className="mt-1">{selectedTask.totalStudents}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === 'delete'} onOpenChange={() => setModalMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminacion</DialogTitle>
            <DialogDescription>
              Esta seguro que desea eliminar esta tarea? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="py-4">
              <p className="font-medium">{selectedTask.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTask.courseName} - {selectedTask.gradeSection}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === 'close'} onOpenChange={() => setModalMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Tarea</DialogTitle>
            <DialogDescription>
              Esta seguro que desea cerrar esta tarea? Los estudiantes ya no podran enviar entregas.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="py-4">
              <p className="font-medium">{selectedTask.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTask.courseName} - {selectedTask.gradeSection}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Nivel: {selectedTask.level} | Estudiantes: {selectedTask.totalStudents}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={confirmCloseTask} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cerrando...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4 mr-2" />
                  Cerrar Tarea
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Calificación */}
      <Dialog open={modalMode === 'grade'} onOpenChange={() => setModalMode(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Calificar Tarea
            </DialogTitle>
            <DialogDescription>
              Ingrese las calificaciones para cada estudiante
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              {/* Info de la tarea */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTask.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTask.courseName} - {selectedTask.gradeSection}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm mt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Vence: {new Date(selectedTask.dueDate).toLocaleDateString()}
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
                <div className="max-h-[300px] overflow-y-auto divide-y">
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)}>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
