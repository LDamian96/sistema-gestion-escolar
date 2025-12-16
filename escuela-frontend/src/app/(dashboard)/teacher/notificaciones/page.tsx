'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Check,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { notificationsService, type Notification } from '@/services/mock-data'

export default function TeacherNotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const { toast } = useToast()

  // Cargar notificaciones para TEACHER
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // Obtener notificaciones dirigidas a profesores o a todos
      const data = await notificationsService.getByRole('TEACHER')
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

  // Marcar como leída
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      )
      toast({
        title: 'Notificación marcada como leída',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo marcar la notificación',
        variant: 'destructive'
      })
    }
  }

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      for (const id of unreadIds) {
        await notificationsService.markAsRead(id)
      }
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      )
      toast({
        title: 'Todas las notificaciones marcadas como leídas',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron marcar las notificaciones',
        variant: 'destructive'
      })
    }
  }

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || notif.type === selectedType
      const matchesUnread = !showOnlyUnread || !notif.read
      return matchesSearch && matchesType && matchesUnread
    })
  }, [notifications, searchTerm, selectedType, showOnlyUnread])

  // Estadísticas
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    return { total, unread }
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
          <h1 className="font-heading text-3xl font-bold">Mis Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            Tienes {stats.unread} notificación{stats.unread !== 1 ? 'es' : ''} sin leer
          </p>
        </div>
        {stats.unread > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unread}</p>
                  <p className="text-xs text-muted-foreground">Sin Leer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10">
                  <Info className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'info').length}</p>
                  <p className="text-xs text-muted-foreground">Informativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'warning').length}</p>
                  <p className="text-xs text-muted-foreground">Advertencias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
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

            {/* Unread Filter */}
            <Button
              variant={showOnlyUnread ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Solo sin leer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notif, index) => {
                const TypeIcon = getTypeIcon(notif.type)

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-xl border hover:border-primary/50 transition-colors ${
                      !notif.read ? 'bg-primary/5 border-primary/20' : ''
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
                          <span>{formatDate(notif.createdAt)}</span>
                          {notif.read && notif.readAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Leída
                            </span>
                          )}
                        </div>
                      </div>
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Marcar leída
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
