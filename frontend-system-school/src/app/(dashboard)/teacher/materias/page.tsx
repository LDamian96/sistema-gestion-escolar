'use client'

import { motion } from 'framer-motion'
import {
  Library,
  BookOpen,
  Clock,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  PenTool
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Subject {
  id: number
  name: string
  code: string
  description: string
  hoursPerWeek: number
  courses: { name: string; students: number }[]
  color: string
  nextClass: string
  pendingTasks: number
  pendingExams: number
}

const subjects: Subject[] = [
  {
    id: 1,
    name: 'Matemáticas',
    code: 'MAT-001',
    description: 'Álgebra, geometría y aritmética básica',
    hoursPerWeek: 6,
    courses: [
      { name: '5to A', students: 28 },
      { name: '5to B', students: 30 },
      { name: '4to A', students: 26 },
    ],
    color: 'bg-blue-500',
    nextClass: 'Hoy 8:00 AM - 5to A',
    pendingTasks: 5,
    pendingExams: 2
  },
  {
    id: 2,
    name: 'Álgebra Avanzada',
    code: 'MAT-002',
    description: 'Ecuaciones, funciones y sistemas',
    hoursPerWeek: 4,
    courses: [
      { name: '6to A', students: 32 },
    ],
    color: 'bg-purple-500',
    nextClass: 'Mañana 10:00 AM - 6to A',
    pendingTasks: 2,
    pendingExams: 1
  },
]

export default function TeacherMateriasPage() {
  const totalStudents = subjects.reduce((acc, s) => acc + s.courses.reduce((a, c) => a + c.students, 0), 0)
  const totalHours = subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0)
  const totalCourses = subjects.reduce((acc, s) => acc + s.courses.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Mis Materias</h1>
        <p className="text-muted-foreground mt-1">Gestiona las materias que impartes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Materias', value: subjects.length, icon: Library, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Cursos', value: totalCourses, icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Estudiantes', value: totalStudents, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Horas/Semana', value: totalHours, icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
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

      {/* Subjects */}
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Subject Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-4 rounded-xl ${subject.color}/20 shrink-0`}>
                      <Library className={`h-8 w-8 ${subject.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-xl">{subject.name}</h3>
                        <span className="text-sm text-muted-foreground">({subject.code})</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{subject.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {subject.hoursPerWeek}h/semana
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {subject.nextClass}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 lg:flex-col lg:w-48">
                    <div className="flex-1 p-3 rounded-xl bg-orange-500/10 min-w-[120px]">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Tareas</span>
                      </div>
                      <p className="text-xl font-bold text-orange-500">{subject.pendingTasks}</p>
                      <p className="text-xs text-muted-foreground">por revisar</p>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-blue-500/10 min-w-[120px]">
                      <div className="flex items-center gap-2 mb-1">
                        <PenTool className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Exámenes</span>
                      </div>
                      <p className="text-xl font-bold text-blue-500">{subject.pendingExams}</p>
                      <p className="text-xs text-muted-foreground">próximos</p>
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Cursos asignados</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {subject.courses.map(course => (
                      <div
                        key={course.name}
                        className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-sm text-muted-foreground">{course.students} estudiantes</p>
                          </div>
                          <Link href={`/teacher/cursos`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/teacher/tareas">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Tareas
                    </Button>
                  </Link>
                  <Link href="/teacher/examenes">
                    <Button variant="outline" size="sm">
                      <PenTool className="h-4 w-4 mr-2" />
                      Ver Exámenes
                    </Button>
                  </Link>
                  <Link href="/teacher/malla-curricular">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Malla Curricular
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
