'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  Edit,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { courses as mockCourses, getStudentsByClassroom, stats as mockStats } from '@/lib/mock-data'

// Colores para las tarjetas de cursos
const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-red-500', 'bg-yellow-500', 'bg-cyan-500'
]

export default function CursosPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Transformar cursos para mostrar
  const coursesDisplay = useMemo(() => {
    return mockCourses.map((course, idx) => {
      const studentsInClassroom = getStudentsByClassroom(course.classroomId)
      return {
        id: course.id,
        name: course.subject.name,
        grade: `${course.classroom.section.gradeLevel.name} ${course.classroom.section.name}`,
        teacher: course.teacher ? `Prof. ${course.teacher.firstName} ${course.teacher.lastName}` : 'Sin profesor',
        students: studentsInClassroom.length,
        schedule: course.schedules.length > 0
          ? `${['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][course.schedules[0].dayOfWeek]} ${course.schedules[0].startTime}`
          : 'Sin horario',
        status: 'active' as const,
        color: colors[idx % colors.length]
      }
    })
  }, [])

  // Estadisticas
  const stats = useMemo(() => {
    const activeCourses = coursesDisplay.filter(c => c.status === 'active').length
    const totalStudents = mockStats.totalStudents
    return [
      { label: 'Total Cursos', value: mockStats.totalCourses.toLocaleString(), icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Cursos Activos', value: activeCourses.toLocaleString(), icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Estudiantes Matriculados', value: totalStudents.toLocaleString(), icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ]
  }, [coursesDisplay])

  // Filtrar cursos
  const filteredCourses = useMemo(() => {
    return coursesDisplay.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.grade.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [coursesDisplay, searchTerm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestion de Cursos</h1>
          <p className="text-muted-foreground mt-1">Administra los cursos del colegio</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {/* Stats */}
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
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.slice(0, 20).map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600">
                    Activo
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.grade}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.schedule}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination hint */}
      {filteredCourses.length > 20 && (
        <div className="text-center text-muted-foreground">
          Mostrando 20 de {filteredCourses.length} cursos
        </div>
      )}
    </div>
  )
}
