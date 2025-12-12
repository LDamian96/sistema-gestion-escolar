'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Search,
  Download,
  Save,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const students = [
  { id: 1, name: 'María García', avatar: 'MG', grades: { t1: 95, t2: 92, exam: 98, final: 95 } },
  { id: 2, name: 'Carlos Ruiz', avatar: 'CR', grades: { t1: 88, t2: 85, exam: 90, final: 88 } },
  { id: 3, name: 'Laura Méndez', avatar: 'LM', grades: { t1: 92, t2: 94, exam: 96, final: 94 } },
  { id: 4, name: 'Diego Torres', avatar: 'DT', grades: { t1: 78, t2: 80, exam: 75, final: 78 } },
  { id: 5, name: 'Sofía López', avatar: 'SL', grades: { t1: 90, t2: 88, exam: 92, final: 90 } },
  { id: 6, name: 'Andrés Flores', avatar: 'AF', grades: { t1: 85, t2: 87, exam: 88, final: 87 } },
  { id: 7, name: 'Valentina Díaz', avatar: 'VD', grades: { t1: 96, t2: 98, exam: 97, final: 97 } },
  { id: 8, name: 'Mateo Sánchez', avatar: 'MS', grades: { t1: 72, t2: 75, exam: 70, final: 72 } },
  { id: 9, name: 'Isabella Martínez', avatar: 'IM', grades: { t1: 88, t2: 90, exam: 85, final: 88 } },
  { id: 10, name: 'Samuel Rodríguez', avatar: 'SR', grades: { t1: 82, t2: 84, exam: 80, final: 82 } },
]

const courses = ['5to A - Matemáticas', '5to B - Matemáticas', '6to A - Álgebra', '6to B - Geometría']

export default function TeacherCalificacionesPage() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const classAverage = Math.round(
    students.reduce((acc, s) => acc + s.grades.final, 0) / students.length
  )

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-500'
    if (grade >= 80) return 'text-blue-500'
    if (grade >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getGradeBg = (grade: number) => {
    if (grade >= 90) return 'bg-green-500/20'
    if (grade >= 80) return 'bg-blue-500/20'
    if (grade >= 70) return 'bg-yellow-500/20'
    return 'bg-red-500/20'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Calificaciones</h1>
          <p className="text-muted-foreground mt-1">Gestiona las notas de tus estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {courses.map((course) => (
              <Button
                key={course}
                variant={selectedCourse === course ? 'default' : 'outline'}
                onClick={() => setSelectedCourse(course)}
              >
                {course}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Estudiantes', value: students.length, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Promedio Clase', value: `${classAverage}%`, icon: BarChart3, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Nota Más Alta', value: '97%', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Nota Más Baja', value: '72%', icon: TrendingDown, color: 'text-red-500', bgColor: 'bg-red-500/10' },
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

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Registro de Notas</CardTitle>
              <CardDescription>{selectedCourse}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiante..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg mb-2 text-sm font-medium">
            <div className="col-span-2">Estudiante</div>
            <div className="text-center">Tarea 1</div>
            <div className="text-center">Tarea 2</div>
            <div className="text-center">Examen</div>
            <div className="text-center">Final</div>
          </div>

          {/* Table Body */}
          <div className="space-y-2">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-6 gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors items-center"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="text-center">
                  <Input
                    type="number"
                    defaultValue={student.grades.t1}
                    className="w-16 text-center mx-auto"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="text-center">
                  <Input
                    type="number"
                    defaultValue={student.grades.t2}
                    className="w-16 text-center mx-auto"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="text-center">
                  <Input
                    type="number"
                    defaultValue={student.grades.exam}
                    className="w-16 text-center mx-auto"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center justify-center w-12 h-10 rounded-lg font-bold ${getGradeBg(student.grades.final)} ${getGradeColor(student.grades.final)}`}>
                    {student.grades.final}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
