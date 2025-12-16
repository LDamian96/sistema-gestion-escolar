'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Search,
  Plus,
  GraduationCap,
  BookOpen,
  Loader2,
  Send,
  Paperclip,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Download,
  Clock,
  CheckCheck,
  User
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
import { useToast } from '@/hooks/use-toast'
import {
  conversationsService,
  messagesService,
  coursesService,
  studentsService,
  parentsService,
  teachersService,
  type Conversation,
  type Message,
  type Course,
  type Student,
  type Parent,
  type Teacher,
  type ConversationParticipant
} from '@/services/mock-data'

// ID del padre actual (simulado - en producción vendría del auth)
const CURRENT_PARENT_ID = 'p1'

export default function ParentMensajesPage() {
  // Estados
  const [currentParent, setCurrentParent] = useState<Parent | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  // Modal nueva conversación
  const [isNewConvOpen, setIsNewConvOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [initialMessage, setInitialMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')

  // Mensaje nuevo
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
      const [parentData, convData, courseData, studentData, teacherData] = await Promise.all([
        parentsService.getById(CURRENT_PARENT_ID),
        conversationsService.getByParent(CURRENT_PARENT_ID),
        coursesService.getAll(),
        studentsService.getAll(),
        teachersService.getAll()
      ])
      setCurrentParent(parentData || null)
      setConversations(convData)
      setCourses(courseData)
      setStudents(studentData)
      setTeachers(teacherData)
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

  // Obtener los hijos del padre actual
  const myChildren = useMemo(() => {
    if (!currentParent) return []
    return students.filter(s => currentParent.childrenIds.includes(s.id))
  }, [currentParent, students])

  // Obtener profesores disponibles para contactar (solo de los cursos de mis hijos)
  const availableTeachers = useMemo(() => {
    if (!selectedChild) return []
    const child = students.find(s => s.id === selectedChild)
    if (!child) return []

    // Obtener cursos del grado/sección del hijo
    const childCourses = courses.filter(c => c.gradeSection === child.gradeSection)
    const teacherIds = [...new Set(childCourses.map(c => c.teacherId))]

    return teachers.filter(t => teacherIds.includes(t.id) && t.status === 'active')
  }, [selectedChild, students, courses, teachers])

  // Cargar mensajes de una conversación
  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true)
      const data = await messagesService.getByConversation(conversationId)
      setMessages(data)
      // Marcar como leído
      await conversationsService.markAsRead(conversationId, CURRENT_PARENT_ID)
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
    loadData() // Refrescar para actualizar unread counts
  }

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentParent) return

    try {
      setIsSending(true)
      await messagesService.create({
        conversationId: selectedConversation.id,
        senderId: CURRENT_PARENT_ID,
        senderName: `${currentParent.firstName} ${currentParent.lastName}`,
        senderRole: 'PARENT',
        content: newMessage.trim()
      })

      setNewMessage('')
      await loadMessages(selectedConversation.id)

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

  // Crear nueva conversación
  const handleCreateConversation = async () => {
    if (!selectedChild || !selectedTeacher || !initialMessage.trim() || !currentParent) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsCreating(true)
      const child = students.find(s => s.id === selectedChild)
      const teacher = teachers.find(t => t.id === selectedTeacher)

      if (!child || !teacher) {
        toast({
          title: 'Error',
          description: 'No se encontró información',
          variant: 'destructive'
        })
        return
      }

      // Verificar si ya existe conversación
      const existingConv = conversations.find(c =>
        c.studentId === child.id &&
        c.participants.some(p => p.id === teacher.id) &&
        c.participants.some(p => p.id === CURRENT_PARENT_ID)
      )

      if (existingConv) {
        toast({
          title: 'Conversación existente',
          description: 'Ya tienes una conversación con este profesor sobre este hijo',
          variant: 'destructive'
        })
        return
      }

      // Crear conversación
      const participants: ConversationParticipant[] = [
        { id: teacher.id, name: `${teacher.firstName} ${teacher.lastName}`, role: 'TEACHER' },
        { id: CURRENT_PARENT_ID, name: `${currentParent.firstName} ${currentParent.lastName}`, role: 'PARENT' }
      ]

      const newConv = await conversationsService.create({
        participants,
        studentId: child.id,
        studentName: `${child.firstName} ${child.lastName}`,
        gradeSection: child.gradeSection,
        createdBy: CURRENT_PARENT_ID
      })

      // Enviar mensaje inicial
      await messagesService.create({
        conversationId: newConv.id,
        senderId: CURRENT_PARENT_ID,
        senderName: `${currentParent.firstName} ${currentParent.lastName}`,
        senderRole: 'PARENT',
        content: initialMessage.trim()
      })

      toast({
        title: 'Conversación creada',
        description: `Se ha iniciado la conversación con ${teacher.firstName} ${teacher.lastName}`
      })

      setIsNewConvOpen(false)
      setSelectedChild('')
      setSelectedTeacher('')
      setInitialMessage('')
      await loadData()

      // Abrir la conversación recién creada
      const updatedConvs = await conversationsService.getByParent(CURRENT_PARENT_ID)
      const createdConv = updatedConvs.find(c => c.id === newConv.id)
      if (createdConv) {
        handleSelectConversation(createdConv)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la conversación',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Filtrar conversaciones
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const searchLower = searchTerm.toLowerCase()
      return !searchTerm ||
        conv.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
        conv.studentName?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.toLowerCase().includes(searchLower)
    })
  }, [conversations, searchTerm])

  // Estadísticas
  const stats = useMemo(() => {
    const total = conversations.length
    const unread = conversations.reduce((acc, c) => acc + (c.unreadCount[CURRENT_PARENT_ID] || 0), 0)
    return { total, unread }
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
          <h1 className="font-heading text-3xl font-bold">Mensajes</h1>
          <p className="text-muted-foreground mt-1">
            Comunícate con los profesores de tus hijos
          </p>
        </div>
        <Button onClick={() => setIsNewConvOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Conversación
        </Button>
      </div>

      {/* Info del padre */}
      {currentParent && (
        <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  {currentParent.firstName[0]}{currentParent.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentParent.firstName} {currentParent.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  Padre/Madre de: {myChildren.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <MessageSquare className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Conversaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unread}</p>
                <p className="text-xs text-muted-foreground">Mensajes sin Leer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="min-h-[500px]">
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
                  Mis Conversaciones
                </CardTitle>
                <CardDescription>
                  Conversaciones con profesores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Búsqueda */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Lista */}
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tienes conversaciones</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsNewConvOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Contactar a un profesor
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {filteredConversations.map((conv, index) => {
                        const teacher = conv.participants.find(p => p.role === 'TEACHER')
                        const unreadCount = conv.unreadCount[CURRENT_PARENT_ID] || 0
                        const isLastSenderMe = conv.lastMessageSenderId === CURRENT_PARENT_ID

                        return (
                          <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <button
                              className={`w-full p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all text-left ${
                                unreadCount > 0 ? 'bg-green-50/50 dark:bg-green-950/20' : ''
                              }`}
                              onClick={() => handleSelectConversation(conv)}
                            >
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-blue-500 text-white">
                                    {teacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold truncate flex items-center gap-2">
                                      <BookOpen className="h-4 w-4 text-blue-500" />
                                      {teacher?.name}
                                    </span>
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
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2 truncate flex items-center gap-1">
                                    {isLastSenderMe && <span className="text-xs">Tú:</span>}
                                    {conv.lastMessage}
                                  </p>
                                </div>

                                {unreadCount > 0 && (
                                  <Badge className="bg-green-500 text-white shrink-0">
                                    {unreadCount}
                                  </Badge>
                                )}
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
              className="flex flex-col h-[500px]"
            >
              {/* Header de Conversación */}
              <div className="p-4 border-b flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {selectedConversation.participants.find(p => p.role === 'TEACHER')?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    {selectedConversation.participants.find(p => p.role === 'TEACHER')?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sobre: {selectedConversation.studentName} - {selectedConversation.gradeSection}
                  </p>
                </div>
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
                      const isMe = msg.senderId === CURRENT_PARENT_ID

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={`${isMe ? 'bg-green-500' : 'bg-blue-500'} text-white text-xs`}>
                              {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                            <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                              <span className="text-xs text-muted-foreground">
                                {formatFullDate(msg.createdAt)}
                              </span>
                            </div>
                            <div className={`p-3 rounded-2xl ${
                              isMe
                                ? 'bg-green-500 text-white rounded-tr-md'
                                : 'bg-muted rounded-tl-md'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                              {/* Attachments */}
                              {msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map(att => (
                                    <div
                                      key={att.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg ${
                                        isMe ? 'bg-white/20' : 'bg-white dark:bg-slate-800'
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
                            {isMe && (
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <CheckCheck className={`h-3 w-3 ${
                                  msg.readBy.length > 1 ? 'text-green-500' : 'text-muted-foreground'
                                }`} />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input de Mensaje */}
              <div className="p-4 border-t">
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

      {/* Modal Nueva Conversación */}
      <Dialog open={isNewConvOpen} onOpenChange={setIsNewConvOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Conversación</DialogTitle>
            <DialogDescription>
              Contacta a un profesor de tus hijos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Seleccionar hijo */}
            <div className="space-y-2">
              <Label>Selecciona a tu hijo(a)</Label>
              <Select value={selectedChild} onValueChange={(value) => {
                setSelectedChild(value)
                setSelectedTeacher('') // Reset teacher when child changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {myChildren.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>{child.firstName} {child.lastName}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {child.gradeSection}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleccionar profesor */}
            <div className="space-y-2">
              <Label>Selecciona un Profesor</Label>
              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
                disabled={!selectedChild}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedChild ? "Selecciona un profesor..." : "Primero selecciona un hijo"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map(teacher => {
                    const hasExistingConv = conversations.some(c =>
                      c.studentId === selectedChild &&
                      c.participants.some(p => p.id === teacher.id)
                    )

                    return (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id}
                        disabled={hasExistingConv}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{teacher.firstName} {teacher.lastName}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {teacher.specialization}
                          </Badge>
                          {hasExistingConv && (
                            <Badge variant="outline" className="text-xs">
                              Ya existe
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Mensaje inicial */}
            <div className="space-y-2">
              <Label>Mensaje Inicial</Label>
              <Textarea
                placeholder="Escribe tu primer mensaje..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={4}
                disabled={!selectedTeacher}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewConvOpen(false)
              setSelectedChild('')
              setSelectedTeacher('')
              setInitialMessage('')
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!selectedChild || !selectedTeacher || !initialMessage.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Iniciar Conversación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
