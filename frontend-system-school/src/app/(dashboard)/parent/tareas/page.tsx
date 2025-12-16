'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  XCircle,
  Eye,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const children = [
  { id: 1, name: 'María García', avatar: 'MG' },
  { id: 2, name: 'José García', avatar: 'JG' },
]

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
  childId: number
}

const allTasks: Task[] = [
  // Tareas de María
  {
    id: 1,
    title: 'Ejercicios de Álgebra Cap. 5',
    subject: 'Matemáticas',
    teacher: 'Prof. García',
    dueDate: '2024-12-15',
    status: 'pending',
    description: 'Resolver los ejercicios del 1 al 20 del capítulo 5',
    maxGrade: 20,
    childId: 1
  },
  {
    id: 2,
    title: 'Ensayo sobre la Revolución',
    subject: 'Historia',
    teacher: 'Prof. Rodríguez',
    dueDate: '2024-12-14',
    status: 'pending',
    description: 'Ensayo de 3 páginas sobre la Revolución Industrial',
    maxGrade: 20,
    childId: 1
  },
  {
    id: 3,
    title: 'Lectura Comprensiva',
    subject: 'Español',
    teacher: 'Prof. López',
    dueDate: '2024-12-10',
    status: 'graded',
    description: 'Leer el capítulo 8 y responder las preguntas',
    grade: 18,
    maxGrade: 20,
    childId: 1
  },
  {
    id: 4,
    title: 'Trabajo Práctico Geometría',
    subject: 'Matemáticas',
    teacher: 'Prof. García',
    dueDate: '2024-12-05',
    status: 'not_submitted',
    description: 'Resolver problemas de geometría euclidiana',
    maxGrade: 20,
    childId: 1
  },
  // Tareas de José
  {
    id: 5,
    title: 'Proyecto de Ciencias',
    subject: 'Ciencias',
    teacher: 'Prof. Martínez',
    dueDate: '2024-12-16',
    status: 'pending',
    description: 'Crear maqueta del sistema solar',
    maxGrade: 20,
    childId: 2
  },
  {
    id: 6,
    title: 'Ejercicios de Inglés',
    subject: 'Inglés',
    teacher: 'Prof. Smith',
    dueDate: '2024-12-13',
    status: 'pending',
    description: 'Complete exercises from Unit 5',
    maxGrade: 20,
    childId: 2
  },
  {
    id: 7,
    title: 'Examen de Práctica',
    subject: 'Matemáticas',
    teacher: 'Prof. García',
    dueDate: '2024-12-08',
    status: 'graded',
    description: 'Examen de práctica de fracciones',
    grade: 16,
    maxGrade: 20,
    childId: 2
  },
  {
    id: 8,
    title: 'Reporte de Lectura',
    subject: 'Español',
    teacher: 'Prof. López',
    dueDate: '2024-12-03',
    status: 'not_submitted',
    description: 'Reporte del libro "El Principito"',
    maxGrade: 20,
    childId: 2
  },
]

export default function ParentTareasPage() {
  const [selectedChild, setSelectedChild] = useState<number | 'all'>('all')
  const [filter, setFilter] = useState('all')

  const filteredTasks = allTasks.filter(task => {
    const matchesChild = selectedChild === 'all' || task.childId === selectedChild
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && task.status === 'pending') ||
      (filter === 'not_submitted' && task.status === 'not_submitted') ||
      (filter === 'graded' && task.status === 'graded')
    return matchesChild && matchesFilter
  })

  const getChildName = (childId: number) => {
    return children.find(c => c.id === childId)?.name || 'Desconocido'
  }

  const getStats = () => {
    const tasks = selectedChild === 'all' ? allTasks : allTasks.filter(t => t.childId === selectedChild)
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      graded: tasks.filter(t => t.status === 'graded').length,
      notSubmitted: tasks.filter(t => t.status === 'not_submitted').length,
    }
  }

  const stats = getStats()

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
          <h1 className="font-heading text-3xl font-bold">Tareas de mis Hijos</h1>
          <p className="text-muted-foreground mt-1">Seguimiento de tareas y entregas</p>
        </div>
      </div>

      {/* Child Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Button
              variant={selectedChild === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedChild('all')}
            >
              Todos los Hijos
            </Button>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Calificadas', value: stats.graded, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'No Entregadas', value: stats.notSubmitted, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
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

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'graded', label: 'Calificadas' },
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
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay tareas en esta categoría</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
                        {selectedChild === 'all' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                            <User className="h-3 w-3" />
                            {getChildName(task.childId)}
                          </span>
                        )}
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary by Child */}
      {selectedChild === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Hijo</CardTitle>
            <CardDescription>Estado de tareas de cada hijo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map((child, index) => {
                const childTasks = allTasks.filter(t => t.childId === child.id)
                const pending = childTasks.filter(t => t.status === 'pending').length
                const graded = childTasks.filter(t => t.status === 'graded').length
                const notSubmitted = childTasks.filter(t => t.status === 'not_submitted').length

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
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-orange-500" />
                          {pending} pendientes
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {graded} calificadas
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-red-500" />
                          {notSubmitted} no entregadas
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChild(child.id)}
                    >
                      Ver Tareas
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
