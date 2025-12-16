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
  GraduationCap,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  User,
  Edit,
  Trash2,
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
import { examsService, studentsService, gradeSectionsService, type Exam, type Student, type GradeSection } from '@/services/mock-data'

// Tipo para calificaciones simuladas
type StudentExamGrade = {
  studentId: string
  studentName: string
  studentCode: string
  score: number | null
  status: 'aprobado' | 'desaprobado' | 'pendiente'
  isEdited?: boolean
}

export default function ExamenDetallePage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [studentGrades, setStudentGrades] = useState<StudentExamGrade[]>([])

  // Estados para modal de calificación
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [editingGrades, setEditingGrades] = useState<StudentExamGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)

  useEffect(() => {
    loadData()
  }, [examId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [examsData, studentsData, gradeSectionsData] = await Promise.all([
        examsService.getAll(),
        studentsService.getAll(),
        gradeSectionsService.getAll()
      ])

      const foundExam = examsData.find(e => e.id === examId)
      setExam(foundExam || null)
      setStudents(studentsData)
      setGradeSections(gradeSectionsData)

      // Generar calificaciones simuladas si el examen está calificado
      if (foundExam) {
        const examStudents = studentsData.filter(
          s => s.gradeSection === foundExam.gradeSection && s.status === 'active'
        )

        const grades: StudentExamGrade[] = examStudents.map(student => {
          let score: number | null = null
          let status: 'aprobado' | 'desaprobado' | 'pendiente' = 'pendiente'

          if (foundExam.status === 'graded') {
            // Generar nota aleatoria entre 8 y 20 para simulación
            score = Math.floor(Math.random() * 13) + 8
            status = score >= foundExam.maxScore * 0.6 ? 'aprobado' : 'desaprobado'
          }

          return {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            studentCode: student.code,
            score,
            status
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
    if (!exam) return null
    const gs = gradeSections.find(g => `${g.grade} ${g.section}` === exam.gradeSection)
    return gs ? { turno: gs.turno, startTime: gs.turnoStartTime, endTime: gs.turnoEndTime } : null
  }, [exam, gradeSections])

  // Estadísticas
  const stats = useMemo(() => {
    if (!exam || studentGrades.length === 0) return null

    const aprobados = studentGrades.filter(sg => sg.status === 'aprobado').length
    const desaprobados = studentGrades.filter(sg => sg.status === 'desaprobado').length
    const pendientes = studentGrades.filter(sg => sg.status === 'pendiente').length
    const calificados = studentGrades.filter(sg => sg.score !== null)
    const promedio = calificados.length > 0
      ? calificados.reduce((sum, sg) => sum + (sg.score || 0), 0) / calificados.length
      : 0
    const notaMaxima = calificados.length > 0 ? Math.max(...calificados.map(sg => sg.score || 0)) : 0
    const notaMinima = calificados.length > 0 ? Math.min(...calificados.map(sg => sg.score || 0)) : 0

    return {
      total: studentGrades.length,
      aprobados,
      desaprobados,
      pendientes,
      promedio: promedio.toFixed(1),
      notaMaxima,
      notaMinima,
      porcentajeAprobacion: studentGrades.length > 0
        ? ((aprobados / (aprobados + desaprobados || 1)) * 100).toFixed(0)
        : '0'
    }
  }, [exam, studentGrades])

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
    if (!exam) return

    setIsSavingGrades(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 500))

      // Calcular estado basado en el puntaje
      const updatedGrades = editingGrades.map(sg => {
        if (sg.score !== null) {
          const passingScore = exam.maxScore * 0.6
          return {
            ...sg,
            status: sg.score >= passingScore ? 'aprobado' as const : 'desaprobado' as const,
            isEdited: false
          }
        }
        return { ...sg, status: 'pendiente' as const, isEdited: false }
      })

      setStudentGrades(updatedGrades)

      // Calcular promedio
      const calificados = updatedGrades.filter(sg => sg.score !== null)
      const promedio = calificados.length > 0
        ? calificados.reduce((sum, sg) => sum + (sg.score || 0), 0) / calificados.length
        : 0

      // Actualizar examen si todos están calificados
      if (calificados.length === updatedGrades.length && updatedGrades.length > 0) {
        setExam(prev => prev ? {
          ...prev,
          status: 'graded',
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
    if (!exam) return ''
    const percentage = (score / exam.maxScore) * 100
    if (percentage >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (percentage >= 40) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-rose-600 bg-rose-50 border-rose-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'graded': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado'
      case 'completed': return 'Completado'
      case 'graded': return 'Calificado'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Examen no encontrado</h2>
            <p className="text-muted-foreground">El examen que buscas no existe o fue eliminado.</p>
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
          Volver a Exámenes
        </Button>
        <div className="flex gap-2">
          <Button onClick={openGradeModal} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <GraduationCap className="h-4 w-4 mr-2" />
            Calificar
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/examenes`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Info principal del examen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className={`h-2 ${
            exam.level === 'Primaria' ? 'bg-blue-500' :
            exam.level === 'Secundaria' ? 'bg-purple-500' :
            'bg-emerald-500'
          }`} />
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  exam.level === 'Primaria' ? 'from-blue-500 to-blue-600' :
                  exam.level === 'Secundaria' ? 'from-purple-500 to-purple-600' :
                  'from-emerald-500 to-emerald-600'
                } shadow-lg`}>
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">{exam.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 text-sm rounded-full ${getLevelColor(exam.level)}`}>
                      {exam.level}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(exam.status)}`}>
                      {getStatusText(exam.status)}
                    </span>
                  </div>
                </div>
              </div>
              {exam.averageScore && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Promedio</p>
                  <p className="text-3xl font-bold text-emerald-600">{exam.averageScore}</p>
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
                  <p className="font-medium">{exam.courseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Grado/Sección</p>
                  <p className="font-medium">{exam.gradeSection}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha del Examen</p>
                  <p className="font-medium">{new Date(exam.examDate).toLocaleDateString('es-ES', {
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
                  <p className="font-medium">{exam.maxScore} puntos</p>
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
                <p className="text-lg font-semibold">{exam.teacherName}</p>
              </div>
              {turnoInfo && (
                <div className="p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Turno
                  </h4>
                  <p className="text-lg font-semibold">{turnoInfo.turno}</p>
                  <p className="text-sm text-muted-foreground">{turnoInfo.startTime} - {turnoInfo.endTime}</p>
                </div>
              )}
            </div>

            {/* Descripción */}
            {exam.description && (
              <div className="mt-6 p-4 rounded-xl bg-muted/30">
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-muted-foreground">{exam.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Estadísticas */}
      {stats && exam.status === 'graded' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas de Calificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-center">
                  <p className="text-3xl font-bold text-emerald-600">{stats.aprobados}</p>
                  <p className="text-sm text-muted-foreground">Aprobados</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 text-center">
                  <p className="text-3xl font-bold text-rose-600">{stats.desaprobados}</p>
                  <p className="text-sm text-muted-foreground">Desaprobados</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats.promedio}</p>
                  <p className="text-sm text-muted-foreground">Promedio</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-center">
                  <p className="text-3xl font-bold text-amber-600">{stats.porcentajeAprobacion}%</p>
                  <p className="text-sm text-muted-foreground">Aprobación</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/20 text-center">
                  <p className="text-lg font-bold text-slate-600">
                    {stats.notaMinima} - {stats.notaMaxima}
                  </p>
                  <p className="text-sm text-muted-foreground">Rango de Notas</p>
                </div>
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
              Estudiantes Asignados ({studentGrades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentGrades.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay estudiantes asignados a este examen</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b grid grid-cols-12 gap-4 text-sm font-medium">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Estudiante</div>
                  <div className="col-span-3">Código</div>
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
                      <div className="col-span-4 font-medium">{sg.studentName}</div>
                      <div className="col-span-3 text-muted-foreground">{sg.studentCode}</div>
                      <div className="col-span-2 text-center">
                        {sg.score !== null ? (
                          <span className={`text-lg font-bold ${
                            sg.status === 'aprobado' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {sg.score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {sg.status === 'aprobado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Aprobado
                          </span>
                        )}
                        {sg.status === 'desaprobado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            <XCircle className="h-3 w-3" />
                            Desaprobado
                          </span>
                        )}
                        {sg.status === 'pendiente' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Calificar Examen: {exam?.title}
            </DialogTitle>
            <DialogDescription>
              Asigne las calificaciones a los estudiantes. Nota máxima: {exam?.maxScore} puntos. Nota aprobatoria: {exam ? Math.ceil(exam.maxScore * 0.6) : 0}+
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Acciones rápidas */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground self-center mr-2">Acciones rápidas:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllScores(exam?.maxScore || 20)}
              >
                Todos {exam?.maxScore}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllScores(Math.ceil((exam?.maxScore || 20) * 0.6))}
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
                <div className="col-span-5">Estudiante</div>
                <div className="col-span-3">Código</div>
                <div className="col-span-3 text-center">Nota (0-{exam?.maxScore})</div>
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
                    <div className="col-span-5 font-medium">{sg.studentName}</div>
                    <div className="col-span-3 text-muted-foreground">{sg.studentCode}</div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={0}
                        max={exam?.maxScore || 20}
                        step={0.5}
                        value={sg.score ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : Number(e.target.value)
                          if (value === null || (value >= 0 && value <= (exam?.maxScore || 20))) {
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
                    {editingGrades.filter(sg => sg.score !== null && sg.score >= (exam?.maxScore || 20) * 0.6).length}
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
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
