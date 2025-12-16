'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Users,
  Clock,
  Eye,
  MapPin,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { coursesService, studentsService, type Course, type Student } from '@/services/mock-data'

const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']

// Simulamos el ID del profesor actual (en producción vendría de auth)
const CURRENT_TEACHER_ID = 't1'

export default function TeacherCursosPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseStudents, setCourseStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false)

  // Estado para sesión de clase
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [classInSession, setClassInSession] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [classStudents, setClassStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({})
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const allCourses = await coursesService.getAll()
      // Filtrar solo los cursos del profesor actual
      const teacherCourses = allCourses.filter(c => c.teacherId === CURRENT_TEACHER_ID && c.status === 'active')
      setCourses(teacherCourses)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los cursos'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudents = async (course: Course) => {
    try {
      setSelectedCourse(course)
      setLoadingStudents(true)
      setIsStudentsModalOpen(true)

      const allStudents = await studentsService.getAll()
      // Filtrar estudiantes por la sección del curso
      const students = allStudents.filter(s => s.gradeSection === course.gradeSection && s.status === 'active')
      setCourseStudents(students)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes'
      })
    } finally {
      setLoadingStudents(false)
    }
  }

  // Funciones para la sesión de clase
  const handleStartClass = async (course: Course) => {
    try {
      setSelectedCourse(course)
      setLoadingStudents(true)
      setIsClassModalOpen(true)

      const allStudents = await studentsService.getAll()
      const students = allStudents.filter(s => s.gradeSection === course.gradeSection && s.status === 'active')
      setClassStudents(students)

      // Inicializar asistencia como ausente para todos
      const initialAttendance: Record<string, 'present' | 'absent' | 'late'> = {}
      students.forEach(s => {
        initialAttendance[s.id] = 'absent'
      })
      setAttendance(initialAttendance)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes'
      })
    } finally {
      setLoadingStudents(false)
    }
  }

  const startSession = () => {
    setClassInSession(true)
    setSessionTime(0)
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    toast({
      title: 'Clase iniciada',
      description: `${selectedCourse?.subjectName} - ${selectedCourse?.gradeSection}`
    })
  }

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setClassInSession(false)

    const presentCount = Object.values(attendance).filter(a => a === 'present').length
    const lateCount = Object.values(attendance).filter(a => a === 'late').length
    const absentCount = Object.values(attendance).filter(a => a === 'absent').length

    toast({
      title: 'Clase finalizada',
      description: `Duración: ${formatTime(sessionTime)} | Presentes: ${presentCount} | Tardanzas: ${lateCount} | Ausentes: ${absentCount}`
    })

    setIsClassModalOpen(false)
    setSessionTime(0)
  }

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => {
      const current = prev[studentId]
      let next: 'present' | 'absent' | 'late' = 'present'
      if (current === 'present') next = 'late'
      else if (current === 'late') next = 'absent'
      else next = 'present'
      return { ...prev, [studentId]: next }
    })
  }

  const markAllPresent = () => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late'> = {}
    classStudents.forEach(s => {
      newAttendance[s.id] = 'present'
    })
    setAttendance(newAttendance)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAttendanceColor = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present': return 'bg-green-500 text-white'
      case 'late': return 'bg-yellow-500 text-white'
      case 'absent': return 'bg-red-500 text-white'
    }
  }

  const getAttendanceIcon = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present': return CheckCircle
      case 'late': return Clock
      case 'absent': return XCircle
    }
  }

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const totalStudents = courseStudents.length || courses.reduce((acc, c) => {
    const allStudents = courseStudents.filter(s => s.gradeSection === c.gradeSection)
    return acc + allStudents.length
  }, 0)

  const stats = [
    { label: 'Mis Cursos', value: courses.length, icon: BookOpen },
    { label: 'Total Estudiantes', value: totalStudents || 'Cargando...', icon: Users },
    { label: 'Horas Semanales', value: '18h', icon: Clock },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground mt-1">Cursos que tengo asignados este período</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground mt-1">Cursos que tengo asignados este período</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div className="p-3 rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
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

        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes cursos asignados</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl ${colors[index % colors.length]} flex items-center justify-center`}>
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.subjectName}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{course.gradeSection}</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{course.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{course.room}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewStudents(course)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Estudiantes
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleStartClass(course)}>
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar Clase
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Estudiantes */}
      <Dialog open={isStudentsModalOpen} onOpenChange={setIsStudentsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estudiantes del Curso</DialogTitle>
            <DialogDescription>
              {selectedCourse?.subjectName} - {selectedCourse?.gradeSection}
            </DialogDescription>
          </DialogHeader>

          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : courseStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay estudiantes matriculados en este curso</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{student.code}</span>
                      <span>{student.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tel: {student.phone}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total: {courseStudents.length} estudiante{courseStudents.length !== 1 ? 's' : ''}
            </p>
            <Button onClick={() => setIsStudentsModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sesión de Clase */}
      <Dialog open={isClassModalOpen} onOpenChange={(open) => {
        if (!open && classInSession) {
          // No cerrar si la clase está en sesión
          return
        }
        setIsClassModalOpen(open)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {classInSession ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span>Clase en Sesión</span>
                </>
              ) : (
                <span>Iniciar Clase</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse?.subjectName} - {selectedCourse?.gradeSection} | {selectedCourse?.room}
            </DialogDescription>
          </DialogHeader>

          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timer y controles */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Timer className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo de sesión</p>
                    <p className="text-3xl font-bold font-mono">{formatTime(sessionTime)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!classInSession ? (
                    <Button onClick={startSession} size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      Iniciar Sesión
                    </Button>
                  ) : (
                    <Button onClick={endSession} variant="destructive" size="lg">
                      <Square className="h-5 w-5 mr-2" />
                      Finalizar Clase
                    </Button>
                  )}
                </div>
              </div>

              {/* Lista de asistencia */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Lista de Asistencia</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllPresent}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Marcar todos presente
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classStudents.map((student, index) => {
                    const status = attendance[student.id] || 'absent'
                    const StatusIcon = getAttendanceIcon(status)
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{student.code}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAttendance(student.id)}
                          className={`${getAttendanceColor(status)} hover:opacity-80`}
                        >
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status === 'present' ? 'P' : status === 'late' ? 'T' : 'A'}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Resumen de asistencia */}
                <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">
                      Presentes: {Object.values(attendance).filter(a => a === 'present').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">
                      Tardanzas: {Object.values(attendance).filter(a => a === 'late').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">
                      Ausentes: {Object.values(attendance).filter(a => a === 'absent').length}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <span className="text-sm font-medium">
                    Total: {classStudents.length} estudiantes
                  </span>
                </div>
              </div>

              {/* Botón cerrar (solo si no está en sesión) */}
              {!classInSession && (
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsClassModalOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
