'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTasks, useCourses, useStaticData } from '@/lib/use-mock-data'
import type { Task, Course } from '@/lib/mock-data'

interface TaskDisplay {
  id: string
  title: string
  subject: string
  course: string
  courseId: string
  teacher: string
  date: string
  status: 'scheduled' | 'completed'
  studentsTotal: number
  studentsSubmitted: number
  description?: string
  level: string
  type: Task['type']
}

export default function AdminTareasPage() {
  const { homework, loading: loadingTasks, addTask, deleteTask } = useTasks()
  const { courses, loading: loadingCourses } = useCourses()
  const { levels } = useStaticData()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskDisplay | null>(null)
  const [newTask, setNewTask] = useState({
    courseId: '',
    title: '',
    description: '',
    date: '',
    type: 'HOMEWORK' as Task['type']
  })
  const [createFilterLevel, setCreateFilterLevel] = useState('')
  const [creating, setCreating] = useState(false)

  const loading = loadingTasks || loadingCourses

  // Transform tasks to display format
  const tasksList: TaskDisplay[] = useMemo(() => {
    return homework.map(task => {
      const dueDate = new Date(task.dueDate)
      const now = new Date()
      const status: TaskDisplay['status'] = dueDate < now ? 'completed' : 'scheduled'

      return {
        id: task.id,
        title: task.title,
        subject: task.course?.subject?.name || 'Sin materia',
        course: task.course?.classroom
          ? `${task.course.classroom.section.gradeLevel.name} ${task.course.classroom.section.name}`
          : 'Sin curso',
        courseId: task.courseId,
        teacher: task.course?.teacher
          ? `${task.course.teacher.firstName} ${task.course.teacher.lastName}`
          : 'Sin profesor',
        date: task.dueDate.split('T')[0],
        status,
        studentsTotal: 25,
        studentsSubmitted: Math.floor(Math.random() * 20),
        description: task.description,
        level: task.course?.classroom?.section.gradeLevel.level.name || '',
        type: task.type
      }
    })
  }, [homework])

  // Get unique values for filters
  const uniqueLevels = [...new Set(tasksList.map(t => t.level).filter(Boolean))]
  const uniqueSubjects = [...new Set(tasksList.map(t => t.subject))]

  // Filter courses by selected level in create modal
  const filteredCoursesForCreate = useMemo(() => {
    if (!createFilterLevel) return courses
    return courses.filter(c => c.classroom.section.gradeLevel.level.name === createFilterLevel)
  }, [courses, createFilterLevel])

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.courseId || !newTask.date) return

    setCreating(true)
    await new Promise(resolve => setTimeout(resolve, 300))

    addTask({
      title: newTask.title,
      description: newTask.description || newTask.title,
      type: newTask.type,
      dueDate: new Date(newTask.date).toISOString(),
      courseId: newTask.courseId
    })

    setCreating(false)
    resetModal()
  }

  const handleDeleteTask = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return
    deleteTask(id)
  }

  const resetModal = () => {
    setNewTask({
      courseId: '',
      title: '',
      description: '',
      date: '',
      type: 'HOMEWORK'
    })
    setCreateFilterLevel('')
    setShowCreateModal(false)
  }

  const getStatusBadge = (status: TaskDisplay['status']) => {
    const styles = {
      scheduled: 'bg-blue-500/20 text-blue-600',
      completed: 'bg-green-500/20 text-green-600'
    }
    const labels = {
      scheduled: 'Pendiente',
      completed: 'Completada'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getTypeBadge = (type: Task['type']) => {
    const styles: Record<Task['type'], string> = {
      HOMEWORK: 'bg-blue-500/20 text-blue-600',
      EXAM: 'bg-red-500/20 text-red-600',
      PROJECT: 'bg-purple-500/20 text-purple-600',
      QUIZ: 'bg-orange-500/20 text-orange-600'
    }
    const labels: Record<Task['type'], string> = {
      HOMEWORK: 'Tarea',
      EXAM: 'Examen',
      PROJECT: 'Proyecto',
      QUIZ: 'Quiz'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    )
  }

  const filteredTasks = useMemo(() => {
    return tasksList.filter(task => {
      const matchesSearch = searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.teacher.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLevel = filterLevel === '' || task.level === filterLevel
      const matchesSubject = filterSubject === '' || task.subject === filterSubject
      const matchesStatus = filterStatus === '' || task.status === filterStatus

      return matchesSearch && matchesLevel && matchesSubject && matchesStatus
    })
  }, [tasksList, searchTerm, filterLevel, filterSubject, filterStatus])

  const stats = {
    total: tasksList.length,
    scheduled: tasksList.filter(t => t.status === 'scheduled').length,
    completed: tasksList.filter(t => t.status === 'completed').length
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Tareas</h1>
          <p className="text-muted-foreground mt-1">Administra las tareas del colegio</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Tareas', value: stats.total, icon: ClipboardList, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Pendientes', value: stats.scheduled, icon: Calendar, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
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
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="">Todos los niveles</option>
                {uniqueLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="scheduled">Pendiente</option>
                <option value="completed">Completada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tareas</CardTitle>
          <CardDescription>Todas las tareas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay tareas registradas</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera tarea
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Título</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Profesor</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha Entrega</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entregas</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <ClipboardList className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{task.subject}</span>
                              {getTypeBadge(task.type)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p>{task.course}</p>
                          <p className="text-xs text-muted-foreground">{task.level}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{task.teacher}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {task.date}
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(task.status)}</td>
                      <td className="py-4 px-4">
                        <div className="w-20">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{task.studentsSubmitted}/{task.studentsTotal}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${(task.studentsSubmitted / task.studentsTotal) * 100}%` }}
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
                              setSelectedTask(task)
                              setShowDetailModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTask && (
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
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                    {getTypeBadge(selectedTask.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTask.subject} - {selectedTask.course}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Profesor</p>
                    <p className="font-medium">{selectedTask.teacher}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Fecha de Entrega</p>
                    <p className="font-medium">{selectedTask.date}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Nivel</p>
                    <p className="font-medium">{selectedTask.level}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Estado</p>
                    {getStatusBadge(selectedTask.status)}
                  </div>
                </div>

                {selectedTask.description && (
                  <div>
                    <h3 className="font-medium mb-3">Descripción</h3>
                    <p className="text-muted-foreground p-4 rounded-xl bg-muted/30">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-3">Progreso de Entregas</h3>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex justify-between mb-2">
                      <span>Estudiantes que entregaron</span>
                      <span className="font-medium">{selectedTask.studentsSubmitted} / {selectedTask.studentsTotal}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(selectedTask.studentsSubmitted / selectedTask.studentsTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Cerrar
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
                <h2 className="text-xl font-semibold">Crear Nueva Tarea</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha de Entrega *</label>
                    <Input
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo *</label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value as Task['type'] })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="HOMEWORK">Tarea</option>
                      <option value="PROJECT">Proyecto</option>
                      <option value="QUIZ">Quiz</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Filtrar por Nivel</label>
                  <select
                    value={createFilterLevel}
                    onChange={(e) => {
                      setCreateFilterLevel(e.target.value)
                      setNewTask({ ...newTask, courseId: '' })
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Todos los niveles</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.name}>{level.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Curso *</label>
                  <select
                    value={newTask.courseId}
                    onChange={(e) => setNewTask({ ...newTask, courseId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Seleccionar curso</option>
                    {filteredCoursesForCreate.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.subject.name} - {course.classroom.section.gradeLevel.name} {course.classroom.section.name}
                        {course.teacher ? ` (${course.teacher.firstName} ${course.teacher.lastName})` : ' (Sin profesor)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    placeholder="Ej: Tarea de Investigación"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción</label>
                  <textarea
                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="Instrucciones de la tarea..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <Button variant="outline" onClick={resetModal} disabled={creating}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!newTask.title || !newTask.courseId || !newTask.date || creating}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {creating ? 'Creando...' : 'Crear Tarea'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
