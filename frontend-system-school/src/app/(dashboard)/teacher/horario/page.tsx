'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const timeSlots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30']

const schedule = {
  'Lunes': [
    { time: '08:00', subject: 'Matemáticas', grade: '5to A', room: 'Aula 201', students: 32 },
    { time: '09:30', subject: 'Matemáticas', grade: '5to B', room: 'Aula 203', students: 28 },
    { time: '14:00', subject: 'Geometría', grade: '6to B', room: 'Aula 205', students: 31 },
  ],
  'Martes': [
    { time: '11:00', subject: 'Álgebra', grade: '6to A', room: 'Aula 301', students: 30 },
    { time: '14:00', subject: 'Geometría', grade: '6to B', room: 'Aula 205', students: 31 },
  ],
  'Miércoles': [
    { time: '08:00', subject: 'Matemáticas', grade: '5to A', room: 'Aula 201', students: 32 },
    { time: '09:30', subject: 'Matemáticas', grade: '5to B', room: 'Aula 203', students: 28 },
  ],
  'Jueves': [
    { time: '11:00', subject: 'Álgebra', grade: '6to A', room: 'Aula 301', students: 30 },
    { time: '14:00', subject: 'Geometría', grade: '6to B', room: 'Aula 205', students: 31 },
  ],
  'Viernes': [
    { time: '08:00', subject: 'Matemáticas', grade: '5to A', room: 'Aula 201', students: 32 },
    { time: '09:30', subject: 'Matemáticas', grade: '5to B', room: 'Aula 203', students: 28 },
  ],
}

const colors: { [key: string]: string } = {
  'Matemáticas': 'bg-blue-500',
  'Álgebra': 'bg-purple-500',
  'Geometría': 'bg-orange-500',
}

export default function TeacherHorarioPage() {
  const today = 'Martes' // Simulated

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mi Horario</h1>
          <p className="text-muted-foreground mt-1">Semana del 9 al 13 de Diciembre, 2024</p>
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

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Clases Esta Semana', value: '12', icon: Calendar },
          { label: 'Horas Totales', value: '18h', icon: Clock },
          { label: 'Estudiantes', value: '121', icon: Users },
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
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
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

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Horario Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground">
                  Hora
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className={`p-3 text-center rounded-lg ${
                      day === today
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="font-medium">{day}</p>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time, timeIndex) => (
                <motion.div
                  key={time}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + timeIndex * 0.05 }}
                  className="grid grid-cols-6 gap-2 mb-2"
                >
                  <div className="p-3 text-center text-sm text-muted-foreground flex items-center justify-center">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const daySchedule = schedule[day as keyof typeof schedule] || []
                    const classItem = daySchedule.find(c => c.time === time)

                    return (
                      <div key={`${day}-${time}`} className="min-h-[80px]">
                        {classItem ? (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`h-full p-3 rounded-lg ${colors[classItem.subject]} text-white cursor-pointer`}
                          >
                            <p className="font-medium text-sm">{classItem.subject}</p>
                            <p className="text-xs opacity-90">{classItem.grade}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                              <MapPin className="h-3 w-3" />
                              {classItem.room}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full bg-muted/30 rounded-lg" />
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Clases de Hoy ({today})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(schedule[today as keyof typeof schedule] || []).map((classItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-2 h-full min-h-[60px] rounded-full ${colors[classItem.subject]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{classItem.subject}</p>
                    <span className="text-sm text-muted-foreground">- {classItem.grade}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {classItem.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {classItem.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {classItem.students} estudiantes
                    </span>
                  </div>
                </div>
                <Button size="sm">Iniciar Clase</Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
