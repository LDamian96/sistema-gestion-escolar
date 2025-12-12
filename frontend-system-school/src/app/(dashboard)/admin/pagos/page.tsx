'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Calendar,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const payments = [
  { id: 1, student: 'María García', concept: 'Mensualidad Enero', amount: 450, date: '2024-01-15', status: 'paid', method: 'Tarjeta', avatar: 'MG' },
  { id: 2, student: 'Carlos Ruiz', concept: 'Mensualidad Enero', amount: 450, date: '2024-01-14', status: 'pending', method: '-', avatar: 'CR' },
  { id: 3, student: 'Laura Méndez', concept: 'Matrícula 2024', amount: 800, date: '2024-01-13', status: 'paid', method: 'Transferencia', avatar: 'LM' },
  { id: 4, student: 'Diego Torres', concept: 'Mensualidad Enero', amount: 450, date: '2024-01-12', status: 'overdue', method: '-', avatar: 'DT' },
  { id: 5, student: 'Sofía López', concept: 'Uniformes', amount: 150, date: '2024-01-11', status: 'paid', method: 'Efectivo', avatar: 'SL' },
  { id: 6, student: 'Andrés Flores', concept: 'Mensualidad Enero', amount: 450, date: '2024-01-10', status: 'paid', method: 'Tarjeta', avatar: 'AF' },
  { id: 7, student: 'Valentina Díaz', concept: 'Excursión', amount: 75, date: '2024-01-09', status: 'pending', method: '-', avatar: 'VD' },
  { id: 8, student: 'Mateo Sánchez', concept: 'Mensualidad Enero', amount: 450, date: '2024-01-08', status: 'paid', method: 'Transferencia', avatar: 'MS' },
]

const stats = [
  { label: 'Ingresos del Mes', value: '$45,280', icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10', trend: '+12%' },
  { label: 'Pagos Recibidos', value: '892', icon: CheckCircle2, color: 'text-blue-500', bgColor: 'bg-blue-500/10', trend: '+8%' },
  { label: 'Pendientes', value: '$12,450', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', trend: '-5%' },
  { label: 'Vencidos', value: '$3,200', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10', trend: '+2%' },
]

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600">Pagado</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-600">Pendiente</span>
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
          <h1 className="font-heading text-3xl font-bold">Gestión de Pagos</h1>
          <p className="text-muted-foreground mt-1">Control de pagos y finanzas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Registrar Pago
          </Button>
        </div>
      </div>

      {/* Stats */}
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend}
                  </span>
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
                placeholder="Buscar por estudiante..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'paid', label: 'Pagados' },
                { value: 'pending', label: 'Pendientes' },
                { value: 'overdue', label: 'Vencidos' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Lista de transacciones recientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {payment.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{payment.student}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{payment.concept}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {payment.date}
                    </span>
                    {payment.method !== '-' && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {payment.method}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${payment.amount}</p>
                  {payment.status !== 'paid' && (
                    <Button size="sm" className="mt-2">
                      Registrar Pago
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
