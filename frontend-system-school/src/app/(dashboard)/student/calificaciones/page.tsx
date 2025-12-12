'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const grades = [
  { subject: 'Matemáticas', teacher: 'Prof. García', t1: 95, t2: 92, t3: 98, exam: 96, final: 95, trend: 'up' },
  { subject: 'Español', teacher: 'Prof. López', t1: 88, t2: 90, t3: 85, exam: 88, final: 88, trend: 'stable' },
  { subject: 'Ciencias', teacher: 'Prof. Martínez', t1: 92, t2: 94, t3: 90, exam: 93, final: 92, trend: 'up' },
  { subject: 'Historia', teacher: 'Prof. Rodríguez', t1: 85, t2: 82, t3: 88, exam: 86, final: 85, trend: 'up' },
  { subject: 'Inglés', teacher: 'Prof. Smith', t1: 94, t2: 96, t3: 92, exam: 95, final: 94, trend: 'stable' },
  { subject: 'Educación Física', teacher: 'Prof. Torres', t1: 98, t2: 97, t3: 99, exam: 98, final: 98, trend: 'up' },
  { subject: 'Arte', teacher: 'Prof. Flores', t1: 90, t2: 88, t3: 92, exam: 90, final: 90, trend: 'up' },
  { subject: 'Computación', teacher: 'Prof. Díaz', t1: 96, t2: 98, t3: 94, exam: 97, final: 96, trend: 'stable' },
]

const generalAverage = Math.round(grades.reduce((acc, g) => acc + g.final, 0) / grades.length)

export default function StudentCalificacionesPage() {
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
          <h1 className="font-heading text-3xl font-bold">Mis Calificaciones</h1>
          <p className="text-muted-foreground mt-1">Periodo: Diciembre 2024</p>
        </div>
        <Button variant="outline">
          Descargar Boletín
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Promedio General', value: `${generalAverage}%`, icon: BarChart3, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Mejor Materia', value: 'Ed. Física', icon: Award, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
          { label: 'Materias', value: '8', icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Posición', value: '#3', icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
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

      {/* Visual Grades */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Materia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {grades.map((grade, index) => (
              <motion.div
                key={grade.subject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      className="fill-none stroke-muted stroke-[6]"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="35"
                      className={`fill-none stroke-[6] ${
                        grade.final >= 90 ? 'stroke-green-500' :
                        grade.final >= 80 ? 'stroke-blue-500' :
                        grade.final >= 70 ? 'stroke-yellow-500' : 'stroke-red-500'
                      }`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0, 220' }}
                      animate={{ strokeDasharray: `${(grade.final / 100) * 220}, 220` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.8 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    {grade.final}
                  </span>
                </div>
                <span className="text-sm font-medium text-center">{grade.subject}</span>
                <span className={`text-xs mt-1 flex items-center gap-1 ${
                  grade.trend === 'up' ? 'text-green-500' :
                  grade.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {grade.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                   grade.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                  {grade.trend === 'up' ? 'Subiendo' :
                   grade.trend === 'down' ? 'Bajando' : 'Estable'}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Calificaciones</CardTitle>
          <CardDescription>Desglose por evaluación</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 rounded-lg mb-2 text-sm font-medium">
            <div className="col-span-2">Materia</div>
            <div className="text-center">T1</div>
            <div className="text-center">T2</div>
            <div className="text-center">T3</div>
            <div className="text-center">Examen</div>
            <div className="text-center">Final</div>
          </div>

          {/* Table Body */}
          <div className="space-y-2">
            {grades.map((grade, index) => (
              <motion.div
                key={grade.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="grid grid-cols-7 gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors items-center"
              >
                <div className="col-span-2">
                  <p className="font-medium">{grade.subject}</p>
                  <p className="text-xs text-muted-foreground">{grade.teacher}</p>
                </div>
                <div className={`text-center font-medium ${getGradeColor(grade.t1)}`}>{grade.t1}</div>
                <div className={`text-center font-medium ${getGradeColor(grade.t2)}`}>{grade.t2}</div>
                <div className={`text-center font-medium ${getGradeColor(grade.t3)}`}>{grade.t3}</div>
                <div className={`text-center font-medium ${getGradeColor(grade.exam)}`}>{grade.exam}</div>
                <div className="text-center">
                  <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold ${getGradeBg(grade.final)} ${getGradeColor(grade.final)}`}>
                    {grade.final}
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
