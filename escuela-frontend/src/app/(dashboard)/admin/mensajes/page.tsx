'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Search,
  Users,
  GraduationCap,
  BookOpen,
  UserCircle,
  Loader2,
  Send,
  Paperclip,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Download,
  X,
  Eye,
  Clock,
  CheckCheck,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  conversationsService,
  messagesService,
  gradeSectionsService,
  type Conversation,
  type Message,
  type GradeSection,
  type Attachment
} from '@/services/mock-data'

// Admin ID
const ADMIN_ID = 'admin1'
const ADMIN_NAME = 'Admin Sistema'

export default function AdminMensajesPage() {
  // Estados
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterGradeSection, setFilterGradeSection] = useState<string>('all')
  const [filterTurno, setFilterTurno] = useState<string>('all')

  // Mensaje nuevo (admin puede escribir)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [convData, gsData] = await Promise.all([
        conversationsService.getAll(),
        gradeSectionsService.getAll()
      ])
      setConversations(convData)
      setGradeSections(gsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar mensajes de una conversación
  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true)
      const data = await messagesService.getByConversation(conversationId)
      setMessages(data)
      // Scroll al final
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mensajes',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Seleccionar conversación
  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv)
    await loadMessages(conv.id)
  }

  // Volver a la lista
  const handleBack = () => {
    setSelectedConversation(null)
    setMessages([])
  }

  // Enviar mensaje (admin puede escribir en cualquier conversación)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setIsSending(true)
      await messagesService.create({
        conversationId: selectedConversation.id,
        senderId: ADMIN_ID,
        senderName: ADMIN_NAME,
        senderRole: 'ADMIN',
        content: newMessage.trim()
      })

      setNewMessage('')
      await loadMessages(selectedConversation.id)

      // Actualizar la conversación en la lista
      const updatedConvs = await conversationsService.getAll()
      setConversations(updatedConvs)

      toast({
        title: 'Mensaje enviado',
        description: 'Tu mensaje ha sido enviado correctamente'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive'
      })
    } finally {
      setIsSending(false)
    }
  }

  // Obtener niveles y turnos únicos
  const levels = useMemo(() => [...new Set(gradeSections.map(gs => gs.level))], [gradeSections])
  const turnos = useMemo(() => [...new Set(gradeSections.map(gs => gs.turno))], [gradeSections])

  // Filtrar grados/secciones según nivel y turno seleccionados
  const filteredGradeSections = useMemo(() => {
    return gradeSections.filter(gs => {
      const matchesLevel = filterLevel === 'all' || gs.level === filterLevel
      const matchesTurno = filterTurno === 'all' || gs.turno === filterTurno
      return matchesLevel && matchesTurno
    })
  }, [gradeSections, filterLevel, filterTurno])

  // Filtrar conversaciones
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // Búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        conv.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
        conv.studentName?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.toLowerCase().includes(searchLower)

      // Obtener info del gradeSection de la conversación
      const convGS = gradeSections.find(gs => gs.name === conv.gradeSection)

      // Filtro por nivel
      const matchesLevel = filterLevel === 'all' || convGS?.level === filterLevel

      // Filtro por grado/sección
      const matchesGradeSection = filterGradeSection === 'all' ||
        conv.gradeSection === filterGradeSection

      // Filtro por turno
      const matchesTurno = filterTurno === 'all' || convGS?.turno === filterTurno

      return matchesSearch && matchesLevel && matchesGradeSection && matchesTurno
    })
  }, [conversations, searchTerm, filterLevel, filterGradeSection, filterTurno, gradeSections])

  // Estadísticas
  const stats = useMemo(() => {
    const total = conversations.length
    const totalMessages = conversations.reduce((acc, c) => {
      // Contar mensajes sin leer
      const unread = Object.values(c.unreadCount).reduce((a, b) => a + b, 0)
      return acc + unread
    }, 0)
    const uniqueTeachers = new Set(
      conversations.flatMap(c =>
        c.participants.filter(p => p.role === 'TEACHER').map(p => p.id)
      )
    ).size
    const uniqueParents = new Set(
      conversations.flatMap(c =>
        c.participants.filter(p => p.role === 'PARENT').map(p => p.id)
      )
    ).size

    return { total, totalMessages, uniqueTeachers, uniqueParents }
  }, [conversations])

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Ayer'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }
  }

  // Formatear fecha completa
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Obtener color del rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TEACHER': return 'bg-blue-500'
      case 'PARENT': return 'bg-green-500'
      case 'ADMIN': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  // Obtener icono del rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'TEACHER': return BookOpen
      case 'PARENT': return UserCircle
      case 'ADMIN': return Users
      default: return Users
    }
  }

  if (isLoading) {
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
          <h1 className="font-heading text-3xl font-bold">Centro de Mensajes</h1>
          <p className="text-muted-foreground mt-1">
            Panel de supervisión - Todas las conversaciones del sistema
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
          <Eye className="h-4 w-4" />
          Modo Supervisor
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversaciones', value: stats.total, icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Mensajes sin Leer', value: stats.totalMessages, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Profesores Activos', value: stats.uniqueTeachers, icon: BookOpen, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
          { label: 'Padres Activos', value: stats.uniqueParents, icon: UserCircle, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        ].map((stat, index) => (
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

      {/* Main Content */}
      <Card className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {!selectedConversation ? (
            // Lista de Conversaciones
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Todas las Conversaciones
                </CardTitle>
                <CardDescription>
                  Visualiza y supervisa las comunicaciones entre profesores y padres
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, estudiante o mensaje..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterLevel} onValueChange={(value) => {
                      setFilterLevel(value)
                      setFilterGradeSection('all') // Reset grado/sección al cambiar nivel
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Niveles</SelectItem>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterGradeSection} onValueChange={setFilterGradeSection}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Grado/Sección" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Grados</SelectItem>
                        {filteredGradeSections.map(gs => (
                          <SelectItem key={gs.id} value={gs.name}>
                            {gs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterTurno} onValueChange={setFilterTurno}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Turnos</SelectItem>
                        {turnos.map(turno => (
                          <SelectItem key={turno} value={turno}>
                            {turno}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(filterLevel !== 'all' || filterGradeSection !== 'all' || filterTurno !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterLevel('all')
                          setFilterGradeSection('all')
                          setFilterTurno('all')
                        }}
                        className="text-muted-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </div>

                {/* Lista */}
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No se encontraron conversaciones</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[450px]">
                    <div className="space-y-2">
                      {filteredConversations.map((conv, index) => {
                        const teacher = conv.participants.find(p => p.role === 'TEACHER')
                        const parent = conv.participants.find(p => p.role === 'PARENT')
                        const totalUnread = Object.values(conv.unreadCount).reduce((a, b) => a + b, 0)

                        return (
                          <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <button
                              className="w-full p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                              onClick={() => handleSelectConversation(conv)}
                            >
                              <div className="flex items-start gap-4">
                                {/* Avatars */}
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback className={`${getRoleColor(teacher?.role || '')} text-white`}>
                                      {teacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <Avatar className="h-8 w-8 absolute -bottom-1 -right-1 border-2 border-background">
                                    <AvatarFallback className={`${getRoleColor(parent?.role || '')} text-white text-xs`}>
                                      {parent?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold truncate">{teacher?.name}</span>
                                      <span className="text-muted-foreground">↔</span>
                                      <span className="font-semibold truncate">{parent?.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatDate(conv.lastMessageAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      <GraduationCap className="h-3 w-3 mr-1" />
                                      {conv.studentName}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {conv.gradeSection}
                                    </Badge>
                                    {totalUnread > 0 && (
                                      <Badge className="bg-orange-500 text-white text-xs">
                                        {totalUnread} sin leer
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2 truncate">
                                    {conv.lastMessage}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </motion.div>
          ) : (
            // Vista de Conversación
            <motion.div
              key="conversation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-[600px]"
            >
              {/* Header de Conversación */}
              <div className="p-4 border-b flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {selectedConversation.participants.map((p, i) => (
                      <span key={p.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-muted-foreground mx-1">↔</span>}
                        <Badge variant="outline" className="flex items-center gap-1">
                          {p.role === 'TEACHER' ? <BookOpen className="h-3 w-3" /> : <UserCircle className="h-3 w-3" />}
                          {p.name}
                        </Badge>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Estudiante: {selectedConversation.studentName} - {selectedConversation.gradeSection}
                  </p>
                </div>
                <Badge variant="secondary">
                  {messages.length} mensajes
                </Badge>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isAdmin = msg.senderRole === 'ADMIN'
                      const RoleIcon = getRoleIcon(msg.senderRole)

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={`${getRoleColor(msg.senderRole)} text-white text-xs`}>
                              {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${isAdmin ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium flex items-center gap-1">
                                <RoleIcon className="h-3 w-3" />
                                {msg.senderName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatFullDate(msg.createdAt)}
                              </span>
                            </div>
                            <div className={`p-3 rounded-2xl ${
                              isAdmin
                                ? 'bg-purple-500 text-white rounded-tr-md'
                                : msg.senderRole === 'TEACHER'
                                  ? 'bg-blue-50 dark:bg-blue-950/30 rounded-tl-md'
                                  : 'bg-green-50 dark:bg-green-950/30 rounded-tl-md'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                              {/* Attachments */}
                              {msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map(att => (
                                    <div
                                      key={att.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg ${
                                        isAdmin ? 'bg-white/20' : 'bg-white dark:bg-slate-800'
                                      }`}
                                    >
                                      {att.type === 'image' ? (
                                        <ImageIcon className="h-4 w-4" />
                                      ) : (
                                        <FileText className="h-4 w-4" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{att.name}</p>
                                        <p className="text-xs opacity-70">{formatFileSize(att.size)}</p>
                                      </div>
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCheck className={`h-3 w-3 ${
                                msg.readBy.length > 1 ? 'text-blue-500' : 'text-muted-foreground'
                              }`} />
                              <span className="text-xs text-muted-foreground">
                                {msg.readBy.length > 1 ? 'Leído' : 'Enviado'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input de Mensaje (Admin puede escribir) */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-950/30">
                    <Users className="h-3 w-3 mr-1" />
                    Escribiendo como Administrador
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    placeholder="Escribe un mensaje..."
                    className="resize-none min-h-[44px] max-h-[120px]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    className="shrink-0"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
