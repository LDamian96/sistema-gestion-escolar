'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Users,
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  User,
  Edit,
  Paperclip,
  CalendarClock,
  Target,
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
  isEdited?: boolean // Para saber si fue editado manualmente
}

export default function TareaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [studentGrades, setStudentGrades] = useState<StudentTaskGrade[]>([])

  // Estados para modal de calificación
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [editingGrades, setEditingGrades] = useState<StudentTaskGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)

  useEffect(() => {
    loadData()
  }, [taskId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tasksData, studentsData, gradeSectionsData] = await Promise.all([
        tasksService.getAll(),
        studentsService.getAll(),
        gradeSectionsService.getAll()
      ])

      const foundTask = tasksData.find(t => t.id === taskId)
      setTask(foundTask || null)
      setStudents(studentsData)
      setGradeSections(gradeSectionsData)

      // Generar entregas simuladas
      if (foundTask) {
        const taskStudents = studentsData.filter(
          s => s.gradeSection === foundTask.gradeSection && s.status === 'active'
        )

        const grades: StudentTaskGrade[] = taskStudents.map((student, index) => {
          // Simular diferentes estados de entrega
          const random = Math.random()
          let status: 'entregado' | 'pendiente' | 'atrasado'
          let score: number | null = null
          let fechaEntrega: string | null = null

          if (foundTask.status === 'closed') {
            // Si la tarea está cerrada, todos tienen algún estado
            if (random > 0.2) {
              status = 'entregado'
              score = Math.floor(Math.random() * 8) + 12 // Nota entre 12 y 20
              const dueDate = new Date(foundTask.dueDate)
              const deliveryDate = new Date(dueDate)
              deliveryDate.setDate(deliveryDate.getDate() - Math.floor(Math.random() * 5))
              fechaEntrega = deliveryDate.toISOString().split('T')[0]
            } else if (random > 0.1) {
              status = 'atrasado'
              score = Math.floor(Math.random() * 6) + 8 // Nota entre 8 y 14
              const dueDate = new Date(foundTask.dueDate)
              const deliveryDate = new Date(dueDate)
              deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 1)
              fechaEntrega = deliveryDate.toISOString().split('T')[0]
            } else {
              status = 'pendiente'
            }
          } else {
            // Tarea pendiente - algunos entregaron, otros no
            if (random > 0.5) {
              status = 'entregado'
              const dueDate = new Date(foundTask.dueDate)
              const deliveryDate = new Date()
              deliveryDate.setDate(deliveryDate.getDate() - Math.floor(Math.random() * 3))
              fechaEntrega = deliveryDate.toISOString().split('T')[0]
            } else {
              status = 'pendiente'
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
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtener información del turno
  const turnoInfo = useMemo(() => {
    if (!task) return null
    const gs = gradeSections.find(g => `${g.grade} ${g.section}` === task.gradeSection)
    return gs ? { turno: gs.turno, startTime: gs.turnoStartTime, endTime: gs.turnoEndTime } : null
  }, [task, gradeSections])

  // Estadísticas
  const stats = useMemo(() => {
    if (!task || studentGrades.length === 0) return null

    const entregados = studentGrades.filter(sg => sg.status === 'entregado').length
    const atrasados = studentGrades.filter(sg => sg.status === 'atrasado').length
    const pendientes = studentGrades.filter(sg => sg.status === 'pendiente').length
    const calificados = studentGrades.filter(sg => sg.score !== null)
    const promedio = calificados.length > 0
      ? calificados.reduce((sum, sg) => sum + (sg.score || 0), 0) / calificados.length
      : 0
    const notaMaxima = calificados.length > 0 ? Math.max(...calificados.map(sg => sg.score || 0)) : 0
    const notaMinima = calificados.length > 0 ? Math.min(...calificados.map(sg => sg.score || 0)) : 0

    return {
      total: studentGrades.length,
      entregados,
      atrasados,
      pendientes,
      promedio: promedio.toFixed(1),
      notaMaxima,
      notaMinima,
      porcentajeEntrega: studentGrades.length > 0
        ? (((entregados + atrasados) / studentGrades.length) * 100).toFixed(0)
        : '0'
    }
  }, [task, studentGrades])

  // Calcular días restantes o pasados
  const diasInfo = useMemo(() => {
    if (!task) return null
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return { text: `Faltan ${diffDays} días`, color: 'text-emerald-600', bg: 'bg-emerald-100' }
    } else if (diffDays === 0) {
      return { text: 'Vence hoy', color: 'text-amber-600', bg: 'bg-amber-100' }
    } else {
      return { text: `Venció hace ${Math.abs(diffDays)} días`, color: 'text-rose-600', bg: 'bg-rose-100' }
    }
  }, [task])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'closed': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-700'
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
      case 'Inicial': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Primaria': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Secundaria': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Funciones para modal de calificación
  const openGradeModal = () => {
    setEditingGrades([...studentGrades])
    setIsGradeModalOpen(true)
  }

  const handleScoreChange = (studentId: string, score: number | null) => {
    setEditingGrades(prev => prev.map(sg =>
      sg.studentId === studentId ? { ...sg, score, isEdited: true } : sg
    ))
  }

  const saveGrades = async () => {
    if (!task) return

    try {
      setIsSavingGrades(true)

      // Calcular promedio de notas calificadas
      const gradedStudents = editingGrades.filter(sg => sg.score !== null)
      const avgScore = gradedStudents.length > 0
        ? gradedStudents.reduce((sum, sg) => sum + (sg.score || 0), 0) / gradedStudents.length
        : 0

      // Actualizar las notas en el estado local
      setStudentGrades(editingGrades)

      // Actualizar la tarea si todas están calificadas
      const allGraded = editingGrades.every(sg => sg.score !== null)
      if (allGraded && task.status === 'pending') {
        const updatedTask = await tasksService.update(task.id, {
          status: 'closed',
          averageScore: Math.round(avgScore * 10) / 10
        })
        setTask(updatedTask)
      }

      toast.success(`Calificaciones guardadas. Promedio: ${avgScore.toFixed(1)}`)
      setIsGradeModalOpen(false)
    } catch (error) {
      toast.error('Error al guardar las calificaciones')
      console.error(error)
    } finally {
      setIsSavingGrades(false)
    }
  }

  const setAllScores = (score: number) => {
    setEditingGrades(prev => prev.map(sg => ({ ...sg, score, isEdited: true })))
  }

  const clearAllScores = () => {
    setEditingGrades(prev => prev.map(sg => ({ ...sg, score: null, isEdited: false })))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
            <p className="text-muted-foreground">La tarea que buscas no existe o fue eliminada.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Tareas
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={openGradeModal}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Calificar
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/tareas`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Info principal de la tarea */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className={`h-2 ${
            task.level === 'Primaria' ? 'bg-blue-500' :
            task.level === 'Secundaria' ? 'bg-purple-500' :
            'bg-emerald-500'
          }`} />
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  task.level === 'Primaria' ? 'from-blue-500 to-blue-600' :
                  task.level === 'Secundaria' ? 'from-purple-500 to-purple-600' :
                  'from-emerald-500 to-emerald-600'
                } shadow-lg`}>
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 text-sm rounded-full ${getLevelColor(task.level)}`}>
                      {task.level}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    {diasInfo && (
                      <span className={`px-3 py-1 text-sm rounded-full ${diasInfo.bg} ${diasInfo.color}`}>
                        {diasInfo.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {stats && task.status === 'closed' && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Promedio</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.promedio}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Materia</p>
                  <p className="font-medium">{task.courseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Grado/Sección</p>
                  <p className="font-medium">{task.gradeSection}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CalendarClock className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                  <p className="font-medium">{new Date(task.dueDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Award className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Puntaje Máximo</p>
                  <p className="font-medium">{task.maxScore} puntos</p>
                </div>
              </div>
            </div>

            {/* Info adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Profesor Responsable
                </h4>
                <p className="text-lg font-semibold">{task.teacherName}</p>
              </div>
              <div className="p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Fecha de Asignación
                </h4>
                <p className="text-lg font-semibold">{new Date(task.assignedDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>

            {/* Descripción */}
            {task.description && (
              <div className="mt-6 p-4 rounded-xl bg-muted/30">
                <h4 className="font-medium mb-2">Descripción / Instrucciones</h4>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Estadísticas */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas de Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-center">
                  <p className="text-3xl font-bold text-emerald-600">{stats.entregados}</p>
                  <p className="text-sm text-muted-foreground">Entregados</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-center">
                  <p className="text-3xl font-bold text-amber-600">{stats.atrasados}</p>
                  <p className="text-sm text-muted-foreground">Atrasados</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 text-center">
                  <p className="text-3xl font-bold text-rose-600">{stats.pendientes}</p>
                  <p className="text-sm text-muted-foreground">Sin entregar</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats.porcentajeEntrega}%</p>
                  <p className="text-sm text-muted-foreground">Entrega</p>
                </div>
                {task.status === 'closed' && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/20 text-center">
                    <p className="text-lg font-bold text-slate-600">
                      {stats.notaMinima} - {stats.notaMaxima}
                    </p>
                    <p className="text-sm text-muted-foreground">Rango de Notas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lista de estudiantes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estado de Entregas ({studentGrades.length} estudiantes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentGrades.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay estudiantes asignados a esta tarea</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b grid grid-cols-12 gap-4 text-sm font-medium">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Estudiante</div>
                  <div className="col-span-2">Código</div>
                  <div className="col-span-2 text-center">Fecha Entrega</div>
                  <div className="col-span-2 text-center">Nota</div>
                  <div className="col-span-2 text-center">Estado</div>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {studentGrades.map((sg, index) => (
                    <motion.div
                      key={sg.studentId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-1">
                        <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="col-span-3 font-medium">{sg.studentName}</div>
                      <div className="col-span-2 text-muted-foreground text-sm">{sg.studentCode}</div>
                      <div className="col-span-2 text-center text-sm">
                        {sg.fechaEntrega ? (
                          new Date(sg.fechaEntrega).toLocaleDateString('es-ES')
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {sg.score !== null ? (
                          <span className={`text-lg font-bold ${
                            sg.score >= task.maxScore * 0.6 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {sg.score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {sg.status === 'entregado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Entregado
                          </span>
                        )}
                        {sg.status === 'atrasado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />
                            Atrasado
                          </span>
                        )}
                        {sg.status === 'pendiente' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            <XCircle className="h-3 w-3" />
                            Pendiente
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de Calificación */}
      <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Calificar Tarea
            </DialogTitle>
            <DialogDescription>
              {task?.status === 'closed' ? 'Edita las calificaciones existentes' : 'Ingresa las calificaciones para cada estudiante'}
            </DialogDescription>
          </DialogHeader>

          {task && (
            <div className="space-y-4 py-4">
              {/* Info de la tarea */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.courseName} - {task.gradeSection}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm mt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Vence: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    Máx: {task.maxScore} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {editingGrades.length} estudiantes
                  </span>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllScores(task.maxScore)}
                  className="text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Todos {task.maxScore}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllScores(Math.round(task.maxScore * 0.5))}
                >
                  Todos 50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllScores}
                >
                  Limpiar todo
                </Button>
              </div>

              {/* Lista de estudiantes para calificar */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Estudiante</span>
                  <span className="text-sm font-medium">Nota (0-{task.maxScore})</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y">
                  {editingGrades.map((sg, index) => (
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
                          max={task.maxScore}
                          step="0.5"
                          value={sg.score ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseFloat(e.target.value)
                            if (value === null || (value >= 0 && value <= task.maxScore)) {
                              handleScoreChange(sg.studentId, value)
                            }
                          }}
                          className={`w-20 text-center font-medium ${
                            sg.score !== null
                              ? sg.score >= task.maxScore * 0.6
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : sg.score >= task.maxScore * 0.4
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-rose-300 bg-rose-50 text-rose-700'
                              : ''
                          }`}
                          placeholder="--"
                        />
                        {sg.score !== null && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            sg.score >= task.maxScore * 0.6
                              ? 'bg-emerald-100 text-emerald-700'
                              : sg.score >= task.maxScore * 0.4
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {sg.score >= task.maxScore * 0.6 ? 'Aprobado' : 'Desaprobado'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Resumen */}
              {editingGrades.some(sg => sg.score !== null) && (
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm">Resumen de calificaciones</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                      <p className="text-emerald-600 font-medium">
                        {editingGrades.filter(sg => sg.score !== null && sg.score >= task.maxScore * 0.6).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Aprobados</p>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/30">
                      <p className="text-rose-600 font-medium">
                        {editingGrades.filter(sg => sg.score !== null && sg.score < task.maxScore * 0.6).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Desaprobados</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950/30">
                      <p className="text-slate-600 font-medium">
                        {editingGrades.filter(sg => sg.score === null).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sin calificar</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                      <p className="text-blue-600 font-medium">
                        {(() => {
                          const gradedStudents = editingGrades.filter(sg => sg.score !== null)
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
            <Button variant="outline" onClick={() => setIsGradeModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveGrades}
              disabled={isSavingGrades || editingGrades.every(sg => sg.score === null)}
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
