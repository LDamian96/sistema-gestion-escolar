'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  Download,
  File,
  BookOpen,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Award,
  User,
  Loader2,
  Search,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { tasksService, studentsService, type Task, type Student } from '@/services/mock-data'

interface StudentTask extends Task {
  submittedAt?: string
  submissionFile?: string
  submissionNotes?: string
  grade?: number
  feedback?: string
  studentStatus: 'pending' | 'submitted' | 'graded' | 'overdue'
}

const studentTaskData: Record<string, Partial<StudentTask>> = {
  'task1': { studentStatus: 'pending' },
  'task2': { studentStatus: 'pending' },
  'task3': { studentStatus: 'submitted', submittedAt: '2024-12-13', submissionFile: 'informe_laboratorio.pdf', submissionNotes: 'Adjunto el informe completo del experimento' },
  'task4': { studentStatus: 'graded', submittedAt: '2024-12-12', submissionFile: 'vocabulario.pdf', grade: 18, feedback: 'Excelente trabajo. Muy completo.' },
  'task5': { studentStatus: 'pending' },
  'task6': { studentStatus: 'overdue' }
}

const CURRENT_STUDENT_ID = 's1'

export default function StudentTareasPage() {
  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<StudentTask | null>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allTasks, allStudents] = await Promise.all([
        tasksService.getAll(),
        studentsService.getAll()
      ])

      const student = allStudents.find(s => s.id === CURRENT_STUDENT_ID)
      setCurrentStudent(student || null)

      if (student) {
        const myTasks = allTasks
          .filter(task => task.gradeSection === student.gradeSection)
          .map(task => {
            const studentData = studentTaskData[task.id] || { studentStatus: 'pending' }
            const today = new Date().toISOString().split('T')[0]

            let status = studentData.studentStatus || 'pending'
            if (status === 'pending' && task.dueDate < today) {
              status = 'overdue'
            }

            return {
              ...task,
              ...studentData,
              studentStatus: status as 'pending' | 'submitted' | 'graded' | 'overdue'
            }
          })

        setTasks(myTasks)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (selectedStatus === 'pending') {
      result = result.filter(task => task.studentStatus === 'pending' || task.studentStatus === 'overdue')
    } else if (selectedStatus !== 'all') {
      result = result.filter(task => task.studentStatus === selectedStatus)
    }

    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return result
  }, [tasks, selectedStatus, searchTerm])

  const tasksBySubject = useMemo(() => {
    const grouped: { [key: string]: StudentTask[] } = {}
    filteredTasks.forEach(task => {
      const subject = task.courseName || 'Sin Materia'
      if (!grouped[subject]) grouped[subject] = []
      grouped[subject].push(task)
    })
    Object.keys(grouped).forEach(subject => {
      grouped[subject].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    })
    return grouped
  }, [filteredTasks])

  const subjects = useMemo(() => Object.keys(tasksBySubject).sort(), [tasksBySubject])

  const stats = useMemo(() => ({
    pending: tasks.filter(t => t.studentStatus === 'pending' || t.studentStatus === 'overdue').length,
    submitted: tasks.filter(t => t.studentStatus === 'submitted').length,
    graded: tasks.filter(t => t.studentStatus === 'graded').length,
    overdue: tasks.filter(t => t.studentStatus === 'overdue').length,
    total: tasks.length
  }), [tasks])

  const scrollToSubject = (subject: string) => {
    const element = sectionRefs.current[subject]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500'
      case 'submitted': return 'bg-blue-500'
      case 'graded': return 'bg-emerald-500'
      case 'overdue': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'submitted': return 'Entregada'
      case 'graded': return 'Calificada'
      case 'overdue': return 'No Entregó'
      default: return status
    }
  }

  const handleViewTask = (task: StudentTask) => {
    setSelectedTask(task)
    setViewModalOpen(true)
  }

  const handleOpenSubmitModal = (task: StudentTask) => {
    setSelectedTask(task)
    setSubmissionFile(null)
    setSubmissionNotes('')
    setSubmitModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0])
    }
  }

  const handleSubmitTask = async () => {
    if (!selectedTask || !submissionFile) {
      toast({
        title: 'Error',
        description: 'Debes adjuntar un archivo',
        type: 'error'
      })
      return
    }

    try {
      setSubmitting(true)
      await new Promise(resolve => setTimeout(resolve, 1500))

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id
            ? {
                ...task,
                studentStatus: 'submitted' as const,
                submittedAt: new Date().toISOString().split('T')[0],
                submissionFile: submissionFile.name,
                submissionNotes
              }
            : task
        )
      )

      toast({
        title: 'Tarea Entregada',
        description: 'Tu tarea ha sido enviada exitosamente',
        type: 'success'
      })

      setSubmitModalOpen(false)
      setSelectedTask(null)
      setSubmissionFile(null)
      setSubmissionNotes('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la tarea',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentStudent && (
                <Avatar className="h-16 w-16 ring-4 ring-white/20">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Mis Tareas</h1>
                <p className="text-white/80 mt-1">
                  {currentStudent?.firstName} {currentStudent?.lastName} • {currentStudent?.gradeSection}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm py-1.5 self-start sm:self-auto">
              {filteredTasks.length} tareas
            </Badge>
          </div>
        </div>
        <Sparkles className="absolute right-4 top-4 h-8 w-8 text-white/20" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pendientes', value: stats.pending, icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500', filter: 'pending' },
          { label: 'Entregadas', value: stats.submitted, icon: Upload, bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-500', filter: 'submitted' },
          { label: 'Calificadas', value: stats.graded, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-500', filter: 'graded' },
          { label: 'Total', value: stats.total, icon: FileText, bg: 'bg-purple-50 dark:bg-purple-950/30', iconBg: 'bg-purple-500', filter: 'all' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`border-0 ${stat.bg} cursor-pointer hover:shadow-xl transition-all duration-300 ${selectedStatus === stat.filter ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedStatus(stat.filter)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <Card className="border-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas por título o materia..."
              className="pl-10 bg-white dark:bg-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Estado
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'pending', label: 'Pendientes' },
                { value: 'submitted', label: 'Entregadas' },
                { value: 'graded', label: 'Calificadas' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedStatus === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación por Materias */}
      {subjects.length > 0 && (
        <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              Ir a Materia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 flex-wrap">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToSubject(subject)}
                  className="gap-2 bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                >
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  {subject}
                  <Badge variant="secondary" className="ml-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {tasksBySubject[subject].length}
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Tareas */}
      {subjects.length === 0 ? (
        <Card className="border-0">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'No se encontraron tareas' : 'No hay tareas en esta categoría'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {subjects.map((subject, subjectIndex) => (
            <motion.div
              key={subject}
              ref={(el) => { sectionRefs.current[subject] = el }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: subjectIndex * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/20">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-lg">{subject}</span>
                        <p className="text-sm font-normal text-white/80">
                          {tasksBySubject[subject].length} tarea(s)
                        </p>
                      </div>
                    </CardTitle>
                    <Badge className="bg-white/20 text-white border-0">
                      {tasksBySubject[subject].filter(t => t.studentStatus === 'pending' || t.studentStatus === 'overdue').length} pendientes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {tasksBySubject[subject].map((task, index) => {
                      const isPastDue = task.studentStatus === 'overdue'

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`p-4 hover:bg-muted/50 transition-colors relative ${isPastDue ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}
                        >
                          {isPastDue && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                          )}
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{task.title}</h3>
                                <span className={`px-2.5 py-1 text-xs rounded-full text-white font-medium ${getStatusColor(task.studentStatus)}`}>
                                  {getStatusText(task.studentStatus)}
                                </span>
                                {isPastDue && (
                                  <span className="px-2.5 py-1 text-xs rounded-full bg-rose-500 text-white font-medium flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Vencida
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <User className="h-4 w-4" />
                                  {task.teacherName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  Vence: {new Date(task.dueDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Award className="h-4 w-4" />
                                  {task.maxScore} pts
                                </span>
                              </div>
                            </div>

                            {task.studentStatus === 'graded' && task.grade !== undefined && (
                              <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${task.grade >= task.maxScore * 0.6 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                  <span className="text-lg font-bold text-white">{task.grade}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">de {task.maxScore}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewTask(task)} className="gap-2">
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
                              {(task.studentStatus === 'pending' || task.studentStatus === 'overdue') && (
                                <Button size="sm" onClick={() => handleOpenSubmitModal(task)} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                                  <Upload className="h-4 w-4" />
                                  Entregar
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Ver Detalles */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalles de la Tarea
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <p className="text-sm text-muted-foreground mb-1">Título</p>
                <p className="font-semibold text-lg">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Materia</p>
                  <p className="font-medium">{selectedTask.courseName}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Profesor</p>
                  <p className="font-medium">{selectedTask.teacherName}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                  <p className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Puntaje Máximo</p>
                  <p className="font-medium">{selectedTask.maxScore} puntos</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Estado</p>
                <span className={`inline-block px-3 py-1.5 text-sm rounded-full text-white font-medium ${getStatusColor(selectedTask.studentStatus)}`}>
                  {getStatusText(selectedTask.studentStatus)}
                </span>
              </div>

              {selectedTask.submittedAt && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                  <p className="font-medium">{new Date(selectedTask.submittedAt).toLocaleDateString('es-ES')}</p>
                  {selectedTask.submissionFile && (
                    <div className="flex items-center gap-2 mt-2">
                      <File className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{selectedTask.submissionFile}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedTask.studentStatus === 'graded' && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-3">Calificación</p>
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${(selectedTask.grade || 0) >= selectedTask.maxScore * 0.6 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      <span className="text-2xl font-bold text-white">{selectedTask.grade}</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">de {selectedTask.maxScore} puntos</p>
                      <p className={`text-sm ${(selectedTask.grade || 0) >= selectedTask.maxScore * 0.6 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {(selectedTask.grade || 0) >= selectedTask.maxScore * 0.6 ? 'Aprobado' : 'Desaprobado'}
                      </p>
                    </div>
                  </div>
                  {selectedTask.feedback && (
                    <div className="mt-4 p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Retroalimentación del profesor</p>
                      <p className="text-sm">{selectedTask.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Entregar Tarea */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Entregar Tarea
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Tarea</p>
                <p className="font-medium">{selectedTask.title}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Materia</p>
                <p className="font-medium">{selectedTask.courseName}</p>
              </div>

              <div>
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Archivo *
                </Label>
                <div className="mt-2">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90 file:cursor-pointer
                      cursor-pointer"
                    accept=".pdf,.doc,.docx,.zip,.rar"
                  />
                  {submissionFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{submissionFile.name}</span>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formatos: PDF, DOC, DOCX, ZIP, RAR (Máx. 10MB)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas (Opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Agrega comentarios sobre tu entrega..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Una vez entregada la tarea, no podrás modificarla. Asegúrate de revisar tu trabajo antes de enviar.
                </p>
              </div>
            </motion.div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmitModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitTask}
              disabled={submitting || !submissionFile}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Entregar Tarea
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
