'use client'

import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const children = [
  {
    id: 1,
    name: 'María García',
    grade: '5to Grado A',
    age: 11,
    avatar: 'MG',
    average: 92,
    attendance: 98,
    pendingTasks: 3,
    nextExam: 'Matemáticas - 15 Dic',
    tutor: 'Prof. López',
    pendingPayment: false,
    recentGrades: [
      { subject: 'Matemáticas', grade: 95 },
      { subject: 'Español', grade: 88 },
      { subject: 'Ciencias', grade: 92 },
    ]
  },
  {
    id: 2,
    name: 'José García',
    grade: '3er Grado B',
    age: 9,
    avatar: 'JG',
    average: 88,
    attendance: 95,
    pendingTasks: 5,
    nextExam: 'Español - 14 Dic',
    tutor: 'Prof. Martínez',
    pendingPayment: true,
    recentGrades: [
      { subject: 'Matemáticas', grade: 85 },
      { subject: 'Español', grade: 90 },
      { subject: 'Ciencias', grade: 88 },
    ]
  },
]

export default function ParentHijosPage() {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-500'
    if (grade >= 80) return 'text-blue-500'
    if (grade >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Hijos</h1>
          <p className="text-muted-foreground mt-1">Información detallada de cada estudiante</p>
        </div>
      </div>

      {/* Children Cards */}
      <div className="space-y-6">
        {children.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-4">
                  {/* Profile Section */}
                  <div className="p-6 bg-primary/5 lg:border-r">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarFallback className="bg-primary text-white text-2xl">
                          {child.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="font-semibold text-xl">{child.name}</h2>
                      <p className="text-muted-foreground">{child.grade}</p>
                      <p className="text-sm text-muted-foreground">{child.age} años</p>

                      {child.pendingPayment && (
                        <span className="mt-3 px-3 py-1 text-xs rounded-full bg-orange-500/20 text-orange-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pago pendiente
                        </span>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Mensaje
                        </Button>
                        <Button size="sm" variant="outline">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pagos
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="p-6 lg:col-span-3">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-green-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Promedio</span>
                        </div>
                        <p className={`text-2xl font-bold ${getGradeColor(child.average)}`}>
                          {child.average}%
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Asistencia</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-500">{child.attendance}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-orange-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-muted-foreground">Tareas</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-500">{child.pendingTasks}</p>
                        <p className="text-xs text-muted-foreground">pendientes</p>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-muted-foreground">Próximo Examen</span>
                        </div>
                        <p className="text-sm font-medium">{child.nextExam}</p>
                      </div>
                    </div>

                    {/* Recent Grades */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Calificaciones Recientes
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {child.recentGrades.map((grade) => (
                          <div
                            key={grade.subject}
                            className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
                          >
                            <span className="text-sm">{grade.subject}</span>
                            <span className={`font-bold ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {child.tutor.split(' ')[1][0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Tutor: {child.tutor}</p>
                          <p className="text-sm text-muted-foreground">Disponible para consultas</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contactar
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Calificaciones
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver Horario
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Ver Asistencia
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
