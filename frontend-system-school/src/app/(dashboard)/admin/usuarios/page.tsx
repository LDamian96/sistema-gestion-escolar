'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Mail,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  X,
  Save,
  GraduationCap,
  BookOpen,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api, ApiError } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  gradeSection?: string
  gradeSections?: string[]
  subjects?: string[]
  department?: string
  children?: string
  status: 'active' | 'inactive'
  avatar: string
}

interface StatsData {
  label: string
  value: string
  icon: typeof Users
  color: string
  bgColor: string
}

// Interfaces para respuestas de API
interface StudentResponse {
  id: string
  firstName: string
  lastName: string
  enrollmentCode: string
  user?: { email: string; isActive: boolean }
  section?: { name: string; gradeLevel?: { name: string } }
}

interface TeacherResponse {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  specialization: string
  user?: { email: string; isActive: boolean }
}

interface ParentResponse {
  id: string
  firstName: string
  lastName: string
  phone: string
  user?: { email: string; isActive: boolean }
  students?: Array<{ id: string }>
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface NewUser {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  role: string
  gradeSection: string
  gradeSections: string[]
  subjects: string[]
  department: string
  // Student specific fields
  dateOfBirth: string
  gender: string
  enrollmentCode: string
  // Parent specific fields
  relationship: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData[]>([
    { label: 'Total Usuarios', value: '0', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Activos', value: '0', icon: UserCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Inactivos', value: '0', icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [availableGradeSections, setAvailableGradeSections] = useState<string[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'Estudiante',
    gradeSection: '',
    gradeSections: [],
    subjects: [],
    department: '',
    dateOfBirth: '',
    gender: '',
    enrollmentCode: '',
    relationship: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [studentsRes, teachersRes, parentsRes, sectionsRes, subjectsRes] = await Promise.all([
        api.get<PaginatedResponse<StudentResponse>>('/students?limit=100'),
        api.get<TeacherResponse[]>('/teachers'),
        api.get<PaginatedResponse<ParentResponse>>('/parents?limit=100'),
        api.get<Array<{ id: string; name: string; gradeLevel: { name: string } }>>('/sections'),
        api.get<Array<{ id: string; name: string }>>('/subjects'),
      ])

      // Transform students
      const studentUsers: User[] = (studentsRes.data || []).map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.user?.email || '',
        phone: '',
        role: 'Estudiante',
        gradeSection: s.section ? `${s.section.gradeLevel?.name || ''} ${s.section.name}` : '',
        status: s.user?.isActive !== false ? 'active' : 'inactive',
        avatar: `${s.firstName[0]}${s.lastName[0]}`.toUpperCase(),
      }))

      // Transform teachers
      const teacherUsers: User[] = (teachersRes || []).map((t) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.user?.email || '',
        phone: '',
        role: 'Profesor',
        subjects: t.specialization ? [t.specialization] : [],
        status: t.user?.isActive !== false ? 'active' : 'inactive',
        avatar: `${t.firstName[0]}${t.lastName[0]}`.toUpperCase(),
      }))

      // Transform parents
      const parentUsers: User[] = (parentsRes.data || []).map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.user?.email || '',
        phone: p.phone || '',
        role: 'Padre',
        children: p.students ? `${p.students.length} hijo${p.students.length !== 1 ? 's' : ''}` : '',
        status: p.user?.isActive !== false ? 'active' : 'inactive',
        avatar: `${p.firstName[0]}${p.lastName[0]}`.toUpperCase(),
      }))

      const allUsers = [...studentUsers, ...teacherUsers, ...parentUsers]
      setUsers(allUsers)
      setStudentCount(studentUsers.length)

      // Update stats
      const activeCount = allUsers.filter(u => u.status === 'active').length
      const inactiveCount = allUsers.filter(u => u.status === 'inactive').length
      setStats([
        { label: 'Total Usuarios', value: allUsers.length.toLocaleString(), icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { label: 'Activos', value: activeCount.toLocaleString(), icon: UserCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { label: 'Inactivos', value: inactiveCount.toLocaleString(), icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
      ])

      // Set available sections and subjects
      setAvailableGradeSections(sectionsRes.map(s => `${s.gradeLevel.name} ${s.name}`))
      setAvailableSubjects(subjectsRes.map(s => s.name))

      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login')
        return
      }
      setError('Error al cargar los usuarios. Verifica tu sesión.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  // Generar código de matrícula automático
  const generateEnrollmentCode = () => {
    const year = new Date().getFullYear()
    const nextNumber = studentCount + 1
    return `EST-${year}-${String(nextNumber).padStart(4, '0')}`
  }

  // Abrir modal con código generado
  const openCreateModal = () => {
    setNewUser(prev => ({
      ...prev,
      enrollmentCode: generateEnrollmentCode()
    }))
    setShowModal(true)
  }

  const toggleGradeSection = (gs: string) => {
    setNewUser(prev => ({
      ...prev,
      gradeSections: prev.gradeSections.includes(gs)
        ? prev.gradeSections.filter(g => g !== gs)
        : [...prev.gradeSections, gs]
    }))
  }

  const toggleSubject = (subject: string) => {
    setNewUser(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const handleCreateUser = async () => {
    // Validaciones básicas
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.role) {
      setError('Por favor complete todos los campos requeridos')
      return
    }

    // Validaciones específicas por rol
    if (newUser.role === 'Estudiante') {
      if (!newUser.dateOfBirth || !newUser.gender || !newUser.enrollmentCode) {
        setError('Para estudiantes, complete fecha de nacimiento, género y código de matrícula')
        return
      }
    }

    try {
      setCreating(true)
      setError(null)

      if (newUser.role === 'Estudiante') {
        await api.post('/students', {
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          dateOfBirth: newUser.dateOfBirth,
          gender: newUser.gender,
          enrollmentCode: newUser.enrollmentCode,
          phone: newUser.phone || undefined,
        })
      } else if (newUser.role === 'Profesor') {
        await api.post('/teachers', {
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone || undefined,
          specialty: newUser.subjects.length > 0 ? newUser.subjects[0] : undefined,
        })
      } else if (newUser.role === 'Padre') {
        await api.post('/parents', {
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone || undefined,
          relationship: newUser.relationship || undefined,
        })
      } else {
        // Administrativo - por ahora no hay endpoint específico
        setError('La creación de usuarios administrativos no está disponible aún')
        return
      }

      // Refrescar datos y cerrar modal
      await fetchAllData()
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'Estudiante',
        gradeSection: '',
        gradeSections: [],
        subjects: [],
        department: '',
        dateOfBirth: '',
        gender: '',
        enrollmentCode: '',
        relationship: ''
      })
      setShowModal(false)
    } catch (err: any) {
      console.error('Error creating user:', err)
      if (err instanceof ApiError && err.status === 401) {
        setError('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }
      setError(err.message || 'Error al crear el usuario')
    } finally {
      setCreating(false)
    }
  }

  const getSecondaryInfo = (user: User) => {
    if (user.gradeSection) return user.gradeSection
    if (user.gradeSections && user.gradeSections.length > 0) {
      return user.gradeSections.length > 2
        ? `${user.gradeSections.slice(0, 2).join(', ')} +${user.gradeSections.length - 2}`
        : user.gradeSections.join(', ')
    }
    if (user.department) return user.department
    if (user.children) return user.children
    return ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchAllData}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'Estudiante', 'Profesor', 'Padre', 'Administrativo'].map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {role === 'all' ? 'Todos' : role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                variants={itemVariants}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      {user.role}
                    </span>
                    {getSecondaryInfo(user) && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {getSecondaryInfo(user)}
                      </span>
                    )}
                    {user.subjects && user.subjects.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {user.subjects.length > 2
                          ? `${user.subjects.slice(0, 2).join(', ')} +${user.subjects.length - 2}`
                          : user.subjects.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Crear Nuevo Usuario</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre *</label>
                    <Input
                      placeholder="Ej: Juan"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Apellido *</label>
                    <Input
                      placeholder="Ej: Pérez"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      placeholder="Ej: juan@escuela.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contraseña *</label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <Input
                      placeholder="Ej: 999-123-456"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rol *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({
                        ...newUser,
                        role: e.target.value,
                        gradeSection: '',
                        gradeSections: [],
                        subjects: [],
                        department: '',
                        dateOfBirth: '',
                        gender: '',
                        enrollmentCode: '',
                        relationship: ''
                      })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="Estudiante">Estudiante</option>
                      <option value="Profesor">Profesor</option>
                      <option value="Padre">Padre de Familia</option>
                      <option value="Administrativo">Administrativo</option>
                    </select>
                  </div>
                </div>

                {/* Student - Required Fields */}
                {newUser.role === 'Estudiante' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Fecha de Nacimiento *</label>
                        <Input
                          type="date"
                          value={newUser.dateOfBirth}
                          onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Género *</label>
                        <select
                          value={newUser.gender}
                          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="">Seleccionar género</option>
                          <option value="MALE">Masculino</option>
                          <option value="FEMALE">Femenino</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Código de Matrícula *</label>
                        <Input
                          placeholder="Ej: EST-2024-001"
                          value={newUser.enrollmentCode}
                          onChange={(e) => setNewUser({ ...newUser, enrollmentCode: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <GraduationCap className="h-4 w-4 inline mr-2" />
                        Grado y Sección (Opcional)
                      </label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Un estudiante solo puede pertenecer a un grado y sección
                      </p>
                      <select
                        value={newUser.gradeSection}
                        onChange={(e) => setNewUser({ ...newUser, gradeSection: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="">Seleccionar grado y sección</option>
                        {availableGradeSections.map(gs => (
                          <option key={gs} value={gs}>{gs}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Teacher - Multiple Grades/Sections */}
                {newUser.role === 'Profesor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <GraduationCap className="h-4 w-4 inline mr-2" />
                        Grados y Secciones *
                      </label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Un profesor puede pertenecer a múltiples grados y secciones. Haz clic para seleccionar.
                      </p>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 max-h-40 overflow-y-auto">
                        {availableGradeSections.map(gs => (
                          <button
                            key={gs}
                            type="button"
                            onClick={() => toggleGradeSection(gs)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              newUser.gradeSections.includes(gs)
                                ? 'bg-primary text-white border-primary'
                                : 'bg-background hover:bg-muted'
                            }`}
                          >
                            {gs}
                          </button>
                        ))}
                      </div>
                      {newUser.gradeSections.length > 0 && (
                        <p className="text-sm text-primary mt-2">
                          Seleccionados: {newUser.gradeSections.join(', ')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <BookOpen className="h-4 w-4 inline mr-2" />
                        Materias *
                      </label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Selecciona las materias que enseña el profesor
                      </p>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 max-h-40 overflow-y-auto">
                        {availableSubjects.map(subject => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => toggleSubject(subject)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              newUser.subjects.includes(subject)
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-background hover:bg-muted'
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                      {newUser.subjects.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          Seleccionadas: {newUser.subjects.join(', ')}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Parent - Relationship */}
                {newUser.role === 'Padre' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Relación con el estudiante</label>
                    <select
                      value={newUser.relationship}
                      onChange={(e) => setNewUser({ ...newUser, relationship: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Seleccionar relación</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Tutor">Tutor Legal</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Podrás vincular estudiantes después de crear el padre
                    </p>
                  </div>
                )}

                {/* Administrative - Department */}
                {newUser.role === 'Administrativo' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Departamento</label>
                    <select
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option value="Secretaría">Secretaría</option>
                      <option value="Dirección">Dirección</option>
                      <option value="Contabilidad">Contabilidad</option>
                      <option value="Biblioteca">Biblioteca</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={creating}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
