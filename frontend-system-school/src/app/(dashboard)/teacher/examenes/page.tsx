'use client'

import { useState } from 'react'
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
  XCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Exam {
  id: number
  title: string
  subject: string
  course: string
  date: string
  duration: string
  totalPoints: number
  status: 'scheduled' | 'in_progress' | 'grading' | 'completed'
  studentsTotal: number
  studentsGraded: number
}

interface StudentGrade {
  id: number
  name: string
  avatar: string
  grade: number | null
  observation: string
  status: 'pending' | 'graded'
}

const exams: Exam[] = [
  { id: 1, title: 'Examen Parcial - Álgebra', subject: 'Matemáticas', course: '5to A', date: '2024-12-15', duration: '90 min', totalPoints: 20, status: 'scheduled', studentsTotal: 28, studentsGraded: 0 },
  { id: 2, title: 'Examen Final - Geometría', subject: 'Matemáticas', course: '5to B', date: '2024-12-20', duration: '120 min', totalPoints: 20, status: 'scheduled', studentsTotal: 30, studentsGraded: 0 },
  { id: 3, title: 'Evaluación Continua', subject: 'Matemáticas', course: '4to A', date: '2024-12-10', duration: '45 min', totalPoints: 20, status: 'grading', studentsTotal: 26, studentsGraded: 18 },
  { id: 4, title: 'Examen de Recuperación', subject: 'Matemáticas', course: '3ro B', date: '2024-12-08', duration: '60 min', totalPoints: 20, status: 'completed', studentsTotal: 25, studentsGraded: 25 },
]

const studentsForGrading: StudentGrade[] = [
  { id: 1, name: 'Ana Martínez', avatar: 'AM', grade: 18, observation: 'Excelente desempeño', status: 'graded' },
  { id: 2, name: 'Carlos López', avatar: 'CL', grade: 15, observation: '', status: 'graded' },
  { id: 3, name: 'Diana García', avatar: 'DG', grade: 12, observation: 'Necesita reforzar álgebra', status: 'graded' },
  { id: 4, name: 'Eduardo Sánchez', avatar: 'ES', grade: null, observation: '', status: 'pending' },
  { id: 5, name: 'Fernanda Ruiz', avatar: 'FR', grade: null, observation: '', status: 'pending' },
  { id: 6, name: 'Gabriel Torres', avatar: 'GT', grade: 16, observation: '', status: 'graded' },
  { id: 7, name: 'Helena Vargas', avatar: 'HV', grade: null, observation: 'No asistió al examen', status: 'pending' },
  { id: 8, name: 'Iván Mendoza', avatar: 'IM', grade: 14, observation: '', status: 'graded' },
]

export default function TeacherExamenesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradingModal, setShowGradingModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [students, setStudents] = useState(studentsForGrading)
  const [newExam, setNewExam] = useState({
    title: '',
    course: '',
    date: '',
    duration: '60',
    totalPoints: '20'
  })

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

  const handleGradeStudent = (studentId: number, grade: number | null, observation: string) => {
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, grade, observation, status: grade !== null ? 'graded' : 'pending' as const }
        : s
    ))
  }

  const openGradingModal = (exam: Exam) => {
    setSelectedExam(exam)
    setShowGradingModal(true)
  }

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: exams.length,
    scheduled: exams.filter(e => e.status === 'scheduled').length,
    grading: exams.filter(e => e.status === 'grading').length,
    completed: exams.filter(e => e.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Exámenes</h1>
          <p className="text-muted-foreground mt-1">Gestiona y califica los exámenes de tus cursos</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Examen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Exámenes', value: stats.total, icon: PenTool, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Programados', value: stats.scheduled, icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Por Calificar', value: stats.grading, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Completados', value: stats.completed, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
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
                placeholder="Buscar exámenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <PenTool className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        {getStatusBadge(exam.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{exam.subject} - {exam.course}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exam.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {exam.studentsGraded}/{exam.studentsTotal} calificados
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {exam.totalPoints} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for grading */}
                  {(exam.status === 'grading' || exam.status === 'completed') && (
                    <div className="w-full lg:w-48">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{Math.round((exam.studentsGraded / exam.studentsTotal) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(exam.studentsGraded / exam.studentsTotal) * 100}%` }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {exam.status === 'grading' && (
                      <Button onClick={() => openGradingModal(exam)}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Calificar
                      </Button>
                    )}
                    {exam.status === 'completed' && (
                      <Button variant="outline" onClick={() => openGradingModal(exam)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Notas
                      </Button>
                    )}
                    {exam.status === 'scheduled' && (
                      <>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Exam Modal */}
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
                <h2 className="text-xl font-semibold">Crear Nuevo Examen</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título del Examen</label>
                  <Input
                    placeholder="Ej: Examen Parcial - Álgebra"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Curso</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newExam.course}
                    onChange={(e) => setNewExam({ ...newExam, course: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="5to A - Matemáticas">5to A - Matemáticas</option>
                    <option value="5to B - Matemáticas">5to B - Matemáticas</option>
                    <option value="6to A - Álgebra">6to A - Álgebra</option>
                    <option value="6to B - Geometría">6to B - Geometría</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha</label>
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Puntaje Total</label>
                  <Input
                    type="number"
                    value={newExam.totalPoints}
                    onChange={(e) => setNewExam({ ...newExam, totalPoints: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Archivo del Examen (opcional)</label>
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
                  Crear Examen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grading Modal */}
      <AnimatePresence>
        {showGradingModal && selectedExam && (
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
                  <h2 className="text-xl font-semibold">{selectedExam.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedExam.subject} - {selectedExam.course}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowGradingModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {students.map((student, index) => (
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
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.status === 'graded' ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Calificado
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <Clock className="h-3 w-3" />
                                  Pendiente
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground whitespace-nowrap">Nota:</label>
                            <Input
                              type="number"
                              min="0"
                              max={selectedExam.totalPoints}
                              value={student.grade ?? ''}
                              onChange={(e) => handleGradeStudent(student.id, e.target.value ? Number(e.target.value) : null, student.observation)}
                              className="w-20"
                              placeholder="--"
                            />
                            <span className="text-sm text-muted-foreground">/ {selectedExam.totalPoints}</span>
                          </div>

                          <Input
                            placeholder="Observación (opcional)"
                            value={student.observation}
                            onChange={(e) => handleGradeStudent(student.id, student.grade, e.target.value)}
                            className="flex-1 sm:w-48"
                          />
                        </div>
                      </div>

                      {student.observation && student.status === 'graded' && (
                        <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-700">{student.observation}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
                <div className="text-sm text-muted-foreground">
                  {students.filter(s => s.status === 'graded').length} de {students.length} estudiantes calificados
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowGradingModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setShowGradingModal(false)}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Calificaciones
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
