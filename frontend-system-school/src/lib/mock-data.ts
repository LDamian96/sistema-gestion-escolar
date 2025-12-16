// ============================================
// DATOS ESTÁTICOS DEL SISTEMA DE GESTIÓN ESCOLAR
// ============================================

// Tipos
export interface Level {
  id: string
  name: string
}

export interface GradeLevel {
  id: string
  name: string
  levelId: string
  level: Level
  order: number
}

export interface Section {
  id: string
  name: string
  gradeLevelId: string
  gradeLevel: GradeLevel
  capacity: number
}

export interface Classroom {
  id: string
  name: string
  sectionId: string
  section: Section
  capacity: number
  location: string
}

export interface Subject {
  id: string
  name: string
  code: string
  gradeLevelId?: string
  gradeLevel?: GradeLevel
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialization: string
  status: 'active' | 'inactive'
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  enrollmentCode: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
  classroomId: string
  classroom?: Classroom
  status: 'active' | 'inactive'
}

export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  relationship: string
  studentIds: string[]
  status: 'active' | 'inactive'
}

export interface Course {
  id: string
  subjectId: string
  subject: Subject
  teacherId: string | null
  teacher: Teacher | null
  classroomId: string
  classroom: Classroom
  schedules: Schedule[]
}

export interface Schedule {
  id: string
  courseId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: 'HOMEWORK' | 'EXAM' | 'PROJECT' | 'QUIZ'
  dueDate: string
  courseId: string
  course: Course
  createdAt: string
}

export interface Enrollment {
  id: string
  studentId: string
  classroomId: string
  year: number
  status: 'ACTIVE' | 'INACTIVE'
}

// ============================================
// DATOS INICIALES
// ============================================

// Niveles
export const levels: Level[] = [
  { id: 'level-1', name: 'Inicial' },
  { id: 'level-2', name: 'Primaria' },
  { id: 'level-3', name: 'Secundaria' },
]

// Grados
export const gradeLevels: GradeLevel[] = [
  // Inicial
  { id: 'grade-1', name: '3 años', levelId: 'level-1', level: levels[0], order: 1 },
  { id: 'grade-2', name: '4 años', levelId: 'level-1', level: levels[0], order: 2 },
  { id: 'grade-3', name: '5 años', levelId: 'level-1', level: levels[0], order: 3 },
  // Primaria
  { id: 'grade-4', name: '1er Grado', levelId: 'level-2', level: levels[1], order: 1 },
  { id: 'grade-5', name: '2do Grado', levelId: 'level-2', level: levels[1], order: 2 },
  { id: 'grade-6', name: '3er Grado', levelId: 'level-2', level: levels[1], order: 3 },
  { id: 'grade-7', name: '4to Grado', levelId: 'level-2', level: levels[1], order: 4 },
  { id: 'grade-8', name: '5to Grado', levelId: 'level-2', level: levels[1], order: 5 },
  { id: 'grade-9', name: '6to Grado', levelId: 'level-2', level: levels[1], order: 6 },
  // Secundaria
  { id: 'grade-10', name: '1er Año', levelId: 'level-3', level: levels[2], order: 1 },
  { id: 'grade-11', name: '2do Año', levelId: 'level-3', level: levels[2], order: 2 },
  { id: 'grade-12', name: '3er Año', levelId: 'level-3', level: levels[2], order: 3 },
  { id: 'grade-13', name: '4to Año', levelId: 'level-3', level: levels[2], order: 4 },
  { id: 'grade-14', name: '5to Año', levelId: 'level-3', level: levels[2], order: 5 },
]

// Secciones
const sectionNames = ['A', 'B']
export const sections: Section[] = gradeLevels.flatMap((grade, gradeIdx) =>
  sectionNames.map((name, secIdx) => ({
    id: `section-${gradeIdx * 2 + secIdx + 1}`,
    name,
    gradeLevelId: grade.id,
    gradeLevel: grade,
    capacity: 30,
  }))
)

// GradeSections con su nivel (para filtros)
export const gradeSections = sections.map(section => ({
  name: `${section.gradeLevel.name} ${section.name}`,
  level: section.gradeLevel.level.name as 'Inicial' | 'Primaria' | 'Secundaria'
}))

// Aulas
export const classrooms: Classroom[] = sections.map((section, idx) => ({
  id: `classroom-${idx + 1}`,
  name: `Aula ${section.gradeLevel.name} ${section.name}`,
  sectionId: section.id,
  section,
  capacity: 30,
  location: section.gradeLevel.level.name === 'Inicial' ? 'Pabellón Inicial' :
            section.gradeLevel.level.name === 'Primaria' ? 'Pabellón A' : 'Pabellón B',
}))

// Materias
export const subjects: Subject[] = [
  // Inicial
  { id: 'sub-1', name: 'Comunicación', code: 'COM', gradeLevelId: 'grade-1' },
  { id: 'sub-2', name: 'Matemática', code: 'MAT', gradeLevelId: 'grade-1' },
  { id: 'sub-3', name: 'Personal Social', code: 'PS', gradeLevelId: 'grade-1' },
  { id: 'sub-4', name: 'Psicomotricidad', code: 'PSI', gradeLevelId: 'grade-1' },
  // Primaria y Secundaria
  { id: 'sub-5', name: 'Matemática', code: 'MAT' },
  { id: 'sub-6', name: 'Comunicación', code: 'COM' },
  { id: 'sub-7', name: 'Ciencias Naturales', code: 'CN' },
  { id: 'sub-8', name: 'Historia', code: 'HIS' },
  { id: 'sub-9', name: 'Geografía', code: 'GEO' },
  { id: 'sub-10', name: 'Inglés', code: 'ING' },
  { id: 'sub-11', name: 'Educación Física', code: 'EF' },
  { id: 'sub-12', name: 'Arte', code: 'ART' },
  { id: 'sub-13', name: 'Computación', code: 'COMP' },
  { id: 'sub-14', name: 'Física', code: 'FIS' },
  { id: 'sub-15', name: 'Química', code: 'QUI' },
]

// Profesores
export const teachers: Teacher[] = [
  { id: 'teacher-1', firstName: 'María', lastName: 'García', email: 'maria.garcia@colegio.edu', phone: '999111222', specialization: 'Matemática', status: 'active' },
  { id: 'teacher-2', firstName: 'Juan', lastName: 'López', email: 'juan.lopez@colegio.edu', phone: '999222333', specialization: 'Comunicación', status: 'active' },
  { id: 'teacher-3', firstName: 'Ana', lastName: 'Martínez', email: 'ana.martinez@colegio.edu', phone: '999333444', specialization: 'Ciencias Naturales', status: 'active' },
  { id: 'teacher-4', firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos.rodriguez@colegio.edu', phone: '999444555', specialization: 'Historia', status: 'active' },
  { id: 'teacher-5', firstName: 'Laura', lastName: 'Fernández', email: 'laura.fernandez@colegio.edu', phone: '999555666', specialization: 'Inglés', status: 'active' },
  { id: 'teacher-6', firstName: 'Pedro', lastName: 'Sánchez', email: 'pedro.sanchez@colegio.edu', phone: '999666777', specialization: 'Educación Física', status: 'active' },
  { id: 'teacher-7', firstName: 'Rosa', lastName: 'Díaz', email: 'rosa.diaz@colegio.edu', phone: '999777888', specialization: 'Arte', status: 'active' },
  { id: 'teacher-8', firstName: 'Luis', lastName: 'Torres', email: 'luis.torres@colegio.edu', phone: '999888999', specialization: 'Computación', status: 'active' },
  { id: 'teacher-9', firstName: 'Carmen', lastName: 'Ruiz', email: 'carmen.ruiz@colegio.edu', phone: '999999000', specialization: 'Física', status: 'active' },
  { id: 'teacher-10', firstName: 'Miguel', lastName: 'Herrera', email: 'miguel.herrera@colegio.edu', phone: '999000111', specialization: 'Química', status: 'active' },
  { id: 'teacher-11', firstName: 'Elena', lastName: 'Vargas', email: 'elena.vargas@colegio.edu', phone: '999123456', specialization: 'Inicial', status: 'active' },
  { id: 'teacher-12', firstName: 'Roberto', lastName: 'Mendoza', email: 'roberto.mendoza@colegio.edu', phone: '999234567', specialization: 'Inicial', status: 'active' },
]

// Estudiantes
const firstNames = ['Alejandro', 'Valeria', 'Sebastián', 'Camila', 'Mateo', 'Isabella', 'Lucas', 'Sofía', 'Daniel', 'Emma', 'Diego', 'Mía', 'Nicolás', 'Victoria', 'Samuel']
const lastNames = ['González', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'García', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz']

export const students: Student[] = []
let studentId = 1
classrooms.forEach((classroom, classroomIdx) => {
  const numStudents = 8 + Math.floor(Math.random() * 5) // 8-12 estudiantes por aula
  for (let i = 0; i < numStudents; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    students.push({
      id: `student-${studentId}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentId}@estudiante.edu`,
      enrollmentCode: `EST-2024-${String(studentId).padStart(4, '0')}`,
      dateOfBirth: `${2010 + Math.floor(Math.random() * 8)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      classroomId: classroom.id,
      classroom,
      status: 'active',
    })
    studentId++
  }
})

// Padres
export const parents: Parent[] = []
students.forEach((student, idx) => {
  if (idx % 2 === 0) { // Un padre cada 2 estudiantes
    const lastName = student.lastName
    parents.push({
      id: `parent-${parents.length + 1}`,
      firstName: Math.random() > 0.5 ? 'Roberto' : 'María',
      lastName,
      email: `padre.${lastName.toLowerCase()}${parents.length + 1}@email.com`,
      phone: `998${String(100000 + Math.floor(Math.random() * 900000))}`,
      relationship: Math.random() > 0.5 ? 'Padre' : 'Madre',
      studentIds: [student.id, students[idx + 1]?.id].filter(Boolean),
      status: 'active',
    })
  }
})

// Cursos (Subject + Classroom + Teacher)
export const courses: Course[] = []
let courseId = 1
const primarySubjects = subjects.filter(s => !s.gradeLevelId || s.gradeLevelId === 'grade-1')
const generalSubjects = subjects.filter(s => !s.gradeLevelId)

classrooms.forEach((classroom) => {
  const levelName = classroom.section.gradeLevel.level.name
  const subjectsForLevel = levelName === 'Inicial'
    ? subjects.filter(s => s.gradeLevelId?.startsWith('grade-1') || s.gradeLevelId?.startsWith('grade-2') || s.gradeLevelId?.startsWith('grade-3'))
    : generalSubjects

  // 4-6 materias por aula
  const selectedSubjects = subjectsForLevel.slice(0, 4 + Math.floor(Math.random() * 3))

  selectedSubjects.forEach((subject) => {
    const availableTeachers = teachers.filter(t =>
      t.specialization === subject.name ||
      (levelName === 'Inicial' && t.specialization === 'Inicial')
    )
    const teacher = availableTeachers.length > 0
      ? availableTeachers[Math.floor(Math.random() * availableTeachers.length)]
      : teachers[Math.floor(Math.random() * teachers.length)]

    courses.push({
      id: `course-${courseId}`,
      subjectId: subject.id,
      subject,
      teacherId: teacher.id,
      teacher,
      classroomId: classroom.id,
      classroom,
      schedules: [],
    })
    courseId++
  })
})

// Horarios
const dayOptions = [1, 2, 3, 4, 5] // Lunes a Viernes
const timeSlots = [
  { start: '08:00', end: '09:30' },
  { start: '09:45', end: '11:15' },
  { start: '11:30', end: '13:00' },
  { start: '14:00', end: '15:30' },
  { start: '15:45', end: '17:15' },
]

export const schedules: Schedule[] = []
let scheduleId = 1
courses.forEach((course) => {
  // 2-3 horarios por curso
  const numSchedules = 2 + Math.floor(Math.random() * 2)
  const usedSlots = new Set<string>()

  for (let i = 0; i < numSchedules; i++) {
    let day = dayOptions[Math.floor(Math.random() * dayOptions.length)]
    let slot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
    let key = `${day}-${slot.start}`

    // Evitar horarios duplicados
    let attempts = 0
    while (usedSlots.has(key) && attempts < 10) {
      day = dayOptions[Math.floor(Math.random() * dayOptions.length)]
      slot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
      key = `${day}-${slot.start}`
      attempts++
    }

    if (!usedSlots.has(key)) {
      usedSlots.add(key)
      const schedule: Schedule = {
        id: `schedule-${scheduleId}`,
        courseId: course.id,
        dayOfWeek: day,
        startTime: slot.start,
        endTime: slot.end,
      }
      schedules.push(schedule)
      course.schedules.push(schedule)
      scheduleId++
    }
  }
})

// Tareas y Exámenes
export const tasks: Task[] = []
const taskTypes: Task['type'][] = ['HOMEWORK', 'EXAM', 'PROJECT', 'QUIZ']
const taskTitles = {
  HOMEWORK: ['Ejercicios de práctica', 'Lectura comprensiva', 'Problemas de aplicación', 'Trabajo de investigación'],
  EXAM: ['Examen Parcial', 'Examen Final', 'Evaluación Mensual', 'Control de lectura'],
  PROJECT: ['Proyecto trimestral', 'Trabajo grupal', 'Exposición', 'Maqueta'],
  QUIZ: ['Quiz rápido', 'Práctica calificada', 'Evaluación sorpresa', 'Test de repaso'],
}

let taskId = 1
courses.slice(0, 50).forEach((course) => { // Tareas para los primeros 50 cursos
  const numTasks = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < numTasks; i++) {
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)]
    const titles = taskTitles[type]
    const title = `${titles[Math.floor(Math.random() * titles.length)]} - ${course.subject.name}`

    // Fecha de entrega: entre hoy y 30 días
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30))

    tasks.push({
      id: `task-${taskId}`,
      title,
      description: `${title} para el curso de ${course.subject.name}`,
      type,
      dueDate: dueDate.toISOString(),
      courseId: course.id,
      course,
      createdAt: new Date().toISOString(),
    })
    taskId++
  }
})

// Matrículas
export const enrollments: Enrollment[] = students.map((student, idx) => ({
  id: `enrollment-${idx + 1}`,
  studentId: student.id,
  classroomId: student.classroomId,
  year: 2024,
  status: 'ACTIVE',
}))

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getLevelName(classroom: Classroom): string {
  return classroom.section.gradeLevel.level.name
}

export function getGradeName(classroom: Classroom): string {
  return classroom.section.gradeLevel.name
}

export function getCourseFullName(course: Course): string {
  return `${course.subject.name} - ${course.classroom.section.gradeLevel.name} ${course.classroom.section.name}`
}

export function getStudentsByClassroom(classroomId: string): Student[] {
  return students.filter(s => s.classroomId === classroomId)
}

export function getCoursesByClassroom(classroomId: string): Course[] {
  return courses.filter(c => c.classroomId === classroomId)
}

export function getCoursesByTeacher(teacherId: string): Course[] {
  return courses.filter(c => c.teacherId === teacherId)
}

export function getTasksByCourse(courseId: string): Task[] {
  return tasks.filter(t => t.courseId === courseId)
}

// ============================================
// ESTADÍSTICAS
// ============================================

export const stats = {
  totalStudents: students.length,
  totalTeachers: teachers.length,
  totalParents: parents.length,
  totalCourses: courses.length,
  totalTasks: tasks.length,
  totalExams: tasks.filter(t => t.type === 'EXAM').length,
  studentsByLevel: {
    Inicial: students.filter(s => s.classroom?.section.gradeLevel.level.name === 'Inicial').length,
    Primaria: students.filter(s => s.classroom?.section.gradeLevel.level.name === 'Primaria').length,
    Secundaria: students.filter(s => s.classroom?.section.gradeLevel.level.name === 'Secundaria').length,
  },
  coursesByLevel: {
    Inicial: courses.filter(c => c.classroom.section.gradeLevel.level.name === 'Inicial').length,
    Primaria: courses.filter(c => c.classroom.section.gradeLevel.level.name === 'Primaria').length,
    Secundaria: courses.filter(c => c.classroom.section.gradeLevel.level.name === 'Secundaria').length,
  },
}

// ============================================
// USUARIOS MOCK PARA AUTENTICACIÓN
// ============================================

export interface MockUser {
  id: string
  email: string
  password: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
  firstName: string
  lastName: string
  relatedId?: string
}

export const mockUsers: MockUser[] = [
  { id: 'user-1', email: 'admin@school.com', password: 'Admin123!', role: 'ADMIN', firstName: 'Admin', lastName: 'Sistema' },
  { id: 'user-2', email: 'teacher@school.com', password: 'Admin123!', role: 'TEACHER', firstName: 'María', lastName: 'García', relatedId: 'teacher-1' },
  { id: 'user-3', email: 'student@school.com', password: 'Admin123!', role: 'STUDENT', firstName: 'Alejandro', lastName: 'González', relatedId: 'student-1' },
  { id: 'user-4', email: 'parent@school.com', password: 'Admin123!', role: 'PARENT', firstName: 'Roberto', lastName: 'González', relatedId: 'parent-1' },
]

// Función para autenticar usuario
export function authenticateUser(email: string, password: string): MockUser | null {
  const user = mockUsers.find(u => u.email === email && u.password === password)
  return user || null
}

console.log('📊 Datos estáticos cargados:')
console.log(`   - ${students.length} estudiantes`)
console.log(`   - ${teachers.length} profesores`)
console.log(`   - ${parents.length} padres`)
console.log(`   - ${courses.length} cursos`)
console.log(`   - ${tasks.length} tareas/exámenes`)
