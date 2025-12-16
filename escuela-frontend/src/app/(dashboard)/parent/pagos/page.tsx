'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Receipt,
  User,
  Building2,
  Smartphone,
  Wallet,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { paymentsService, studentsService, type Payment, type Student } from '@/services/mock-data'

export default function ParentPagosPage() {
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState<Student[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedChild, setSelectedChild] = useState<Student | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Payment['paymentMethod']>('cash')
  const [processingPayment, setProcessingPayment] = useState(false)
  const { toast } = useToast()

  // Simular ID del padre autenticado (en producción vendría del contexto de autenticación)
  const CURRENT_PARENT_ID = 'p1' // Pedro Pérez

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allStudents, allPayments] = await Promise.all([
        studentsService.getAll(),
        paymentsService.getAll()
      ])

      // Filtrar estudiantes del padre autenticado
      const parentChildren = allStudents.filter(s => s.parentId === CURRENT_PARENT_ID)
      setChildren(parentChildren)

      if (parentChildren.length > 0) {
        setSelectedChild(parentChildren[0])
      }

      // Filtrar pagos del padre
      const parentPayments = allPayments.filter(p => p.parentId === CURRENT_PARENT_ID)
      setPayments(parentPayments)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const currentChildPayments = selectedChild
    ? payments.filter(p => p.studentId === selectedChild.id)
    : []

  const filteredPayments = selectedStatus === 'all'
    ? currentChildPayments
    : currentChildPayments.filter(p => p.status === selectedStatus)

  const totalPaid = currentChildPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0)
  const totalPending = currentChildPayments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0)
  const paidCount = currentChildPayments.filter(p => p.status === 'paid').length
  const pendingCount = currentChildPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length

  const stats = [
    { label: 'Total Pagado', value: `S/ ${totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Pendiente', value: `S/ ${totalPending.toLocaleString()}`, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { label: 'Pagos Realizados', value: paidCount, icon: Receipt, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Por Pagar', value: pendingCount, icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ]

  const paymentMethods = [
    { id: 'cash', name: 'Efectivo', description: 'Pago en caja', icon: Wallet, color: 'text-green-500' },
    { id: 'card', name: 'Tarjeta', description: 'Crédito o débito', icon: CreditCard, color: 'text-blue-500' },
    { id: 'transfer', name: 'Transferencia', description: 'Bancaria', icon: Building2, color: 'text-purple-500' },
    { id: 'mercadopago', name: 'MercadoPago', description: 'Pago digital', icon: Smartphone, color: 'text-cyan-500' },
  ] as const

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'overdue': return 'Vencido'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-600'
      case 'pending': return 'bg-yellow-500/20 text-yellow-600'
      case 'overdue': return 'bg-red-500/20 text-red-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  const handleOpenPayModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setSelectedPaymentMethod('cash')
    setPayModalOpen(true)
  }

  const handleOpenDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setDetailsModalOpen(true)
  }

  const handleProcessPayment = async () => {
    if (!selectedPayment) return

    try {
      setProcessingPayment(true)
      await paymentsService.markAsPaid(selectedPayment.id, selectedPaymentMethod)

      // Recargar datos
      await loadData()

      toast({
        title: 'Pago registrado',
        description: `El pago de S/ ${selectedPayment.amount} ha sido registrado exitosamente`,
        type: 'success'
      })

      setPayModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago',
        type: 'error'
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleDownloadReceipt = (payment: Payment) => {
    toast({
      title: 'Descargando recibo',
      description: `Recibo ${payment.invoiceNumber} descargado exitosamente`,
      type: 'success'
    })
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Pagos y Pensiones</h1>
          <p className="text-muted-foreground mt-1">Gestión de pagos escolares</p>
        </div>
      </div>

      {/* Selector de hijos */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 flex-wrap">
            {children.map((child) => (
              <motion.div
                key={child.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedChild?.id === child.id ? 'default' : 'outline'}
                  onClick={() => setSelectedChild(child)}
                  className="flex items-center gap-3 h-auto py-3 px-4"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedChild?.id === child.id ? 'bg-white/20' : 'bg-primary/10 text-primary'
                  }`}>
                    {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                    <p className="text-xs opacity-80">{child.gradeSection}</p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'overdue', 'paid'].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'all' ? 'Todos' : getStatusText(status)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pagos de {selectedChild?.firstName} ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPayments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay pagos para mostrar</p>
                </motion.div>
              ) : (
                filteredPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(payment.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{payment.concept}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Vence: {payment.dueDate}
                          </span>
                          {payment.paidDate && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Pagado: {payment.paidDate}
                            </span>
                          )}
                          {payment.invoiceNumber && (
                            <span className="flex items-center gap-1">
                              <Receipt className="h-3 w-3" />
                              {payment.invoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">S/ {payment.amount}</p>
                    </div>
                    <div className="flex gap-2">
                      {payment.status === 'paid' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Recibo
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenPayModal(payment)}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetailsModal(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Resumen por hijo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Hijo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map((child, index) => {
                const childPayments = payments.filter(p => p.studentId === child.id)
                const childPaid = childPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0)
                const childPending = childPayments.filter(p => p.status !== 'paid').reduce((acc, p) => acc + p.amount, 0)
                const childTotal = childPaid + childPending

                return (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                        {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{child.firstName} {child.lastName}</p>
                        <p className="text-xs text-muted-foreground">{child.gradeSection}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pagado</span>
                        <span className="font-medium text-green-600">S/ {childPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pendiente</span>
                        <span className="font-medium text-yellow-600">S/ {childPending.toLocaleString()}</span>
                      </div>
                      {childTotal > 0 && (
                        <>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(childPaid / childTotal) * 100}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-full bg-green-500"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {((childPaid / childTotal) * 100).toFixed(0)}% completado
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${method.color.replace('text-', 'bg-')}/10`}>
                      <method.icon className={`h-5 w-5 ${method.color}`} />
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de pago */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Realizar Pago</DialogTitle>
            <DialogDescription>
              Seleccione el método de pago para procesar el pago
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{selectedPayment.concept}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.studentName}</p>
                  </div>
                  <p className="text-xl font-bold">S/ {selectedPayment.amount}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Vencimiento: {selectedPayment.dueDate}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Método de Pago</Label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod(method.id as Payment['paymentMethod'])}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <method.icon className={`h-5 w-5 ${method.color}`} />
                      </div>
                      <p className="font-medium text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayModalOpen(false)}
              disabled={processingPayment}
            >
              Cancelar
            </Button>
            <Button onClick={handleProcessPayment} disabled={processingPayment}>
              {processingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Pago</DialogTitle>
            <DialogDescription>
              Información completa del pago
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusText(selectedPayment.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estudiante</span>
                  <span className="font-medium">{selectedPayment.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Grado</span>
                  <span className="font-medium">{selectedPayment.gradeSection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Concepto</span>
                  <span className="font-medium">{selectedPayment.concept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto</span>
                  <span className="text-lg font-bold">S/ {selectedPayment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha de Vencimiento</span>
                  <span className="font-medium">{selectedPayment.dueDate}</span>
                </div>

                {selectedPayment.status === 'paid' && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Fecha de Pago</span>
                        <span className="font-medium">{selectedPayment.paidDate}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Método de Pago</span>
                        <span className="font-medium capitalize">
                          {selectedPayment.paymentMethod === 'cash' && 'Efectivo'}
                          {selectedPayment.paymentMethod === 'card' && 'Tarjeta'}
                          {selectedPayment.paymentMethod === 'transfer' && 'Transferencia'}
                          {selectedPayment.paymentMethod === 'mercadopago' && 'MercadoPago'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">N° de Factura</span>
                        <span className="font-medium">{selectedPayment.invoiceNumber}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {selectedPayment.status === 'paid' && (
                <Button
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Recibo
                </Button>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
