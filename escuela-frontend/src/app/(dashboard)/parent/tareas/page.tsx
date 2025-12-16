'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Calendar,
  BookOpen,
  User,
  Users,
  Loader2,
  Eye,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  studentsService,
  parentsService,
  tasksService,
  type Parent,
  type Student,
  type Task
} from '@/services/mock-data'

export default function ParentTareasPage() {
  const [loading, setLoading] = useState(true)
  const [parent, setParent] = useState<Parent | null>(null)
  const [children, setChildren] = useState<Student[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'closed'>('all')
  const [viewModal, setViewModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [parents, students, tasksData] = await Promise.all([
        parentsService.getAll(),
        studentsService.getAll(),
        tasksService.getAll()
      ])

      const currentParent = parents.find(p => p.id === 'p1')
      if (currentParent) {
        setParent(currentParent)
        const childrenList = students.filter(s => currentParent.childrenIds.includes(s.id))
        setChildren(childrenList)
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedChild = children[selectedChildIndex]

  const filteredTasks = useMemo(() => {
    if (!selectedChild) return []
    return tasks
      .filter(t => t.gradeSection === selectedChild.gradeSection)
      .filter(t => {
        if (searchTerm) {
          const search = searchTerm.toLowerCase()
          return t.title.toLowerCase().includes(search) ||
                 t.courseName.toLowerCase().includes(search)
        }
        return true
      })
      .filter(t => statusFilter === 'all' || t.status === statusFilter)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [selectedChild, tasks, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-600 border-0">Pendiente</Badge>
      case 'closed':
        return <Badge className="bg-slate-500/20 text-slate-600 border-0">Cerrada</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tareas</h1>
        <p className="text-muted-foreground">Tareas asignadas a mis hijos</p>
      </div>

      {/* Selector de Hijo */}
      {children.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {children.map((child, index) => (
                <Button
                  key={child.id}
                  variant={selectedChildIndex === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChildIndex(index)}
                  className="gap-2"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {child.firstName[0]}{child.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {child.firstName} {child.lastName}
                  <Badge variant="secondary" className="text-[10px]">{child.gradeSection}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarea..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'pending', label: 'Pendientes' },
                { value: 'closed', label: 'Cerradas' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay tareas para mostrar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {task.courseName}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.teacherName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Puntaje</p>
                      <p className="text-xl font-bold">{task.maxScore}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTask(task); setViewModal(true); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Ver Detalle */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Tarea</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Titulo</p>
                <p className="font-medium">{selectedTask.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descripcion</p>
                <p>{selectedTask.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Materia</p>
                  <p className="font-medium">{selectedTask.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profesor</p>
                  <p className="font-medium">{selectedTask.teacherName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Entrega</p>
                  <p className="font-medium">{selectedTask.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Puntaje Maximo</p>
                  <p className="font-medium">{selectedTask.maxScore} pts</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
