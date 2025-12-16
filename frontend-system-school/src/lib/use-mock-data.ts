'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  students as initialStudents,
  teachers as initialTeachers,
  parents as initialParents,
  courses as initialCourses,
  tasks as initialTasks,
  levels,
  gradeLevels,
  sections,
  classrooms,
  subjects,
  schedules as initialSchedules,
  generateId,
  Student,
  Teacher,
  Parent,
  Course,
  Task,
  Schedule,
  Level,
  GradeLevel,
  Section,
  Classroom,
  Subject,
} from './mock-data'

// ============================================
// HOOK PARA ESTUDIANTES
// ============================================
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('mock-students')
      if (saved) {
        setStudents(JSON.parse(saved))
      } else {
        setStudents(initialStudents)
      }
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const saveStudents = (newStudents: Student[]) => {
    setStudents(newStudents)
    localStorage.setItem('mock-students', JSON.stringify(newStudents))
  }

  const addStudent = useCallback((data: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...data,
      id: generateId(),
      classroom: classrooms.find(c => c.id === data.classroomId),
    }
    const updated = [...students, newStudent]
    saveStudents(updated)
    return newStudent
  }, [students])

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    const updated = students.map(s => s.id === id ? { ...s, ...data } : s)
    saveStudents(updated)
  }, [students])

  const deleteStudent = useCallback((id: string) => {
    const updated = students.filter(s => s.id !== id)
    saveStudents(updated)
  }, [students])

  return { students, loading, addStudent, updateStudent, deleteStudent, setStudents: saveStudents }
}

// ============================================
// HOOK PARA PROFESORES
// ============================================
export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('mock-teachers')
      if (saved) {
        setTeachers(JSON.parse(saved))
      } else {
        setTeachers(initialTeachers)
      }
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const saveTeachers = (newTeachers: Teacher[]) => {
    setTeachers(newTeachers)
    localStorage.setItem('mock-teachers', JSON.stringify(newTeachers))
  }

  const addTeacher = useCallback((data: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = { ...data, id: generateId() }
    const updated = [...teachers, newTeacher]
    saveTeachers(updated)
    return newTeacher
  }, [teachers])

  const updateTeacher = useCallback((id: string, data: Partial<Teacher>) => {
    const updated = teachers.map(t => t.id === id ? { ...t, ...data } : t)
    saveTeachers(updated)
  }, [teachers])

  const deleteTeacher = useCallback((id: string) => {
    const updated = teachers.filter(t => t.id !== id)
    saveTeachers(updated)
  }, [teachers])

  return { teachers, loading, addTeacher, updateTeacher, deleteTeacher, setTeachers: saveTeachers }
}

// ============================================
// HOOK PARA PADRES
// ============================================
export function useParents() {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('mock-parents')
      if (saved) {
        setParents(JSON.parse(saved))
      } else {
        setParents(initialParents)
      }
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const saveParents = (newParents: Parent[]) => {
    setParents(newParents)
    localStorage.setItem('mock-parents', JSON.stringify(newParents))
  }

  const addParent = useCallback((data: Omit<Parent, 'id'>) => {
    const newParent: Parent = { ...data, id: generateId() }
    const updated = [...parents, newParent]
    saveParents(updated)
    return newParent
  }, [parents])

  const updateParent = useCallback((id: string, data: Partial<Parent>) => {
    const updated = parents.map(p => p.id === id ? { ...p, ...data } : p)
    saveParents(updated)
  }, [parents])

  const deleteParent = useCallback((id: string) => {
    const updated = parents.filter(p => p.id !== id)
    saveParents(updated)
  }, [parents])

  return { parents, loading, addParent, updateParent, deleteParent, setParents: saveParents }
}

// ============================================
// HOOK PARA CURSOS
// ============================================
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('mock-courses')
      if (saved) {
        setCourses(JSON.parse(saved))
      } else {
        setCourses(initialCourses)
      }
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const saveCourses = (newCourses: Course[]) => {
    setCourses(newCourses)
    localStorage.setItem('mock-courses', JSON.stringify(newCourses))
  }

  const addCourse = useCallback((data: { subjectId: string, classroomId: string, teacherId?: string }) => {
    const subject = subjects.find(s => s.id === data.subjectId)!
    const classroom = classrooms.find(c => c.id === data.classroomId)!
    const teacher = data.teacherId ? initialTeachers.find(t => t.id === data.teacherId) || null : null

    const newCourse: Course = {
      id: generateId(),
      subjectId: data.subjectId,
      subject,
      teacherId: data.teacherId || null,
      teacher,
      classroomId: data.classroomId,
      classroom,
      schedules: [],
    }
    const updated = [...courses, newCourse]
    saveCourses(updated)
    return newCourse
  }, [courses])

  const updateCourse = useCallback((id: string, data: Partial<Course>) => {
    const updated = courses.map(c => {
      if (c.id === id) {
        const updatedCourse = { ...c, ...data }
        if (data.teacherId !== undefined) {
          updatedCourse.teacher = data.teacherId ? initialTeachers.find(t => t.id === data.teacherId) || null : null
        }
        return updatedCourse
      }
      return c
    })
    saveCourses(updated)
  }, [courses])

  const deleteCourse = useCallback((id: string) => {
    const updated = courses.filter(c => c.id !== id)
    saveCourses(updated)
  }, [courses])

  const addSchedule = useCallback((courseId: string, scheduleData: { dayOfWeek: number, startTime: string, endTime: string }) => {
    const newSchedule: Schedule = {
      id: generateId(),
      courseId,
      ...scheduleData,
    }
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, schedules: [...c.schedules, newSchedule] }
      }
      return c
    })
    saveCourses(updated)
    return newSchedule
  }, [courses])

  const deleteSchedule = useCallback((courseId: string, scheduleId: string) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, schedules: c.schedules.filter(s => s.id !== scheduleId) }
      }
      return c
    })
    saveCourses(updated)
  }, [courses])

  return { courses, loading, addCourse, updateCourse, deleteCourse, addSchedule, deleteSchedule, setCourses: saveCourses }
}

// ============================================
// HOOK PARA TAREAS/EXÁMENES
// ============================================
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('mock-tasks')
      if (saved) {
        setTasks(JSON.parse(saved))
      } else {
        setTasks(initialTasks)
      }
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    localStorage.setItem('mock-tasks', JSON.stringify(newTasks))
  }

  const addTask = useCallback((data: { title: string, description: string, type: Task['type'], dueDate: string, courseId: string }) => {
    const course = initialCourses.find(c => c.id === data.courseId)!
    const newTask: Task = {
      id: generateId(),
      title: data.title,
      description: data.description,
      type: data.type,
      dueDate: data.dueDate,
      courseId: data.courseId,
      course,
      createdAt: new Date().toISOString(),
    }
    const updated = [...tasks, newTask]
    saveTasks(updated)
    return newTask
  }, [tasks])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...data } : t)
    saveTasks(updated)
  }, [tasks])

  const deleteTask = useCallback((id: string) => {
    const updated = tasks.filter(t => t.id !== id)
    saveTasks(updated)
  }, [tasks])

  // Filtrar solo exámenes
  const exams = tasks.filter(t => t.type === 'EXAM')

  // Filtrar solo tareas (no exámenes)
  const homework = tasks.filter(t => t.type !== 'EXAM')

  return { tasks, exams, homework, loading, addTask, updateTask, deleteTask, setTasks: saveTasks }
}

// ============================================
// HOOK PARA DATOS ESTÁTICOS (solo lectura)
// ============================================
export function useStaticData() {
  return {
    levels,
    gradeLevels,
    sections,
    classrooms,
    subjects,
    // Helpers
    getLevelById: (id: string) => levels.find(l => l.id === id),
    getGradeLevelById: (id: string) => gradeLevels.find(g => g.id === id),
    getSectionById: (id: string) => sections.find(s => s.id === id),
    getClassroomById: (id: string) => classrooms.find(c => c.id === id),
    getSubjectById: (id: string) => subjects.find(s => s.id === id),
    // Filters
    getGradeLevelsByLevel: (levelId: string) => gradeLevels.filter(g => g.levelId === levelId),
    getSectionsByGradeLevel: (gradeLevelId: string) => sections.filter(s => s.gradeLevelId === gradeLevelId),
    getClassroomsBySection: (sectionId: string) => classrooms.filter(c => c.sectionId === sectionId),
    getClassroomsByLevel: (levelName: string) => classrooms.filter(c => c.section.gradeLevel.level.name === levelName),
  }
}

// ============================================
// HOOK COMBINADO PARA TODOS LOS USUARIOS
// ============================================
export function useAllUsers() {
  const { students, loading: loadingStudents, addStudent, updateStudent, deleteStudent } = useStudents()
  const { teachers, loading: loadingTeachers, addTeacher, updateTeacher, deleteTeacher } = useTeachers()
  const { parents, loading: loadingParents, addParent, updateParent, deleteParent } = useParents()

  const loading = loadingStudents || loadingTeachers || loadingParents

  // Combinar todos los usuarios en un formato común
  const allUsers = [
    ...students.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      phone: '',
      role: 'Estudiante' as const,
      gradeSection: s.classroom ? `${s.classroom.section.gradeLevel.name} ${s.classroom.section.name}` : '',
      status: s.status,
      avatar: `${s.firstName[0]}${s.lastName[0]}`.toUpperCase(),
      originalData: s,
    })),
    ...teachers.map(t => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      phone: t.phone,
      role: 'Profesor' as const,
      subjects: [t.specialization],
      status: t.status,
      avatar: `${t.firstName[0]}${t.lastName[0]}`.toUpperCase(),
      originalData: t,
    })),
    ...parents.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      phone: p.phone,
      role: 'Padre' as const,
      children: `${p.studentIds.length} hijo${p.studentIds.length !== 1 ? 's' : ''}`,
      status: p.status,
      avatar: `${p.firstName[0]}${p.lastName[0]}`.toUpperCase(),
      originalData: p,
    })),
  ]

  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 'active').length,
    inactive: allUsers.filter(u => u.status === 'inactive').length,
    students: students.length,
    teachers: teachers.length,
    parents: parents.length,
  }

  return {
    allUsers,
    students,
    teachers,
    parents,
    loading,
    stats,
    // CRUD
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addParent,
    updateParent,
    deleteParent,
  }
}

// ============================================
// RESET DE DATOS
// ============================================
export function resetAllData() {
  localStorage.removeItem('mock-students')
  localStorage.removeItem('mock-teachers')
  localStorage.removeItem('mock-parents')
  localStorage.removeItem('mock-courses')
  localStorage.removeItem('mock-tasks')
  window.location.reload()
}
