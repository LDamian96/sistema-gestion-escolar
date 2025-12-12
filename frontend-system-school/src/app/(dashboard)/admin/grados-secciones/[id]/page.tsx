'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Plus,
  ArrowLeft,
  Users,
  UserCheck,
  X,
  Save,
  Layers,
  BookOpen,
  Trash2,
  Edit,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Schedule {
  day: string
  startTime: string
  endTime: string
}

interface Course {
  id: string
  name: string
  teacher: string
  color: string
  schedules: Schedule[]
}

interface Section {
  id: string
  name: string
  tutor: string
  students: number
  courses: Course[]
}

interface GradeDetail {
  id: string
  name: string
  level: string
  color: string
  sections: Section[]
}

// Mock data
const gradesData: Record<string, GradeDetail> = {
  '1': {
    id: '1',
    name: '1er Grado',
    level: 'Primaria',
    color: 'bg-blue-500',
    sections: [
      {
        id: '1a',
        name: 'A',
        tutor: 'María López',
        students: 28,
        courses: [
          { id: 'c1', name: 'Matemáticas', teacher: 'Prof. García', color: 'bg-blue-500', schedules: [{ day: 'Lunes', startTime: '08:00', endTime: '09:30' }, { day: 'Miércoles', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c2', name: 'Comunicación', teacher: 'Prof. López', color: 'bg-green-500', schedules: [{ day: 'Lunes', startTime: '09:45', endTime: '11:15' }, { day: 'Jueves', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c3', name: 'Ciencias', teacher: 'Prof. Martínez', color: 'bg-purple-500', schedules: [{ day: 'Martes', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c4', name: 'Personal Social', teacher: 'Prof. Rodríguez', color: 'bg-orange-500', schedules: [{ day: 'Martes', startTime: '09:45', endTime: '11:15' }] },
          { id: 'c5', name: 'Arte', teacher: 'Prof. Flores', color: 'bg-pink-500', schedules: [{ day: 'Viernes', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c6', name: 'Ed. Física', teacher: 'Prof. Sánchez', color: 'bg-cyan-500', schedules: [{ day: 'Viernes', startTime: '09:45', endTime: '11:15' }] },
        ]
      },
      {
        id: '1b',
        name: 'B',
        tutor: 'Carlos Ruiz',
        students: 30,
        courses: [
          { id: 'c1', name: 'Matemáticas', teacher: 'Prof. Pérez', color: 'bg-blue-500', schedules: [{ day: 'Lunes', startTime: '10:00', endTime: '11:30' }, { day: 'Jueves', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c2', name: 'Comunicación', teacher: 'Prof. García', color: 'bg-green-500', schedules: [{ day: 'Martes', startTime: '08:00', endTime: '09:30' }, { day: 'Viernes', startTime: '10:00', endTime: '11:30' }] },
          { id: 'c3', name: 'Ciencias', teacher: 'Prof. Luna', color: 'bg-purple-500', schedules: [{ day: 'Miércoles', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c4', name: 'Personal Social', teacher: 'Prof. Torres', color: 'bg-orange-500', schedules: [{ day: 'Miércoles', startTime: '09:45', endTime: '11:15' }] },
          { id: 'c5', name: 'Arte', teacher: 'Prof. Vargas', color: 'bg-pink-500', schedules: [{ day: 'Jueves', startTime: '09:45', endTime: '11:15' }] },
          { id: 'c6', name: 'Ed. Física', teacher: 'Prof. Mendoza', color: 'bg-cyan-500', schedules: [{ day: 'Viernes', startTime: '08:00', endTime: '09:30' }] },
        ]
      },
      {
        id: '1c',
        name: 'C',
        tutor: 'Ana Torres',
        students: 27,
        courses: [
          { id: 'c1', name: 'Matemáticas', teacher: 'Prof. García', color: 'bg-blue-500', schedules: [{ day: 'Martes', startTime: '08:00', endTime: '09:30' }, { day: 'Viernes', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c2', name: 'Comunicación', teacher: 'Prof. Díaz', color: 'bg-green-500', schedules: [{ day: 'Lunes', startTime: '08:00', endTime: '09:30' }, { day: 'Miércoles', startTime: '10:00', endTime: '11:30' }] },
          { id: 'c3', name: 'Ciencias', teacher: 'Prof. Martínez', color: 'bg-purple-500', schedules: [{ day: 'Jueves', startTime: '10:00', endTime: '11:30' }] },
          { id: 'c4', name: 'Personal Social', teacher: 'Prof. Rodríguez', color: 'bg-orange-500', schedules: [{ day: 'Lunes', startTime: '09:45', endTime: '11:15' }] },
          { id: 'c5', name: 'Arte', teacher: 'Prof. Flores', color: 'bg-pink-500', schedules: [{ day: 'Miércoles', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c6', name: 'Ed. Física', teacher: 'Prof. Sánchez', color: 'bg-cyan-500', schedules: [{ day: 'Jueves', startTime: '08:00', endTime: '09:30' }] },
        ]
      },
    ]
  },
  '2': {
    id: '2',
    name: '2do Grado',
    level: 'Primaria',
    color: 'bg-green-500',
    sections: [
      {
        id: '2a',
        name: 'A',
        tutor: 'Pedro García',
        students: 32,
        courses: [
          { id: 'c1', name: 'Matemáticas', teacher: 'Prof. Ruiz', color: 'bg-blue-500', schedules: [{ day: 'Lunes', startTime: '08:00', endTime: '09:30' }, { day: 'Miércoles', startTime: '08:00', endTime: '09:30' }] },
          { id: 'c2', name: 'Comunicación', teacher: 'Prof. Soto', color: 'bg-green-500', schedules: [{ day: 'Martes', startTime: '08:00', endTime: '09:30' }, { day: 'Jueves', startTime: '08:00', endTime: '09:30' }] },
        ]
      },
      {
        id: '2b',
        name: 'B',
        tutor: 'Laura Mendez',
        students: 29,
        courses: [
          { id: 'c1', name: 'Matemáticas', teacher: 'Prof. Castro', color: 'bg-blue-500', schedules: [{ day: 'Lunes', startTime: '10:00', endTime: '11:30' }, { day: 'Jueves', startTime: '10:00', endTime: '11:30' }] },
          { id: 'c2', name: 'Comunicación', teacher: 'Prof. Rivera', color: 'bg-green-500', schedules: [{ day: 'Martes', startTime: '10:00', endTime: '11:30' }, { day: 'Viernes', startTime: '08:00', endTime: '09:30' }] },
        ]
      },
    ]
  },
}

// Para grados sin data específica
const defaultGrade = (id: string): GradeDetail => ({
  id,
  name: `Grado ${id}`,
  level: 'Primaria',
  color: 'bg-gray-500',
  sections: []
})

const availableCourses = [
  'Matemáticas', 'Comunicación', 'Ciencias', 'Ciencia y Tecnología',
  'Personal Social', 'Arte', 'Arte y Cultura', 'Educación Física',
  'Inglés', 'Computación', 'Música', 'Religión', 'Tutoría'
]

const availableTeachers = [
  'Prof. García', 'Prof. López', 'Prof. Martínez', 'Prof. Rodríguez',
  'Prof. Flores', 'Prof. Sánchez', 'Prof. Williams', 'Prof. Pérez',
  'Prof. Luna', 'Prof. Torres', 'Prof. Vargas', 'Prof. Mendoza',
  'Prof. Ruiz', 'Prof. Soto', 'Prof. Castro', 'Prof. Rivera', 'Prof. Díaz'
]

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const courseColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500'
]

interface NewSchedule {
  day: string
  startTime: string
  endTime: string
}

interface NewCourse {
  name: string
  teacher: string
  schedules: NewSchedule[]
}

const initialNewCourse: NewCourse = {
  name: '',
  teacher: '',
  schedules: [{ day: 'Lunes', startTime: '08:00', endTime: '09:30' }]
}

export default function GradeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const gradeId = params.id as string

  const grade = gradesData[gradeId] || defaultGrade(gradeId)

  const [expandedSections, setExpandedSections] = useState<string[]>([grade.sections[0]?.id || ''])
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [newCourse, setNewCourse] = useState<NewCourse>(initialNewCourse)

  if (!grade.sections.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Grado no encontrado</h2>
          <Button onClick={() => router.push('/admin/grados-secciones')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a grados
          </Button>
        </div>
      </div>
    )
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const totalStudents = grade.sections.reduce((acc, s) => acc + s.students, 0)
  const totalCourses = grade.sections.reduce((acc, s) => acc + s.courses.length, 0)

  const openCourseModal = (section: Section) => {
    setSelectedSection(section)
    setNewCourse(initialNewCourse)
    setShowCourseModal(true)
  }

  const addSchedule = () => {
    setNewCourse({
      ...newCourse,
      schedules: [...newCourse.schedules, { day: 'Lunes', startTime: '08:00', endTime: '09:30' }]
    })
  }

  const removeSchedule = (index: number) => {
    if (newCourse.schedules.length > 1) {
      setNewCourse({
        ...newCourse,
        schedules: newCourse.schedules.filter((_, i) => i !== index)
      })
    }
  }

  const updateSchedule = (index: number, field: keyof NewSchedule, value: string) => {
    const updated = [...newCourse.schedules]
    updated[index] = { ...updated[index], [field]: value }
    setNewCourse({ ...newCourse, schedules: updated })
  }

  const handleCreateCourse = () => {
    if (!newCourse.name || !newCourse.teacher) return
    console.log('Creating course for section:', selectedSection?.id, newCourse)
    setShowCourseModal(false)
    setNewCourse(initialNewCourse)
  }

  const getTotalHours = (course: Course) => {
    return course.schedules.reduce((acc, s) => {
      const start = parseInt(s.startTime.split(':')[0]) + parseInt(s.startTime.split(':')[1]) / 60
      const end = parseInt(s.endTime.split(':')[0]) + parseInt(s.endTime.split(':')[1]) / 60
      return acc + (end - start)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/grados-secciones')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-16 h-16 rounded-xl ${grade.color} flex items-center justify-center`}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">{grade.name}</h1>
            <p className="text-muted-foreground">{grade.level}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Secciones', value: grade.sections.length, icon: Layers, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Estudiantes', value: totalStudents, icon: Users, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Cursos Totales', value: totalCourses, icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
          { label: 'Profesores', value: new Set(grade.sections.flatMap(s => s.courses.map(c => c.teacher))).size, icon: UserCheck, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
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

      {/* Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Secciones y sus Cursos</h2>
        <p className="text-sm text-muted-foreground">
          Cada sección puede tener diferentes profesores y horarios para sus cursos
        </p>

        {grade.sections.map((section, sIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIndex * 0.1 }}
          >
            <Card className="overflow-hidden">
              {/* Section Header */}
              <div
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${grade.color.replace('bg-', 'border-')}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${grade.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{section.name}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {grade.name} - Sección {section.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          Tutor: {section.tutor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {section.students} estudiantes
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {section.courses.length} cursos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openCourseModal(section)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Curso
                    </Button>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Section Courses */}
              <AnimatePresence>
                {expandedSections.includes(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t"
                  >
                    <div className="p-4">
                      {section.courses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No hay cursos asignados a esta sección</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => openCourseModal(section)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar primer curso
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {section.courses.map((course, cIndex) => (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: cIndex * 0.05 }}
                            >
                              <Card className="hover:shadow-md transition-shadow h-full">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-lg ${course.color} flex items-center justify-center`}>
                                      <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <h4 className="font-semibold mb-1">{course.name}</h4>
                                  <p className="text-sm text-muted-foreground mb-3">{course.teacher}</p>

                                  {/* Horarios */}
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Horarios ({getTotalHours(course).toFixed(1)}h/semana)
                                    </p>
                                    {course.schedules.map((schedule, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className="text-xs bg-muted/50 px-2 py-1.5 rounded flex items-center justify-between"
                                      >
                                        <span className="font-medium">{schedule.day}</span>
                                        <span>{schedule.startTime} - {schedule.endTime}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showCourseModal && selectedSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowCourseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-lg my-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Agregar Curso</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {grade.name} - Sección {selectedSection.name}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCourseModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Materia */}
                <div>
                  <label className="block text-sm font-medium mb-2">Materia</label>
                  <select
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Seleccionar materia...</option>
                    {availableCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Profesor */}
                <div>
                  <label className="block text-sm font-medium mb-2">Profesor</label>
                  <select
                    value={newCourse.teacher}
                    onChange={(e) => setNewCourse({ ...newCourse, teacher: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Seleccionar profesor...</option>
                    {availableTeachers.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Horarios */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">Horarios</label>
                    <Button variant="outline" size="sm" onClick={addSchedule}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar horario
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newCourse.schedules.map((schedule, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Horario {index + 1}
                          </span>
                          {newCourse.schedules.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeSchedule(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Día</label>
                            <select
                              value={schedule.day}
                              onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            >
                              {days.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                            <Input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Fin</label>
                            <Input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Los horarios se mostrarán en el calendario de la sección
                  </p>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCourseModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCourse}
                  disabled={!newCourse.name || !newCourse.teacher}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Agregar Curso
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
