'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Award,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
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
import { examsService, studentsService, gradeSectionsService, type Exam, type Student, type GradeSection } from '@/services/mock-data'

// Tipo para calificaciones
type StudentExamGrade = {
  studentId: string
  studentName: string
  studentCode: string
  score: number | null
  status: 'aprobado' | 'desaprobado' | 'pendiente'
  isEdited?: boolean
}

const CURRENT_TEACHER_ID = 't1'

export default function TeacherExamenDetallePage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para calificaciones
  const [studentGrades, setStudentGrades] = useState<StudentExamGrade[]>([])
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [editingGrades, setEditingGrades] = useState<StudentExamGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)

  useEffect(() => {
    loadData()
  }, [examId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allExams, allStudents, allGradeSections] = await Promise.all([
        examsService.getByTeacher(CURRENT_TEACHER_ID),
        studentsService.getAll(),
        gradeSectionsService.getAll()
      ])

      const foundExam = allExams.find(e => e.id === examId)
      if (foundExam) {
        setExam(foundExam)
        const examStudents = allStudents.filter(s => s.gradeSection === foundExam.gradeSection && s.status === 'active')
        setStudents(examStudents)

        // Generar calificaciones
        const grades: StudentExamGrade[] = examStudents.map(student => {
          let score: number | null = null
          let status: 'aprobado' | 'desaprobado' | 'pendiente' = 'pendiente'

          if (foundExam.status === 'graded') {
            const baseScore = foundExam.averageScore || 14
            const variation = Math.random() * 6 - 3
            score = Math.max(0, Math.min(foundExam.maxScore, Math.round((baseScore + variation) * 10) / 10))
            const passingScore = foundExam.maxScore * 0.6
            status = score >= passingScore ? 'aprobado' : 'desaprobado'
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
      setGradeSections(allGradeSections)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const examGradeSection = useMemo(() => {
    if (!exam) return null
    return gradeSections.find(gs => `${gs.grade} ${gs.section}` === exam.gradeSection)
  }, [exam, gradeSections])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-600'
      case 'completed': return 'bg-green-500/20 text-green-600'
      case 'graded': return 'bg-purple-500/20 text-purple-600'
      default: return 'bg-gray-500/20 text-gray-600'
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

  // Stats calculados desde studentGrades
  const passedCount = studentGrades.filter(sg => sg.status === 'aprobado').length
  const failedCount = studentGrades.filter(sg => sg.status === 'desaprobado').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando examen...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Examen no encontrado</h2>
        <p className="text-muted-foreground mb-4">El examen que buscas no existe o no tienes acceso</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.courseName} - {exam.gradeSection}</p>
        </div>
        <Button onClick={openGradeModal} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <GraduationCap className="h-4 w-4 mr-2" />
          Calificar
        </Button>
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
                <p className="font-medium">{exam.courseName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grado/Sección</p>
                <p className="font-medium">{exam.gradeSection}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">{exam.examDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Award className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Puntaje Máximo</p>
                <p className="font-medium">{exam.maxScore} puntos</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <span className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${getStatusColor(exam.status)}`}>
                  {getStatusText(exam.status)}
                </span>
              </div>
              {examGradeSection && (
                <div>
                  <p className="text-sm text-muted-foreground">Turno</p>
                  <p className="font-medium mt-1">{examGradeSection.turno}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                <p className="font-medium mt-1">{students.length}</p>
              </div>
            </div>
          </div>

          {exam.description && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">Descripción</p>
              <p>{exam.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas si está calificado */}
      {exam.status === 'graded' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
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
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{passedCount}</p>
                    <p className="text-xs text-muted-foreground">Aprobados</p>
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
                    <XCircle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-rose-600">{failedCount}</p>
                    <p className="text-xs text-muted-foreground">Desaprobados</p>
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
                    <p className="text-2xl font-bold text-purple-600">{exam.averageScore}</p>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

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
              {studentGrades.map((sg, index) => (
                <motion.div
                  key={sg.studentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{sg.studentName}</p>
                    <p className="text-sm text-muted-foreground">{sg.studentCode}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {sg.score !== null ? (
                      <>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          sg.status === 'aprobado'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sg.score} / {exam.maxScore}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sg.status === 'aprobado'
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-rose-500/20 text-rose-600'
                        }`}>
                          {sg.status === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600">
                        Pendiente
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
              Calificar Examen: {exam?.title}
            </DialogTitle>
            <DialogDescription>
              Asigne las calificaciones a los estudiantes de {exam?.gradeSection}. Nota máxima: {exam?.maxScore} puntos. Nota aprobatoria: {exam ? Math.ceil(exam.maxScore * 0.6) : 0}+
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
