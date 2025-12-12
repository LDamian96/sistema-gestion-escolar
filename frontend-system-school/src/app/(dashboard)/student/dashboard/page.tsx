'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ClipboardCheck,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const courses = [
  { id: 'all', name: 'Todos' },
  { id: 'mat', name: 'Matemáticas' },
  { id: 'esp', name: 'Español' },
  { id: 'cie', name: 'Ciencias' },
  { id: 'his', name: 'Historia' },
  { id: 'ing', name: 'Inglés' },
]

const attendanceByCourse: Record<string, number> = {
  all: 98,
  mat: 100,
  esp: 95,
  cie: 100,
  his: 90,
  ing: 98,
}

const stats = [
  {
    title: 'Tareas Pendientes',
    value: '5',
    subtitle: 'Esta semana',
    icon: ClipboardCheck,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Materias Inscritas',
    value: '6',
    subtitle: 'Este período',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
]

const todayClasses = [
  { time: '08:00', subject: 'Matemáticas', teacher: 'Prof. García', room: 'Aula 201', status: 'completed' },
  { time: '09:30', subject: 'Español', teacher: 'Prof. López', room: 'Aula 203', status: 'completed' },
  { time: '11:00', subject: 'Ciencias', teacher: 'Prof. Martínez', room: 'Lab 1', status: 'current' },
  { time: '14:00', subject: 'Historia', teacher: 'Prof. Rodríguez', room: 'Aula 205', status: 'upcoming' },
  { time: '15:30', subject: 'Inglés', teacher: 'Prof. Smith', room: 'Aula 102', status: 'upcoming' },
]

const pendingAssignments = [
  { id: 1, title: 'Ejercicios de Álgebra Cap. 5', subject: 'Matemáticas', deadline: 'Hoy 11:59 PM', progress: 60 },
  { id: 2, title: 'Ensayo sobre la Revolución', subject: 'Historia', deadline: 'Mañana', progress: 30 },
  { id: 3, title: 'Reporte de Laboratorio', subject: 'Ciencias', deadline: 'Vie 13 Dic', progress: 0 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudentDashboardPage() {
  const [attendanceCourse, setAttendanceCourse] = useState('all')
  const attendanceValue = attendanceByCourse[attendanceCourse] || 98

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">¡Hola, Estudiante!</h1>
          <p className="text-muted-foreground mt-1">
            Tienes 5 clases hoy. ¡Sigue así!
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/student/tareas">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Mis Tareas
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm font-medium mt-1">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Attendance Card with Filter */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{attendanceValue}%</p>
                <p className="text-sm font-medium mt-1">Asistencia</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setAttendanceCourse(course.id)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        attendanceCourse === course.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {course.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mi Horario de Hoy</CardTitle>
                  <CardDescription>Martes, 10 de Diciembre</CardDescription>
                </div>
                <Link href="/student/horario">
                  <Button variant="ghost" size="sm">
                    Ver completo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayClasses.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      item.status === 'current'
                        ? 'bg-primary/10 border-2 border-primary'
                        : item.status === 'completed'
                        ? 'bg-muted/50 opacity-60'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center w-16">
                      <Clock className={`h-4 w-4 mb-1 ${
                        item.status === 'current' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className={`text-sm font-bold ${
                        item.status === 'current' ? 'text-primary' : ''
                      }`}>
                        {item.time}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.teacher} • {item.room}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'current' && (
                        <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full animate-pulse">
                          Ahora
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {item.status === 'upcoming' && (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tareas Pendientes</CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full">
                  {pendingAssignments.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAssignments.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.subject}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${
                        task.deadline.includes('Hoy') ? 'text-red-500 font-medium' : 'text-muted-foreground'
                      }`}>
                        {task.deadline}
                      </span>
                      <span className="text-muted-foreground">{task.progress}% completado</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/student/tareas">
                  <Button variant="outline" className="w-full">
                    Ver todas las tareas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
