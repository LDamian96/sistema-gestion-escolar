'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenTool,
  Plus,
  Search,
  Calendar,
  FileText,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  ClipboardList
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tasks as mockTasks, courses as mockCourses, getCourseFullName, gradeSections } from '@/lib/mock-data'

interface ExamDisplay {
  id: string
  title: string
  description: string
  subject: string
  course: string
  teacher: string
  date: string
  type: 'HOMEWORK' | 'EXAM' | 'PROJECT' | 'QUIZ'
  status: 'scheduled' | 'completed'
}

export default function AdminExamenesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState<ExamDisplay | null>(null)
  const [newExam, setNewExam] = useState({
    courseId: mockCourses[0]?.id || '',
    title: '',
    description: '',
    date: '',
    type: 'EXAM' as 'HOMEWORK' | 'EXAM',
    duration: '60',
    totalPoints: '20'
  })
  const [modalFilterLevel, setModalFilterLevel] = useState<'all' | 'Primaria' | 'Secundaria'>('all')
  const [modalFilterGradeSection, setModalFilterGradeSection] = useState<string>('all')

  // Grado/Secciones filtrados por nivel en el modal
  const filteredGradeSectionsForModal = useMemo(() => {
    if (modalFilterLevel === 'all') {
      return gradeSections.map(gs => gs.name).sort()
    }
    return gradeSections
      .filter(gs => gs.level === modalFilterLevel)
      .map(gs => gs.name)
      .sort()
  }, [modalFilterLevel])

  // Cursos filtrados por nivel y grado/sección en el modal
  const filteredCoursesForModal = useMemo(() => {
    return mockCourses.filter(course => {
      const gradeSection = `${course.classroom.section.gradeLevel.name} ${course.classroom.section.name}`

      // Filtrar por nivel
      if (modalFilterLevel !== 'all') {
        const gsInfo = gradeSections.find(gs => gs.name === gradeSection)
        if (!gsInfo || gsInfo.level !== modalFilterLevel) return false
      }

      // Filtrar por grado/sección
      if (modalFilterGradeSection !== 'all') {
        if (gradeSection !== modalFilterGradeSection) return false
      }

      return true
    })
  }, [modalFilterLevel, modalFilterGradeSection])

  // Transformar tareas a formato de examen
  const examsList = useMemo<ExamDisplay[]>(() => {
    return mockTasks.map(task => {
      const now = new Date()
      const dueDate = new Date(task.dueDate)
      const status = dueDate < now ? 'completed' : 'scheduled'

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        subject: task.course.subject.name,
        course: getCourseFullName(task.course),
        teacher: task.course.teacher
          ? `${task.course.teacher.firstName} ${task.course.teacher.lastName}`
          : 'Sin profesor',
        date: task.dueDate.split('T')[0],
        type: task.type,
        status
      }
    })
  }, [])

  // Obtener materias y cursos unicos para filtros
  const uniqueSubjects = [...new Set(examsList.map(e => e.subject))]

  // Filtrar examenes
  const filteredExams = useMemo(() => {
    return examsList.filter(exam => {
      const matchesSearch = searchTerm === '' ||
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.course.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === '' || exam.type === filterType
      const matchesStatus = filterStatus === '' || exam.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [examsList, searchTerm, filterType, filterStatus])

  // Estadisticas
  const stats = useMemo(() => ({
    total: examsList.length,
    exams: examsList.filter(e => e.type === 'EXAM').length,
    homework: examsList.filter(e => e.type === 'HOMEWORK').length,
    scheduled: examsList.filter(e => e.status === 'scheduled').length,
    completed: examsList.filter(e => e.status === 'completed').length
  }), [examsList])

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOMEWORK: 'Tarea',
      EXAM: 'Examen',
      PROJECT: 'Proyecto',
      QUIZ: 'Quiz'
    }
    return labels[type] || type
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      HOMEWORK: 'bg-blue-500/20 text-blue-600',
      EXAM: 'bg-red-500/20 text-red-600',
      PROJECT: 'bg-purple-500/20 text-purple-600',
      QUIZ: 'bg-orange-500/20 text-orange-600'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-600'
  }

  const getTypeIcon = (type: string) => {
    if (type === 'HOMEWORK') return <ClipboardList className="h-4 w-4 text-blue-500" />
    return <PenTool className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-500/20 text-blue-600',
      completed: 'bg-green-500/20 text-green-600'
    }
    const labels = {
      scheduled: 'Programado',
      completed: 'Completado'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const handleCreateExam = () => {
    alert(`${newExam.type === 'EXAM' ? 'Examen' : 'Tarea'} "${newExam.title}" creado (modo estatico - no persistente)`)
    setShowCreateModal(false)
    setNewExam({
      courseId: mockCourses[0]?.id || '',
      title: '',
      description: '',
      date: '',
      type: 'EXAM',
      duration: '60',
      totalPoints: '20'
    })
    setModalFilterLevel('all')
    setModalFilterGradeSection('all')
  }

  // Reset gradeSection filter when level changes
  const handleModalLevelChange = (level: 'all' | 'Primaria' | 'Secundaria') => {
    setModalFilterLevel(level)
    setModalFilterGradeSection('all')
    setNewExam(prev => ({ ...prev, courseId: '' }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Examenes / Tareas</h1>
          <p className="text-muted-foreground mt-1">Administra examenes y tareas del colegio</p>
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
          { label: 'Examenes', value: stats.exams, icon: PenTool, color: 'text-red-500', bgColor: 'bg-red-500/10' },
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
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="EXAM">Examen</option>
                <option value="HOMEWORK">Tarea</option>
                <option value="PROJECT">Proyecto</option>
                <option value="QUIZ">Quiz</option>
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
          <CardTitle>Lista de Tareas y Examenes ({filteredExams.length})</CardTitle>
          <CardDescription>Todas las tareas y examenes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Titulo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Curso</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Profesor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.slice(0, 20).map((exam, index) => (
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
          {filteredExams.length > 20 && (
            <div className="text-center text-muted-foreground mt-4">
              Mostrando 20 de {filteredExams.length} tareas
            </div>
          )}
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
              className="bg-background rounded-xl shadow-xl w-full max-w-lg"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedExam.title}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                    <p className="font-medium">{getTypeLabel(selectedExam.type)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Estado</p>
                    {getStatusBadge(selectedExam.status)}
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Materia</p>
                    <p className="font-medium">{selectedExam.subject}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                    <p className="font-medium">{selectedExam.date}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Curso</p>
                  <p className="font-medium">{selectedExam.course}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Profesor</p>
                  <p className="font-medium">{selectedExam.teacher}</p>
                </div>
                {selectedExam.description && (
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Descripcion</p>
                    <p>{selectedExam.description}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
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
              className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Crear {newExam.type === 'EXAM' ? 'Examen' : 'Tarea'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {/* Título */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    placeholder="Ej: Examen Parcial de Matemáticas"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo *</label>
                  <select
                    value={newExam.type}
                    onChange={(e) => setNewExam({ ...newExam, type: e.target.value as 'HOMEWORK' | 'EXAM' })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="EXAM">Examen</option>
                    <option value="HOMEWORK">Tarea</option>
                  </select>
                </div>

                {/* Filtros de Nivel y Grado/Sección */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nivel</label>
                    <select
                      value={modalFilterLevel}
                      onChange={(e) => handleModalLevelChange(e.target.value as 'all' | 'Primaria' | 'Secundaria')}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="all">Todos los niveles</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Grado/Sección</label>
                    <select
                      value={modalFilterGradeSection}
                      onChange={(e) => {
                        setModalFilterGradeSection(e.target.value)
                        setNewExam(prev => ({ ...prev, courseId: '' }))
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="all">Todos</option>
                      {filteredGradeSectionsForModal.map(gs => (
                        <option key={gs} value={gs}>{gs}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Curso */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Curso *</label>
                  <select
                    value={newExam.courseId}
                    onChange={(e) => setNewExam({ ...newExam, courseId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Seleccionar curso...</option>
                    {filteredCoursesForModal.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.subject.name} - {course.classroom.section.gradeLevel.name} {course.classroom.section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha y Duración */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha *</label>
                    <Input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duración (min)</label>
                    <Input
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                    />
                  </div>
                </div>

                {/* Puntaje Total */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Puntaje Total</label>
                  <Input
                    type="number"
                    value={newExam.totalPoints}
                    onChange={(e) => setNewExam({ ...newExam, totalPoints: e.target.value })}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción (opcional)</label>
                  <textarea
                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="Instrucciones adicionales..."
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateExam}
                  disabled={!newExam.title || !newExam.courseId || !newExam.date}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear {newExam.type === 'EXAM' ? 'Examen' : 'Tarea'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
