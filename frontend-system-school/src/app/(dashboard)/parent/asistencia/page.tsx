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
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const children = [
  { id: 1, name: 'María García', avatar: 'MG' },
  { id: 2, name: 'José García', avatar: 'JG' },
]

const attendanceData = {
  1: { present: 45, absent: 1, late: 2, total: 48, rate: 98 },
  2: { present: 42, absent: 3, late: 3, total: 48, rate: 95 },
}

const monthlyAttendance = {
  1: [
    { day: 1, status: 'present' }, { day: 2, status: 'present' }, { day: 3, status: 'present' },
    { day: 4, status: 'present' }, { day: 5, status: 'present' }, { day: 6, status: 'weekend' },
    { day: 7, status: 'weekend' }, { day: 8, status: 'present' }, { day: 9, status: 'present' },
    { day: 10, status: 'present' }, { day: 11, status: 'present' }, { day: 12, status: 'late' },
    { day: 13, status: 'weekend' }, { day: 14, status: 'weekend' }, { day: 15, status: 'present' },
    { day: 16, status: 'present' }, { day: 17, status: 'present' }, { day: 18, status: 'present' },
    { day: 19, status: 'absent' }, { day: 20, status: 'weekend' }, { day: 21, status: 'weekend' },
    { day: 22, status: 'present' }, { day: 23, status: 'present' }, { day: 24, status: 'present' },
    { day: 25, status: 'present' }, { day: 26, status: 'late' }, { day: 27, status: 'weekend' },
    { day: 28, status: 'weekend' }, { day: 29, status: 'present' }, { day: 30, status: 'present' },
  ],
  2: [
    { day: 1, status: 'present' }, { day: 2, status: 'late' }, { day: 3, status: 'present' },
    { day: 4, status: 'present' }, { day: 5, status: 'absent' }, { day: 6, status: 'weekend' },
    { day: 7, status: 'weekend' }, { day: 8, status: 'present' }, { day: 9, status: 'present' },
    { day: 10, status: 'present' }, { day: 11, status: 'present' }, { day: 12, status: 'present' },
    { day: 13, status: 'weekend' }, { day: 14, status: 'weekend' }, { day: 15, status: 'late' },
    { day: 16, status: 'present' }, { day: 17, status: 'absent' }, { day: 18, status: 'present' },
    { day: 19, status: 'present' }, { day: 20, status: 'weekend' }, { day: 21, status: 'weekend' },
    { day: 22, status: 'present' }, { day: 23, status: 'present' }, { day: 24, status: 'absent' },
    { day: 25, status: 'present' }, { day: 26, status: 'late' }, { day: 27, status: 'weekend' },
    { day: 28, status: 'weekend' }, { day: 29, status: 'present' }, { day: 30, status: 'present' },
  ],
}

export default function ParentAsistenciaPage() {
  const [selectedChild, setSelectedChild] = useState(1)

  const currentData = attendanceData[selectedChild as keyof typeof attendanceData]
  const currentAttendance = monthlyAttendance[selectedChild as keyof typeof monthlyAttendance]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500'
      case 'absent': return 'bg-red-500'
      case 'late': return 'bg-yellow-500'
      case 'weekend': return 'bg-muted'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Asistencia</h1>
          <p className="text-muted-foreground mt-1">Control de asistencia de sus hijos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Diciembre 2024
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Child Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tasa de Asistencia', value: `${currentData.rate}%`, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Días Presentes', value: currentData.present, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Ausencias', value: currentData.absent, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Tardanzas', value: currentData.late, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
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

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Asistencia</CardTitle>
          <CardDescription>
            {children.find(c => c.id === selectedChild)?.name} - Diciembre 2024
          </CardDescription>
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
            {currentAttendance.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.01 }}
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

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Asistencia</CardTitle>
          <CardDescription>Resumen de todos sus hijos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {children.map((child, index) => {
              const data = attendanceData[child.id as keyof typeof attendanceData]
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
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {data.present} presentes
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {data.absent} ausencias
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-yellow-500" />
                        {data.late} tardanzas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${data.rate >= 95 ? 'text-green-500' : data.rate >= 90 ? 'text-blue-500' : 'text-yellow-500'}`}>
                      {data.rate}%
                    </p>
                    <p className="text-xs text-muted-foreground">asistencia</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
