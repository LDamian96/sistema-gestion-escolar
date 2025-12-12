'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const enrollments = [
  { id: 1, student: 'María García', grade: '5to Grado', date: '2024-01-15', status: 'approved', parent: 'José García', avatar: 'MG' },
  { id: 2, student: 'Carlos Ruiz', grade: '6to Grado', date: '2024-01-14', status: 'pending', parent: 'Ana Ruiz', avatar: 'CR' },
  { id: 3, student: 'Laura Méndez', grade: '4to Grado', date: '2024-01-13', status: 'approved', parent: 'Pedro Méndez', avatar: 'LM' },
  { id: 4, student: 'Diego Torres', grade: '3er Grado', date: '2024-01-12', status: 'rejected', parent: 'Carmen Torres', avatar: 'DT' },
  { id: 5, student: 'Sofía López', grade: '5to Grado', date: '2024-01-11', status: 'pending', parent: 'Roberto López', avatar: 'SL' },
  { id: 6, student: 'Andrés Flores', grade: '6to Grado', date: '2024-01-10', status: 'approved', parent: 'María Flores', avatar: 'AF' },
  { id: 7, student: 'Valentina Díaz', grade: '4to Grado', date: '2024-01-09', status: 'approved', parent: 'Juan Díaz', avatar: 'VD' },
  { id: 8, student: 'Mateo Sánchez', grade: '3er Grado', date: '2024-01-08', status: 'pending', parent: 'Laura Sánchez', avatar: 'MS' },
]

const stats = [
  { label: 'Total Matrículas', value: '1,284', icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Aprobadas', value: '1,150', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: 'Pendientes', value: '98', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { label: 'Rechazadas', value: '36', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
]

export default function MatriculasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.student.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Aprobada</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-600 flex items-center gap-1"><Clock className="h-3 w-3" /> Pendiente</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rechazada</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Matrículas</h1>
          <p className="text-muted-foreground mt-1">Gestiona las matrículas de estudiantes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Matrícula
        </Button>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiante..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'approved', label: 'Aprobadas' },
                { value: 'pending', label: 'Pendientes' },
                { value: 'rejected', label: 'Rechazadas' },
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

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Matrícula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEnrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {enrollment.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{enrollment.student}</p>
                    {getStatusBadge(enrollment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {enrollment.grade}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {enrollment.parent}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {enrollment.date}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {enrollment.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost">
                    Ver Detalles
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
