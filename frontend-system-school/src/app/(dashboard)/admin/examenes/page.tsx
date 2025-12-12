'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenTool,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  BarChart3,
  BookOpen,
  Loader2,
  Upload,
  Paperclip,
  ClipboardList
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

interface Exam {
  id: string
  title: string
  subject: string
  course: string
  courseId: string
  teacher: string
  date: string
  duration: string
  totalPoints: number
  status: 'scheduled' | 'in_progress' | 'grading' | 'completed'
  studentsTotal: number
  studentsGraded: number
  averageGrade: number | null
  type: 'HOMEWORK' | 'EXAM'
  attachmentUrl?: string
  description?: string
}

interface TaskResponse {
  id: string
  title: string
  description: string
  type: string
  dueDate: string
  fileUrl?: string
  course: {
    id: string
    subject: { name: string }
    teacher: { firstName: string; lastName: string }
    classroom: {
      section: {
        name: string
        gradeLevel: { name: string }
      }
    }
  }
  _count: { submissions: number }
}

interface CourseResponse {
  id: string
  subject: { id: string; name: string }
  teacher: { firstName: string; lastName: string }
  classroom: {
    section: {
      name: string
      gradeLevel: { name: string; level: { name: string } }
    }
  }
}

export default function AdminExamenesPage() {
  const [examsList, setExamsList] = useState<Exam[]>([])
  const [coursesList, setCoursesList] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [newExam, setNewExam] = useState({
    courseId: '',
    title: '',
    description: '',
    date: '',
    type: 'EXAM' as 'HOMEWORK' | 'EXAM'
  })
  const [filterType, setFilterType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksData, coursesData] = await Promise.all([
        api.get<TaskResponse[]>('/tasks'),
        api.get<CourseResponse[]>('/courses')
      ])

      // Filtrar solo HOMEWORK y EXAM, luego transformar
      const filteredTasks = tasksData.filter(task =>
        task.type === 'HOMEWORK' || task.type === 'EXAM'
      )

      const transformedExams: Exam[] = filteredTasks.map(task => {
        const dueDate = new Date(task.dueDate)
        const now = new Date()
        let status: Exam['status'] = 'scheduled'
        if (dueDate < now) {
          status = 'completed'
        }

        return {
          id: task.id,
          title: task.title,
          subject: task.course?.subject?.name || 'Sin materia',
          course: task.course?.classroom?.section
            ? `${task.course.classroom.section.gradeLevel.name} ${task.course.classroom.section.name}`
            : 'Sin curso',
          courseId: task.course?.id || '',
          teacher: task.course?.teacher
            ? `${task.course.teacher.firstName} ${task.course.teacher.lastName}`
            : 'Sin profesor',
          date: task.dueDate?.split('T')[0] || '',
          duration: '60 min',
          totalPoints: 20,
          status,
          studentsTotal: 30,
          studentsGraded: task._count?.submissions || 0,
          averageGrade: null,
          type: task.type as Exam['type'],
          attachmentUrl: task.fileUrl,
          description: task.description
        }
      })

      setExamsList(transformedExams)
      setCoursesList(coursesData)

      // Set default courseId si hay cursos disponibles
      if (coursesData.length > 0 && !newExam.courseId) {
        setNewExam(prev => ({ ...prev, courseId: coursesData[0].id }))
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Obtener materias y cursos únicos para los filtros
  const uniqueSubjects = [...new Set(examsList.map(e => e.subject))]
  const uniqueCourses = [...new Set(examsList.map(e => e.course))]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.courseId || !newExam.date) {
      console.log('Validación fallida - campos requeridos faltantes')
      return
    }

    try {
      setCreating(true)
      let attachmentUrl: string | undefined

      // Si hay archivo y es tarea, subir primero
      if (selectedFile && newExam.type === 'HOMEWORK') {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        try {
          const uploadResponse = await api.upload<{ url: string }>('/uploads/file', formData)
          attachmentUrl = uploadResponse.url
        } catch (uploadErr) {
          console.error('Error al subir archivo:', uploadErr)
        } finally {
          setUploading(false)
        }
      }

      // Crear tarea en la API
      const createdTask = await api.post<TaskResponse>('/tasks', {
        courseId: newExam.courseId,
        title: newExam.title,
        description: newExam.description || newExam.title,
        type: newExam.type,
        dueDate: newExam.date,
        fileUrl: attachmentUrl
      })

      console.log('Tarea creada en BD:', createdTask)

      // Refrescar datos
      await fetchData()

      resetModal()
    } catch (err) {
      console.error('Error al crear tarea:', err)
      setError('Error al crear la tarea')
    } finally {
      setCreating(false)
    }
  }

  const resetModal = () => {
    setNewExam({
      courseId: coursesList.length > 0 ? coursesList[0].id : '',
      title: '',
      description: '',
      date: '',
      type: 'EXAM'
    })
    setSelectedFile(null)
    setShowCreateModal(false)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOMEWORK: 'Tarea',
      EXAM: 'Examen'
    }
    return labels[type] || type
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      HOMEWORK: 'bg-blue-500/20 text-blue-600',
      EXAM: 'bg-red-500/20 text-red-600'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-600'
  }

  const getTypeIcon = (type: string) => {
    if (type === 'HOMEWORK') {
      return <ClipboardList className="h-4 w-4 text-blue-500" />
    }
    return <PenTool className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: Exam['status']) => {
    const styles = {
      scheduled: 'bg-blue-500/20 text-blue-600',
      in_progress: 'bg-yellow-500/20 text-yellow-600',
      grading: 'bg-orange-500/20 text-orange-600',
      completed: 'bg-green-500/20 text-green-600'
    }
    const labels = {
      scheduled: 'Programado',
      in_progress: 'En Curso',
      grading: 'Calificando',
      completed: 'Completado'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const filteredExams = examsList.filter(exam => {
    const matchesSearch = searchTerm === '' ||
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.teacher.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = filterSubject === '' || exam.subject === filterSubject
    const matchesCourse = filterCourse === '' || exam.course === filterCourse
    const matchesStatus = filterStatus === '' || exam.status === filterStatus
    const matchesType = filterType === '' || exam.type === filterType

    return matchesSearch && matchesSubject && matchesCourse && matchesStatus && matchesType
  })

  const stats = {
    total: examsList.length,
    exams: examsList.filter(e => e.type === 'EXAM').length,
    homework: examsList.filter(e => e.type === 'HOMEWORK').length,
    scheduled: examsList.filter(e => e.status === 'scheduled').length,
    completed: examsList.filter(e => e.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando tareas...</p>
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
          <h1 className="font-heading text-3xl font-bold">Exámenes / Tareas</h1>
          <p className="text-muted-foreground mt-1">Administra exámenes y tareas del colegio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Exámenes', value: stats.exams, icon: PenTool, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Tareas', value: stats.homework, icon: ClipboardList, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Programadas', value: stats.scheduled, icon: Calendar, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
          { label: 'Completadas', value: stats.completed, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
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

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, materia, curso o profesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="">Todas las materias</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">Todos los grados</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="EXAM">Examen</option>
                <option value="HOMEWORK">Tarea</option>
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="scheduled">Programado</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filterType === 'EXAM' ? 'Lista de Exámenes' : filterType === 'HOMEWORK' ? 'Lista de Tareas' : 'Lista de Tareas y Exámenes'}
          </CardTitle>
          <CardDescription>
            {filterType === 'EXAM'
              ? 'Todos los exámenes registrados en el sistema'
              : filterType === 'HOMEWORK'
                ? 'Todas las tareas registradas en el sistema'
                : 'Todas las tareas y exámenes registrados en el sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Título</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Curso</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Profesor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entregas</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam, index) => (
                  <motion.tr
                    key={exam.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${exam.type === 'HOMEWORK' ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                          {getTypeIcon(exam.type)}
                        </div>
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-sm text-muted-foreground">{exam.subject}</p>
                          {exam.attachmentUrl && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-500">
                              <Paperclip className="h-3 w-3" />
                              Archivo adjunto
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(exam.type)}`}>
                        {getTypeLabel(exam.type)}
                      </span>
                    </td>
                    <td className="py-4 px-4">{exam.course}</td>
                    <td className="py-4 px-4">{exam.teacher}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {exam.date}
                      </div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(exam.status)}</td>
                    <td className="py-4 px-4">
                      <div className="w-20">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{exam.studentsGraded}/{exam.studentsTotal}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(exam.studentsGraded / exam.studentsTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedExam(exam)
                            setShowDetailModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl shadow-xl w-full max-w-2xl"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedExam.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedExam.subject} - {selectedExam.course}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Profesor</p>
                    <p className="font-medium">{selectedExam.teacher}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                    <p className="font-medium">{selectedExam.date}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Duración</p>
                    <p className="font-medium">{selectedExam.duration}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Puntaje Total</p>
                    <p className="font-medium">{selectedExam.totalPoints} puntos</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Progreso de Calificación</h3>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex justify-between mb-2">
                      <span>Estudiantes calificados</span>
                      <span className="font-medium">{selectedExam.studentsGraded} / {selectedExam.studentsTotal}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(selectedExam.studentsGraded / selectedExam.studentsTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {selectedExam.averageGrade !== null && (
                  <div>
                    <h3 className="font-medium mb-3">Estadísticas</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-green-500/10 text-center">
                        <p className="text-2xl font-bold text-green-500">{selectedExam.averageGrade.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Promedio</p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-500/10 text-center">
                        <p className="text-2xl font-bold text-blue-500">18</p>
                        <p className="text-sm text-muted-foreground">Nota más alta</p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/10 text-center">
                        <p className="text-2xl font-bold text-red-500">11</p>
                        <p className="text-sm text-muted-foreground">Nota más baja</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Reporte
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h2 className="text-xl font-semibold">Crear Nueva Tarea/Examen</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo *</label>
                    <select
                      value={newExam.type}
                      onChange={(e) => {
                        setNewExam({ ...newExam, type: e.target.value as 'HOMEWORK' | 'EXAM' })
                        if (e.target.value === 'EXAM') {
                          setSelectedFile(null)
                        }
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="EXAM">Examen</option>
                      <option value="HOMEWORK">Tarea</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha de Entrega *</label>
                    <Input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Curso *</label>
                  <select
                    value={newExam.courseId}
                    onChange={(e) => setNewExam({ ...newExam, courseId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {coursesList.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.subject.name} - {course.classroom.section.gradeLevel.name} {course.classroom.section.name} ({course.teacher.firstName} {course.teacher.lastName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    placeholder={newExam.type === 'EXAM' ? 'Ej: Examen Parcial de Matemáticas' : 'Ej: Tarea de Investigación'}
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción</label>
                  <textarea
                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder={newExam.type === 'EXAM' ? 'Instrucciones del examen...' : 'Instrucciones de la tarea...'}
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  />
                </div>

                {/* File upload - solo para tareas */}
                {newExam.type === 'HOMEWORK' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Archivo adjunto (opcional)
                      <span className="text-xs text-muted-foreground ml-2">
                        El alumno podrá descargar este archivo
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                      {selectedFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{selectedFile.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                          />
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <span className="text-sm">Click para seleccionar archivo</span>
                            <span className="text-xs">PDF, DOC, XLS, PPT, imágenes</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={resetModal} disabled={creating}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateExam}
                  disabled={!newExam.title || !newExam.courseId || !newExam.date || creating || uploading}
                >
                  {creating || uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Subiendo archivo...' : creating ? 'Creando...' : `Crear ${newExam.type === 'EXAM' ? 'Examen' : 'Tarea'}`}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
