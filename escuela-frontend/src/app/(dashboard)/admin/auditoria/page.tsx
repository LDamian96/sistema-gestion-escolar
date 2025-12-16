'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Search,
  User,
  Calendar,
  Clock,
  Activity,
  Filter,
  Download,
  Eye,
  TrendingUp,
  CalendarDays,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { auditService, type AuditLog } from '@/services/mock-data'

type ActionFilter = 'Todos' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW'
type ModuleFilter = 'Todos' | 'Auth' | 'Estudiantes' | 'Profesores' | 'Tareas' | 'Exámenes' | 'Pagos' | 'Usuarios'

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<ActionFilter>('Todos')
  const [selectedModule, setSelectedModule] = useState<ModuleFilter>('Todos')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      const data = await auditService.getAll()
      setLogs(data)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrado de logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filtro de búsqueda por usuario
      const matchesSearch = searchTerm === '' ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por acción
      const matchesAction = selectedAction === 'Todos' || log.action === selectedAction

      // Filtro por módulo
      const matchesModule = selectedModule === 'Todos' || log.module === selectedModule

      // Filtro por rango de fechas
      let matchesDateRange = true
      if (startDate || endDate) {
        const logDate = new Date(log.timestamp)
        if (startDate) {
          const start = new Date(startDate)
          start.setHours(0, 0, 0, 0)
          matchesDateRange = matchesDateRange && logDate >= start
        }
        if (endDate) {
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          matchesDateRange = matchesDateRange && logDate <= end
        }
      }

      return matchesSearch && matchesAction && matchesModule && matchesDateRange
    })
  }, [logs, searchTerm, selectedAction, selectedModule, startDate, endDate])

  // Estadísticas
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayLogs = logs.filter(log => new Date(log.timestamp) >= today)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)
    const weekLogs = logs.filter(log => new Date(log.timestamp) >= weekAgo)

    return {
      total: logs.length,
      today: todayLogs.length,
      week: weekLogs.length
    }
  }, [logs])

  // Función para obtener color del badge según acción
  const getActionColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
      case 'UPDATE':
        return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
      case 'DELETE':
        return 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
      case 'LOGIN':
        return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'
      case 'LOGOUT':
        return 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
      case 'VIEW':
        return 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
    }
  }

  // Función para formatear fecha y hora
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  }

  // Función para exportar datos
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `auditoria_${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedAction('Todos')
    setSelectedModule('Todos')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = searchTerm !== '' || selectedAction !== 'Todos' ||
    selectedModule !== 'Todos' || startDate !== '' || endDate !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Auditoría del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Registro completo de actividades y cambios
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Datos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '-' : stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Acciones</p>
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
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '-' : stats.today}</p>
                  <p className="text-xs text-muted-foreground">Hoy</p>
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
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '-' : stats.week}</p>
                  <p className="text-xs text-muted-foreground">Esta Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o descripción..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros de acción */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Acción</label>
              <div className="flex gap-2 flex-wrap">
                {(['Todos', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'] as ActionFilter[]).map((action) => (
                  <Button
                    key={action}
                    variant={selectedAction === action ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAction(action)}
                  >
                    {action === 'Todos' ? 'Todos' : action}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros de módulo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Módulo</label>
              <div className="flex gap-2 flex-wrap">
                {(['Todos', 'Auth', 'Estudiantes', 'Profesores', 'Tareas', 'Exámenes', 'Pagos', 'Usuarios'] as ModuleFilter[]).map((module) => (
                  <Button
                    key={module}
                    variant={selectedModule === module ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedModule(module)}
                  >
                    {module}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros de fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registro de Auditoría
            </div>
            <Badge variant="outline" className="font-normal">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'registro' : 'registros'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No se encontraron registros de auditoría</p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
                const { date, time } = formatDateTime(log.timestamp)
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Badge className={`${getActionColor(log.action)} border-0`}>
                      {log.action}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{log.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.userName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.module}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </span>
                        <span className="text-xs opacity-70">
                          IP: {log.ipAddress}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLog(log)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detalles del Registro de Auditoría
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {/* Acción y Módulo */}
              <div className="flex items-center gap-3">
                <Badge className={`${getActionColor(selectedLog.action)} border-0`}>
                  {selectedLog.action}
                </Badge>
                <Badge variant="outline">
                  {selectedLog.module}
                </Badge>
              </div>

              {/* Descripción */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedLog.description}</p>
              </div>

              {/* Información del Usuario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usuario</label>
                  <p className="mt-1 font-medium">{selectedLog.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rol</label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedLog.userRole}</Badge>
                  </p>
                </div>
              </div>

              {/* Información de Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha
                  </label>
                  <p className="mt-1 font-medium">{formatDateTime(selectedLog.timestamp).date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hora
                  </label>
                  <p className="mt-1 font-medium">{formatDateTime(selectedLog.timestamp).time}</p>
                </div>
              </div>

              {/* Dirección IP */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección IP</label>
                <p className="mt-1 font-mono text-sm bg-muted/50 px-3 py-2 rounded">
                  {selectedLog.ipAddress}
                </p>
              </div>

              {/* ID del Usuario */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID de Usuario</label>
                <p className="mt-1 font-mono text-sm bg-muted/50 px-3 py-2 rounded">
                  {selectedLog.userId}
                </p>
              </div>

              {/* Detalles Adicionales */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Detalles Adicionales
                  </label>
                  <div className="p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-auto max-h-60">
                    <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Timestamp completo */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {selectedLog.timestamp}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
