'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Award,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { tasksService, studentsService, gradeSectionsService, type Task, type Student, type GradeSection } from '@/services/mock-data'

// Tipo para calificaciones
type StudentTaskGrade = {
  studentId: string
  studentName: string
  studentCode: string
  score: number | null
  status: 'entregado' | 'pendiente' | 'atrasado'
  fechaEntrega: string | null
  isEdited?: boolean
}

const CURRENT_TEACHER_ID = 't1'

export default function TeacherTareaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para calificaciones
  const [studentGrades, setStudentGrades] = useState<StudentTaskGrade[]>([])
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [editingGrades, setEditingGrades] = useState<StudentTaskGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)

  useEffect(() => {
    loadData()
  }, [taskId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allTasks, allStudents, allGradeSections] = await Promise.all([
        tasksService.getByTeacher(CURRENT_TEACHER_ID),
        studentsService.getAll(),
        gradeSectionsService.getAll()
      ])

      const foundTask = allTasks.find(t => t.id === taskId)
      if (foundTask) {
        setTask(foundTask)
        const taskStudents = allStudents.filter(s => s.gradeSection === foundTask.gradeSection && s.status === 'active')
        setStudents(taskStudents)

        // Generar calificaciones simuladas
        const grades: StudentTaskGrade[] = taskStudents.map(student => {
          const random = Math.random()
          let status: 'entregado' | 'pendiente' | 'atrasado' = 'pendiente'
          let score: number | null = null
          let fechaEntrega: string | null = null

          const today = new Date()
          const dueDate = new Date(foundTask.dueDate)
          const isPastDue = today > dueDate

          if (foundTask.status === 'closed') {
            status = random > 0.15 ? 'entregado' : 'atrasado'
            const baseScore = foundTask.averageScore || 14
            const variation = Math.random() * 6 - 3
            score = Math.max(0, Math.min(foundTask.maxScore, Math.round((baseScore + variation) * 10) / 10))
            fechaEntrega = foundTask.dueDate
          } else if (isPastDue) {
            status = random > 0.3 ? 'entregado' : random > 0.1 ? 'atrasado' : 'pendiente'
            if (status !== 'pendiente') {
              fechaEntrega = foundTask.dueDate
            }
          } else {
            status = random > 0.5 ? 'entregado' : 'pendiente'
            if (status === 'entregado') {
              fechaEntrega = new Date().toISOString().split('T')[0]
            }
          }

          return {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            studentCode: student.code,
            score,
            status,
            fechaEntrega
          }
        })
        setStudentGrades(grades)
      }
      setGradeSections(allGradeSections)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generar estado de entregas simulado
  const studentSubmissions = useMemo(() => {
    if (!task) return []

    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const isPastDue = today > dueDate

    return students.map((student, index) => {
      // Simular diferentes estados de entrega
      const random = Math.random()
      let status: 'entregado' | 'atrasado' | 'pendiente'
      let submissionDate: string | null = null
      let score: number | null = null

      if (task.status === 'closed') {
        // Si la tarea está cerrada, todos deberían haber entregado
        status = random > 0.15 ? 'entregado' : 'atrasado'
        const baseScore = task.averageScore || 14
        const variation = Math.random() * 6 - 3
        score = Math.max(0, Math.min(task.maxScore, Math.round((baseScore + variation) * 10) / 10))
        submissionDate = task.dueDate
      } else if (isPastDue) {
        // Si pasó la fecha de entrega
        status = random > 0.3 ? 'entregado' : random > 0.1 ? 'atrasado' : 'pendiente'
        if (status === 'entregado' || status === 'atrasado') {
          submissionDate = task.dueDate
        }
      } else {
        // Si aún no vence
        status = random > 0.5 ? 'entregado' : 'pendiente'
        if (status === 'entregado') {
          submissionDate = new Date().toISOString().split('T')[0]
        }
      }

      return {
        student,
        status,
        submissionDate,
        score,
        passed: score !== null ? score >= task.maxScore * 0.6 : null
      }
    })
  }, [task, students])

  const taskGradeSection = useMemo(() => {
    if (!task) return null
    return gradeSections.find(gs => `${gs.grade} ${gs.section}` === task.gradeSection)
  }, [task, gradeSections])

  // Calcular días restantes o pasados
  const daysInfo = useMemo(() => {
    if (!task) return null
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return { text: `${diffDays} días restantes`, color: 'text-blue-600 bg-blue-100' }
    } else if (diffDays === 0) {
      return { text: 'Vence hoy', color: 'text-amber-600 bg-amber-100' }
    } else {
      return { text: `Venció hace ${Math.abs(diffDays)} días`, color: 'text-rose-600 bg-rose-100' }
    }
  }, [task])

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

  // === Funciones para calificación ===
  const openGradeModal = () => {
    setEditingGrades([...studentGrades])
    setIsGradeModalOpen(true)
  }

  const handleScoreChange = (studentId: string, score: number | null) => {
    setEditingGrades(prev =>
      prev.map(sg =>
        sg.studentId === studentId ? { ...sg, score, isEdited: true } : sg
      )
    )
  }

  const saveGrades = async () => {
    if (!task) return

    setIsSavingGrades(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 500))

      setStudentGrades(editingGrades.map(sg => ({ ...sg, isEdited: false })))

      // Calcular promedio
      const calificados = editingGrades.filter(sg => sg.score !== null)
      const promedio = calificados.length > 0
        ? calificados.reduce((sum, sg) => sum + (sg.score || 0), 0) / calificados.length
        : 0

      // Actualizar tarea si todos están calificados
      if (calificados.length === editingGrades.length && editingGrades.length > 0) {
        setTask(prev => prev ? {
          ...prev,
          status: 'closed',
          averageScore: Number(promedio.toFixed(1))
        } : prev)
      }

      setIsGradeModalOpen(false)
      toast.success('Calificaciones guardadas correctamente')
    } catch (error) {
      toast.error('Error al guardar las calificaciones')
    } finally {
      setIsSavingGrades(false)
    }
  }

  const setAllScores = (score: number) => {
    setEditingGrades(prev =>
      prev.map(sg => ({ ...sg, score, isEdited: true }))
    )
  }

  const clearAllScores = () => {
    setEditingGrades(prev =>
      prev.map(sg => ({ ...sg, score: null, isEdited: true }))
    )
  }

  // Color para nota según valor
  const getScoreColor = (score: number | null) => {
    if (score === null) return ''
    if (!task) return ''
    const percentage = (score / task.maxScore) * 100
    if (percentage >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (percentage >= 40) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-rose-600 bg-rose-50 border-rose-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tarea...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
        <p className="text-muted-foreground mb-4">La tarea que buscas no existe o no tienes acceso</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    )
  }

  const entregados = studentSubmissions.filter(s => s.status === 'entregado').length
  const atrasados = studentSubmissions.filter(s => s.status === 'atrasado').length
  const pendientes = studentSubmissions.filter(s => s.status === 'pendiente').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{task.title}</h1>
          <p className="text-muted-foreground">{task.courseName} - {task.gradeSection}</p>
        </div>
        <Button onClick={openGradeModal} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
          <GraduationCap className="h-4 w-4 mr-2" />
          Calificar
        </Button>
        {daysInfo && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${daysInfo.color}`}>
            {daysInfo.text}
          </span>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Materia</p>
                <p className="font-medium">{task.courseName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grado/Sección</p>
                <p className="font-medium">{task.gradeSection}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Entrega</p>
                <p className="font-medium">{task.dueDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Award className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Puntaje Máximo</p>
                <p className="font-medium">{task.maxScore} puntos</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <span className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
              {taskGradeSection && (
                <div>
                  <p className="text-sm text-muted-foreground">Turno</p>
                  <p className="font-medium mt-1">{taskGradeSection.turno}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Fecha Asignada</p>
                <p className="font-medium mt-1">{task.assignedDate}</p>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">Descripción</p>
              <p>{task.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{entregados}</p>
                  <p className="text-xs text-muted-foreground">Entregados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{atrasados}</p>
                  <p className="text-xs text-muted-foreground">Atrasados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose-500/10">
                  <Clock className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-600">{pendientes}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((entregados / students.length) * 100) || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Entrega</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lista de estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estudiantes ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay estudiantes en este grado/sección</p>
            </div>
          ) : (
            <div className="space-y-2">
              {studentSubmissions.map((sub, index) => (
                <motion.div
                  key={sub.student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{sub.student.firstName} {sub.student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{sub.student.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Estado de entrega */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'entregado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : sub.status === 'atrasado'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {sub.status === 'entregado' ? 'Entregado' :
                       sub.status === 'atrasado' ? 'Atrasado' : 'Pendiente'}
                    </span>

                    {/* Calificación si existe */}
                    {sub.score !== null && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        sub.passed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {sub.score} / {task.maxScore}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Calificación */}
      <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Calificar Tarea: {task?.title}
            </DialogTitle>
            <DialogDescription>
              Asigne las calificaciones a los estudiantes de {task?.gradeSection}. Nota máxima: {task?.maxScore} puntos.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Acciones rápidas */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground self-center mr-2">Acciones rápidas:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllScores(task?.maxScore || 20)}
              >
                Todos {task?.maxScore}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllScores(Math.ceil((task?.maxScore || 20) * 0.6))}
              >
                Todos Mínimo Aprobatorio
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllScores}
              >
                Limpiar Todo
              </Button>
            </div>

            {/* Lista de estudiantes */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b grid grid-cols-12 gap-4 text-sm font-medium">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Estudiante</div>
                <div className="col-span-2">Código</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-3 text-center">Nota (0-{task?.maxScore})</div>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {editingGrades.map((sg, index) => (
                  <div
                    key={sg.studentId}
                    className={`px-4 py-3 grid grid-cols-12 gap-4 items-center transition-colors ${
                      sg.isEdited ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <div className="col-span-1">
                      <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-4 font-medium">{sg.studentName}</div>
                    <div className="col-span-2 text-muted-foreground text-sm">{sg.studentCode}</div>
                    <div className="col-span-2 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sg.status === 'entregado'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sg.status === 'atrasado'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sg.status === 'entregado' ? 'Entregado' :
                         sg.status === 'atrasado' ? 'Atrasado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={0}
                        max={task?.maxScore || 20}
                        step={0.5}
                        value={sg.score ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : Number(e.target.value)
                          if (value === null || (value >= 0 && value <= (task?.maxScore || 20))) {
                            handleScoreChange(sg.studentId, value)
                          }
                        }}
                        className={`text-center font-medium ${getScoreColor(sg.score)}`}
                        placeholder="--"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de calificaciones */}
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3">Resumen de Calificaciones</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800">
                  <p className="text-2xl font-bold text-blue-600">
                    {editingGrades.filter(sg => sg.score !== null).length}
                  </p>
                  <p className="text-muted-foreground">Calificados</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800">
                  <p className="text-2xl font-bold text-amber-600">
                    {editingGrades.filter(sg => sg.score === null).length}
                  </p>
                  <p className="text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800">
                  <p className="text-2xl font-bold text-emerald-600">
                    {editingGrades.filter(sg => sg.score !== null && sg.score >= (task?.maxScore || 20) * 0.6).length}
                  </p>
                  <p className="text-muted-foreground">Aprobados</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800">
                  <p className="text-2xl font-bold text-purple-600">
                    {editingGrades.filter(sg => sg.score !== null).length > 0
                      ? (editingGrades.filter(sg => sg.score !== null).reduce((sum, sg) => sum + (sg.score || 0), 0) /
                         editingGrades.filter(sg => sg.score !== null).length).toFixed(1)
                      : '--'}
                  </p>
                  <p className="text-muted-foreground">Promedio</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsGradeModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveGrades}
              disabled={isSavingGrades}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isSavingGrades ? (
                <>Guardando...</>
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
