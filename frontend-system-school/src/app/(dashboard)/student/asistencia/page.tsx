'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
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

const attendanceDataByCourse: Record<string, { present: number; absent: number; late: number; total: number }> = {
  all: { present: 45, absent: 2, late: 3, total: 50 },
  mat: { present: 18, absent: 1, late: 1, total: 20 },
  esp: { present: 17, absent: 0, late: 1, total: 18 },
  cie: { present: 8, absent: 1, late: 0, total: 9 },
  his: { present: 2, absent: 0, late: 1, total: 3 },
  ing: { present: 0, absent: 0, late: 0, total: 0 },
  edf: { present: 0, absent: 0, late: 0, total: 0 },
}

const monthlyAttendance = [
  { day: 1, status: 'present' },
  { day: 2, status: 'present' },
  { day: 3, status: 'present' },
  { day: 4, status: 'present' },
  { day: 5, status: 'present' },
  { day: 6, status: 'weekend' },
  { day: 7, status: 'weekend' },
  { day: 8, status: 'present' },
  { day: 9, status: 'late' },
  { day: 10, status: 'present' },
  { day: 11, status: 'present' },
  { day: 12, status: 'absent' },
  { day: 13, status: 'weekend' },
  { day: 14, status: 'weekend' },
  { day: 15, status: 'present' },
  { day: 16, status: 'present' },
  { day: 17, status: 'present' },
  { day: 18, status: 'late' },
  { day: 19, status: 'present' },
  { day: 20, status: 'weekend' },
  { day: 21, status: 'weekend' },
  { day: 22, status: 'present' },
  { day: 23, status: 'present' },
  { day: 24, status: 'absent' },
  { day: 25, status: 'present' },
  { day: 26, status: 'late' },
  { day: 27, status: 'weekend' },
  { day: 28, status: 'weekend' },
  { day: 29, status: 'present' },
  { day: 30, status: 'present' },
  { day: 31, status: 'future' },
]

const recentHistory = [
  { date: '2024-12-10', status: 'present', time: '7:45 AM', course: 'Matemáticas' },
  { date: '2024-12-09', status: 'late', time: '8:15 AM', course: 'Español' },
  { date: '2024-12-06', status: 'present', time: '7:50 AM', course: 'Ciencias' },
  { date: '2024-12-05', status: 'present', time: '7:48 AM', course: 'Historia' },
  { date: '2024-12-04', status: 'absent', time: '-', course: 'Matemáticas' },
  { date: '2024-12-03', status: 'present', time: '7:52 AM', course: 'Inglés' },
]

export default function StudentAsistenciaPage() {
  const [selectedCourse, setSelectedCourse] = useState('all')

  const attendanceData = attendanceDataByCourse[selectedCourse] || attendanceDataByCourse.all
  const attendanceRate = attendanceData.total > 0
    ? Math.round((attendanceData.present / attendanceData.total) * 100)
    : 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500'
      case 'absent':
        return 'bg-red-500'
      case 'late':
        return 'bg-yellow-500'
      case 'weekend':
        return 'bg-muted'
      case 'future':
        return 'bg-muted/50 border-2 border-dashed border-muted-foreground/30'
      default:
        return 'bg-muted'
    }
  }

  const filteredHistory = selectedCourse === 'all'
    ? recentHistory
    : recentHistory.filter(r => r.course.toLowerCase().includes(courses.find(c => c.id === selectedCourse)?.name.toLowerCase() || ''))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mi Asistencia</h1>
          <p className="text-muted-foreground mt-1">Diciembre 2024</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tasa de Asistencia', value: `${attendanceRate}%`, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Días Presentes', value: attendanceData.present, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Ausencias', value: attendanceData.absent, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Tardanzas', value: attendanceData.late, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Asistencia</CardTitle>
              <CardDescription>Vista mensual de tu asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before the 1st */}
                {[...Array(0)].map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {monthlyAttendance.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.01 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${getStatusColor(day.status)} ${
                      day.status === 'present' ? 'text-white' :
                      day.status === 'absent' ? 'text-white' :
                      day.status === 'late' ? 'text-white' : 'text-muted-foreground'
                    }`}
                  >
                    {day.day}
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm">Presente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-sm">Ausente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-sm">Tardanza</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted" />
                  <span className="text-sm">Fin de Semana</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Historial Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredHistory.map((record, index) => (
                  <motion.div
                    key={`${record.date}-${record.course}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30"
                  >
                    {getStatusIcon(record.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{record.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.status === 'present' ? 'Presente' :
                         record.status === 'absent' ? 'Ausente' : 'Tardanza'} - {record.course}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{record.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
