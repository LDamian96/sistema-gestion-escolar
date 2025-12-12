'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  X,
  Save,
  Star,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Task {
  id: number
  title: string
  course: string
  dueDate: string
  created: string
  submissions: number
  total: number
  status: 'active' | 'grading' | 'completed'
  maxGrade: number
  hasFile: boolean
}

interface StudentSubmission {
  id: number
  name: string
  avatar: string
  submittedAt: string | null
  file: string | null
  grade: number | null
  maxGrade: number
  status: 'pending' | 'submitted' | 'graded' | 'not_submitted'
}

const tasks: Task[] = [
  { id: 1, title: 'Ejercicios de Álgebra Cap. 5', course: '6to A - Álgebra', dueDate: '2024-12-15', created: '2024-12-10', submissions: 18, total: 30, status: 'active', maxGrade: 20, hasFile: true },
  { id: 2, title: 'Problemas de Geometría', course: '6to B - Geometría', dueDate: '2024-12-14', created: '2024-12-08', submissions: 25, total: 31, status: 'active', maxGrade: 20, hasFile: true },
  { id: 3, title: 'Trabajo Práctico Matemáticas', course: '5to A - Matemáticas', dueDate: '2024-12-12', created: '2024-12-05', submissions: 32, total: 32, status: 'grading', maxGrade: 20, hasFile: false },
  { id: 4, title: 'Tarea de Fracciones', course: '5to B - Matemáticas', dueDate: '2024-12-10', created: '2024-12-03', submissions: 28, total: 28, status: 'completed', maxGrade: 20, hasFile: true },
  { id: 5, title: 'Proyecto Final', course: '6to A - Álgebra', dueDate: '2024-12-20', created: '2024-12-01', submissions: 5, total: 30, status: 'active', maxGrade: 20, hasFile: true },
]

const studentSubmissions: StudentSubmission[] = [
  { id: 1, name: 'Ana Martínez', avatar: 'AM', submittedAt: '2024-12-10 14:30', file: 'tarea_ana.pdf', grade: 18, maxGrade: 20, status: 'graded' },
  { id: 2, name: 'Carlos López', avatar: 'CL', submittedAt: '2024-12-10 15:45', file: 'ejercicios_carlos.pdf', grade: 15, maxGrade: 20, status: 'graded' },
  { id: 3, name: 'Diana García', avatar: 'DG', submittedAt: '2024-12-11 09:20', file: 'diana_algebra.pdf', grade: null, maxGrade: 20, status: 'submitted' },
  { id: 4, name: 'Eduardo Sánchez', avatar: 'ES', submittedAt: '2024-12-11 10:15', file: 'tarea_eduardo.pdf', grade: null, maxGrade: 20, status: 'submitted' },
  { id: 5, name: 'Fernanda Ruiz', avatar: 'FR', submittedAt: null, file: null, grade: null, maxGrade: 20, status: 'pending' },
  { id: 6, name: 'Gabriel Torres', avatar: 'GT', submittedAt: '2024-12-10 16:00', file: 'gabriel_cap5.pdf', grade: 16, maxGrade: 20, status: 'graded' },
  { id: 7, name: 'Helena Vargas', avatar: 'HV', submittedAt: null, file: null, grade: null, maxGrade: 20, status: 'pending' },
  { id: 8, name: 'Iván Mendoza', avatar: 'IM', submittedAt: '2024-12-11 08:30', file: 'ivan_ejercicios.pdf', grade: null, maxGrade: 20, status: 'submitted' },
]

export default function TeacherTareasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradingModal, setShowGradingModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [submissions, setSubmissions] = useState(studentSubmissions)
  const [newTask, setNewTask] = useState({
    title: '',
    course: '',
    dueDate: '',
    maxGrade: '20',
    description: ''
  })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-600">Activa</span>
      case 'grading':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-600">Por Calificar</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600">Completada</span>
      default:
        return null
    }
  }

  const handleGradeStudent = (studentId: number, grade: number | null) => {
    setSubmissions(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, grade, status: grade !== null ? 'graded' as const : s.status }
        : s
    ))
  }

  const handleMarkNotSubmitted = (studentId: number) => {
    setSubmissions(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, status: 'not_submitted' as const, grade: null }
        : s
    ))
  }

  const openGradingModal = (task: Task) => {
    setSelectedTask(task)
    setShowGradingModal(true)
  }

  const getGradeColor = (grade: number, max: number) => {
    const percentage = (grade / max) * 100
    if (percentage >= 90) return 'text-green-500'
    if (percentage >= 75) return 'text-blue-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const stats = {
    active: tasks.filter(t => t.status === 'active').length,
    grading: submissions.filter(s => s.status === 'submitted').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Tareas</h1>
          <p className="text-muted-foreground mt-1">Crea, asigna y califica tareas de tus cursos</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tareas Activas', value: stats.active, icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Por Calificar', value: stats.grading, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'grading', label: 'Por Calificar' },
                { value: 'completed', label: 'Completadas' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={filterStatus === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{task.title}</p>
                    {getStatusBadge(task.status)}
                    {task.hasFile && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-600 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Con archivo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>{task.course}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Entrega: {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {task.submissions}/{task.total} entregas
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Nota máx: {task.maxGrade}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Progress */}
                  <div className="w-full sm:w-24">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{Math.round((task.submissions / task.total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(task.submissions / task.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(task.status === 'grading' || task.status === 'active') && (
                      <Button size="sm" onClick={() => openGradingModal(task)}>
                        <Star className="h-4 w-4 mr-1" />
                        Calificar
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => openGradingModal(task)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Notas
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
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
                <h2 className="text-xl font-semibold">Nueva Tarea</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título de la Tarea</label>
                  <Input
                    placeholder="Ej: Ejercicios de Álgebra Cap. 5"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Curso</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={newTask.course}
                      onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="5to A - Matemáticas">5to A - Matemáticas</option>
                      <option value="5to B - Matemáticas">5to B - Matemáticas</option>
                      <option value="6to A - Álgebra">6to A - Álgebra</option>
                      <option value="6to B - Geometría">6to B - Geometría</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha de Entrega</label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nota Máxima</label>
                  <Input
                    type="number"
                    value={newTask.maxGrade}
                    onChange={(e) => setNewTask({ ...newTask, maxGrade: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción / Instrucciones</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="Instrucciones para los estudiantes..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Archivo Adjunto (opcional)</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Arrastra un archivo o haz clic para seleccionar</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, hasta 10MB</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Tarea
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grading Modal */}
      <AnimatePresence>
        {showGradingModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGradingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedTask.course} - Nota máxima: {selectedTask.maxGrade}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowGradingModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {submissions.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.status === 'pending' ? (
                                <span className="text-orange-500">Sin entregar</span>
                              ) : student.status === 'submitted' ? (
                                <span className="text-blue-500">Entregado: {student.submittedAt}</span>
                              ) : student.status === 'not_submitted' ? (
                                <span className="text-red-500">No Entregó</span>
                              ) : (
                                <span className="text-green-500">Calificado</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          {/* File download */}
                          {student.file && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              {student.file}
                            </Button>
                          )}

                          {/* No Entregó button for pending students */}
                          {student.status === 'pending' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleMarkNotSubmitted(student.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              No Entregó
                            </Button>
                          )}

                          {/* Grade input */}
                          {(student.status === 'submitted' || student.status === 'graded') && (
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-muted-foreground whitespace-nowrap">Nota:</label>
                              <Input
                                type="number"
                                min="0"
                                max={student.maxGrade}
                                value={student.grade ?? ''}
                                onChange={(e) => handleGradeStudent(student.id, e.target.value ? Number(e.target.value) : null)}
                                className="w-20"
                                placeholder="--"
                              />
                              <span className="text-sm text-muted-foreground">/ {student.maxGrade}</span>
                            </div>
                          )}

                          {/* Not submitted display */}
                          {student.status === 'not_submitted' && (
                            <div className="px-3 py-1 rounded-lg font-bold text-red-500 bg-red-500/10">
                              Sin nota
                            </div>
                          )}

                          {/* Grade display for completed */}
                          {student.grade !== null && (
                            <div className={`px-3 py-1 rounded-lg font-bold ${getGradeColor(student.grade, student.maxGrade)} bg-current/10`}>
                              {student.grade}/{student.maxGrade}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
                <div className="text-sm text-muted-foreground">
                  {submissions.filter(s => s.status === 'graded').length} de {submissions.filter(s => s.status !== 'pending').length} entregas calificadas
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowGradingModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setShowGradingModal(false)}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Notas
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
