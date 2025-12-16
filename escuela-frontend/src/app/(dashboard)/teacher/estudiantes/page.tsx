'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Search,
  Mail,
  Eye,
  Users,
  Phone,
  MapPin,
  Calendar,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { coursesService, studentsService, type Course, type Student } from '@/services/mock-data'

// Simulamos el ID del profesor actual
const CURRENT_TEACHER_ID = 't1'

export default function TeacherEstudiantesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar cursos del profesor
      const allCourses = await coursesService.getAll()
      const teacherCourses = allCourses.filter(c => c.teacherId === CURRENT_TEACHER_ID && c.status === 'active')
      setCourses(teacherCourses)

      // Cargar estudiantes de las secciones de los cursos del profesor
      const allStudents = await studentsService.getAll()
      const gradeSections = [...new Set(teacherCourses.map(c => c.gradeSection))]
      const teacherStudents = allStudents.filter(s =>
        gradeSections.includes(s.gradeSection) && s.status === 'active'
      )
      setStudents(teacherStudents)

      // Establecer el primer grado como seleccionado
      if (gradeSections.length > 0 && selectedGrade === 'all') {
        setSelectedGrade(gradeSections[0])
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailModalOpen(true)
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGrade = selectedGrade === 'all' || student.gradeSection === selectedGrade
      return matchesSearch && matchesGrade
    })
  }, [searchTerm, selectedGrade, students])

  const uniqueGrades = [...new Set(courses.map(c => c.gradeSection))].sort()

  const calculateAverage = () => {
    // Simulamos un promedio (en producción vendría de calificaciones reales)
    return '16.2'
  }

  const calculateAttendance = () => {
    // Simulamos asistencia (en producción vendría de datos reales)
    return '94%'
  }

  const stats = [
    { label: 'Mis Estudiantes', value: filteredStudents.length, icon: GraduationCap },
    { label: 'Promedio General', value: calculateAverage(), icon: GraduationCap },
    { label: 'Asistencia Promedio', value: calculateAttendance(), icon: Users },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Estudiantes</h1>
          <p className="text-muted-foreground mt-1">Estudiantes de mis cursos asignados</p>
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
          <h1 className="font-heading text-3xl font-bold">Mis Estudiantes</h1>
          <p className="text-muted-foreground mt-1">Estudiantes de mis cursos asignados</p>
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiantes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Todos los grados</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Estudiantes
              {selectedGrade !== 'all' && ` - ${selectedGrade}`}
              {' '}({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes en este curso'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </span>
                        <span className="hidden sm:inline">{student.gradeSection}</span>
                      </div>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="font-bold text-lg">16.5</p>
                      <p className="text-xs text-muted-foreground">Promedio</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="font-bold text-lg">95%</p>
                      <p className="text-xs text-muted-foreground">Asistencia</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(student)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalles del Estudiante */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Estudiante</DialogTitle>
            <DialogDescription>
              Información personal y académica
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedStudent.code}</p>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {selectedStudent.gradeSection}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Información de Contacto</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Teléfono:</span>
                    <span className="text-muted-foreground">{selectedStudent.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Dirección:</span>
                    <span className="text-muted-foreground">{selectedStudent.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha de Nacimiento:</span>
                    <span className="text-muted-foreground">{selectedStudent.birthDate}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Información del Tutor</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nombre:</span>
                    <span className="text-muted-foreground">{selectedStudent.parentName || 'No asignado'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Rendimiento Académico</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">16.5</p>
                        <p className="text-sm text-muted-foreground mt-1">Promedio General</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">95%</p>
                        <p className="text-sm text-muted-foreground mt-1">Asistencia</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Información Adicional</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Fecha de Matrícula:</span>
                    <span className="text-muted-foreground">{selectedStudent.enrollmentDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedStudent.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedStudent.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Cerrar
                </Button>
                <Button>
                  Ver Calificaciones Detalladas
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
