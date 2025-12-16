'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash2,
  X,
  FileText,
  Award,
  LayoutGrid,
  List,
  Filter,
  Users,
  CheckCircle2,
  Save,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { examsService, coursesService, gradeSectionsService, studentsService, type Exam, type Course, type GradeSection, type Student } from '@/services/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toast'

type ExamFormData = Omit<Exam, 'id'>

// Tipo para calificaciones de estudiantes
type StudentGrade = {
  studentId: string
  studentName: string
  studentCode: string
  score: number | null
  comment: string
}

export default function ExamenesPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')
  const [selectedTurno, setSelectedTurno] = useState<string>('all')
  const [selectedGradeSection, setSelectedGradeSection] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'scheduled' | 'graded'>('all')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'delete' | 'grade'>('create')
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [isSavingGrades, setIsSavingGrades] = useState(false)
  const [formData, setFormData] = useState<ExamFormData & { gradeSectionId: string }>({
    title: '',
    description: '',
    courseId: '',
    courseName: '',
    gradeSection: '',
    gradeSectionId: '',
    level: 'Inicial',
    teacherId: '',
    teacherName: '',
    examDate: '',
    startTime: '08:00',
    endTime: '09:30',
    type: 'partial',
    maxScore: 20,
    status: 'scheduled'
  })

  const { toast, toasts, dismiss } = useToast()

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [examsData, coursesData, gradeSectionsData, studentsData] = await Promise.all([
        examsService.getAll(),
        coursesService.getAll(),
        gradeSectionsService.getAll(),
        studentsService.getAll()
      ])
      setExams(examsData)
      setCourses(coursesData)
      setGradeSections(gradeSectionsData)
      setStudents(studentsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Turnos disponibles
  const availableTurnos = useMemo(() => {
    const turnos = new Set<string>()
    gradeSections.forEach(gs => {
      if (gs.turno) turnos.add(gs.turno)
    })
    return Array.from(turnos).sort()
  }, [gradeSections])

  // Obtener grado/secciones únicos
  const allGradeSectionNames = useMemo(() => {
    const unique = [...new Set(exams.map(e => e.gradeSection))]
    return unique.sort()
  }, [exams])

  // Filtrar grado/secciones por nivel y turno seleccionados
  const filteredGradeSectionsForFilter = useMemo(() => {
    let result = gradeSections
    if (selectedLevel !== 'all') {
      result = result.filter(gs => gs.level === selectedLevel)
    }
    if (selectedTurno !== 'all') {
      result = result.filter(gs => gs.turno === selectedTurno)
    }
    const names = result.map(gs => `${gs.grade} ${gs.section}`)
    return allGradeSectionNames.filter(gs => names.includes(gs) || selectedLevel === 'all')
  }, [allGradeSectionNames, gradeSections, selectedLevel, selectedTurno])

  // Grado-secciones para el formulario
  const filteredGradeSectionsForForm = useMemo(() => {
    return gradeSections.filter(gs => gs.level === formData.level)
  }, [gradeSections, formData.level])

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.gradeSection.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = selectedLevel === 'all' || exam.level === selectedLevel

      // Filtrar por turno usando los grado-secciones
      let matchesTurno = true
      if (selectedTurno !== 'all') {
        const gsWithTurno = gradeSections
          .filter(gs => gs.turno === selectedTurno)
          .map(gs => `${gs.grade} ${gs.section}`)
        matchesTurno = gsWithTurno.includes(exam.gradeSection)
      }

      const matchesGradeSection = selectedGradeSection === 'all' || exam.gradeSection === selectedGradeSection
      const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus
      return matchesSearch && matchesLevel && matchesTurno && matchesGradeSection && matchesStatus
    })
  }, [exams, searchTerm, selectedLevel, selectedTurno, selectedGradeSection, selectedStatus, gradeSections])

  // Agrupar exámenes por materia y grado-sección
  const groupedExams = useMemo(() => {
    const groups: Record<string, {
      key: string
      courseName: string
      gradeSection: string
      level: string
      turno: string
      teacherName: string
      exams: Exam[]
    }> = {}

    filteredExams.forEach(exam => {
      // Encontrar el turno del grado-sección
      const gs = gradeSections.find(g => `${g.grade} ${g.section}` === exam.gradeSection)
      const turno = gs?.turno || 'Sin turno'

      const key = `${exam.courseName}-${exam.gradeSection}-${turno}`

      if (!groups[key]) {
        groups[key] = {
          key,
          courseName: exam.courseName,
          gradeSection: exam.gradeSection,
          level: exam.level,
          turno,
          teacherName: exam.teacherName,
          exams: []
        }
      }
      groups[key].exams.push(exam)
    })

    // Ordenar por nivel, grado-sección y materia
    return Object.values(groups).sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level)
      if (a.gradeSection !== b.gradeSection) return a.gradeSection.localeCompare(b.gradeSection)
      return a.courseName.localeCompare(b.courseName)
    })
  }, [filteredExams, gradeSections])

  // Toggle grupo expandido
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }

  // Expandir/Colapsar todos
  const expandAll = () => {
    setExpandedGroups(new Set(groupedExams.map(g => g.key)))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  // Filtered courses based on selected level
  const filteredCourses = useMemo(() => {
    if (selectedLevel === 'all') return courses
    const gradeSectionNames = gradeSections
      .filter(gs => gs.level === selectedLevel)
      .map(gs => `${gs.grade} ${gs.section}`)
    return courses.filter(c => gradeSectionNames.includes(c.gradeSection))
  }, [courses, gradeSections, selectedLevel])

  // Estudiantes que coinciden con el examen seleccionado (por gradeSection)
  const examStudents = useMemo(() => {
    if (!selectedExam) return []
    return students.filter(s => s.gradeSection === selectedExam.gradeSection && s.status === 'active')
  }, [selectedExam, students])

  // Stats
  const stats = [
    {
      label: 'Total Exámenes',
      value: exams.length,
      icon: ClipboardList,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Programados',
      value: exams.filter(e => e.status === 'scheduled').length,
      icon: Calendar,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Calificados',
      value: exams.filter(e => e.status === 'graded').length,
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
  ]

  // Handlers
  const handleCreate = () => {
    setModalMode('create')
    setSelectedExam(null)
    setFormData({
      title: '',
      description: '',
      courseId: '',
      courseName: '',
      gradeSection: '',
      gradeSectionId: '',
      level: 'Inicial',
      teacherId: '',
      teacherName: '',
      examDate: '',
      startTime: '08:00',
      endTime: '09:30',
      type: 'partial',
      maxScore: 20,
      status: 'scheduled'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (exam: Exam) => {
    setModalMode('edit')
    setSelectedExam(exam)
    // Buscar el gradeSectionId basado en el gradeSection
    const gs = gradeSections.find(g => `${g.grade} ${g.section}` === exam.gradeSection)
    setFormData({
      title: exam.title,
      description: exam.description,
      courseId: exam.courseId,
      courseName: exam.courseName,
      gradeSection: exam.gradeSection,
      gradeSectionId: gs?.id || '',
      level: exam.level as 'Inicial' | 'Primaria' | 'Secundaria',
      teacherId: exam.teacherId,
      teacherName: exam.teacherName,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      type: exam.type,
      maxScore: exam.maxScore,
      status: exam.status,
      averageScore: exam.averageScore
    })
    setIsModalOpen(true)
  }

  const handleView = (exam: Exam) => {
    router.push(`/admin/examenes/${exam.id}`)
  }

  const handleDelete = (exam: Exam) => {
    setModalMode('delete')
    setSelectedExam(exam)
    setIsModalOpen(true)
  }

  const handleGrade = (exam: Exam) => {
    setModalMode('grade')
    setSelectedExam(exam)
    // Cargar estudiantes del grado/sección del examen
    const examStudentsList = students.filter(s => s.gradeSection === exam.gradeSection && s.status === 'active')
    // Inicializar calificaciones (simulando que algunas ya tienen notas si el examen está calificado)
    const initialGrades: StudentGrade[] = examStudentsList.map((student, index) => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentCode: student.code,
      score: exam.status === 'graded' ? Math.floor(Math.random() * 6) + 14 : null, // Si ya está calificado, mostrar notas simuladas
      comment: ''
    }))
    setStudentGrades(initialGrades)
    setIsModalOpen(true)
  }

  const handleScoreChange = (studentId: string, score: number | null) => {
    setStudentGrades(prev => prev.map(sg =>
      sg.studentId === studentId ? { ...sg, score } : sg
    ))
  }

  const handleCommentChange = (studentId: string, comment: string) => {
    setStudentGrades(prev => prev.map(sg =>
      sg.studentId === studentId ? { ...sg, comment } : sg
    ))
  }

  const saveGrades = async () => {
    if (!selectedExam) return

    // Validar que todas las notas estén completas
    const incompleteGrades = studentGrades.filter(sg => sg.score === null)
    if (incompleteGrades.length > 0) {
      toast({
        title: 'Calificaciones incompletas',
        description: `Faltan ${incompleteGrades.length} estudiantes por calificar`,
        type: 'error'
      })
      return
    }

    try {
      setIsSavingGrades(true)
      // Calcular promedio
      const totalScore = studentGrades.reduce((sum, sg) => sum + (sg.score || 0), 0)
      const averageScore = Math.round((totalScore / studentGrades.length) * 10) / 10

      // Actualizar el examen con el promedio y estado
      const updatedExam = await examsService.update(selectedExam.id, {
        status: 'graded',
        averageScore
      })

      setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e))

      toast({
        title: 'Calificaciones guardadas',
        description: `Se han guardado las calificaciones de ${studentGrades.length} estudiantes. Promedio: ${averageScore}`,
        type: 'success'
      })
      setIsModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las calificaciones',
        type: 'error'
      })
    } finally {
      setIsSavingGrades(false)
    }
  }

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course) {
      // Find the level based on gradeSection
      const gradeSection = gradeSections.find(gs => `${gs.grade} ${gs.section}` === course.gradeSection)
      setFormData(prev => ({
        ...prev,
        courseId: course.id,
        courseName: course.subjectName,
        gradeSection: course.gradeSection,
        level: gradeSection?.level || 'Primaria',
        teacherId: course.teacherId,
        teacherName: course.teacherName
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.gradeSectionId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un grado/sección',
        type: 'error'
      })
      return
    }

    try {
      const selectedGradeSection = gradeSections.find(gs => gs.id === formData.gradeSectionId)
      if (!selectedGradeSection) {
        toast({
          title: 'Error',
          description: 'Grado/Sección no encontrado',
          type: 'error'
        })
        return
      }

      // Buscar un curso asociado al grado-sección si existe
      const associatedCourse = courses.find(c => c.gradeSection === `${selectedGradeSection.grade} ${selectedGradeSection.section}`)

      const examData = {
        ...formData,
        courseId: associatedCourse?.id || '',
        courseName: associatedCourse?.subjectName || 'General',
        gradeSection: `${selectedGradeSection.grade} ${selectedGradeSection.section}`,
        teacherId: associatedCourse?.teacherId || '',
        teacherName: associatedCourse?.teacherName || 'Sin asignar'
      }

      if (modalMode === 'create') {
        const newExam = await examsService.create(examData)
        setExams([...exams, newExam])
        toast({
          title: 'Examen creado',
          description: `El examen "${formData.title}" ha sido creado exitosamente`,
          type: 'success'
        })
      } else if (modalMode === 'edit' && selectedExam) {
        const updatedExam = await examsService.update(selectedExam.id, examData)
        setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e))
        toast({
          title: 'Examen actualizado',
          description: `El examen "${formData.title}" ha sido actualizado exitosamente`,
          type: 'success'
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el examen',
        type: 'error'
      })
    }
  }

  const confirmDelete = async () => {
    if (!selectedExam) return

    try {
      await examsService.delete(selectedExam.id)
      setExams(exams.filter(e => e.id !== selectedExam.id))
      toast({
        title: 'Examen eliminado',
        description: `El examen "${selectedExam.title}" ha sido eliminado`,
        type: 'success'
      })
      setIsModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el examen',
        type: 'error'
      })
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Primaria': return 'bg-blue-500/20 text-blue-600'
      case 'Secundaria': return 'bg-purple-500/20 text-purple-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando exámenes...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">Gestión de Exámenes</h1>
            <p className="text-muted-foreground mt-1">Administra los exámenes y evaluaciones</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Examen
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exámenes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Level, Turno, GradeSection and Status filters */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Nivel:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'Inicial', 'Primaria', 'Secundaria'] as const).map((level) => (
                        <Button
                          key={level}
                          variant={selectedLevel === level ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedLevel(level)
                            setSelectedGradeSection('all')
                          }}
                        >
                          {level === 'all' ? 'Todos' : level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Turno:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedTurno === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedTurno('all')
                          setSelectedGradeSection('all')
                        }}
                      >
                        Todos
                      </Button>
                      {availableTurnos.map((turno) => (
                        <Button
                          key={turno}
                          variant={selectedTurno === turno ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedTurno(turno)
                            setSelectedGradeSection('all')
                          }}
                        >
                          {turno}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Grado/Sección:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedGradeSection === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGradeSection('all')}
                      >
                        Todos
                      </Button>
                      {filteredGradeSectionsForFilter.map((gs) => (
                        <Button
                          key={gs}
                          variant={selectedGradeSection === gs ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedGradeSection(gs)}
                        >
                          {gs}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Estado:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'scheduled', 'graded'] as const).map((status) => (
                        <Button
                          key={status}
                          variant={selectedStatus === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedStatus(status)}
                        >
                          {status === 'all' ? 'Todos' : getStatusText(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredExams.length} de {exams.length} exámenes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exámenes agrupados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Exámenes por Materia y Grado
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expandir todo
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Colapsar todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {groupedExams.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron exámenes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedExams.map((group, groupIndex) => {
                  const isExpanded = expandedGroups.has(group.key)
                  const scheduledCount = group.exams.filter(e => e.status === 'scheduled').length
                  const gradedCount = group.exams.filter(e => e.status === 'graded').length

                  return (
                    <motion.div
                      key={group.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.03 }}
                      className="border rounded-xl overflow-hidden"
                    >
                      {/* Header del grupo - Clickeable */}
                      <button
                        onClick={() => toggleGroup(group.key)}
                        className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30 hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/30 transition-colors text-left"
                      >
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                          group.level === 'Primaria' ? 'from-blue-500 to-blue-600' :
                          group.level === 'Secundaria' ? 'from-purple-500 to-purple-600' :
                          'from-emerald-500 to-emerald-600'
                        } shadow-lg`}>
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{group.courseName}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelColor(group.level)}`}>
                              {group.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {group.gradeSection}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {group.turno}
                            </span>
                            <span>{group.teacherName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Badges de estado */}
                          <div className="flex gap-2">
                            {scheduledCount > 0 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                {scheduledCount} programados
                              </span>
                            )}
                            {gradedCount > 0 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                {gradedCount} calificados
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {group.exams.length} {group.exams.length === 1 ? 'examen' : 'exámenes'}
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </div>
                      </button>

                      {/* Contenido expandible - Lista de exámenes */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t bg-muted/20 divide-y">
                              {group.exams.map((exam, examIndex) => (
                                <motion.div
                                  key={exam.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: examIndex * 0.03 }}
                                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{exam.title}</p>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(exam.status)}`}>
                                        {getStatusText(exam.status)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {exam.examDate}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Award className="h-3 w-3" />
                                        {exam.maxScore} pts
                                      </span>
                                      {exam.averageScore && (
                                        <span className="text-emerald-600 font-medium">
                                          Promedio: {exam.averageScore}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleView(exam)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGrade(exam)}
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      title="Calificar"
                                    >
                                      <GraduationCap className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(exam)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(exam)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {modalMode === 'create' && 'Nuevo Examen'}
                  {modalMode === 'edit' && 'Editar Examen'}
                  {modalMode === 'view' && 'Detalles del Examen'}
                  {modalMode === 'delete' && 'Eliminar Examen'}
                  {modalMode === 'grade' && 'Calificar Examen'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {modalMode === 'delete' ? (
                <div className="space-y-4">
                  <p>¿Está seguro que desea eliminar el examen "{selectedExam?.title}"?</p>
                  <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ) : modalMode === 'view' && selectedExam ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Título</Label>
                      <p className="font-medium">{selectedExam.title}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Nivel</Label>
                      <p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(selectedExam.level)}`}>
                          {selectedExam.level}
                        </span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Curso</Label>
                      <p className="font-medium">{selectedExam.courseName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Grado/Sección</Label>
                      <p className="font-medium">{selectedExam.gradeSection}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Profesor</Label>
                      <p className="font-medium">{selectedExam.teacherName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fecha</Label>
                      <p className="font-medium">{selectedExam.examDate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Puntaje Máximo</Label>
                      <p className="font-medium">{selectedExam.maxScore} puntos</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedExam.status)}`}>
                          {getStatusText(selectedExam.status)}
                        </span>
                      </p>
                    </div>
                    {selectedExam.averageScore && (
                      <div>
                        <Label className="text-muted-foreground">Promedio</Label>
                        <p className="font-medium text-green-600">{selectedExam.averageScore}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Descripción</Label>
                    <p className="mt-1">{selectedExam.description}</p>
                  </div>

                  {/* Lista de Estudiantes Asignados */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-primary" />
                      <Label className="text-base font-semibold">Estudiantes Asignados ({examStudents.length})</Label>
                    </div>
                    {examStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay estudiantes activos en este grado/sección</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {examStudents.map((student, index) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                              <p className="text-xs text-muted-foreground">{student.code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                  </div>
                </div>
              ) : modalMode === 'grade' && selectedExam ? (
                <div className="space-y-4">
                  {/* Info del examen */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500 text-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedExam.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedExam.courseName} - {selectedExam.gradeSection}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm mt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {selectedExam.examDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        Máx: {selectedExam.maxScore} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {studentGrades.length} estudiantes
                      </span>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStudentGrades(prev => prev.map(sg => ({ ...sg, score: selectedExam.maxScore })))
                      }}
                      className="text-emerald-600 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Todos {selectedExam.maxScore}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStudentGrades(prev => prev.map(sg => ({ ...sg, score: Math.round(selectedExam.maxScore * 0.5) })))
                      }}
                    >
                      Todos 50%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStudentGrades(prev => prev.map(sg => ({ ...sg, score: null })))
                      }}
                    >
                      Limpiar todo
                    </Button>
                  </div>

                  {/* Lista de estudiantes para calificar */}
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">Estudiante</span>
                      <span className="text-sm font-medium">Nota (0-{selectedExam.maxScore})</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto divide-y">
                      {studentGrades.map((sg, index) => (
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
                              max={selectedExam.maxScore}
                              step="0.5"
                              value={sg.score ?? ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? null : parseFloat(e.target.value)
                                if (value === null || (value >= 0 && value <= selectedExam.maxScore)) {
                                  handleScoreChange(sg.studentId, value)
                                }
                              }}
                              className={`w-20 text-center font-medium ${
                                sg.score !== null
                                  ? sg.score >= selectedExam.maxScore * 0.6
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : sg.score >= selectedExam.maxScore * 0.4
                                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                                    : 'border-rose-300 bg-rose-50 text-rose-700'
                                  : ''
                              }`}
                              placeholder="--"
                            />
                            {sg.score !== null && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                sg.score >= selectedExam.maxScore * 0.6
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : sg.score >= selectedExam.maxScore * 0.4
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}>
                                {sg.score >= selectedExam.maxScore * 0.6 ? 'Aprobado' : 'Desaprobado'}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen */}
                  {studentGrades.some(sg => sg.score !== null) && (
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <h4 className="font-medium text-sm">Resumen de calificaciones</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                          <p className="text-emerald-600 font-medium">
                            {studentGrades.filter(sg => sg.score !== null && sg.score >= selectedExam.maxScore * 0.6).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Aprobados</p>
                        </div>
                        <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/30">
                          <p className="text-rose-600 font-medium">
                            {studentGrades.filter(sg => sg.score !== null && sg.score < selectedExam.maxScore * 0.6).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Desaprobados</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950/30">
                          <p className="text-slate-600 font-medium">
                            {studentGrades.filter(sg => sg.score === null).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Sin calificar</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                          <p className="text-blue-600 font-medium">
                            {(() => {
                              const gradedStudents = studentGrades.filter(sg => sg.score !== null)
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

                  {/* Botones */}
                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={saveGrades}
                      disabled={isSavingGrades || studentGrades.every(sg => sg.score === null)}
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
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ej: Examen Parcial - Matemáticas"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción del examen"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Nivel *</Label>
                      <select
                        id="level"
                        value={formData.level}
                        onChange={(e) => {
                          setFormData({ ...formData, level: e.target.value as Exam['level'], gradeSectionId: '', courseId: '', courseName: '', gradeSection: '', teacherId: '', teacherName: '' })
                        }}
                        required
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="Inicial">Inicial</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="gradeSectionId">Grado/Sección *</Label>
                      <select
                        id="gradeSectionId"
                        value={formData.gradeSectionId}
                        onChange={(e) => setFormData({ ...formData, gradeSectionId: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="">Seleccionar grado/sección</option>
                        {filteredGradeSectionsForForm.map(gs => (
                          <option key={gs.id} value={gs.id}>
                            {gs.grade} {gs.section} ({gs.turno})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examDate">Fecha *</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={formData.examDate}
                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="startTime">Hora Inicio *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">Hora Fin *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Tipo de Examen *</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'partial' | 'final' | 'quiz' })}
                        required
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="partial">Parcial</option>
                        <option value="final">Final</option>
                        <option value="quiz">Práctica</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="maxScore">Puntaje Máximo *</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        min="1"
                        value={formData.maxScore}
                        onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  {formData.gradeSectionId && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                      <p><strong>Grado/Sección:</strong> {(() => {
                        const gs = filteredGradeSectionsForForm.find(g => g.id === formData.gradeSectionId)
                        return gs ? `${gs.grade} ${gs.section}` : ''
                      })()}</p>
                      <p><strong>Turno:</strong> {(() => {
                        const gs = filteredGradeSectionsForForm.find(g => g.id === formData.gradeSectionId)
                        return gs?.turno || ''
                      })()}</p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
