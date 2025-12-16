'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  GraduationCap,
  BookOpen,
  UserCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { notificationsService, type Notification, type UserRole } from '@/services/mock-data'

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTarget, setSelectedTarget] = useState<string>('all')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    targetRole: 'ALL' as UserRole | 'ALL'
  })

  const { toast } = useToast()

  // Cargar notificaciones
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getAll()
      setNotifications(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las notificaciones',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || notif.type === selectedType
      const matchesTarget = selectedTarget === 'all' || notif.targetRole === selectedTarget
      return matchesSearch && matchesType && matchesTarget
    })
  }, [notifications, searchTerm, selectedType, selectedTarget])

  // Estadísticas
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const byType = {
      info: notifications.filter(n => n.type === 'info').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      success: notifications.filter(n => n.type === 'success').length,
      error: notifications.filter(n => n.type === 'error').length,
    }

    return [
      { label: 'Total', value: total, icon: Bell, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Sin Leer', value: unread, icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      { label: 'Información', value: byType.info, icon: Info, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
      { label: 'Advertencias', value: byType.warning, icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
      { label: 'Éxito', value: byType.success, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Errores', value: byType.error, icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    ]
  }, [notifications])

  // Obtener color según tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
      case 'success': return 'bg-green-500/20 text-green-600 border-green-500/30'
      case 'error': return 'bg-red-500/20 text-red-600 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30'
    }
  }

  // Obtener ícono según tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return Info
      case 'warning': return AlertTriangle
      case 'success': return CheckCircle
      case 'error': return AlertCircle
      default: return Bell
    }
  }

  // Obtener texto en español según tipo
  const getTypeText = (type: string) => {
    switch (type) {
      case 'info': return 'Información'
      case 'warning': return 'Advertencia'
      case 'success': return 'Éxito'
      case 'error': return 'Error'
      default: return type
    }
  }

  // Obtener texto del rol objetivo
  const getTargetRoleText = (role?: UserRole | 'ALL') => {
    switch (role) {
      case 'ALL': return 'Todos'
      case 'STUDENT': return 'Estudiantes'
      case 'TEACHER': return 'Profesores'
      case 'PARENT': return 'Padres'
      case 'ADMIN': return 'Administradores'
      default: return 'Todos'
    }
  }

  // Obtener ícono del rol objetivo
  const getTargetRoleIcon = (role?: UserRole | 'ALL') => {
    switch (role) {
      case 'STUDENT': return GraduationCap
      case 'TEACHER': return BookOpen
      case 'PARENT': return UserCircle
      case 'ADMIN': return Users
      default: return Users
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      targetRole: 'ALL'
    })
  }

  // Abrir modal de crear
  const handleOpenCreate = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Abrir modal de editar
  const handleOpenEdit = (notification: Notification) => {
    setSelectedNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      targetRole: notification.targetRole || 'ALL'
    })
    setIsEditModalOpen(true)
  }

  // Abrir diálogo de eliminar
  const handleOpenDelete = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDeleteDialogOpen(true)
  }

  // Crear notificación
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsSaving(true)
      await notificationsService.create({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetRole: formData.targetRole
      })

      toast({
        title: 'Notificación creada',
        description: `Se ha enviado la notificación a ${getTargetRoleText(formData.targetRole)}`,
      })

      setIsCreateModalOpen(false)
      resetForm()
      await loadNotifications()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la notificación',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Actualizar notificación
  const handleUpdate = async () => {
    if (!selectedNotification) return

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsSaving(true)

      // Simulamos actualización eliminando y creando nueva
      await notificationsService.delete(selectedNotification.id)
      await notificationsService.create({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetRole: formData.targetRole
      })

      toast({
        title: 'Notificación actualizada',
        description: 'Los cambios se han guardado correctamente',
      })

      setIsEditModalOpen(false)
      setSelectedNotification(null)
      resetForm()
      await loadNotifications()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la notificación',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Eliminar notificación
  const handleDelete = async () => {
    if (!selectedNotification) return

    try {
      await notificationsService.delete(selectedNotification.id)

      toast({
        title: 'Notificación eliminada',
        description: 'La notificación ha sido eliminada',
      })

      setIsDeleteDialogOpen(false)
      setSelectedNotification(null)
      await loadNotifications()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la notificación',
        variant: 'destructive'
      })
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">Gestiona las comunicaciones del sistema</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Notificación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificaciones..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Tipo:</span>
              {['all', 'info', 'warning', 'success', 'error'].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type === 'all' ? 'Todas' : getTypeText(type)}
                </Button>
              ))}
            </div>

            {/* Target Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Destinatario:</span>
              {['all', 'ALL', 'STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].map((target) => (
                <Button
                  key={target}
                  variant={selectedTarget === target ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTarget(target)}
                >
                  {target === 'all' ? 'Todos' : getTargetRoleText(target as UserRole | 'ALL')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notificaciones ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron notificaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notif, index) => {
                const TypeIcon = getTypeIcon(notif.type)
                const TargetIcon = getTargetRoleIcon(notif.targetRole)

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-xl border hover:border-primary/50 transition-colors ${
                      !notif.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{notif.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full border flex items-center gap-1 ${getTypeColor(notif.type)}`}>
                            <TypeIcon className="h-3 w-3" />
                            {getTypeText(notif.type)}
                          </span>
                          {!notif.read && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-600 border border-blue-500/30">
                              Nueva
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TargetIcon className="h-3 w-3" />
                            {getTargetRoleText(notif.targetRole)}
                          </span>
                          <span>{formatDate(notif.createdAt)}</span>
                          {notif.read && notif.readAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Leída
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(notif)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleOpenDelete(notif)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedNotification(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Nueva Notificación' : 'Editar Notificación'}
            </DialogTitle>
            <DialogDescription>
              {isCreateModalOpen
                ? 'Envía una nueva notificación a los usuarios del sistema'
                : 'Modifica los datos de la notificación'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ingrese el título de la notificación"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Ingrese el mensaje de la notificación"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Notification['type'] })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-cyan-500" />
                      Información
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Advertencia
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Éxito
                    </div>
                  </SelectItem>
                  <SelectItem value="error">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Error
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <Label htmlFor="targetRole">Destinatarios</Label>
              <Select
                value={formData.targetRole}
                onValueChange={(value) => setFormData({ ...formData, targetRole: value as UserRole | 'ALL' })}
              >
                <SelectTrigger id="targetRole">
                  <SelectValue placeholder="Seleccione los destinatarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value="STUDENT">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Estudiantes
                    </div>
                  </SelectItem>
                  <SelectItem value="TEACHER">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Profesores
                    </div>
                  </SelectItem>
                  <SelectItem value="PARENT">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      Padres
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Administradores
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedNotification(null)
                resetForm()
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={isCreateModalOpen ? handleCreate : handleUpdate}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isCreateModalOpen ? 'Enviar Notificación' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La notificación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
