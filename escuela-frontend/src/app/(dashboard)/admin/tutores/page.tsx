'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Mail,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  GraduationCap,
  UserCheck,
  UserX,
  MapPin,
  Briefcase,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { parentsService, type Parent, type Status } from '@/services/mock-data'

// Toast notification component
type ToastType = 'success' | 'error'

interface ToastProps {
  type: ToastType
  message: string
  onClose: () => void
}

function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className="fixed top-4 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-background border"
    >
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null

export default function TutoresPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    occupation: '',
    childrenIds: [] as string[],
    childrenNames: [] as string[],
    status: 'active' as Status
  })
  // Para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)

  // Load parents data
  useEffect(() => {
    loadParents()
  }, [])

  const loadParents = async () => {
    try {
      setLoading(true)
      const data = await parentsService.getAll()
      setParents(data)
    } catch (error) {
      showToast('error', 'Error al cargar los tutores')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message })
  }

  const filteredParents = useMemo(() => {
    return parents.filter(parent =>
      `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm)
    )
  }, [parents, searchTerm])

  const stats = [
    {
      label: 'Total Padres de Familia',
      value: parents.length,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Activos',
      value: parents.filter(p => p.status === 'active').length,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Inactivos',
      value: parents.filter(p => p.status === 'inactive').length,
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
  ]

  const openModal = (mode: ModalMode, parent?: Parent) => {
    setModalMode(mode)
    if (parent) {
      setSelectedParent(parent)
      if (mode === 'edit') {
        setFormData({
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          phone: parent.phone,
          password: (parent as any).password || '',
          address: parent.address,
          occupation: parent.occupation,
          childrenIds: parent.childrenIds,
          childrenNames: parent.childrenNames,
          status: parent.status
        })
        setShowPassword(false)
      }
    } else {
      setSelectedParent(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        occupation: '',
        childrenIds: [],
        childrenNames: [],
        status: 'active'
      })
      setShowPassword(false)
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedParent(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      address: '',
      occupation: '',
      childrenIds: [],
      childrenNames: [],
      status: 'active'
    })
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.password) {
      showToast('error', 'La contraseña es requerida')
      return
    }

    try {
      if (modalMode === 'create') {
        await parentsService.create(formData)
        showToast('success', 'Padre de familia creado exitosamente')
      } else if (modalMode === 'edit' && selectedParent) {
        await parentsService.update(selectedParent.id, formData)
        showToast('success', 'Padre de familia actualizado exitosamente')
      }
      await loadParents()
      closeModal()
    } catch (error) {
      showToast('error', `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} el padre de familia`)
    }
  }

  const handleDelete = async () => {
    if (!selectedParent) return

    try {
      await parentsService.delete(selectedParent.id)
      showToast('success', 'Padre de familia eliminado exitosamente')
      await loadParents()
      closeModal()
    } catch (error) {
      showToast('error', 'Error al eliminar el padre de familia')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Padres de Familia</h1>
          <p className="text-muted-foreground mt-1">Administra los padres y apoderados</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Padre de Familia
        </Button>
      </div>

      {/* Stats cards */}
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar padres de familia..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Parents list */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Padres de Familia ({filteredParents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredParents.map((parent, index) => (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {parent.firstName[0]}{parent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{parent.firstName} {parent.lastName}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      parent.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                    }`}>
                      {parent.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {parent.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {parent.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {parent.occupation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <GraduationCap className="h-3 w-3" />
                    <span>Hijos: {parent.childrenNames.length > 0 ? parent.childrenNames.join(', ') : 'Sin asignar'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openModal('view', parent)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openModal('edit', parent)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => openModal('delete', parent)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Nuevo Padre de Familia' : 'Editar Padre de Familia'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombres *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  placeholder="Ingrese nombres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  placeholder="Ingrese apellidos"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="999-999-999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Contraseña del tutor"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                El tutor usará esta contraseña para iniciar sesión
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                placeholder="Ingrese dirección completa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Ocupación *</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                required
                placeholder="Ingrese ocupación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {modalMode === 'create' ? 'Crear' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Padre de Familia</DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedParent.firstName[0]}{selectedParent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedParent.firstName} {selectedParent.lastName}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedParent.status === 'active'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-red-500/20 text-red-600'
                  }`}>
                    {selectedParent.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Electrónico
                  </p>
                  <p className="font-medium">{selectedParent.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </p>
                  <p className="font-medium">{selectedParent.phone}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección
                </p>
                <p className="font-medium">{selectedParent.address}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Ocupación
                </p>
                <p className="font-medium">{selectedParent.occupation}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Hijos
                </p>
                {selectedParent.childrenNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedParent.childrenNames.map((child, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {child}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sin hijos asignados</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={closeModal}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modalMode === 'delete'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Padre de Familia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              ¿Está seguro que desea eliminar a{' '}
              <span className="font-semibold text-foreground">
                {selectedParent?.firstName} {selectedParent?.lastName}
              </span>
              ?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
