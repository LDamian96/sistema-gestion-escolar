'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PenTool,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const children = [
  { id: 1, name: 'María García', avatar: 'MG' },
  { id: 2, name: 'José García', avatar: 'JG' },
]

interface Exam {
  id: number
  title: string
  subject: string
  date: string
  grade: number | null
  totalPoints: number
  status: 'upcoming' | 'completed' | 'missed'
  observation?: string
}

const examsData = {
  1: [
    { id: 1, title: 'Examen Parcial - Álgebra', subject: 'Matemáticas', date: '2024-12-15', grade: null, totalPoints: 20, status: 'upcoming' as const },
    { id: 2, title: 'Examen de Unidad 3', subject: 'Ciencias', date: '2024-12-08', grade: 18, totalPoints: 20, status: 'completed' as const, observation: 'Excelente trabajo' },
    { id: 3, title: 'Evaluación Continua', subject: 'Historia', date: '2024-12-05', grade: 16, totalPoints: 20, status: 'completed' as const },
    { id: 4, title: 'Examen Oral', subject: 'Inglés', date: '2024-12-03', grade: 17, totalPoints: 20, status: 'completed' as const },
    { id: 5, title: 'Examen Final', subject: 'Español', date: '2024-12-01', grade: 15, totalPoints: 20, status: 'completed' as const },
  ],
  2: [
    { id: 1, title: 'Examen Parcial - Álgebra', subject: 'Matemáticas', date: '2024-12-15', grade: null, totalPoints: 20, status: 'upcoming' as const },
    { id: 2, title: 'Examen de Unidad 3', subject: 'Ciencias', date: '2024-12-08', grade: 14, totalPoints: 20, status: 'completed' as const },
    { id: 3, title: 'Evaluación Continua', subject: 'Historia', date: '2024-12-05', grade: 13, totalPoints: 20, status: 'completed' as const, observation: 'Necesita reforzar fechas' },
    { id: 4, title: 'Examen Oral', subject: 'Inglés', date: '2024-12-03', grade: 15, totalPoints: 20, status: 'completed' as const },
    { id: 5, title: 'Examen Final', subject: 'Español', date: '2024-12-01', grade: null, totalPoints: 20, status: 'missed' as const, observation: 'No asistió - Justificado' },
  ],
}

export default function ParentExamenesPage() {
  const [selectedChild, setSelectedChild] = useState(1)

  const currentExams = examsData[selectedChild as keyof typeof examsData]
  const completedExams = currentExams.filter(e => e.status === 'completed' && e.grade !== null)
  const average = completedExams.length > 0
    ? Math.round(completedExams.reduce((acc, e) => acc + (e.grade || 0), 0) / completedExams.length * 10) / 10
    : 0

  const getGradeColor = (grade: number, total: number) => {
    const percentage = (grade / total) * 100
    if (percentage >= 90) return 'text-green-500'
    if (percentage >= 75) return 'text-blue-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getGradeBg = (grade: number, total: number) => {
    const percentage = (grade / total) * 100
    if (percentage >= 90) return 'bg-green-500/20'
    if (percentage >= 75) return 'bg-blue-500/20'
    if (percentage >= 60) return 'bg-yellow-500/20'
    return 'bg-red-500/20'
  }

  const getStatusBadge = (status: Exam['status']) => {
    const styles = {
      upcoming: 'bg-blue-500/20 text-blue-600',
      completed: 'bg-green-500/20 text-green-600',
      missed: 'bg-red-500/20 text-red-600'
    }
    const labels = {
      upcoming: 'Próximo',
      completed: 'Completado',
      missed: 'No asistió'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Exámenes</h1>
          <p className="text-muted-foreground mt-1">Seguimiento de exámenes de sus hijos</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar Boletín
        </Button>
      </div>

      {/* Child Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                onClick={() => setSelectedChild(child.id)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={selectedChild === child.id ? 'bg-primary-foreground text-primary' : 'bg-primary/10 text-primary'}>
                    {child.avatar}
                  </AvatarFallback>
                </Avatar>
                {child.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Promedio', value: `${average}/20`, icon: TrendingUp, color: average >= 15 ? 'text-green-500' : 'text-yellow-500', bgColor: average >= 15 ? 'bg-green-500/10' : 'bg-yellow-500/10' },
          { label: 'Próximos', value: currentExams.filter(e => e.status === 'upcoming').length, icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Completados', value: completedExams.length, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Mejor Nota', value: completedExams.length > 0 ? `${Math.max(...completedExams.map(e => e.grade || 0))}/20` : '-', icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
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

      {/* Upcoming Exams */}
      {currentExams.filter(e => e.status === 'upcoming').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Próximos Exámenes
            </CardTitle>
            <CardDescription>
              {children.find(c => c.id === selectedChild)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentExams.filter(e => e.status === 'upcoming').map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
                >
                  <div className="p-3 rounded-xl bg-blue-500/20 shrink-0">
                    <PenTool className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">{exam.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {exam.date}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Resultados de Exámenes
          </CardTitle>
          <CardDescription>
            {children.find(c => c.id === selectedChild)?.name} - Historial de evaluaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentExams.filter(e => e.status !== 'upcoming').map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${exam.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <PenTool className={`h-5 w-5 ${exam.status === 'completed' ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">{exam.title}</h3>
                        {getStatusBadge(exam.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{exam.subject} - {exam.date}</p>
                    </div>
                  </div>

                  {exam.status === 'completed' && exam.grade !== null && (
                    <div className={`px-4 py-2 rounded-xl ${getGradeBg(exam.grade, exam.totalPoints)}`}>
                      <span className={`text-2xl font-bold ${getGradeColor(exam.grade, exam.totalPoints)}`}>
                        {exam.grade}
                      </span>
                      <span className="text-muted-foreground">/{exam.totalPoints}</span>
                    </div>
                  )}

                  {exam.status === 'missed' && (
                    <div className="px-4 py-2 rounded-xl bg-red-500/10">
                      <span className="text-red-500 font-medium">Sin calificar</span>
                    </div>
                  )}
                </div>

                {exam.observation && (
                  <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">{exam.observation}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Rendimiento</CardTitle>
          <CardDescription>Promedio de notas de todos sus hijos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {children.map((child, index) => {
              const childExams = examsData[child.id as keyof typeof examsData]
              const completed = childExams.filter(e => e.status === 'completed' && e.grade !== null)
              const avg = completed.length > 0
                ? Math.round(completed.reduce((acc, e) => acc + (e.grade || 0), 0) / completed.length * 10) / 10
                : 0

              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {child.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{completed.length} exámenes completados</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${avg >= 16 ? 'text-green-500' : avg >= 14 ? 'text-blue-500' : 'text-yellow-500'}`}>
                      {avg}
                    </p>
                    <p className="text-xs text-muted-foreground">promedio</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
