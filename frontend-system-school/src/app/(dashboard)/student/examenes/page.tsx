'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PenTool,
  Calendar,
  Download,
  AlertCircle,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const courses = [
  { id: 'all', name: 'Todos los cursos' },
  { id: 'mat', name: 'Matemáticas' },
  { id: 'esp', name: 'Español' },
  { id: 'cie', name: 'Ciencias' },
  { id: 'his', name: 'Historia' },
  { id: 'ing', name: 'Inglés' },
  { id: 'edf', name: 'Educación Física' },
]

interface Exam {
  id: number
  title: string
  subject: string
  subjectId: string
  date: string
  totalPoints: number
  grade: number | null
  observation?: string
}

const exams: Exam[] = [
  { id: 1, title: 'Examen Parcial - Álgebra', subject: 'Matemáticas', subjectId: 'mat', date: '2024-12-15', totalPoints: 20, grade: null },
  { id: 2, title: 'Evaluación Final', subject: 'Español', subjectId: 'esp', date: '2024-12-18', totalPoints: 20, grade: null },
  { id: 3, title: 'Examen de Unidad 3', subject: 'Ciencias', subjectId: 'cie', date: '2024-12-08', totalPoints: 20, grade: 18, observation: 'Excelente trabajo' },
  { id: 4, title: 'Evaluación Continua', subject: 'Historia', subjectId: 'his', date: '2024-12-05', totalPoints: 20, grade: 15 },
  { id: 5, title: 'Examen Oral', subject: 'Inglés', subjectId: 'ing', date: '2024-12-03', totalPoints: 20, grade: 17, observation: 'Buena pronunciación' },
  { id: 6, title: 'Prueba Física', subject: 'Educación Física', subjectId: 'edf', date: '2024-11-28', totalPoints: 20, grade: 19 },
  { id: 7, title: 'Examen de Geometría', subject: 'Matemáticas', subjectId: 'mat', date: '2024-11-20', totalPoints: 20, grade: 16 },
  { id: 8, title: 'Comprensión Lectora', subject: 'Español', subjectId: 'esp', date: '2024-11-15', totalPoints: 20, grade: 14 },
]

export default function StudentExamenesPage() {
  const [selectedCourse, setSelectedCourse] = useState('all')

  const filteredExams = selectedCourse === 'all'
    ? exams
    : exams.filter(e => e.subjectId === selectedCourse)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Exámenes</h1>
          <p className="text-muted-foreground mt-1">Revisa tus calificaciones de exámenes</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar Boletín
        </Button>
      </div>

      {/* Course Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por curso:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  {course.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Lista de Exámenes
          </CardTitle>
          <CardDescription>Historial de evaluaciones y calificaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay exámenes para este curso
              </div>
            ) : (
              filteredExams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${exam.grade !== null ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                        <PenTool className={`h-5 w-5 ${exam.grade !== null ? 'text-green-500' : 'text-blue-500'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{exam.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{exam.subject}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {exam.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grade */}
                    <div className="flex items-center gap-4">
                      {exam.grade !== null ? (
                        <div className={`px-4 py-2 rounded-xl ${getGradeBg(exam.grade, exam.totalPoints)}`}>
                          <span className={`text-2xl font-bold ${getGradeColor(exam.grade, exam.totalPoints)}`}>
                            {exam.grade}
                          </span>
                          <span className="text-muted-foreground">/{exam.totalPoints}</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-xl bg-blue-500/10">
                          <span className="text-blue-500 font-medium">Pendiente</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {exam.observation && (
                    <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">{exam.observation}</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
