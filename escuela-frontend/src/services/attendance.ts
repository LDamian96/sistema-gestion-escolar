import api from './api'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'

export interface Attendance {
  id: string
  courseId: string
  studentId: string
  date: string
  status: AttendanceStatus
  notes?: string
  student?: {
    firstName: string
    lastName: string
    enrollmentCode: string
  }
  course?: {
    id: string
    subject: {
      id: string
      name: string
    }
    classroom?: {
      id: string
      name: string
    }
  }
}

// Archivo adjunto por sesión de clase (fecha + curso)
export interface AttendanceSessionFile {
  id: string
  courseId: string
  date: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
}

export interface AttendanceSummary {
  studentId: string
  total: number
  byStatus: Record<AttendanceStatus, number>
  percentage: {
    present: number
  }
}

export interface CreateAttendanceDto {
  courseId: string
  studentId: string
  date: string
  status: AttendanceStatus
  notes?: string
}

// Determinar si usar mock
const USE_MOCK = typeof window !== 'undefined' && localStorage.getItem('school_access_token')?.startsWith('mock-')

// Datos mock para desarrollo
const mockStudents = [
  { id: '1', firstName: 'María', lastName: 'García', enrollmentCode: 'EST001' },
  { id: '2', firstName: 'Carlos', lastName: 'Ruiz', enrollmentCode: 'EST002' },
  { id: '3', firstName: 'Laura', lastName: 'Méndez', enrollmentCode: 'EST003' },
  { id: '4', firstName: 'Diego', lastName: 'Torres', enrollmentCode: 'EST004' },
  { id: '5', firstName: 'Sofía', lastName: 'López', enrollmentCode: 'EST005' },
  { id: '6', firstName: 'Andrés', lastName: 'Flores', enrollmentCode: 'EST006' },
  { id: '7', firstName: 'Valentina', lastName: 'Díaz', enrollmentCode: 'EST007' },
  { id: '8', firstName: 'Mateo', lastName: 'Sánchez', enrollmentCode: 'EST008' },
  { id: '9', firstName: 'Isabella', lastName: 'Martínez', enrollmentCode: 'EST009' },
  { id: '10', firstName: 'Samuel', lastName: 'Rodríguez', enrollmentCode: 'EST010' },
]

const mockCourses = [
  { id: 'course-1', name: '5to A - Matemáticas', subject: { id: 'sub-1', name: 'Matemáticas' }, classroom: { id: 'class-1', name: '5to A' } },
  { id: 'course-2', name: '5to B - Matemáticas', subject: { id: 'sub-1', name: 'Matemáticas' }, classroom: { id: 'class-2', name: '5to B' } },
  { id: 'course-3', name: '6to A - Álgebra', subject: { id: 'sub-2', name: 'Álgebra' }, classroom: { id: 'class-3', name: '6to A' } },
  { id: 'course-4', name: '6to B - Geometría', subject: { id: 'sub-3', name: 'Geometría' }, classroom: { id: 'class-4', name: '6to B' } },
]

// Generar asistencias mock basadas en fechas
const generateMockAttendances = (courseId?: string, studentId?: string, date?: string): Attendance[] => {
  const attendances: Attendance[] = []
  const statuses: AttendanceStatus[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT']

  const targetCourses = courseId ? mockCourses.filter(c => c.id === courseId) : mockCourses
  const targetStudents = studentId ? mockStudents.filter(s => s.id === studentId) : mockStudents

  // Generar para los últimos 30 días
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)

    // Saltar fines de semana
    if (d.getDay() === 0 || d.getDay() === 6) continue

    const dateStr = d.toISOString().split('T')[0]

    // Si se especificó una fecha, solo devolver esa
    if (date && dateStr !== date) continue

    targetCourses.forEach(course => {
      targetStudents.forEach(student => {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
        attendances.push({
          id: `att-${course.id}-${student.id}-${dateStr}`,
          courseId: course.id,
          studentId: student.id,
          date: dateStr,
          status: randomStatus,
          student: {
            firstName: student.firstName,
            lastName: student.lastName,
            enrollmentCode: student.enrollmentCode,
          },
          course: {
            id: course.id,
            subject: course.subject,
            classroom: course.classroom,
          },
        })
      })
    })
  }

  return attendances
}

// Cache para mock attendances
let mockAttendanceCache: Attendance[] | null = null

const getMockAttendances = () => {
  if (!mockAttendanceCache) {
    mockAttendanceCache = generateMockAttendances()
  }
  return mockAttendanceCache
}

export const attendanceService = {
  // Obtener todas las asistencias con filtros opcionales
  async getAll(filters?: { courseId?: string; studentId?: string; date?: string }): Promise<Attendance[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      let attendances = getMockAttendances()

      if (filters?.courseId) {
        attendances = attendances.filter(a => a.courseId === filters.courseId)
      }
      if (filters?.studentId) {
        attendances = attendances.filter(a => a.studentId === filters.studentId)
      }
      if (filters?.date) {
        attendances = attendances.filter(a => a.date === filters.date)
      }

      return attendances
    }

    const params = new URLSearchParams()
    if (filters?.courseId) params.append('courseId', filters.courseId)
    if (filters?.studentId) params.append('studentId', filters.studentId)
    if (filters?.date) params.append('date', filters.date)

    const response = await api.get(`/attendance?${params.toString()}`)
    return response.data
  },

  // Crear asistencia
  async create(data: CreateAttendanceDto): Promise<Attendance> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const student = mockStudents.find(s => s.id === data.studentId)
      const course = mockCourses.find(c => c.id === data.courseId)

      const newAttendance: Attendance = {
        id: `att-${Date.now()}`,
        ...data,
        student: student ? {
          firstName: student.firstName,
          lastName: student.lastName,
          enrollmentCode: student.enrollmentCode,
        } : undefined,
        course: course ? {
          id: course.id,
          subject: course.subject,
          classroom: course.classroom,
        } : undefined,
      }

      // Actualizar cache
      if (mockAttendanceCache) {
        const existingIndex = mockAttendanceCache.findIndex(
          a => a.courseId === data.courseId && a.studentId === data.studentId && a.date === data.date
        )
        if (existingIndex >= 0) {
          mockAttendanceCache[existingIndex] = newAttendance
        } else {
          mockAttendanceCache.push(newAttendance)
        }
      }

      return newAttendance
    }

    const response = await api.post('/attendance', data)
    return response.data
  },

  // Actualizar asistencia
  async update(id: string, status: AttendanceStatus, notes?: string): Promise<Attendance> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      if (mockAttendanceCache) {
        const index = mockAttendanceCache.findIndex(a => a.id === id)
        if (index >= 0) {
          mockAttendanceCache[index] = { ...mockAttendanceCache[index], status, notes }
          return mockAttendanceCache[index]
        }
      }

      return { id, status, notes } as Attendance
    }

    const response = await api.put(`/attendance/${id}`, { status, notes })
    return response.data
  },

  // Eliminar asistencia
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      if (mockAttendanceCache) {
        mockAttendanceCache = mockAttendanceCache.filter(a => a.id !== id)
      }
      return
    }

    await api.delete(`/attendance/${id}`)
  },

  // Marcar todos los estudiantes de un curso
  async markAll(courseId: string, date: string, status: AttendanceStatus): Promise<{ message: string; attendances: Attendance[] }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const course = mockCourses.find(c => c.id === courseId)
      const attendances: Attendance[] = mockStudents.map(student => ({
        id: `att-${courseId}-${student.id}-${date}`,
        courseId,
        studentId: student.id,
        date,
        status,
        student: {
          firstName: student.firstName,
          lastName: student.lastName,
          enrollmentCode: student.enrollmentCode,
        },
        course: course ? {
          id: course.id,
          subject: course.subject,
          classroom: course.classroom,
        } : undefined,
      }))

      // Actualizar cache
      if (mockAttendanceCache) {
        attendances.forEach(att => {
          const existingIndex = mockAttendanceCache!.findIndex(
            a => a.courseId === att.courseId && a.studentId === att.studentId && a.date === att.date
          )
          if (existingIndex >= 0) {
            mockAttendanceCache![existingIndex] = att
          } else {
            mockAttendanceCache!.push(att)
          }
        })
      }

      return { message: `Asistencia marcada para ${attendances.length} estudiantes`, attendances }
    }

    const response = await api.post('/attendance/mark-all', { courseId, date, status })
    return response.data
  },

  // Obtener resumen de asistencia de un estudiante
  async getStudentSummary(studentId: string, courseId?: string): Promise<AttendanceSummary> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      let attendances = getMockAttendances().filter(a => a.studentId === studentId)
      if (courseId) {
        attendances = attendances.filter(a => a.courseId === courseId)
      }

      const summary: AttendanceSummary = {
        studentId,
        total: attendances.length,
        byStatus: {
          PRESENT: attendances.filter(a => a.status === 'PRESENT').length,
          ABSENT: attendances.filter(a => a.status === 'ABSENT').length,
          LATE: attendances.filter(a => a.status === 'LATE').length,
        },
        percentage: {
          present: attendances.length > 0
            ? (attendances.filter(a => a.status === 'PRESENT').length / attendances.length) * 100
            : 0,
        },
      }

      return summary
    }

    const params = courseId ? `?courseId=${courseId}` : ''
    const response = await api.get(`/attendance/student/${studentId}/summary${params}`)
    return response.data
  },

  // Obtener cursos (mock)
  async getCourses() {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockCourses
    }

    const response = await api.get('/courses')
    return response.data
  },

  // Obtener estudiantes por curso (mock)
  async getStudentsByCourse(courseId: string) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockStudents
    }

    const response = await api.get(`/courses/${courseId}/students`)
    return response.data
  },

  // Obtener archivo de sesión de clase
  async getSessionFile(courseId: string, date: string): Promise<AttendanceSessionFile | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockSessionFiles.find(f => f.courseId === courseId && f.date === date) || null
    }

    try {
      const response = await api.get(`/attendance/session-file`, { params: { courseId, date } })
      return response.data
    } catch {
      return null
    }
  },

  // Subir archivo de sesión de clase
  async uploadSessionFile(courseId: string, date: string, file: File): Promise<AttendanceSessionFile> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))

      const newFile: AttendanceSessionFile = {
        id: `file-${Date.now()}`,
        courseId,
        date,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'teacher-1',
      }

      // Actualizar cache - reemplazar si ya existe
      const existingIndex = mockSessionFiles.findIndex(f => f.courseId === courseId && f.date === date)
      if (existingIndex >= 0) {
        mockSessionFiles[existingIndex] = newFile
      } else {
        mockSessionFiles.push(newFile)
      }

      return newFile
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('courseId', courseId)
    formData.append('date', date)

    const response = await api.post('/attendance/session-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Eliminar archivo de sesión
  async deleteSessionFile(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const index = mockSessionFiles.findIndex(f => f.id === id)
      if (index >= 0) {
        mockSessionFiles.splice(index, 1)
      }
      return
    }

    await api.delete(`/attendance/session-file/${id}`)
  },
}

// Mock session files storage
const mockSessionFiles: AttendanceSessionFile[] = []

export default attendanceService
