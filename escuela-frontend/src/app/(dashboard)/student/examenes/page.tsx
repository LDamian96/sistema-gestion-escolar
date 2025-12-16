'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  Calendar,
  Clock,
  MapPin,
  Eye,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Sparkles,
  GraduationCap,
  User,
  Loader2,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { examsService, studentsService, type Exam, type Student } from '@/services/mock-data'

interface StudentExam extends Exam {
  studentGrade?: number
  studentFeedback?: string
  room?: string
  studentStatus: 'upcoming' | 'completed' | 'graded'
}

const studentExamData: Record<string, Partial<StudentExam>> = {
  'exam1': { studentStatus: 'upcoming', room: 'Aula 101' },
  'exam2': { studentStatus: 'graded', studentGrade: 17, studentFeedback: 'Muy buen desempeño en comprensión lectora', room: 'Aula 101' },
  'exam3': { studentStatus: 'upcoming', room: 'Lab. Ciencias' },
  'exam4': { studentStatus: 'graded', studentGrade: 16, studentFeedback: 'Buen dominio del vocabulario', room: 'Aula 101' },
  'exam5': { studentStatus: 'upcoming', room: 'Aula 102' }
}

const CURRENT_STUDENT_ID = 's1'

export default function StudentExamenesPage() {
  const [exams, setExams] = useState<StudentExam[]>([])
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<StudentExam | null>(null)
  const { toast } = useToast()
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allExams, allStudents] = await Promise.all([
        examsService.getAll(),
        studentsService.getAll()
      ])

      const student = allStudents.find(s => s.id === CURRENT_STUDENT_ID)
      setCurrentStudent(student || null)

      if (student) {
        const myExams = allExams
          .filter(exam => exam.gradeSection === student.gradeSection)
          .map(exam => {
            const studentData = studentExamData[exam.id] || { studentStatus: 'upcoming' }
            return {
              ...exam,
              ...studentData,
              studentStatus: studentData.studentStatus as 'upcoming' | 'completed' | 'graded'
            }
          })
          .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())

        setExams(myExams)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los exámenes',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredExams = useMemo(() => {
    let result = exams

    if (selectedFilter === 'pending') {
      result = result.filter(e => e.studentStatus === 'upcoming')
    } else if (selectedFilter === 'graded') {
      result = result.filter(e => e.studentStatus === 'graded')
    }

    if (searchTerm) {
      result = result.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return result
  }, [exams, selectedFilter, searchTerm])

  const examsBySubject = useMemo(() => {
    const grouped: { [key: string]: StudentExam[] } = {}
    filteredExams.forEach(exam => {
      const subject = exam.courseName || 'Sin Materia'
      if (!grouped[subject]) grouped[subject] = []
      grouped[subject].push(exam)
    })
    Object.keys(grouped).forEach(subject => {
      grouped[subject].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    })
    return grouped
  }, [filteredExams])

  const subjects = useMemo(() => Object.keys(examsBySubject).sort(), [examsBySubject])

  const stats = useMemo(() => {
    const upcoming = exams.filter(e => e.studentStatus === 'upcoming').length
    const graded = exams.filter(e => e.studentStatus === 'graded')
    const avgGrade = graded.length > 0
      ? (graded.reduce((acc, e) => acc + (e.studentGrade || 0), 0) / graded.length).toFixed(1)
      : '-'

    return {
      upcoming,
      graded: graded.length,
      average: avgGrade,
      total: exams.length
    }
  }, [exams])

  const scrollToSubject = (subject: string) => {
    const element = sectionRefs.current[subject]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleViewExam = (exam: StudentExam) => {
    setSelectedExam(exam)
    setViewModalOpen(true)
  }

  const getExamTypeLabel = (type: string) => {
    switch (type) {
      case 'partial': return 'Parcial'
      case 'final': return 'Final'
      case 'quiz': return 'Práctica'
      default: return type
    }
  }

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'partial': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'final': return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      case 'quiz': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const isExamSoon = (examDate: string) => {
    const today = new Date()
    const exam = new Date(examDate)
    const diffDays = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando exámenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-6 text-white">
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
                <h1 className="text-2xl sm:text-3xl font-bold">Mis Exámenes</h1>
                <p className="text-white/80 mt-1">
                  {currentStudent?.firstName} {currentStudent?.lastName} • {currentStudent?.gradeSection}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm py-1.5 self-start sm:self-auto">
              {filteredExams.length} exámenes
            </Badge>
          </div>
        </div>
        <Sparkles className="absolute right-4 top-4 h-8 w-8 text-white/20" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Próximos', value: stats.upcoming, icon: Calendar, bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500', filter: 'pending' },
          { label: 'Calificados', value: stats.graded, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-500', filter: 'graded' },
          { label: 'Promedio', value: stats.average, icon: TrendingUp, bg: 'bg-purple-50 dark:bg-purple-950/30', iconBg: 'bg-purple-500', filter: null },
          { label: 'Total', value: stats.total, icon: ClipboardList, bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-500', filter: 'all' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`border-0 ${stat.bg} ${stat.filter !== null ? 'cursor-pointer hover:shadow-xl' : ''} transition-all duration-300 ${stat.filter && selectedFilter === stat.filter ? 'ring-2 ring-primary' : ''}`}
              onClick={() => stat.filter && setSelectedFilter(stat.filter)}
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
              placeholder="Buscar exámenes por título o materia..."
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
                { value: 'all', label: 'Todos' },
                { value: 'pending', label: 'Próximos' },
                { value: 'graded', label: 'Calificados' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
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
        <Card className="border-0 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-rose-600" />
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
                  className="gap-2 bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                >
                  <BookOpen className="h-4 w-4 text-rose-600" />
                  {subject}
                  <Badge variant="secondary" className="ml-1 bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                    {examsBySubject[subject].length}
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Exámenes */}
      {subjects.length === 0 ? (
        <Card className="border-0">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'No se encontraron exámenes' : 'No hay exámenes en esta categoría'}
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
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/20">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-lg">{subject}</span>
                        <p className="text-sm font-normal text-white/80">
                          {examsBySubject[subject].length} examen(es)
                        </p>
                      </div>
                    </CardTitle>
                    <Badge className="bg-white/20 text-white border-0">
                      {examsBySubject[subject].filter(e => e.studentStatus === 'upcoming').length} próximos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {examsBySubject[subject].map((exam, index) => {
                      const isSoon = exam.studentStatus === 'upcoming' && isExamSoon(exam.examDate)

                      return (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`p-4 hover:bg-muted/50 transition-colors relative ${isSoon ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                        >
                          {isSoon && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                          )}
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{exam.title}</h3>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getExamTypeColor(exam.type)}`}>
                                  {getExamTypeLabel(exam.type)}
                                </span>
                                <span className={`px-2.5 py-1 text-xs rounded-full text-white font-medium ${
                                  exam.studentStatus === 'graded' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}>
                                  {exam.studentStatus === 'graded' ? 'Calificado' : 'Programado'}
                                </span>
                                {isSoon && (
                                  <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500 text-white font-medium flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Próximamente
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{exam.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <User className="h-4 w-4" />
                                  {exam.teacherName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(exam.examDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  {exam.startTime} - {exam.endTime}
                                </span>
                                {exam.room && (
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {exam.room}
                                  </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                  <Award className="h-4 w-4" />
                                  {exam.maxScore} pts
                                </span>
                              </div>
                            </div>

                            {exam.studentStatus === 'graded' && exam.studentGrade !== undefined && (
                              <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${exam.studentGrade >= exam.maxScore * 0.6 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                  <span className="text-lg font-bold text-white">{exam.studentGrade}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">de {exam.maxScore}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewExam(exam)} className="gap-2">
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
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
              <ClipboardList className="h-5 w-5 text-primary" />
              Detalles del Examen
            </DialogTitle>
          </DialogHeader>

          {selectedExam && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                <p className="text-sm text-muted-foreground mb-1">Título</p>
                <p className="font-semibold text-lg">{selectedExam.title}</p>
              </div>

              {selectedExam.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">{selectedExam.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Materia</p>
                  <p className="font-medium">{selectedExam.courseName}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Profesor</p>
                  <p className="font-medium">{selectedExam.teacherName}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getExamTypeColor(selectedExam.type)}`}>
                    {getExamTypeLabel(selectedExam.type)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Puntaje Máximo</p>
                  <p className="font-medium">{selectedExam.maxScore} puntos</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(selectedExam.examDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Horario</p>
                  <p className="font-medium">{selectedExam.startTime} - {selectedExam.endTime}</p>
                </div>
              </div>

              {selectedExam.room && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <p className="text-xs text-muted-foreground">Aula</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {selectedExam.room}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Estado</p>
                <span className={`inline-block px-3 py-1.5 text-sm rounded-full text-white font-medium ${
                  selectedExam.studentStatus === 'graded' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {selectedExam.studentStatus === 'graded' ? 'Calificado' : 'Programado'}
                </span>
              </div>

              {selectedExam.studentStatus === 'graded' && selectedExam.studentGrade !== undefined && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-3">Calificación</p>
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${selectedExam.studentGrade >= selectedExam.maxScore * 0.6 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      <span className="text-2xl font-bold text-white">{selectedExam.studentGrade}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold">de {selectedExam.maxScore} puntos</p>
                      <p className={`text-sm ${selectedExam.studentGrade >= selectedExam.maxScore * 0.6 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedExam.studentGrade >= selectedExam.maxScore * 0.6 ? 'Aprobado' : 'Desaprobado'}
                      </p>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(selectedExam.studentGrade / selectedExam.maxScore) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${selectedExam.studentGrade >= selectedExam.maxScore * 0.6 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((selectedExam.studentGrade / selectedExam.maxScore) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  {selectedExam.studentFeedback && (
                    <div className="mt-4 p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Retroalimentación del profesor</p>
                      <p className="text-sm">{selectedExam.studentFeedback}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedExam.studentStatus === 'upcoming' && isExamSoon(selectedExam.examDate) && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-400">Examen Próximo</p>
                      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                        Este examen está programado para los próximos días. Asegúrate de prepararte adecuadamente.
                      </p>
                    </div>
                  </div>
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
    </div>
  )
}
