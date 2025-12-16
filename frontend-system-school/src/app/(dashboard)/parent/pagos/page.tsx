'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Receipt,
  User,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const children = [
  { id: 1, name: 'María García', avatar: 'MG', grade: '5to A Primaria' },
  { id: 2, name: 'José García', avatar: 'JG', grade: '3ro B Primaria' },
]

interface Payment {
  id: number
  concept: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paidDate?: string
  childId: number
  paymentMethod?: string
}

const allPayments: Payment[] = [
  // Pagos de María
  {
    id: 1,
    concept: 'Mensualidad Enero 2025',
    amount: 350,
    dueDate: '2025-01-05',
    status: 'pending',
    childId: 1
  },
  {
    id: 2,
    concept: 'Mensualidad Diciembre 2024',
    amount: 350,
    dueDate: '2024-12-05',
    status: 'paid',
    paidDate: '2024-12-03',
    paymentMethod: 'Transferencia',
    childId: 1
  },
  {
    id: 3,
    concept: 'Materiales Educativos',
    amount: 75,
    dueDate: '2024-12-15',
    status: 'pending',
    childId: 1
  },
  {
    id: 4,
    concept: 'Mensualidad Noviembre 2024',
    amount: 350,
    dueDate: '2024-11-05',
    status: 'paid',
    paidDate: '2024-11-04',
    paymentMethod: 'Efectivo',
    childId: 1
  },
  // Pagos de José
  {
    id: 5,
    concept: 'Mensualidad Enero 2025',
    amount: 320,
    dueDate: '2025-01-05',
    status: 'pending',
    childId: 2
  },
  {
    id: 6,
    concept: 'Mensualidad Diciembre 2024',
    amount: 320,
    dueDate: '2024-12-05',
    status: 'overdue',
    childId: 2
  },
  {
    id: 7,
    concept: 'Excursión Educativa',
    amount: 50,
    dueDate: '2024-12-20',
    status: 'pending',
    childId: 2
  },
  {
    id: 8,
    concept: 'Mensualidad Noviembre 2024',
    amount: 320,
    dueDate: '2024-11-05',
    status: 'paid',
    paidDate: '2024-11-05',
    paymentMethod: 'Tarjeta',
    childId: 2
  },
]

export default function ParentPagosPage() {
  const [selectedChild, setSelectedChild] = useState<number | 'all'>('all')
  const [filter, setFilter] = useState('all')

  const filteredPayments = allPayments.filter(payment => {
    const matchesChild = selectedChild === 'all' || payment.childId === selectedChild
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && (payment.status === 'pending' || payment.status === 'overdue')) ||
      (filter === 'paid' && payment.status === 'paid')
    return matchesChild && matchesFilter
  })

  const getChildName = (childId: number) => {
    return children.find(c => c.id === childId)?.name || 'Desconocido'
  }

  const getStats = () => {
    const payments = selectedChild === 'all' ? allPayments : allPayments.filter(p => p.childId === selectedChild)
    const pending = payments.filter(p => p.status === 'pending' || p.status === 'overdue')
    const paid = payments.filter(p => p.status === 'paid')
    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((acc, p) => acc + p.amount, 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((acc, p) => acc + p.amount, 0),
      overdueCount: payments.filter(p => p.status === 'overdue').length,
    }
  }

  const stats = getStats()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-600">Pendiente</span>
      case 'paid':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600">Pagado</span>
      case 'overdue':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-600">Vencido</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Pagos</h1>
          <p className="text-muted-foreground mt-1">Control de pagos de mis hijos</p>
        </div>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Realizar Pago
        </Button>
      </div>

      {/* Child Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Button
              variant={selectedChild === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedChild('all')}
            >
              Todos los Hijos
            </Button>
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                onClick={() => setSelectedChild(child.id)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={selectedChild === child.id ? 'bg-primary-foreground text-primary' : 'bg-primary/10 text-primary'}>
                    {child.avatar}
                  </AvatarFallback>
                </Avatar>
                {child.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Por Pagar', value: `S/ ${stats.pendingAmount}`, subValue: `${stats.pendingCount} pagos`, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Pagados', value: `S/ ${stats.paidAmount}`, subValue: `${stats.paidCount} pagos`, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Vencidos', value: stats.overdueCount.toString(), subValue: 'requieren atención', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Total Hijos', value: children.length.toString(), subValue: 'registrados', icon: User, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        ].map((stat, index) => (
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
                    <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert for overdue payments */}
      {stats.overdueCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-600">Pagos Vencidos</p>
                  <p className="text-sm text-muted-foreground">
                    Tiene {stats.overdueCount} pago(s) vencido(s). Por favor regularice su situación.
                  </p>
                </div>
                <Button variant="destructive">
                  Pagar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'paid', label: 'Pagados' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay pagos en esta categoría</p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-all ${
                payment.status === 'overdue' ? 'border-red-500/50' : 'hover:border-primary/50'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{payment.concept}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {selectedChild === 'all' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                            <User className="h-3 w-3" />
                            {getChildName(payment.childId)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Vence: {payment.dueDate}
                        </span>
                        {payment.paidDate && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Pagado: {payment.paidDate}
                          </span>
                        )}
                        {payment.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {payment.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          payment.status === 'overdue' ? 'text-red-500' :
                          payment.status === 'pending' ? 'text-orange-500' : 'text-green-500'
                        }`}>
                          S/ {payment.amount}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {payment.status === 'paid' ? (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Comprobante
                          </Button>
                        ) : (
                          <Button size="sm" variant={payment.status === 'overdue' ? 'destructive' : 'default'}>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary by Child */}
      {selectedChild === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Hijo</CardTitle>
            <CardDescription>Estado de pagos de cada hijo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map((child, index) => {
                const childPayments = allPayments.filter(p => p.childId === child.id)
                const pending = childPayments.filter(p => p.status === 'pending' || p.status === 'overdue')
                const paid = childPayments.filter(p => p.status === 'paid')
                const pendingAmount = pending.reduce((acc, p) => acc + p.amount, 0)
                const hasOverdue = childPayments.some(p => p.status === 'overdue')

                return (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      hasOverdue ? 'bg-red-500/10 border border-red-500/30' : 'bg-muted/30'
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {child.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-muted-foreground">{child.grade}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-orange-500" />
                          {pending.length} pendientes
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {paid.length} pagados
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${hasOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                        S/ {pendingAmount}
                      </p>
                      <p className="text-xs text-muted-foreground">por pagar</p>
                    </div>
                    <Button
                      variant={hasOverdue ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedChild(child.id)}
                    >
                      Ver Pagos
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
