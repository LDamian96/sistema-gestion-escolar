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
  PenTool,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

interface Subject {
  id: number
  name: string
  code: string
  description: string
  teacher: { name: string; avatar: string }
  hoursPerWeek: number
  color: string
  nextClass: string
  pendingTasks: number
  nextExam: string | null
  average: number
  progress: number
}

const subjects: Subject[] = [
  {
    id: 1,
    name: 'Matemáticas',
    code: 'MAT-001',
    description: 'Álgebra, geometría y aritmética básica',
    teacher: { name: 'Prof. López', avatar: 'PL' },
    hoursPerWeek: 6,
    color: 'bg-blue-500',
    nextClass: 'Hoy 8:00 AM',
    pendingTasks: 2,
    nextExam: 'Examen Parcial - 15 Dic',
    average: 16,
    progress: 75
  },
  {
    id: 2,
    name: 'Español',
    code: 'ESP-001',
    description: 'Lengua y literatura',
    teacher: { name: 'Prof. Martínez', avatar: 'PM' },
    hoursPerWeek: 5,
    color: 'bg-green-500',
    nextClass: 'Mañana 10:00 AM',
    pendingTasks: 1,
    nextExam: null,
    average: 15,
    progress: 80
  },
  {
    id: 3,
    name: 'Ciencias Naturales',
    code: 'CIE-001',
    description: 'Biología, física y química',
    teacher: { name: 'Prof. Rodríguez', avatar: 'PR' },
    hoursPerWeek: 4,
    color: 'bg-purple-500',
    nextClass: 'Miércoles 9:00 AM',
    pendingTasks: 0,
    nextExam: 'Quiz - 18 Dic',
    average: 18,
    progress: 85
  },
  {
    id: 4,
    name: 'Historia',
    code: 'HIS-001',
    description: 'Historia universal y nacional',
    teacher: { name: 'Prof. Sánchez', avatar: 'PS' },
    hoursPerWeek: 3,
    color: 'bg-yellow-500',
    nextClass: 'Jueves 11:00 AM',
    pendingTasks: 3,
    nextExam: null,
    average: 14,
    progress: 60
  },
  {
    id: 5,
    name: 'Inglés',
    code: 'ING-001',
    description: 'Idioma extranjero',
    teacher: { name: 'Prof. Williams', avatar: 'PW' },
    hoursPerWeek: 4,
    color: 'bg-red-500',
    nextClass: 'Hoy 2:00 PM',
    pendingTasks: 1,
    nextExam: 'Oral Exam - 20 Dic',
    average: 17,
    progress: 70
  },
  {
    id: 6,
    name: 'Educación Física',
    code: 'EDF-001',
    description: 'Actividad física y deportes',
    teacher: { name: 'Prof. Torres', avatar: 'PT' },
    hoursPerWeek: 2,
    color: 'bg-orange-500',
    nextClass: 'Viernes 8:00 AM',
    pendingTasks: 0,
    nextExam: null,
    average: 19,
    progress: 95
  },
]

export default function StudentMateriasPage() {
  const totalHours = subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0)
  const generalAverage = Math.round(subjects.reduce((acc, s) => acc + s.average, 0) / subjects.length)
  const pendingTasks = subjects.reduce((acc, s) => acc + s.pendingTasks, 0)

  const getGradeColor = (grade: number) => {
    if (grade >= 18) return 'text-green-500'
    if (grade >= 15) return 'text-blue-500'
    if (grade >= 12) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Mis Materias</h1>
        <p className="text-muted-foreground mt-1">Información de tus asignaturas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Materias', value: subjects.length, icon: Library, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'Horas/Semana', value: totalHours, icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Promedio General', value: `${generalAverage}/20`, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Tareas Pendientes', value: pendingTasks, icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
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

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${subject.color}/20 shrink-0`}>
                    <Library className={`h-6 w-6 ${subject.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(subject.average)}`}>{subject.average}</p>
                    <p className="text-xs text-muted-foreground">promedio</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>

                {/* Teacher */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {subject.teacher.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{subject.teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{subject.hoursPerWeek}h/semana</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso del curso</span>
                    <span className="font-medium">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className={`h-full ${subject.color} rounded-full`}
                    />
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Próxima clase</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {subject.nextClass}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Tareas pendientes</p>
                    <p className={`text-sm font-medium flex items-center gap-1 ${subject.pendingTasks > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                      {subject.pendingTasks > 0 ? (
                        <>
                          <FileText className="h-3 w-3" />
                          {subject.pendingTasks} pendientes
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Al día
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Next Exam */}
                {subject.nextExam && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                    <p className="text-sm flex items-center gap-2 text-blue-600">
                      <PenTool className="h-4 w-4" />
                      {subject.nextExam}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href="/student/tareas" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-1" />
                      Tareas
                    </Button>
                  </Link>
                  <Link href="/student/examenes" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <PenTool className="h-4 w-4 mr-1" />
                      Exámenes
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
