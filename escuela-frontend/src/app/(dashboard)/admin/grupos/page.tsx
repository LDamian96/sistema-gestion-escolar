'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  BookOpen,
  GraduationCap,
  Search,
  Eye,
  Clock,
  Plus,
  Trash2,
  Loader2,
  Filter,
  ChevronRight,
  UserCheck,
  Calendar,
  MapPin,
  ArrowLeft,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  groupsService,
  coursesService,
  schedulesService,
  Group,
  Course,
  Student,
  Teacher,
  Schedule,
  Turno
} from '@/services/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toast'

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

interface ScheduleEntry {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
}

type ViewMode = 'groups' | 'group-detail'

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Inicial' | 'Primaria' | 'Secundaria'>('all')

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('groups')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupStudents, setGroupStudents] = useState<Student[]>([])
  const [groupTeachers, setGroupTeachers] = useState<Teacher[]>([])
  const [groupCourses, setGroupCourses] = useState<Course[]>([])
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])

  // Course schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseSchedules, setCourseSchedules] = useState<ScheduleEntry[]>([])
  const [isSavingSchedules, setIsSavingSchedules] = useState(false)

  const { toast, toasts, dismiss } = useToast()

  // Load groups
  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const [groupsData, schedulesData] = await Promise.all([
        groupsService.getAll(),
        schedulesService.getAll()
      ])
      setGroups(groupsData)
      setAllSchedules(schedulesData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grupos',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Load group details
  const loadGroupDetails = async (group: Group) => {
    try {
      setLoading(true)
      const [students, teachers, courses] = await Promise.all([
        groupsService.getStudents(group.id),
        groupsService.getTeachers(group.id),
        groupsService.getCourses(group.id)
      ])
      setGroupStudents(students)
      setGroupTeachers(teachers)
      setGroupCourses(courses)
      setSelectedGroup(group)
      setViewMode('group-detail')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles del grupo',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter groups
  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = selectedLevel === 'all' || group.level === selectedLevel
      return matchesSearch && matchesLevel
    })
  }, [groups, searchTerm, selectedLevel])

  // Stats
  const stats = useMemo(() => {
    const totalStudents = groups.reduce((sum, g) => sum + g.studentCount, 0)
    const initialGroups = groups.filter(g => g.level === 'Inicial').length
    const primaryGroups = groups.filter(g => g.level === 'Primaria').length
    const secondaryGroups = groups.filter(g => g.level === 'Secundaria').length

    return [
      { label: 'Total Grupos', value: groups.length, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Inicial', value: initialGroups, icon: GraduationCap, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      { label: 'Primaria', value: primaryGroups, icon: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Secundaria', value: secondaryGroups, icon: GraduationCap, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ]
  }, [groups])

  // Get schedules for a course
  const getSchedulesForCourse = (courseId: string) => {
    return allSchedules.filter(s => s.courseId === courseId)
  }

  // Open schedule modal for a course
  const openScheduleModal = (course: Course) => {
    setSelectedCourse(course)
    const existingSchedules = getSchedulesForCourse(course.id)
    setCourseSchedules(existingSchedules.map(s => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room
    })))
    if (existingSchedules.length === 0) {
      setCourseSchedules([{ dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: '' }])
    }
    setShowScheduleModal(true)
  }

  // Add schedule entry
  const addScheduleEntry = () => {
    setCourseSchedules([...courseSchedules, { dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: '' }])
  }

  // Remove schedule entry
  const removeScheduleEntry = (index: number) => {
    if (courseSchedules.length > 1) {
      setCourseSchedules(courseSchedules.filter((_, i) => i !== index))
    }
  }

  // Update schedule entry
  const updateScheduleEntry = (index: number, field: keyof ScheduleEntry, value: string | number) => {
    const updated = [...courseSchedules]
    updated[index] = { ...updated[index], [field]: value }
    setCourseSchedules(updated)
  }

  // Helper function to check if two time ranges overlap
  const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    return start1 < end2 && end1 > start2
  }

  // Helper to get turno time range from group (now dynamic)
  const getTurnoTimeRange = (group: Group): { min: string, max: string } => {
    return { min: group.turnoStartTime, max: group.turnoEndTime }
  }

  // Helper to generate hour slots from turno time range
  const generateHourSlots = (startTime: string, endTime: string): string[] => {
    const hours: string[] = []
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])
    for (let h = startHour; h <= endHour; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`)
    }
    return hours
  }

  // Save schedules
  const saveSchedules = async () => {
    if (!selectedCourse || !selectedGroup) return

    // Get turno time range from the group's configured hours
    const turnoRange = getTurnoTimeRange(selectedGroup)

    // Validate each schedule
    for (const schedule of courseSchedules) {
      if (!schedule.room) {
        toast({ title: 'Error', description: 'Todos los horarios deben tener un aula asignada', type: 'error' })
        return
      }
      if (schedule.startTime >= schedule.endTime) {
        toast({ title: 'Error', description: 'La hora de inicio debe ser menor a la hora de fin', type: 'error' })
        return
      }
      // Validate against turno
      if (schedule.startTime < turnoRange.min || schedule.endTime > turnoRange.max) {
        toast({
          title: 'Error',
          description: `El horario debe estar dentro del turno ${selectedGroup.turno} (${turnoRange.min} - ${turnoRange.max})`,
          type: 'error'
        })
        return
      }
    }

    // Check for overlaps with other courses in the same group (excluding current course)
    const otherSchedules = allSchedules.filter(s => {
      const course = groupCourses.find(c => c.id === s.courseId)
      return course && s.courseId !== selectedCourse.id
    })

    for (const newSchedule of courseSchedules) {
      for (const existingSchedule of otherSchedules) {
        if (newSchedule.dayOfWeek === existingSchedule.dayOfWeek) {
          if (checkTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
            const dayName = DAYS_OF_WEEK.find(d => d.value === newSchedule.dayOfWeek)?.label
            toast({
              title: 'Superposición detectada',
              description: `El horario ${newSchedule.startTime}-${newSchedule.endTime} del ${dayName} se cruza con ${existingSchedule.courseName} (${existingSchedule.startTime}-${existingSchedule.endTime})`,
              type: 'error'
            })
            return
          }
        }
      }
    }

    // Check for overlaps within the new schedules themselves
    for (let i = 0; i < courseSchedules.length; i++) {
      for (let j = i + 1; j < courseSchedules.length; j++) {
        if (courseSchedules[i].dayOfWeek === courseSchedules[j].dayOfWeek) {
          if (checkTimeOverlap(courseSchedules[i].startTime, courseSchedules[i].endTime, courseSchedules[j].startTime, courseSchedules[j].endTime)) {
            const dayName = DAYS_OF_WEEK.find(d => d.value === courseSchedules[i].dayOfWeek)?.label
            toast({
              title: 'Superposición detectada',
              description: `Los horarios ${i + 1} y ${j + 1} del ${dayName} se superponen`,
              type: 'error'
            })
            return
          }
        }
      }
    }

    try {
      setIsSavingSchedules(true)

      // Delete existing schedules for this course
      const existingSchedules = getSchedulesForCourse(selectedCourse.id)
      for (const schedule of existingSchedules) {
        await schedulesService.delete(schedule.id)
      }

      // Create new schedules
      for (const schedule of courseSchedules) {
        await schedulesService.create({
          courseId: selectedCourse.id,
          courseName: selectedCourse.subjectName,
          teacherName: selectedCourse.teacherName,
          gradeSection: selectedCourse.gradeSection,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room
        })
      }

      // Reload schedules
      const updatedSchedules = await schedulesService.getAll()
      setAllSchedules(updatedSchedules)

      toast({ title: 'Éxito', description: 'Horarios guardados correctamente', type: 'success' })
      setShowScheduleModal(false)
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron guardar los horarios', type: 'error' })
    } finally {
      setIsSavingSchedules(false)
    }
  }

  // Go back to groups list
  const goBackToGroups = () => {
    setViewMode('groups')
    setSelectedGroup(null)
    setGroupStudents([])
    setGroupTeachers([])
    setGroupCourses([])
  }

  if (loading && viewMode === 'groups') {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Group Detail View
  if (viewMode === 'group-detail' && selectedGroup) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBackToGroups}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">{selectedGroup.name}</h1>
            <p className="text-muted-foreground mt-1">
              {selectedGroup.tutorName && `Tutor: ${selectedGroup.tutorName}`}
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {selectedGroup.level}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{groupStudents.length}</p>
                  <p className="text-xs text-muted-foreground">Estudiantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <BookOpen className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{groupCourses.length}</p>
                  <p className="text-xs text-muted-foreground">Cursos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <UserCheck className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{groupTeachers.length}</p>
                  <p className="text-xs text-muted-foreground">Profesores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cursos / Materias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : groupCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay cursos asignados a este grupo</p>
                <p className="text-sm mt-2">Los cursos se crean automáticamente al crear materias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupCourses.map((course, index) => {
                  const schedules = getSchedulesForCourse(course.id)
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{course.subjectName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {course.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {course.teacherName}
                            </span>
                          </div>
                          {/* Schedules */}
                          {schedules.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {schedules.map((schedule) => (
                                <Badge key={schedule.id} variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {DAYS_OF_WEEK.find(d => d.value === schedule.dayOfWeek)?.short} {schedule.startTime}-{schedule.endTime}
                                  <MapPin className="h-3 w-3 mx-1" />
                                  {schedule.room}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 mt-2">Sin horarios asignados</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openScheduleModal(course)}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          {schedules.length > 0 ? 'Editar Horarios' : 'Asignar Horarios'}
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estudiantes ({groupStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay estudiantes en este grupo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">{student.code}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Profesores ({groupTeachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupTeachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay profesores asignados a este grupo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {teacher.firstName[0]}{teacher.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                      <p className="text-sm text-muted-foreground">{teacher.specialization}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {teacher.subjects.slice(0, 2).map(subject => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Modal */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios de {selectedCourse?.subjectName}
              </DialogTitle>
              <DialogDescription>
                Asigna los horarios para este curso. Puedes agregar múltiples horarios en diferentes días.
              </DialogDescription>
            </DialogHeader>

            {/* Vista de horario semanal ocupado */}
            {selectedGroup && (
              <div className="border rounded-lg p-4 bg-muted/20">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Horario semanal de {selectedGroup.name}
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    selectedGroup.turno === 'Mañana'
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : 'bg-blue-500/20 text-blue-600'
                  }`}>
                    Turno {selectedGroup.turno}
                  </span>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted/50 w-16">Hora</th>
                        {DAYS_OF_WEEK.map(day => (
                          <th key={day.value} className="border p-2 bg-muted/50 min-w-[100px]">
                            {day.short}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Dynamic hours based on turno configuration */}
                      {generateHourSlots(selectedGroup.turnoStartTime, selectedGroup.turnoEndTime).map(hour => {
                        // Obtener todos los horarios del grupo para este bloque
                        const groupSchedules = allSchedules.filter(s => {
                          const course = groupCourses.find(c => c.id === s.courseId)
                          return course !== undefined
                        })

                        return (
                          <tr key={hour}>
                            <td className="border p-2 text-center font-medium bg-muted/30">{hour}</td>
                            {DAYS_OF_WEEK.map(day => {
                              // Buscar si hay clase en este día y hora
                              const schedulesAtSlot = groupSchedules.filter(s => {
                                if (s.dayOfWeek !== day.value) return false
                                const slotStart = hour
                                const slotEnd = `${(parseInt(hour.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
                                // Verificar si el horario se superpone con este slot
                                return s.startTime < slotEnd && s.endTime > slotStart
                              })

                              const hasSchedule = schedulesAtSlot.length > 0
                              const isCurrentCourse = schedulesAtSlot.some(s => s.courseId === selectedCourse?.id)

                              return (
                                <td
                                  key={day.value}
                                  className={`border p-1 text-center ${
                                    hasSchedule
                                      ? isCurrentCourse
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                                      : 'bg-green-500/10'
                                  }`}
                                >
                                  {hasSchedule ? (
                                    <div className="text-[10px] leading-tight">
                                      {schedulesAtSlot.map((s, i) => (
                                        <div key={i} className="truncate" title={`${s.courseName} - ${s.room}`}>
                                          {s.courseName?.substring(0, 8)}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-500/20"></span> Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-orange-500/20"></span> Ocupado (otro curso)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-primary/20"></span> Este curso
                  </span>
                </div>
              </div>
            )}

            {/* Info about turno constraints */}
            {selectedGroup && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                selectedGroup.turno === 'Mañana'
                  ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
              }`}>
                <Clock className="h-4 w-4" />
                <span>
                  Turno {selectedGroup.turno}: los horarios deben estar entre{' '}
                  <strong>{selectedGroup.turnoStartTime} - {selectedGroup.turnoEndTime}</strong>
                </span>
              </div>
            )}

            <div className="space-y-4 py-4">
              {courseSchedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Horario {index + 1}</span>
                    {courseSchedules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeScheduleEntry(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Día</Label>
                      <Select
                        value={schedule.dayOfWeek.toString()}
                        onValueChange={(value) => updateScheduleEntry(index, 'dayOfWeek', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map(day => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hora Inicio</Label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateScheduleEntry(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hora Fin</Label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateScheduleEntry(index, 'endTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Aula</Label>
                      <Input
                        value={schedule.room}
                        onChange={(e) => updateScheduleEntry(index, 'room', e.target.value)}
                        placeholder="Ej: Aula 101"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={addScheduleEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Otro Horario
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleModal(false)} disabled={isSavingSchedules}>
                Cancelar
              </Button>
              <Button onClick={saveSchedules} disabled={isSavingSchedules}>
                {isSavingSchedules ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Horarios
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster toasts={toasts} onDismiss={dismiss} />
      </div>
    )
  }

  // Groups List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Grupos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los grupos por grado y sección</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as 'all' | 'Inicial' | 'Primaria' | 'Secundaria')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Inicial">Inicial</SelectItem>
                  <SelectItem value="Primaria">Primaria</SelectItem>
                  <SelectItem value="Secundaria">Secundaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
                onClick={() => loadGroupDetails(group)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={
                        group.level === 'Inicial' ? 'outline' :
                        group.level === 'Primaria' ? 'default' : 'secondary'
                      }>
                        {group.level}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          group.turno === 'Mañana'
                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                            : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                        }
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {group.turno}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{group.grade} {group.section}</h3>
                  {group.tutorName && (
                    <p className="text-sm text-muted-foreground mb-3">Tutor: {group.tutorName}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.studentCount} estudiantes
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {group.courseCount} cursos
                    </span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={(e) => {
                    e.stopPropagation()
                    loadGroupDetails(group)
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Grupo
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron grupos</h3>
          <p className="text-muted-foreground">
            Los grupos se crean automáticamente al crear grados/secciones en Estructura
          </p>
        </div>
      )}

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
