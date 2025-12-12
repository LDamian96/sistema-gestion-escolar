'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Student {
  id: number
  name: string
  avatar: string
  weekAttendance: { [key: string]: 'present' | 'absent' | 'late' | 'pending' }
}

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
const weekDaysFull = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const getWeekDates = (offset: number = 0) => {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + (offset * 7))

  return weekDays.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      day,
      dayFull: weekDaysFull[index],
      date: date.getDate(),
      month: date.toLocaleDateString('es', { month: 'short' }),
      fullDate: date.toISOString().split('T')[0],
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today && date.toDateString() !== today.toDateString()
    }
  })
}

const initialStudents: Student[] = [
  { id: 1, name: 'María García', avatar: 'MG', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'present', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 2, name: 'Carlos Ruiz', avatar: 'CR', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'present', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 3, name: 'Laura Méndez', avatar: 'LM', weekAttendance: { '2024-12-09': 'absent', '2024-12-10': 'present', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 4, name: 'Diego Torres', avatar: 'DT', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'late', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 5, name: 'Sofía López', avatar: 'SL', weekAttendance: { '2024-12-09': 'late', '2024-12-10': 'present', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 6, name: 'Andrés Flores', avatar: 'AF', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'present', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 7, name: 'Valentina Díaz', avatar: 'VD', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'absent', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 8, name: 'Mateo Sánchez', avatar: 'MS', weekAttendance: { '2024-12-09': 'absent', '2024-12-10': 'absent', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 9, name: 'Isabella Martínez', avatar: 'IM', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'present', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
  { id: 10, name: 'Samuel Rodríguez', avatar: 'SR', weekAttendance: { '2024-12-09': 'present', '2024-12-10': 'late', '2024-12-11': 'pending', '2024-12-12': 'pending', '2024-12-13': 'pending' } },
]

const courses = ['5to A - Matemáticas', '5to B - Matemáticas', '6to A - Álgebra', '6to B - Geometría']

export default function TeacherAsistenciaPage() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0])
  const [students, setStudents] = useState(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const weekDates = getWeekDates(weekOffset)

  // Auto-select today or first day if not selected
  const effectiveSelectedDay = selectedDay || weekDates.find(d => d.isToday)?.fullDate || weekDates[0].fullDate

  const updateAttendance = (studentId: number, date: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev =>
      prev.map(s => s.id === studentId
        ? { ...s, weekAttendance: { ...s.weekAttendance, [date]: status } }
        : s
      )
    )
  }

  const markAllPresent = (date: string) => {
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        weekAttendance: { ...s.weekAttendance, [date]: 'present' }
      }))
    )
  }

  const getStats = (date: string) => {
    return {
      present: students.filter(s => s.weekAttendance[date] === 'present').length,
      absent: students.filter(s => s.weekAttendance[date] === 'absent').length,
      late: students.filter(s => s.weekAttendance[date] === 'late').length,
      pending: students.filter(s => s.weekAttendance[date] === 'pending' || !s.weekAttendance[date]).length,
    }
  }

  const stats = getStats(effectiveSelectedDay)

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedDayInfo = weekDates.find(d => d.fullDate === effectiveSelectedDay)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground mt-1">Registra la asistencia diaria de tus cursos</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Guardar Asistencia
        </Button>
      </div>

      {/* Week Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                Semana del {weekDates[0].date} {weekDates[0].month} - {weekDates[4].date} {weekDates[4].month}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-5 gap-2">
            {weekDates.map((dayInfo) => {
              const dayStats = getStats(dayInfo.fullDate)
              const isSelected = effectiveSelectedDay === dayInfo.fullDate
              const hasData = dayStats.pending < students.length

              return (
                <motion.button
                  key={dayInfo.fullDate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDay(dayInfo.fullDate)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : dayInfo.isToday
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {dayInfo.day}
                    </p>
                    <p className={`text-2xl font-bold ${isSelected ? 'text-primary' : ''}`}>
                      {dayInfo.date}
                    </p>
                    {dayInfo.isToday && (
                      <span className="text-xs text-primary font-medium">Hoy</span>
                    )}
                    {hasData && !dayInfo.isToday && (
                      <div className="flex justify-center gap-1 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" title={`${dayStats.present} presentes`} />
                        {dayStats.late > 0 && <span className="w-2 h-2 rounded-full bg-yellow-500" title={`${dayStats.late} tardanzas`} />}
                        {dayStats.absent > 0 && <span className="w-2 h-2 rounded-full bg-red-500" title={`${dayStats.absent} ausentes`} />}
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Course Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {courses.map((course) => (
              <Button
                key={course}
                variant={selectedCourse === course ? 'default' : 'outline'}
                onClick={() => setSelectedCourse(course)}
              >
                {course}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats for Selected Day */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: students.length, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Presentes', value: stats.present, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Ausentes', value: stats.absent, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Tardanzas', value: stats.late, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
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

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Lista de Estudiantes
              </CardTitle>
              <CardDescription>
                {selectedCourse} - {selectedDayInfo?.dayFull}, {selectedDayInfo?.date} {selectedDayInfo?.month}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiante..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => markAllPresent(effectiveSelectedDay)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Todos Presentes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStudents.map((student, index) => {
              const currentAttendance = student.weekAttendance[effectiveSelectedDay] || 'pending'

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Estado actual: {' '}
                      <span className={
                        currentAttendance === 'present' ? 'text-green-500' :
                        currentAttendance === 'late' ? 'text-yellow-500' :
                        currentAttendance === 'absent' ? 'text-red-500' :
                        'text-muted-foreground'
                      }>
                        {currentAttendance === 'present' ? 'Presente' :
                         currentAttendance === 'late' ? 'Tardanza' :
                         currentAttendance === 'absent' ? 'Ausente' : 'Sin registrar'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={currentAttendance === 'present' ? 'default' : 'outline'}
                      className={currentAttendance === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                      onClick={() => updateAttendance(student.id, effectiveSelectedDay, 'present')}
                    >
                      <CheckCircle2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Presente</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={currentAttendance === 'late' ? 'default' : 'outline'}
                      className={currentAttendance === 'late' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                      onClick={() => updateAttendance(student.id, effectiveSelectedDay, 'late')}
                    >
                      <Clock className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Tarde</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={currentAttendance === 'absent' ? 'default' : 'outline'}
                      className={currentAttendance === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}
                      onClick={() => updateAttendance(student.id, effectiveSelectedDay, 'absent')}
                    >
                      <XCircle className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Ausente</span>
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Semanal</CardTitle>
          <CardDescription>Vista rápida de asistencia de la semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estudiante</th>
                  {weekDates.map(day => (
                    <th key={day.fullDate} className={`text-center py-3 px-2 font-medium ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {day.day} {day.date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{student.name}</span>
                      </div>
                    </td>
                    {weekDates.map(day => {
                      const status = student.weekAttendance[day.fullDate] || 'pending'
                      return (
                        <td key={day.fullDate} className="text-center py-3 px-2">
                          {status === 'present' && <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />}
                          {status === 'late' && <Clock className="h-5 w-5 text-yellow-500 mx-auto" />}
                          {status === 'absent' && <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                          {status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30 mx-auto" />}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
