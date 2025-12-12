'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const courses = [
  { id: 1, name: 'Matemáticas Avanzadas', grade: '6to Grado', teacher: 'Prof. García', students: 32, schedule: 'Lun-Mie-Vie 8:00', status: 'active', color: 'bg-blue-500' },
  { id: 2, name: 'Español y Literatura', grade: '5to Grado', teacher: 'Prof. López', students: 28, schedule: 'Mar-Jue 9:30', status: 'active', color: 'bg-green-500' },
  { id: 3, name: 'Ciencias Naturales', grade: '6to Grado', teacher: 'Prof. Martínez', students: 30, schedule: 'Lun-Mie 11:00', status: 'active', color: 'bg-purple-500' },
  { id: 4, name: 'Historia Universal', grade: '5to Grado', teacher: 'Prof. Rodríguez', students: 31, schedule: 'Mar-Jue 14:00', status: 'active', color: 'bg-orange-500' },
  { id: 5, name: 'Inglés Básico', grade: '4to Grado', teacher: 'Prof. Smith', students: 25, schedule: 'Lun-Vie 15:30', status: 'active', color: 'bg-pink-500' },
  { id: 6, name: 'Educación Física', grade: 'Todos', teacher: 'Prof. Torres', students: 120, schedule: 'Variable', status: 'active', color: 'bg-red-500' },
  { id: 7, name: 'Arte y Música', grade: '3er Grado', teacher: 'Prof. Flores', students: 22, schedule: 'Vie 10:00', status: 'inactive', color: 'bg-yellow-500' },
  { id: 8, name: 'Computación', grade: '6to Grado', teacher: 'Prof. Díaz', students: 30, schedule: 'Mar-Jue 11:00', status: 'active', color: 'bg-cyan-500' },
]

const stats = [
  { label: 'Total Cursos', value: '24', icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Cursos Activos', value: '22', icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: 'Estudiantes Matriculados', value: '1,284', icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
]

export default function CursosPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Cursos</h1>
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
        {filteredCourses.map((course, index) => (
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
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.status === 'active'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-red-500/20 text-red-600'
                  }`}>
                    {course.status === 'active' ? 'Activo' : 'Inactivo'}
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
    </div>
  )
}
