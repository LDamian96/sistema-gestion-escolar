'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const timeSlots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30']

const schedule = {
  'Lunes': [
    { time: '08:00', subject: 'Matemáticas', teacher: 'Prof. García', room: 'Aula 201' },
    { time: '09:30', subject: 'Español', teacher: 'Prof. López', room: 'Aula 203' },
    { time: '11:00', subject: 'Ciencias', teacher: 'Prof. Martínez', room: 'Lab 1' },
    { time: '14:00', subject: 'Historia', teacher: 'Prof. Rodríguez', room: 'Aula 205' },
  ],
  'Martes': [
    { time: '08:00', subject: 'Inglés', teacher: 'Prof. Smith', room: 'Aula 102' },
    { time: '09:30', subject: 'Matemáticas', teacher: 'Prof. García', room: 'Aula 201' },
    { time: '11:00', subject: 'Educación Física', teacher: 'Prof. Torres', room: 'Gimnasio' },
    { time: '14:00', subject: 'Arte', teacher: 'Prof. Flores', room: 'Aula Arte' },
  ],
  'Miércoles': [
    { time: '08:00', subject: 'Matemáticas', teacher: 'Prof. García', room: 'Aula 201' },
    { time: '09:30', subject: 'Español', teacher: 'Prof. López', room: 'Aula 203' },
    { time: '11:00', subject: 'Ciencias', teacher: 'Prof. Martínez', room: 'Lab 1' },
    { time: '14:00', subject: 'Computación', teacher: 'Prof. Díaz', room: 'Lab Comp' },
  ],
  'Jueves': [
    { time: '08:00', subject: 'Inglés', teacher: 'Prof. Smith', room: 'Aula 102' },
    { time: '09:30', subject: 'Matemáticas', teacher: 'Prof. García', room: 'Aula 201' },
    { time: '11:00', subject: 'Educación Física', teacher: 'Prof. Torres', room: 'Gimnasio' },
    { time: '14:00', subject: 'Historia', teacher: 'Prof. Rodríguez', room: 'Aula 205' },
  ],
  'Viernes': [
    { time: '08:00', subject: 'Matemáticas', teacher: 'Prof. García', room: 'Aula 201' },
    { time: '09:30', subject: 'Español', teacher: 'Prof. López', room: 'Aula 203' },
    { time: '11:00', subject: 'Ciencias', teacher: 'Prof. Martínez', room: 'Lab 1' },
    { time: '14:00', subject: 'Música', teacher: 'Prof. Hernández', room: 'Aula Música' },
  ],
}

const colors: { [key: string]: string } = {
  'Matemáticas': 'bg-blue-500',
  'Español': 'bg-green-500',
  'Ciencias': 'bg-purple-500',
  'Historia': 'bg-orange-500',
  'Inglés': 'bg-pink-500',
  'Educación Física': 'bg-red-500',
  'Arte': 'bg-yellow-500',
  'Computación': 'bg-cyan-500',
  'Música': 'bg-indigo-500',
}

export default function StudentHorarioPage() {
  const today = 'Martes'

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
          { label: 'Clases Esta Semana', value: '20', icon: BookOpen },
          { label: 'Horas Totales', value: '30h', icon: Clock },
          { label: 'Materias', value: '9', icon: Calendar },
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
                            className={`h-full p-3 rounded-lg ${colors[classItem.subject] || 'bg-gray-500'} text-white cursor-pointer`}
                          >
                            <p className="font-medium text-sm">{classItem.subject}</p>
                            <p className="text-xs opacity-90">{classItem.teacher}</p>
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
                <div className={`w-2 h-full min-h-[60px] rounded-full ${colors[classItem.subject] || 'bg-gray-500'}`} />
                <div className="flex-1">
                  <p className="font-medium">{classItem.subject}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {classItem.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {classItem.teacher}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {classItem.room}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
