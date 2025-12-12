'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Upload,
  Eye,
  XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Task {
  id: number
  title: string
  subject: string
  teacher: string
  dueDate: string
  status: 'pending' | 'graded' | 'not_submitted'
  description: string
  grade?: number
  maxGrade: number
}

const tasks: Task[] = [
  {
    id: 1,
    title: 'Ejercicios de Álgebra Cap. 5',
    subject: 'Matemáticas',
    teacher: 'Prof. García',
    dueDate: '2024-12-15',
    status: 'pending',
    description: 'Resolver los ejercicios del 1 al 20 del capítulo 5',
    maxGrade: 20
  },
  {
    id: 2,
    title: 'Ensayo sobre la Revolución',
    subject: 'Historia',
    teacher: 'Prof. Rodríguez',
    dueDate: '2024-12-14',
    status: 'pending',
    description: 'Ensayo de 3 páginas sobre la Revolución Industrial',
    maxGrade: 20
  },
  {
    id: 3,
    title: 'Reporte de Laboratorio',
    subject: 'Ciencias',
    teacher: 'Prof. Martínez',
    dueDate: '2024-12-13',
    status: 'pending',
    description: 'Documentar los resultados del experimento de química',
    maxGrade: 20
  },
  {
    id: 4,
    title: 'Lectura Comprensiva',
    subject: 'Español',
    teacher: 'Prof. López',
    dueDate: '2024-12-10',
    status: 'graded',
    description: 'Leer el capítulo 8 y responder las preguntas',
    grade: 18,
    maxGrade: 20
  },
  {
    id: 5,
    title: 'Proyecto de Inglés',
    subject: 'Inglés',
    teacher: 'Prof. Smith',
    dueDate: '2024-12-08',
    status: 'graded',
    description: 'Presentación oral sobre cultura americana',
    grade: 19,
    maxGrade: 20
  },
  {
    id: 6,
    title: 'Trabajo Práctico Geometría',
    subject: 'Matemáticas',
    teacher: 'Prof. García',
    dueDate: '2024-12-05',
    status: 'not_submitted',
    description: 'Resolver problemas de geometría euclidiana',
    maxGrade: 20
  },
  {
    id: 7,
    title: 'Análisis de Texto',
    subject: 'Español',
    teacher: 'Prof. López',
    dueDate: '2024-12-02',
    status: 'graded',
    description: 'Análisis literario de "Don Quijote"',
    grade: 16,
    maxGrade: 20
  },
  {
    id: 8,
    title: 'Investigación Histórica',
    subject: 'Historia',
    teacher: 'Prof. Rodríguez',
    dueDate: '2024-11-28',
    status: 'not_submitted',
    description: 'Investigación sobre la Segunda Guerra Mundial',
    maxGrade: 20
  },
]

const stats = [
  { label: 'Pendientes', value: tasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { label: 'Calificadas', value: tasks.filter(t => t.status === 'graded').length, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: 'No Entregadas', value: tasks.filter(t => t.status === 'not_submitted').length, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
]

export default function StudentTareasPage() {
  const [filter, setFilter] = useState('all')

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending') return task.status === 'pending'
    if (filter === 'not_submitted') return task.status === 'not_submitted'
    return true
  })

  const getStatusBadge = (status: string, grade?: number, maxGrade?: number) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-600">Pendiente</span>
      case 'graded':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600">Calificada: {grade}/{maxGrade}</span>
      case 'not_submitted':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-600">No Entregada</span>
      default:
        return null
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status === 'pending'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mis Tareas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus tareas y entregas</p>
        </div>
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

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'not_submitted', label: 'No Entregadas' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay tareas en esta categoría
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        {getStatusBadge(task.status, task.grade, task.maxGrade)}
                        {isOverdue(task.dueDate, task.status) && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Vencida
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>{task.subject}</span>
                        <span>{task.teacher}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Entrega: {task.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {task.status === 'pending' ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-1" />
                            Entregar
                          </Button>
                        </>
                      ) : task.status === 'not_submitted' ? (
                        <Button variant="outline" size="sm" disabled>
                          <XCircle className="h-4 w-4 mr-1" />
                          No Entregada
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
