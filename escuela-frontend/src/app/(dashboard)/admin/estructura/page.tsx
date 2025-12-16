'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  ChevronRight,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  X,
  Save,
  Loader2,
  AlertTriangle,
  Eye,
  Clock,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { gradeSectionsService, teachersService, turnosService, GradeSection, Teacher, TurnoConfig, Status, Turno } from '@/services/mock-data'

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null
type TurnoModalMode = 'list' | 'create' | 'edit' | null

export default function EstructuraPage() {
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [turnos, setTurnos] = useState<TurnoConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedLevel, setExpandedLevel] = useState<string | null>('Primaria')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedItem, setSelectedItem] = useState<GradeSection | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    grade: '',
    section: '',
    level: 'Inicial' as 'Inicial' | 'Primaria' | 'Secundaria',
    turno: '' as Turno,
    turnoStartTime: '',
    turnoEndTime: '',
    capacity: 30,
    currentStudents: 0,
    tutorId: '',
    tutorName: '',
    status: 'active' as Status,
  })

  // Estados para modal de turnos
  const [turnoModalMode, setTurnoModalMode] = useState<TurnoModalMode>(null)
  const [selectedTurno, setSelectedTurno] = useState<TurnoConfig | null>(null)
  const [turnoFormData, setTurnoFormData] = useState({
    nombre: '',
    horaInicio: '07:00',
    horaFin: '12:30',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [gsData, teacherData, turnosData] = await Promise.all([
        gradeSectionsService.getAll(),
        teachersService.getAll(),
        turnosService.getAll()
      ])
      setGradeSections(gsData)
      setTeachers(teacherData.filter(t => t.status === 'active'))
      setTurnos(turnosData.filter(t => t.status === 'active'))
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const groupedByLevel = useMemo(() => {
    const grouped: Record<string, Record<string, GradeSection[]>> = {
      Inicial: {},
      Primaria: {},
      Secundaria: {}
    }

    gradeSections.forEach(gs => {
      if (!grouped[gs.level][gs.grade]) {
        grouped[gs.level][gs.grade] = []
      }
      grouped[gs.level][gs.grade].push(gs)
    })

    return grouped
  }, [gradeSections])

  const stats = useMemo(() => {
    const totalStudents = gradeSections.reduce((acc, gs) => acc + gs.currentStudents, 0)
    return [
      { label: 'Niveles', value: 3, icon: Building2, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { label: 'Secciones', value: gradeSections.length, icon: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Estudiantes', value: totalStudents, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ]
  }, [gradeSections])

  const openModal = (mode: ModalMode, item?: GradeSection) => {
    setModalMode(mode)
    if (item) {
      setSelectedItem(item)
      setFormData({
        grade: item.grade,
        section: item.section,
        level: item.level,
        turno: item.turno,
        turnoStartTime: item.turnoStartTime,
        turnoEndTime: item.turnoEndTime,
        capacity: item.capacity,
        currentStudents: item.currentStudents,
        tutorId: item.tutorId || '',
        tutorName: item.tutorName || '',
        status: item.status,
      })
    } else {
      setSelectedItem(null)
      // Usar el primer turno disponible
      const defaultTurno = turnos[0]
      setFormData({
        grade: '',
        section: '',
        level: 'Inicial',
        turno: defaultTurno?.nombre || '',
        turnoStartTime: defaultTurno?.horaInicio || '',
        turnoEndTime: defaultTurno?.horaFin || '',
        capacity: 30,
        currentStudents: 0,
        tutorId: '',
        tutorName: '',
        status: 'active',
      })
    }
  }

  // Handler para seleccionar turno y auto-llenar horas
  const handleTurnoChange = (turnoNombre: string) => {
    const turnoConfig = turnos.find(t => t.nombre === turnoNombre)
    if (turnoConfig) {
      setFormData({
        ...formData,
        turno: turnoNombre,
        turnoStartTime: turnoConfig.horaInicio,
        turnoEndTime: turnoConfig.horaFin,
      })
    }
  }

  // Funciones para gestión de turnos
  const openTurnoModal = (mode: TurnoModalMode, turno?: TurnoConfig) => {
    setTurnoModalMode(mode)
    if (turno && mode === 'edit') {
      setSelectedTurno(turno)
      setTurnoFormData({
        nombre: turno.nombre,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
      })
    } else {
      setSelectedTurno(null)
      setTurnoFormData({
        nombre: '',
        horaInicio: '07:00',
        horaFin: '12:30',
      })
    }
  }

  const closeTurnoModal = () => {
    setTurnoModalMode(null)
    setSelectedTurno(null)
  }

  const handleCreateTurno = async () => {
    if (!turnoFormData.nombre) {
      toast.error('El nombre del turno es requerido')
      return
    }
    if (turnoFormData.horaInicio >= turnoFormData.horaFin) {
      toast.error('La hora de inicio debe ser menor a la hora de fin')
      return
    }
    setIsSaving(true)
    try {
      const newTurno = await turnosService.create({
        ...turnoFormData,
        status: 'active',
      })
      setTurnos(prev => [...prev, newTurno])
      toast.success('Turno creado exitosamente')
      setTurnoModalMode('list')
    } catch (error) {
      toast.error('Error al crear turno')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTurno = async () => {
    if (!selectedTurno) return
    if (turnoFormData.horaInicio >= turnoFormData.horaFin) {
      toast.error('La hora de inicio debe ser menor a la hora de fin')
      return
    }
    setIsSaving(true)
    try {
      const updated = await turnosService.update(selectedTurno.id, turnoFormData)
      setTurnos(prev => prev.map(t => t.id === updated.id ? updated : t))
      toast.success('Turno actualizado exitosamente')
      setTurnoModalMode('list')
    } catch (error) {
      toast.error('Error al actualizar turno')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTurno = async (turno: TurnoConfig) => {
    // Verificar si hay secciones usando este turno
    const seccionesConTurno = gradeSections.filter(gs => gs.turno === turno.nombre)
    if (seccionesConTurno.length > 0) {
      toast.error(`No se puede eliminar. Hay ${seccionesConTurno.length} sección(es) usando este turno.`)
      return
    }
    setIsSaving(true)
    try {
      await turnosService.delete(turno.id)
      setTurnos(prev => prev.filter(t => t.id !== turno.id))
      toast.success('Turno eliminado exitosamente')
    } catch (error) {
      toast.error('Error al eliminar turno')
    } finally {
      setIsSaving(false)
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedItem(null)
  }

  const handleCreate = async () => {
    if (!formData.grade || !formData.section) {
      toast.error('Complete los campos requeridos')
      return
    }
    setIsSaving(true)
    try {
      const teacher = teachers.find(t => t.id === formData.tutorId)
      const newItem = await gradeSectionsService.create({
        ...formData,
        tutorName: teacher ? `${teacher.firstName} ${teacher.lastName}` : ''
      })
      setGradeSections(prev => [...prev, newItem])
      toast.success('Sección creada exitosamente')
      closeModal()
    } catch (error) {
      toast.error('Error al crear sección')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedItem) return
    setIsSaving(true)
    try {
      const teacher = teachers.find(t => t.id === formData.tutorId)
      const updated = await gradeSectionsService.update(selectedItem.id, {
        ...formData,
        tutorName: teacher ? `${teacher.firstName} ${teacher.lastName}` : ''
      })
      setGradeSections(prev => prev.map(gs => gs.id === updated.id ? updated : gs))
      toast.success('Sección actualizada exitosamente')
      closeModal()
    } catch (error) {
      toast.error('Error al actualizar sección')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setIsSaving(true)
    try {
      await gradeSectionsService.delete(selectedItem.id)
      setGradeSections(prev => prev.filter(gs => gs.id !== selectedItem.id))
      toast.success('Sección eliminada exitosamente')
      closeModal()
    } catch (error) {
      toast.error('Error al eliminar sección')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Grado-Sección</h1>
          <p className="text-muted-foreground mt-1">Administra grados y secciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openTurnoModal('list')}>
            <Clock className="h-4 w-4 mr-2" />
            Configurar Turnos
          </Button>
          <Button onClick={() => openModal('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sección
          </Button>
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Organización Académica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Inicial', 'Primaria', 'Secundaria'].map((level, levelIndex) => (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: levelIndex * 0.1 }}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{level}</p>
                      <p className="text-sm text-muted-foreground">
                        {Object.keys(groupedByLevel[level]).length} grados, {' '}
                        {Object.values(groupedByLevel[level]).flat().length} secciones
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform ${expandedLevel === level ? 'rotate-90' : ''}`} />
                </button>

                {expandedLevel === level && (
                  <div className="p-4 space-y-3">
                    {Object.entries(groupedByLevel[level]).length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No hay secciones registradas
                      </p>
                    ) : (
                      Object.entries(groupedByLevel[level]).map(([grade, sections]) => (
                        <div key={grade} className="border rounded-lg">
                          <div className="flex items-center justify-between p-3 bg-muted/20">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{grade}</span>
                              <span className="text-sm text-muted-foreground">
                                ({sections.length} {sections.length === 1 ? 'sección' : 'secciones'})
                              </span>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            {sections.map((section) => (
                              <div
                                key={section.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                              >
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="font-medium">Sección {section.section}</span>
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                      section.turno === 'Mañana'
                                        ? 'bg-yellow-500/20 text-yellow-600'
                                        : 'bg-blue-500/20 text-blue-600'
                                    }`}>
                                      {section.turno} ({section.turnoStartTime} - {section.turnoEndTime})
                                    </span>
                                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                      section.status === 'active'
                                        ? 'bg-green-500/20 text-green-600'
                                        : 'bg-red-500/20 text-red-600'
                                    }`}>
                                      {section.status === 'active' ? 'Activa' : 'Inactiva'}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {section.currentStudents} estudiantes
                                  </span>
                                  {section.tutorName && (
                                    <span className="text-sm text-muted-foreground">
                                      Tutor: {section.tutorName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal('view', section)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal('edit', section)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openModal('delete', section)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {modalMode === 'create' && 'Nueva Sección'}
                  {modalMode === 'edit' && 'Editar Sección'}
                  {modalMode === 'view' && 'Detalles de Sección'}
                  {modalMode === 'delete' && 'Eliminar Sección'}
                </h2>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {modalMode === 'delete' ? (
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-red-500/10">
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">¿Eliminar esta sección?</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem?.grade} {selectedItem?.section}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      Eliminar
                    </Button>
                  </div>
                </div>
              ) : modalMode === 'view' ? (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nivel</p>
                      <p className="font-medium">{selectedItem?.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Turno</p>
                      <p className="font-medium">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          selectedItem?.turno === 'Mañana'
                            ? 'bg-yellow-500/20 text-yellow-600'
                            : 'bg-blue-500/20 text-blue-600'
                        }`}>
                          {selectedItem?.turno}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horario del Turno</p>
                      <p className="font-medium">{selectedItem?.turnoStartTime} - {selectedItem?.turnoEndTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grado/Sección</p>
                      <p className="font-medium">{selectedItem?.grade} {selectedItem?.section}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estudiantes Actuales</p>
                      <p className="font-medium">{selectedItem?.currentStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tutor</p>
                      <p className="font-medium">{selectedItem?.tutorName || 'Sin asignar'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className={`font-medium ${selectedItem?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedItem?.status === 'active' ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={closeModal}>Cerrar</Button>
                    <Button onClick={() => openModal('edit', selectedItem!)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nivel *</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as 'Inicial' | 'Primaria' | 'Secundaria' })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="Inicial">Inicial</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Turno *</label>
                      <select
                        value={formData.turno}
                        onChange={(e) => handleTurnoChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="">Seleccionar turno</option>
                        {turnos.map(t => (
                          <option key={t.id} value={t.nombre}>
                            {t.nombre} ({t.horaInicio} - {t.horaFin})
                          </option>
                        ))}
                      </select>
                      {turnos.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          No hay turnos configurados. <button type="button" className="underline" onClick={() => openTurnoModal('list')}>Configurar turnos</button>
                        </p>
                      )}
                    </div>
                  </div>
                  {formData.turno && (
                    <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Horario del turno: <strong>{formData.turnoStartTime} - {formData.turnoEndTime}</strong>
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Grado *</label>
                      <Input
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="5to"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sección *</label>
                      <Input
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        placeholder="A"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tutor (opcional)</label>
                    <select
                      value={formData.tutorId}
                      onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Sin asignar</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName} - {t.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Estado solo visible al editar */}
                  {modalMode === 'edit' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Estado</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="active">Activa</option>
                        <option value="inactive">Inactiva</option>
                      </select>
                    </div>
                  )}
                  {/* Vista previa solo al crear */}
                  {modalMode === 'create' && formData.grade && formData.section && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Vista Previa</p>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <GraduationCap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">{formData.grade} - Sección {formData.section}</span>
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                formData.turno === 'Mañana'
                                  ? 'bg-yellow-500/20 text-yellow-600'
                                  : 'bg-blue-500/20 text-blue-600'
                              }`}>
                                {formData.turno} ({formData.turnoStartTime} - {formData.turnoEndTime})
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            <Users className="h-3 w-3 inline mr-1" />
                            0 estudiantes
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                          {formData.level}
                        </span>
                      </div>
                      {formData.tutorId && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Tutor: {teachers.find(t => t.id === formData.tutorId)?.firstName} {teachers.find(t => t.id === formData.tutorId)?.lastName}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                    <Button onClick={modalMode === 'create' ? handleCreate : handleUpdate} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      {modalMode === 'create' ? 'Crear' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Modal de Configuración de Turnos */}
        {turnoModalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeTurnoModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {turnoModalMode === 'list' && 'Configurar Turnos'}
                  {turnoModalMode === 'create' && 'Nuevo Turno'}
                  {turnoModalMode === 'edit' && 'Editar Turno'}
                </h2>
                <Button variant="ghost" size="icon" onClick={closeTurnoModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {turnoModalMode === 'list' ? (
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    {turnos.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No hay turnos configurados
                      </p>
                    ) : (
                      turnos.map(turno => (
                        <div
                          key={turno.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              turno.nombre.toLowerCase().includes('mañana')
                                ? 'bg-yellow-500/10'
                                : 'bg-blue-500/10'
                            }`}>
                              <Clock className={`h-4 w-4 ${
                                turno.nombre.toLowerCase().includes('mañana')
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{turno.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                {turno.horaInicio} - {turno.horaFin}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openTurnoModal('edit', turno)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteTurno(turno)}
                              disabled={isSaving}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => openTurnoModal('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Turno
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Turno *</label>
                    <Input
                      value={turnoFormData.nombre}
                      onChange={(e) => setTurnoFormData({ ...turnoFormData, nombre: e.target.value })}
                      placeholder="Ej: Mañana, Tarde, Nocturno"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hora Inicio *</label>
                      <Input
                        type="time"
                        value={turnoFormData.horaInicio}
                        onChange={(e) => setTurnoFormData({ ...turnoFormData, horaInicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hora Fin *</label>
                      <Input
                        type="time"
                        value={turnoFormData.horaFin}
                        onChange={(e) => setTurnoFormData({ ...turnoFormData, horaFin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setTurnoModalMode('list')}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={turnoModalMode === 'create' ? handleCreateTurno : handleUpdateTurno}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      {turnoModalMode === 'create' ? 'Crear' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
