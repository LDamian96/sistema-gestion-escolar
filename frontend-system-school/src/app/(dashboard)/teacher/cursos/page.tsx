'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const courses = [
  {
    id: 1,
    name: 'Matemáticas',
    grade: '5to A',
    students: 32,
    schedule: 'Lun-Mie-Vie 8:00',
    progress: 68,
    nextClass: 'Mañana 8:00',
    pendingTasks: 5,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Matemáticas',
    grade: '5to B',
    students: 28,
    schedule: 'Lun-Mie-Vie 9:30',
    progress: 65,
    nextClass: 'Mañana 9:30',
    pendingTasks: 3,
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Álgebra',
    grade: '6to A',
    students: 30,
    schedule: 'Mar-Jue 11:00',
    progress: 72,
    nextClass: 'Hoy 11:00',
    pendingTasks: 8,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    name: 'Geometría',
    grade: '6to B',
    students: 31,
    schedule: 'Mar-Jue 14:00',
    progress: 55,
    nextClass: 'Hoy 14:00',
    pendingTasks: 2,
    color: 'bg-orange-500'
  },
]

export default function TeacherCursosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Mis Cursos</h1>
        <p className="text-muted-foreground mt-1">Gestiona tus cursos asignados</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Cursos', value: '4', icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Estudiantes', value: '121', icon: Users, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Tareas Pendientes', value: '18', icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Clases Esta Semana', value: '12', icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">{course.grade}</span>
                </div>

                <h3 className="font-semibold text-xl mb-2">{course.name}</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.schedule}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso del curso</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className={`h-full ${course.color} rounded-full`}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-sm pt-4 border-t">
                  <div>
                    <span className="text-muted-foreground">Próxima clase: </span>
                    <span className="font-medium">{course.nextClass}</span>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-600">
                    {course.pendingTasks} tareas por revisar
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Tareas
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Notas
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Lista
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
