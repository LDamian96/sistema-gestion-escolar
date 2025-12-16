'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
  CalendarDays,
  Sparkles,
  Target,
  Award,
  BarChart3,
  History,
  Search,
  ChevronDown,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  studentsService,
  type Student
} from '@/services/mock-data'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'pending'

interface DayAttendance {
  date: string
  dayName: string
  dayNumber: number
  status: AttendanceStatus
  isWeekend: boolean
  isFuture: boolean
  isToday: boolean
}

const CURRENT_STUDENT_ID = 's1'
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const generateMonthAttendance = (year: number, month: number): DayAttendance[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const attendance: DayAttendance[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isFuture = date > today
    const isToday = date.toDateString() === today.toDateString()

    let status: AttendanceStatus = 'pending'
    if (!isWeekend && !isFuture) {
      const seed = day + month * 31 + year
      if (seed % 15 === 0) {
        status = 'absent'
      } else if (seed % 8 === 0) {
        status = 'late'
      } else {
        status = 'present'
      }
    }

    attendance.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[dayOfWeek],
      dayNumber: day,
      status,
      isWeekend,
      isFuture,
      isToday
    })
  }

  return attendance
}

// Genera historial de todo el año escolar (marzo a diciembre)
const generateYearAttendance = (): DayAttendance[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const startMonth = 2 // Marzo (0-indexed)
  const allDays: DayAttendance[] = []

  for (let month = startMonth; month <= today.getMonth(); month++) {
    const monthDays = generateMonthAttendance(currentYear, month)
    allDays.push(...monthDays.filter(d => !d.isWeekend && !d.isFuture && d.status !== 'pending'))
  }

  return allDays.reverse() // Más reciente primero
}

export default function StudentAsistenciaPage() {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null)
  const [historyLimit, setHistoryLimit] = useState(7)
  const [historySearchDate, setHistorySearchDate] = useState('')

  const currentMonth = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + monthOffset)
    return date
  }, [monthOffset])

  const monthName = currentMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })

  const monthAttendance = useMemo(() => {
    return generateMonthAttendance(currentMonth.getFullYear(), currentMonth.getMonth())
  }, [currentMonth])

  const stats = useMemo(() => {
    const schoolDays = monthAttendance.filter(d => !d.isWeekend && !d.isFuture)
    const present = schoolDays.filter(d => d.status === 'present').length
    const absent = schoolDays.filter(d => d.status === 'absent').length
    const late = schoolDays.filter(d => d.status === 'late').length
    const total = schoolDays.length

    return {
      present,
      absent,
      late,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      streak: calculateStreak(monthAttendance)
    }
  }, [monthAttendance])

  function calculateStreak(attendance: DayAttendance[]): number {
    let streak = 0
    const sorted = [...attendance].filter(d => !d.isWeekend && !d.isFuture).reverse()
    for (const day of sorted) {
      if (day.status === 'present') streak++
      else break
    }
    return streak
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const students = await studentsService.getAll()
        const student = students.find(s => s.id === CURRENT_STUDENT_ID)
        setCurrentStudent(student || null)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Historial completo del año
  const fullYearHistory = useMemo(() => {
    return generateYearAttendance()
  }, [])

  // Historial filtrado por búsqueda de fecha
  const filteredHistory = useMemo(() => {
    if (!historySearchDate) return fullYearHistory
    return fullYearHistory.filter(d => d.date.includes(historySearchDate))
  }, [fullYearHistory, historySearchDate])

  // Historial visible (con límite)
  const visibleHistory = useMemo(() => {
    return filteredHistory.slice(0, historyLimit)
  }, [filteredHistory, historyLimit])

  const hasMoreHistory = filteredHistory.length > historyLimit

  // Estadísticas anuales
  const yearStats = useMemo(() => {
    const present = fullYearHistory.filter(d => d.status === 'present').length
    const absent = fullYearHistory.filter(d => d.status === 'absent').length
    const late = fullYearHistory.filter(d => d.status === 'late').length
    const total = fullYearHistory.length
    return {
      present,
      absent,
      late,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0
    }
  }, [fullYearHistory])

  const getStatusColor = (status: AttendanceStatus, isWeekend: boolean, isFuture: boolean, isToday: boolean) => {
    if (isWeekend) return 'bg-slate-100 dark:bg-slate-800/50 text-slate-400'
    if (isFuture) return 'bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400'
    if (isToday) {
      switch (status) {
        case 'present': return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-4 ring-emerald-500/30'
        case 'absent': return 'bg-gradient-to-br from-rose-400 to-rose-600 text-white ring-4 ring-rose-500/30'
        case 'late': return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-500/30'
        default: return 'bg-slate-200 dark:bg-slate-700 ring-4 ring-primary/30'
      }
    }
    switch (status) {
      case 'present': return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
      case 'absent': return 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/20'
      case 'late': return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20'
      default: return 'bg-slate-200 dark:bg-slate-700'
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="h-4 w-4" />
      case 'absent': return <XCircle className="h-4 w-4" />
      case 'late': return <Clock className="h-4 w-4" />
      default: return null
    }
  }

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'Presente'
      case 'absent': return 'Ausente'
      case 'late': return 'Tardanza'
      default: return 'Pendiente'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando asistencia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentStudent && (
                <Avatar className="h-16 w-16 ring-4 ring-white/20">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Mi Asistencia</h1>
                <p className="text-white/80 mt-1">
                  {currentStudent?.firstName} {currentStudent?.lastName} • {currentStudent?.gradeSection}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => setMonthOffset(prev => prev - 1)} className="bg-white/20 hover:bg-white/30 border-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" onClick={() => setMonthOffset(0)} className="bg-white/20 hover:bg-white/30 border-0">
                <Calendar className="h-4 w-4 mr-2" />
                Hoy
              </Button>
              <Button variant="secondary" size="icon" onClick={() => setMonthOffset(prev => prev + 1)} className="bg-white/20 hover:bg-white/30 border-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Sparkles className="absolute right-4 top-4 h-8 w-8 text-white/20" />
      </div>

      {/* Stats Cards con diseño premium */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Tasa', value: `${stats.rate}%`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-500' },
          { label: 'Presentes', value: stats.present, icon: CheckCircle2, gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-950/30', iconBg: 'bg-green-500' },
          { label: 'Ausencias', value: stats.absent, icon: XCircle, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-950/30', iconBg: 'bg-rose-500' },
          { label: 'Tardanzas', value: stats.late, icon: Clock, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500' },
          { label: 'Racha', value: `${stats.streak} días`, icon: Award, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', iconBg: 'bg-violet-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`border-0 ${stat.bg} overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Barra de progreso visual */}
      <Card className="border-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold">Meta de Asistencia: 95%</span>
            </div>
            <span className={`text-lg font-bold ${stats.rate >= 95 ? 'text-emerald-600' : stats.rate >= 90 ? 'text-amber-600' : 'text-rose-600'}`}>
              {stats.rate}%
            </span>
          </div>
          <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.rate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                stats.rate >= 95 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                stats.rate >= 90 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                'bg-gradient-to-r from-rose-500 to-pink-500'
              }`}
            />
            <div className="absolute inset-y-0 left-[95%] w-0.5 bg-slate-400 dark:bg-slate-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.rate >= 95 ? '¡Excelente! Has alcanzado tu meta' : `Te faltan ${95 - stats.rate}% para alcanzar tu meta`}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Calendario de Asistencia
                  </CardTitle>
                  <CardDescription className="capitalize mt-1">{monthName}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{stats.total} días</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                  <div key={day} className={`text-center text-sm font-semibold py-2 ${i >= 5 ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid del calendario */}
              <div className="grid grid-cols-7 gap-2">
                {[...Array(emptyDays)].map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {monthAttendance.map((day, index) => (
                  <motion.button
                    key={day.date}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.008 }}
                    onClick={() => !day.isWeekend && !day.isFuture && setSelectedDay(day)}
                    disabled={day.isWeekend || day.isFuture}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all hover:scale-105 ${getStatusColor(day.status, day.isWeekend, day.isFuture, day.isToday)} ${!day.isWeekend && !day.isFuture ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className="font-bold">{day.dayNumber}</span>
                    {day.isToday && <span className="text-[8px] uppercase tracking-wider mt-0.5">Hoy</span>}
                  </motion.button>
                ))}
              </div>

              {/* Leyenda mejorada */}
              <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t">
                {[
                  { color: 'bg-gradient-to-br from-emerald-400 to-emerald-600', label: 'Presente' },
                  { color: 'bg-gradient-to-br from-rose-400 to-rose-600', label: 'Ausente' },
                  { color: 'bg-gradient-to-br from-amber-400 to-amber-600', label: 'Tardanza' },
                  { color: 'bg-slate-100 dark:bg-slate-800', label: 'Fin de Semana' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md ${item.color}`} />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Panel lateral - Historial Anual */}
        <div className="space-y-6">
          {/* Resumen anual compacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {currentStudent && (
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{currentStudent?.firstName}</h3>
                    <p className="text-xs text-muted-foreground">{currentStudent?.gradeSection}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        yearStats.rate >= 95 ? 'bg-emerald-500 text-white' :
                        yearStats.rate >= 90 ? 'bg-amber-500 text-white' :
                        'bg-rose-500 text-white'
                      }`}>
                        {yearStats.rate}% anual
                      </div>
                      <span className="text-xs text-muted-foreground">{yearStats.total} días</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Historial del año */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-5 w-5 text-primary" />
                    Historial del Año
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {filteredHistory.length} días
                  </Badge>
                </div>
                {/* Buscador por fecha */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar fecha (ej: 2025-03)"
                    value={historySearchDate}
                    onChange={(e) => {
                      setHistorySearchDate(e.target.value)
                      setHistoryLimit(7)
                    }}
                    className="pl-9 pr-9 h-9 text-sm"
                  />
                  {historySearchDate && (
                    <button
                      onClick={() => {
                        setHistorySearchDate('')
                        setHistoryLimit(7)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {visibleHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {historySearchDate ? 'No se encontraron registros' : 'Sin registros'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleHistory.map((day, index) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index < 7 ? 0.4 + index * 0.03 : 0 }}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          day.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-950/30' :
                          day.status === 'absent' ? 'bg-rose-50 dark:bg-rose-950/30' :
                          'bg-amber-50 dark:bg-amber-950/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            day.status === 'present' ? 'bg-emerald-500' :
                            day.status === 'absent' ? 'bg-rose-500' :
                            'bg-amber-500'
                          } text-white`}>
                            {getStatusIcon(day.status)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{day.dayName} {day.dayNumber}</p>
                            <p className="text-xs text-muted-foreground">{day.date}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          day.status === 'present' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                          day.status === 'absent' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300' :
                          'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}>
                          {getStatusText(day.status)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Botón cargar más */}
                {hasMoreHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryLimit(prev => prev + 10)}
                    className="w-full mt-4 text-primary hover:text-primary"
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Cargar más ({filteredHistory.length - historyLimit} restantes)
                  </Button>
                )}

                {/* Resumen rápido */}
                {visibleHistory.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                    <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <p className="text-lg font-bold text-emerald-600">{yearStats.present}</p>
                      <p className="text-[10px] text-muted-foreground">Presentes</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                      <p className="text-lg font-bold text-rose-600">{yearStats.absent}</p>
                      <p className="text-[10px] text-muted-foreground">Ausencias</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                      <p className="text-lg font-bold text-amber-600">{yearStats.late}</p>
                      <p className="text-[10px] text-muted-foreground">Tardanzas</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal de día seleccionado */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  selectedDay.status === 'present' ? 'bg-emerald-500' :
                  selectedDay.status === 'absent' ? 'bg-rose-500' :
                  'bg-amber-500'
                }`}>
                  {selectedDay.status === 'present' && <CheckCircle2 className="h-8 w-8 text-white" />}
                  {selectedDay.status === 'absent' && <XCircle className="h-8 w-8 text-white" />}
                  {selectedDay.status === 'late' && <Clock className="h-8 w-8 text-white" />}
                </div>
                <h3 className="text-xl font-bold mb-1">{selectedDay.dayName} {selectedDay.dayNumber}</h3>
                <p className="text-muted-foreground mb-4">{selectedDay.date}</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedDay.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  selectedDay.status === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {getStatusText(selectedDay.status)}
                </span>
              </div>
              <Button onClick={() => setSelectedDay(null)} className="w-full mt-6">
                Cerrar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
