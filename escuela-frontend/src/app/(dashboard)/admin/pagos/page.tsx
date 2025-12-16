'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { paymentsService, studentsService, parentsService, gradeSectionsService, type Payment, type Student, type Parent, type GradeSection } from '@/services/mock-data'

type ModalMode = 'create' | 'create-bulk' | 'edit' | 'view' | 'pay' | null

interface StudentPaymentAmount {
  studentId: string
  amount: number
  customAmount: boolean
}

export default function PagosPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null)

  // Form state for individual payment
  const [formData, setFormData] = useState({
    studentId: '',
    concept: '',
    amount: '',
    dueDate: '',
    status: 'pending' as Payment['status'],
    paymentMethod: '' as Payment['paymentMethod'] | '',
    paidDate: ''
  })

  // Filtros para modal de pago individual
  const [individualFilterLevel, setIndividualFilterLevel] = useState<string>('_all')
  const [individualFilterGradeSection, setIndividualFilterGradeSection] = useState<string>('_all')
  const [individualFilterTurno, setIndividualFilterTurno] = useState<string>('_all')
  const [individualSearchTerm, setIndividualSearchTerm] = useState('')

  // Bulk payment state
  const [bulkLevel, setBulkLevel] = useState<string>('')
  const [bulkGradeSection, setBulkGradeSection] = useState<string>('')
  const [bulkTurno, setBulkTurno] = useState<string>('')
  const [bulkConcept, setBulkConcept] = useState('')
  const [bulkDefaultAmount, setBulkDefaultAmount] = useState('')
  const [bulkDueDate, setBulkDueDate] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [studentAmounts, setStudentAmounts] = useState<Map<string, number>>(new Map())
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [tempAmount, setTempAmount] = useState('')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [paymentsData, studentsData, parentsData, gradeSectionsData] = await Promise.all([
        paymentsService.getAll(),
        studentsService.getAll(),
        parentsService.getAll(),
        gradeSectionsService.getAll()
      ])
      setPayments(paymentsData)
      setStudents(studentsData)
      setParents(parentsData)
      setGradeSections(gradeSectionsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar los datos',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch =
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.concept.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [payments, searchTerm, selectedStatus])

  // Get unique values for filters
  const levels = useMemo(() => {
    return [...new Set(gradeSections.map(gs => gs.level))]
  }, [gradeSections])

  const turnos = useMemo(() => {
    return [...new Set(gradeSections.map(gs => gs.turno))]
  }, [gradeSections])

  // Filtered grade sections based on level and turno
  const filteredGradeSections = useMemo(() => {
    return gradeSections.filter(gs => {
      const matchesLevel = !bulkLevel || gs.level === bulkLevel
      const matchesTurno = !bulkTurno || gs.turno === bulkTurno
      return matchesLevel && matchesTurno && gs.status === 'active'
    })
  }, [gradeSections, bulkLevel, bulkTurno])

  // Filtered students based on bulk selection
  const filteredBulkStudents = useMemo(() => {
    if (!bulkGradeSection) return []

    const gs = gradeSections.find(g => g.id === bulkGradeSection)
    if (!gs) return []

    const gradeSectionString = `${gs.grade} ${gs.section}`
    return students.filter(s => s.gradeSection === gradeSectionString && s.status === 'active')
  }, [students, gradeSections, bulkGradeSection])

  // Filtered grade sections for individual payment modal
  const filteredIndividualGradeSections = useMemo(() => {
    return gradeSections.filter(gs => {
      const matchesLevel = individualFilterLevel === '_all' || gs.level === individualFilterLevel
      const matchesTurno = individualFilterTurno === '_all' || gs.turno === individualFilterTurno
      return matchesLevel && matchesTurno && gs.status === 'active'
    })
  }, [gradeSections, individualFilterLevel, individualFilterTurno])

  // Filtered students for individual payment modal
  const filteredIndividualStudents = useMemo(() => {
    return students.filter(s => {
      if (s.status !== 'active') return false

      // Buscar por nombre
      const matchesSearch = individualSearchTerm === '' ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(individualSearchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(individualSearchTerm.toLowerCase())

      // Filtrar por grado-sección específico
      if (individualFilterGradeSection !== '_all') {
        const gs = gradeSections.find(g => g.id === individualFilterGradeSection)
        if (gs) {
          const gradeSectionString = `${gs.grade} ${gs.section}`
          return matchesSearch && s.gradeSection === gradeSectionString
        }
        return false
      }

      // Filtrar por nivel y turno
      const studentGS = gradeSections.find(gs => `${gs.grade} ${gs.section}` === s.gradeSection)
      if (!studentGS) return matchesSearch

      const matchesLevel = individualFilterLevel === '_all' || studentGS.level === individualFilterLevel
      const matchesTurno = individualFilterTurno === '_all' || studentGS.turno === individualFilterTurno

      return matchesSearch && matchesLevel && matchesTurno
    })
  }, [students, gradeSections, individualFilterLevel, individualFilterGradeSection, individualFilterTurno, individualSearchTerm])

  // Auto-select all students when grade-section changes
  useEffect(() => {
    if (bulkGradeSection && filteredBulkStudents.length > 0) {
      const allIds = new Set(filteredBulkStudents.map(s => s.id))
      setSelectedStudents(allIds)

      // Set default amount for all
      const defaultAmt = parseFloat(bulkDefaultAmount) || 0
      const newAmounts = new Map<string, number>()
      filteredBulkStudents.forEach(s => {
        newAmounts.set(s.id, defaultAmt)
      })
      setStudentAmounts(newAmounts)
    } else {
      setSelectedStudents(new Set())
      setStudentAmounts(new Map())
    }
  }, [bulkGradeSection, filteredBulkStudents.length])

  // Update all amounts when default amount changes
  useEffect(() => {
    if (bulkDefaultAmount && filteredBulkStudents.length > 0) {
      const defaultAmt = parseFloat(bulkDefaultAmount) || 0
      const newAmounts = new Map<string, number>()
      filteredBulkStudents.forEach(s => {
        // Keep custom amounts, update non-custom ones
        const currentAmount = studentAmounts.get(s.id)
        const isCustom = currentAmount !== undefined && currentAmount !== (parseFloat(bulkDefaultAmount) || 0)
        newAmounts.set(s.id, isCustom ? (currentAmount || defaultAmt) : defaultAmt)
      })
      setStudentAmounts(newAmounts)
    }
  }, [bulkDefaultAmount])

  // Stats calculations
  const stats = useMemo(() => {
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0)
    const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0)
    const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0)
    const totalPayments = payments.length

    return [
      { label: 'Total Recaudado', value: `S/ ${totalPaid.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10' },
      { label: 'Pendiente', value: `S/ ${totalPending.toLocaleString()}`, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
      { label: 'Vencido', value: `S/ ${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
      { label: 'Total Pagos', value: totalPayments, icon: CreditCard, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    ]
  }, [payments])

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-600'
      case 'pending': return 'bg-yellow-500/20 text-yellow-600'
      case 'overdue': return 'bg-red-500/20 text-red-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'overdue': return 'Vencido'
      default: return status
    }
  }

  const getPaymentMethodText = (method?: Payment['paymentMethod']) => {
    switch (method) {
      case 'cash': return 'Efectivo'
      case 'card': return 'Tarjeta'
      case 'transfer': return 'Transferencia'
      case 'mercadopago': return 'MercadoPago'
      default: return '-'
    }
  }

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      studentId: '',
      concept: '',
      amount: '',
      dueDate: '',
      status: 'pending',
      paymentMethod: '',
      paidDate: ''
    })
    // Resetear filtros individuales
    setIndividualFilterLevel('_all')
    setIndividualFilterGradeSection('_all')
    setIndividualFilterTurno('_all')
    setIndividualSearchTerm('')
    setModalMode('create')
    setModalOpen(true)
  }

  const openBulkCreateModal = () => {
    setBulkLevel('')
    setBulkGradeSection('')
    setBulkTurno('')
    setBulkConcept('')
    setBulkDefaultAmount('')
    setBulkDueDate('')
    setSelectedStudents(new Set())
    setStudentAmounts(new Map())
    setEditingStudentId(null)
    setModalMode('create-bulk')
    setModalOpen(true)
  }

  const openEditModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setFormData({
      studentId: payment.studentId,
      concept: payment.concept,
      amount: payment.amount.toString(),
      dueDate: payment.dueDate,
      status: payment.status,
      paymentMethod: payment.paymentMethod || '',
      paidDate: payment.paidDate || ''
    })
    setModalMode('edit')
    setModalOpen(true)
  }

  const openViewModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setModalMode('view')
    setModalOpen(true)
  }

  const openPayModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setFormData({
      studentId: payment.studentId,
      concept: payment.concept,
      amount: payment.amount.toString(),
      dueDate: payment.dueDate,
      status: 'paid',
      paymentMethod: '',
      paidDate: new Date().toISOString().split('T')[0]
    })
    setModalMode('pay')
    setModalOpen(true)
  }

  const openDeleteDialog = (paymentId: string) => {
    setPaymentToDelete(paymentId)
    setDeleteDialogOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalMode(null)
    setSelectedPayment(null)
    setEditingStudentId(null)
  }

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
      // Set default amount if not already set
      if (!studentAmounts.has(studentId)) {
        const newAmounts = new Map(studentAmounts)
        newAmounts.set(studentId, parseFloat(bulkDefaultAmount) || 0)
        setStudentAmounts(newAmounts)
      }
    }
    setSelectedStudents(newSelected)
  }

  // Set custom amount for student
  const startEditingAmount = (studentId: string) => {
    setEditingStudentId(studentId)
    setTempAmount((studentAmounts.get(studentId) || 0).toString())
  }

  const saveCustomAmount = () => {
    if (editingStudentId) {
      const newAmounts = new Map(studentAmounts)
      newAmounts.set(editingStudentId, parseFloat(tempAmount) || 0)
      setStudentAmounts(newAmounts)
      setEditingStudentId(null)
      setTempAmount('')
    }
  }

  // CRUD operations
  const handleCreate = async () => {
    try {
      if (!formData.studentId || !formData.concept || !formData.amount || !formData.dueDate) {
        toast({
          title: 'Error',
          description: 'Por favor complete todos los campos obligatorios',
          type: 'error'
        })
        return
      }

      const student = students.find(s => s.id === formData.studentId)
      if (!student) {
        toast({
          title: 'Error',
          description: 'Estudiante no encontrado',
          type: 'error'
        })
        return
      }

      const parent = parents.find(p => p.id === student.parentId)

      const newPayment: Omit<Payment, 'id'> = {
        studentId: formData.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        gradeSection: student.gradeSection,
        parentId: student.parentId || '',
        parentName: parent ? `${parent.firstName} ${parent.lastName}` : '',
        concept: formData.concept,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        status: formData.status,
        paymentMethod: formData.paymentMethod || undefined,
        paidDate: formData.paidDate || undefined
      }

      const created = await paymentsService.create(newPayment)
      setPayments([...payments, created])

      toast({
        title: 'Pago creado',
        description: 'El pago se ha registrado exitosamente',
        type: 'success'
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el pago',
        type: 'error'
      })
    }
  }

  const handleBulkCreate = async () => {
    try {
      if (!bulkConcept || !bulkDueDate || selectedStudents.size === 0) {
        toast({
          title: 'Error',
          description: 'Complete el concepto, fecha de vencimiento y seleccione al menos un estudiante',
          type: 'error'
        })
        return
      }

      // Validate all selected students have amounts > 0
      let hasInvalidAmount = false
      selectedStudents.forEach(studentId => {
        const amount = studentAmounts.get(studentId) || 0
        if (amount <= 0) hasInvalidAmount = true
      })

      if (hasInvalidAmount) {
        toast({
          title: 'Error',
          description: 'Todos los estudiantes seleccionados deben tener un monto mayor a 0',
          type: 'error'
        })
        return
      }

      const newPayments: Payment[] = []

      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId)
        if (!student) continue

        const parent = parents.find(p => p.id === student.parentId)
        const amount = studentAmounts.get(studentId) || parseFloat(bulkDefaultAmount) || 0

        const newPayment: Omit<Payment, 'id'> = {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          gradeSection: student.gradeSection,
          parentId: student.parentId || '',
          parentName: parent ? `${parent.firstName} ${parent.lastName}` : '',
          concept: bulkConcept,
          amount: amount,
          dueDate: bulkDueDate,
          status: 'pending'
        }

        const created = await paymentsService.create(newPayment)
        newPayments.push(created)
      }

      setPayments([...payments, ...newPayments])

      toast({
        title: 'Pagos creados',
        description: `Se han creado ${newPayments.length} pagos exitosamente`,
        type: 'success'
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron crear los pagos',
        type: 'error'
      })
    }
  }

  const handleUpdate = async () => {
    try {
      if (!selectedPayment) return

      if (!formData.studentId || !formData.concept || !formData.amount || !formData.dueDate) {
        toast({
          title: 'Error',
          description: 'Por favor complete todos los campos obligatorios',
          type: 'error'
        })
        return
      }

      const student = students.find(s => s.id === formData.studentId)
      if (!student) {
        toast({
          title: 'Error',
          description: 'Estudiante no encontrado',
          type: 'error'
        })
        return
      }

      const parent = parents.find(p => p.id === student.parentId)

      const updatedData: Partial<Payment> = {
        studentId: formData.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        gradeSection: student.gradeSection,
        parentId: student.parentId || '',
        parentName: parent ? `${parent.firstName} ${parent.lastName}` : '',
        concept: formData.concept,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        status: formData.status,
        paymentMethod: formData.paymentMethod || undefined,
        paidDate: formData.paidDate || undefined
      }

      const updated = await paymentsService.update(selectedPayment.id, updatedData)
      setPayments(payments.map(p => p.id === selectedPayment.id ? updated : p))

      toast({
        title: 'Pago actualizado',
        description: 'El pago se ha actualizado exitosamente',
        type: 'success'
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el pago',
        type: 'error'
      })
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      if (!selectedPayment) return

      if (!formData.paymentMethod) {
        toast({
          title: 'Error',
          description: 'Por favor seleccione un método de pago',
          type: 'error'
        })
        return
      }

      const updated = await paymentsService.markAsPaid(selectedPayment.id, formData.paymentMethod as Payment['paymentMethod'])
      setPayments(payments.map(p => p.id === selectedPayment.id ? updated : p))

      toast({
        title: 'Pago registrado',
        description: `Pago marcado como pagado. Factura: ${updated.invoiceNumber}`,
        type: 'success'
      })
      closeModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago',
        type: 'error'
      })
    }
  }

  const handleDelete = async () => {
    try {
      if (!paymentToDelete) return

      await paymentsService.delete(paymentToDelete)
      setPayments(payments.filter(p => p.id !== paymentToDelete))

      toast({
        title: 'Pago eliminado',
        description: 'El pago se ha eliminado exitosamente',
        type: 'success'
      })
      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el pago',
        type: 'error'
      })
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Estudiante', 'Grado', 'Padre', 'Concepto', 'Monto', 'Fecha Vencimiento', 'Fecha Pago', 'Estado', 'Método Pago', 'N° Factura']
      const rows = filteredPayments.map(p => [
        p.id,
        p.studentName,
        p.gradeSection,
        p.parentName,
        p.concept,
        p.amount,
        p.dueDate,
        p.paidDate || '',
        getStatusText(p.status),
        getPaymentMethodText(p.paymentMethod),
        p.invoiceNumber || ''
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `pagos_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      toast({
        title: 'Exportación exitosa',
        description: 'El archivo CSV se ha descargado correctamente',
        type: 'success'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el archivo',
        type: 'error'
      })
    }
  }

  // Calculate bulk totals
  const bulkTotal = useMemo(() => {
    let total = 0
    selectedStudents.forEach(studentId => {
      total += studentAmounts.get(studentId) || 0
    })
    return total
  }, [selectedStudents, studentAmounts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gestión de Pagos</h1>
          <p className="text-muted-foreground mt-1">Administra los pagos y pensiones</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={openCreateModal} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Pago Individual
          </Button>
          <Button onClick={openBulkCreateModal} className="bg-emerald-600 hover:bg-emerald-700">
            <Users className="h-4 w-4 mr-2" />
            Pago Masivo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por estudiante, padre o concepto..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'paid', label: 'Pagados' },
                { value: 'pending', label: 'Pendientes' },
                { value: 'overdue', label: 'Vencidos' }
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={selectedStatus === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagos ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron pagos
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium">{payment.studentName}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span>{payment.gradeSection}</span>
                        <span>{payment.concept}</span>
                        <span>Padre: {payment.parentName}</span>
                        <span>Vence: {payment.dueDate}</span>
                        {payment.paidDate && <span>Pagado: {payment.paidDate}</span>}
                        {payment.paymentMethod && <span>{getPaymentMethodText(payment.paymentMethod)}</span>}
                        {payment.invoiceNumber && <span>Factura: {payment.invoiceNumber}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold">S/ {payment.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status !== 'paid' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openPayModal(payment)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditModal(payment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(payment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Create/Edit/View/Pay */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className={`${modalMode === 'create-bulk' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' && 'Crear Pago Individual'}
              {modalMode === 'create-bulk' && 'Crear Pagos Masivos'}
              {modalMode === 'edit' && 'Editar Pago'}
              {modalMode === 'view' && 'Detalles del Pago'}
              {modalMode === 'pay' && 'Registrar Pago'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' && 'Complete los datos para registrar un nuevo pago'}
              {modalMode === 'create-bulk' && 'Seleccione nivel, grado-sección y turno para crear pagos masivos'}
              {modalMode === 'edit' && 'Modifique los datos del pago'}
              {modalMode === 'view' && 'Información detallada del pago'}
              {modalMode === 'pay' && 'Seleccione el método de pago para marcar como pagado'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {modalMode === 'view' && selectedPayment ? (
              // View mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Estudiante</Label>
                    <p className="font-medium">{selectedPayment.studentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Grado/Sección</Label>
                    <p className="font-medium">{selectedPayment.gradeSection}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Padre/Tutor</Label>
                    <p className="font-medium">{selectedPayment.parentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Concepto</Label>
                    <p className="font-medium">{selectedPayment.concept}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Monto</Label>
                    <p className="font-medium text-lg">S/ {selectedPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {getStatusText(selectedPayment.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Vencimiento</Label>
                    <p className="font-medium">{selectedPayment.dueDate}</p>
                  </div>
                  {selectedPayment.paidDate && (
                    <div>
                      <Label className="text-muted-foreground">Fecha de Pago</Label>
                      <p className="font-medium">{selectedPayment.paidDate}</p>
                    </div>
                  )}
                  {selectedPayment.paymentMethod && (
                    <div>
                      <Label className="text-muted-foreground">Método de Pago</Label>
                      <p className="font-medium">{getPaymentMethodText(selectedPayment.paymentMethod)}</p>
                    </div>
                  )}
                  {selectedPayment.invoiceNumber && (
                    <div>
                      <Label className="text-muted-foreground">Número de Factura</Label>
                      <p className="font-medium">{selectedPayment.invoiceNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : modalMode === 'pay' && selectedPayment ? (
              // Pay mode
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estudiante:</span>
                      <span className="font-medium">{selectedPayment.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Concepto:</span>
                      <span className="font-medium">{selectedPayment.concept}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monto:</span>
                      <span className="font-bold text-lg">S/ {selectedPayment.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Método de Pago *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as Payment['paymentMethod'] })}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : modalMode === 'create-bulk' ? (
              // Bulk create mode
              <div className="space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulkLevel">Nivel</Label>
                    <Select value={bulkLevel || '_all'} onValueChange={(value) => {
                      setBulkLevel(value === '_all' ? '' : value)
                      setBulkGradeSection('')
                    }}>
                      <SelectTrigger id="bulkLevel">
                        <SelectValue placeholder="Seleccione nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">Todos</SelectItem>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bulkTurno">Turno</Label>
                    <Select value={bulkTurno || '_all'} onValueChange={(value) => {
                      setBulkTurno(value === '_all' ? '' : value)
                      setBulkGradeSection('')
                    }}>
                      <SelectTrigger id="bulkTurno">
                        <SelectValue placeholder="Seleccione turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">Todos</SelectItem>
                        {turnos.map(turno => (
                          <SelectItem key={turno} value={turno}>{turno}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bulkGradeSection">Grado-Sección *</Label>
                    <Select value={bulkGradeSection} onValueChange={setBulkGradeSection}>
                      <SelectTrigger id="bulkGradeSection">
                        <SelectValue placeholder="Seleccione grado-sección" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredGradeSections.map(gs => (
                          <SelectItem key={gs.id} value={gs.id}>
                            {gs.grade} {gs.section} - {gs.level} ({gs.turno})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulkConcept">Concepto *</Label>
                    <Input
                      id="bulkConcept"
                      value={bulkConcept}
                      onChange={(e) => setBulkConcept(e.target.value)}
                      placeholder="Ej: Pensión Diciembre 2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bulkDefaultAmount">Monto Base (S/) *</Label>
                    <Input
                      id="bulkDefaultAmount"
                      type="number"
                      step="0.01"
                      value={bulkDefaultAmount}
                      onChange={(e) => setBulkDefaultAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bulkDueDate">Fecha de Vencimiento *</Label>
                    <Input
                      id="bulkDueDate"
                      type="date"
                      value={bulkDueDate}
                      onChange={(e) => setBulkDueDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Students list */}
                {bulkGradeSection && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Estudiantes ({selectedStudents.size} de {filteredBulkStudents.length} seleccionados)</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allIds = new Set(filteredBulkStudents.map(s => s.id))
                            setSelectedStudents(allIds)
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Todos
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudents(new Set())}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Ninguno
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                      {filteredBulkStudents.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          No hay estudiantes en este grado-sección
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredBulkStudents.map((student) => {
                            const isSelected = selectedStudents.has(student.id)
                            const amount = studentAmounts.get(student.id) || 0
                            const isEditing = editingStudentId === student.id
                            const defaultAmt = parseFloat(bulkDefaultAmount) || 0
                            const isCustom = amount !== defaultAmt && defaultAmt > 0

                            return (
                              <div
                                key={student.id}
                                className={`flex items-center gap-3 p-3 transition-colors ${
                                  isSelected ? 'bg-emerald-50' : 'hover:bg-muted/50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleStudentSelection(student.id)}
                                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-gray-300 hover:border-emerald-400'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{student.code}</p>
                                </div>

                                {isSelected && (
                                  <div className="flex items-center gap-2">
                                    {isEditing ? (
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-muted-foreground">S/</span>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={tempAmount}
                                          onChange={(e) => setTempAmount(e.target.value)}
                                          className="w-24 h-8"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveCustomAmount()
                                            if (e.key === 'Escape') setEditingStudentId(null)
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={saveCustomAmount}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Check className="h-4 w-4 text-emerald-600" />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setEditingStudentId(null)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <X className="h-4 w-4 text-rose-600" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => startEditingAmount(student.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                          isCustom
                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                      >
                                        S/ {amount.toFixed(2)}
                                        {isCustom && <span className="ml-1 text-xs">(especial)</span>}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {selectedStudents.size > 0 && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-emerald-800">Resumen</p>
                            <p className="text-sm text-emerald-600">
                              {selectedStudents.size} estudiante(s) seleccionado(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-emerald-600">Total a generar</p>
                            <p className="text-2xl font-bold text-emerald-700">
                              S/ {bulkTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Create/Edit mode
              <>
                {/* Filtros para buscar estudiante */}
                {modalMode === 'create' && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-medium">Filtros para encontrar estudiante</Label>

                    {/* Búsqueda por nombre */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o código..."
                        className="pl-10"
                        value={individualSearchTerm}
                        onChange={(e) => setIndividualSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filtros por nivel, turno y grado-sección */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nivel</Label>
                        <Select value={individualFilterLevel} onValueChange={(value) => {
                          setIndividualFilterLevel(value)
                          setIndividualFilterGradeSection('_all')
                        }}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_all">Todos</SelectItem>
                            {levels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Turno</Label>
                        <Select value={individualFilterTurno} onValueChange={(value) => {
                          setIndividualFilterTurno(value)
                          setIndividualFilterGradeSection('_all')
                        }}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_all">Todos</SelectItem>
                            {turnos.map(turno => (
                              <SelectItem key={turno} value={turno}>{turno}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Grado-Sección</Label>
                        <Select value={individualFilterGradeSection} onValueChange={setIndividualFilterGradeSection}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_all">Todos</SelectItem>
                            {filteredIndividualGradeSections.map(gs => (
                              <SelectItem key={gs.id} value={gs.id}>
                                {gs.grade} {gs.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {filteredIndividualStudents.length} estudiante(s) encontrado(s)
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="studentId">Estudiante *</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger id="studentId">
                      <SelectValue placeholder="Seleccione estudiante" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {(modalMode === 'create' ? filteredIndividualStudents : students).map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - {student.gradeSection}
                        </SelectItem>
                      ))}
                      {modalMode === 'create' && filteredIndividualStudents.length === 0 && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No se encontraron estudiantes
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="concept">Concepto *</Label>
                  <Input
                    id="concept"
                    value={formData.concept}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    placeholder="Ej: Pensión Diciembre, Matrícula 2024"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Monto (S/) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <>
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as Payment['status'] })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="paid">Pagado</SelectItem>
                          <SelectItem value="overdue">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.status === 'paid' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paymentMethod">Método de Pago</Label>
                          <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as Payment['paymentMethod'] })}
                          >
                            <SelectTrigger id="paymentMethod">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Efectivo</SelectItem>
                              <SelectItem value="card">Tarjeta</SelectItem>
                              <SelectItem value="transfer">Transferencia</SelectItem>
                              <SelectItem value="mercadopago">MercadoPago</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="paidDate">Fecha de Pago</Label>
                          <Input
                            id="paidDate"
                            type="date"
                            value={formData.paidDate}
                            onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {modalMode === 'create' && (
              <Button onClick={handleCreate}>Crear Pago</Button>
            )}
            {modalMode === 'create-bulk' && (
              <Button
                onClick={handleBulkCreate}
                disabled={selectedStudents.size === 0 || !bulkConcept || !bulkDueDate}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Crear {selectedStudents.size} Pago(s)
              </Button>
            )}
            {modalMode === 'edit' && (
              <Button onClick={handleUpdate}>Guardar Cambios</Button>
            )}
            {modalMode === 'pay' && (
              <Button onClick={handleMarkAsPaid}>Registrar Pago</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
