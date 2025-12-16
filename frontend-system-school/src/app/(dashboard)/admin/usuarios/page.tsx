'use client'

import { useState, useMemo } from 'react'
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
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  students as mockStudents,
  teachers as mockTeachers,
  parents as mockParents,
  sections,
  subjects,
  generateId
} from '@/lib/mock-data'

interface UserDisplay {
  id: string
  name: string
  email: string
  phone: string
  role: string
  gradeSection?: string
  subjects?: string[]
  children?: string
  status: 'active' | 'inactive'
  avatar: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Estudiante',
    gradeSection: '',
    subjects: [] as string[],
    dateOfBirth: '',
    gender: '',
    enrollmentCode: '',
    relationship: '',
    department: ''
  })

  // Transformar datos estaticos a formato de usuario
  const users = useMemo<UserDisplay[]>(() => {
    const studentUsers: UserDisplay[] = mockStudents.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      phone: '',
      role: 'Estudiante',
      gradeSection: s.classroom ? `${s.classroom.section.gradeLevel.name} ${s.classroom.section.name}` : '',
      status: s.status,
      avatar: `${s.firstName[0]}${s.lastName[0]}`.toUpperCase(),
    }))

    const teacherUsers: UserDisplay[] = mockTeachers.map(t => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      phone: t.phone,
      role: 'Profesor',
      subjects: [t.specialization],
      status: t.status,
      avatar: `${t.firstName[0]}${t.lastName[0]}`.toUpperCase(),
    }))

    const parentUsers: UserDisplay[] = mockParents.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      phone: p.phone,
      role: 'Padre',
      children: `${p.studentIds.length} hijo${p.studentIds.length !== 1 ? 's' : ''}`,
      status: p.status,
      avatar: `${p.firstName[0]}${p.lastName[0]}`.toUpperCase(),
    }))

    return [...studentUsers, ...teacherUsers, ...parentUsers]
  }, [])

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === 'all' || user.role === selectedRole
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, selectedRole])

  // Estadisticas
  const stats = useMemo(() => {
    const activeCount = users.filter(u => u.status === 'active').length
    const inactiveCount = users.filter(u => u.status === 'inactive').length
    return [
      { label: 'Total Usuarios', value: users.length.toLocaleString(), icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Activos', value: activeCount.toLocaleString(), icon: UserCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Inactivos', value: inactiveCount.toLocaleString(), icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    ]
  }, [users])

  // Opciones disponibles
  const availableGradeSections = sections.map(s => `${s.gradeLevel.name} ${s.name}`)
  const availableSubjects = subjects.map(s => s.name)

  // Generar codigo de matricula
  const generateEnrollmentCode = () => {
    const year = new Date().getFullYear()
    const nextNumber = mockStudents.length + 1
    return `EST-${year}-${String(nextNumber).padStart(4, '0')}`
  }

  const openCreateModal = () => {
    setNewUser(prev => ({
      ...prev,
      enrollmentCode: generateEnrollmentCode()
    }))
    setShowModal(true)
  }

  const toggleSubject = (subject: string) => {
    setNewUser(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const handleCreateUser = () => {
    // En modo estatico, solo mostramos un mensaje
    alert(`Usuario "${newUser.firstName} ${newUser.lastName}" creado (modo estatico - no persistente)`)
    setShowModal(false)
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'Estudiante',
      gradeSection: '',
      subjects: [],
      dateOfBirth: '',
      gender: '',
      enrollmentCode: '',
      relationship: '',
      department: ''
    })
  }

  const getSecondaryInfo = (user: UserDisplay) => {
    if (user.gradeSection) return user.gradeSection
    if (user.children) return user.children
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestion de Usuarios</h1>
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
              {['all', 'Estudiante', 'Profesor', 'Padre'].map((role) => (
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
          <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
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
                        {user.subjects.join(', ')}
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
                      placeholder="Ej: Perez"
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
                    <label className="block text-sm font-medium mb-2">Telefono</label>
                    <Input
                      placeholder="Ej: 999-123-456"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Rol *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="Estudiante">Estudiante</option>
                      <option value="Profesor">Profesor</option>
                      <option value="Padre">Padre de Familia</option>
                    </select>
                  </div>
                </div>

                {/* Student Fields */}
                {newUser.role === 'Estudiante' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
                        <Input
                          type="date"
                          value={newUser.dateOfBirth}
                          onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Genero</label>
                        <select
                          value={newUser.gender}
                          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="">Seleccionar</option>
                          <option value="MALE">Masculino</option>
                          <option value="FEMALE">Femenino</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Codigo de Matricula</label>
                        <Input
                          value={newUser.enrollmentCode}
                          onChange={(e) => setNewUser({ ...newUser, enrollmentCode: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Grado y Seccion</label>
                      <select
                        value={newUser.gradeSection}
                        onChange={(e) => setNewUser({ ...newUser, gradeSection: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="">Seleccionar</option>
                        {availableGradeSections.map(gs => (
                          <option key={gs} value={gs}>{gs}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Teacher Fields */}
                {newUser.role === 'Profesor' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <BookOpen className="h-4 w-4 inline mr-2" />
                      Materias
                    </label>
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
                  </div>
                )}

                {/* Parent Fields */}
                {newUser.role === 'Padre' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Relacion</label>
                    <select
                      value={newUser.relationship}
                      onChange={(e) => setNewUser({ ...newUser, relationship: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Tutor">Tutor Legal</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
