'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Loader2,
  GraduationCap,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface Student {
  id: string
  firstName: string
  lastName: string
  enrollmentCode: string
  enrollments: Array<{
    classroom: {
      section: {
        name: string
        gradeLevel: { name: string }
      }
    }
  }>
}

interface ParentData {
  id: string
  firstName: string
  lastName: string
  students: Student[]
}

interface Grade {
  id: string
  score: number
  course: {
    subject: { name: string }
  }
  student: {
    firstName: string
    lastName: string
  }
  period: {
    name: string
  }
  createdAt: string
}

interface Payment {
  id: string
  amount: number
  description: string
  status: string
  dueDate: string
  student: {
    firstName: string
    lastName: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ParentDashboardPage() {
  const { user } = useAuth()
  const [parentData, setParentData] = useState<ParentData | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [parentsData, gradesData, paymentsData] = await Promise.all([
        api.get<ParentData[]>('/parents'),
        api.get<Grade[]>('/grades'),
        api.get<Payment[]>('/payments')
      ])

      // El padre logueado debería obtener solo su información
      if (parentsData.length > 0) {
        setParentData(parentsData[0])
      }
      setGrades(gradesData)
      setPayments(paymentsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
  const childrenCount = parentData?.students?.length || 0

  const stats = [
    {
      title: 'Hijos Registrados',
      value: childrenCount.toString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Calificaciones',
      value: grades.length.toString(),
      icon: GraduationCap,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pagos Pendientes',
      value: pendingPayments.length.toString(),
      icon: CreditCard,
      color: pendingPayments.length > 0 ? 'text-orange-500' : 'text-green-500',
      bgColor: pendingPayments.length > 0 ? 'bg-orange-500/10' : 'bg-green-500/10',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            Bienvenido, {user?.profile?.firstName || 'Padre'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Seguimiento académico de sus hijos
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/parent/calificaciones">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Calificaciones
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Children Cards */}
      {parentData?.students && parentData.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-heading text-xl font-semibold mb-4">Mis Hijos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parentData.students.map((child, index) => {
              const childGrades = grades.filter(g =>
                g.student.firstName === child.firstName && g.student.lastName === child.lastName
              )
              const averageGrade = childGrades.length > 0
                ? childGrades.reduce((acc, g) => acc + g.score, 0) / childGrades.length
                : 0
              const childPayments = payments.filter(p =>
                p.student.firstName === child.firstName && p.student.lastName === child.lastName
              )
              const hasPendingPayment = childPayments.some(p => p.status === 'PENDING' || p.status === 'OVERDUE')

              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {getInitials(child.firstName, child.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{child.firstName} {child.lastName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {child.enrollments?.[0]?.classroom?.section?.gradeLevel?.name || 'Sin grado'}{' '}
                                {child.enrollments?.[0]?.classroom?.section?.name || ''}
                              </p>
                              <p className="text-xs text-muted-foreground">Código: {child.enrollmentCode}</p>
                            </div>
                            {hasPendingPayment && (
                              <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 rounded-full flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Pago pendiente
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground">Promedio</p>
                              <p className={`text-xl font-bold ${
                                averageGrade >= 16 ? 'text-green-500' :
                                averageGrade >= 11 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {averageGrade > 0 ? averageGrade.toFixed(1) : '-'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground">Calificaciones</p>
                              <p className="text-xl font-bold text-blue-500">{childGrades.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href="/parent/calificaciones" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Ver Notas
                          </Button>
                        </Link>
                        <Link href="/parent/asistencia" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Asistencia
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Calificaciones Recientes</CardTitle>
                  <CardDescription>Últimas evaluaciones registradas</CardDescription>
                </div>
                <Link href="/parent/calificaciones">
                  <Button variant="ghost" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay calificaciones registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grades.slice(0, 5).map((grade, index) => (
                    <motion.div
                      key={grade.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        grade.score >= 16 ? 'bg-green-500/20 text-green-600' :
                        grade.score >= 11 ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'
                      }`}>
                        {grade.score.toFixed(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{grade.course.subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.student.firstName} - {grade.period.name}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estado de Pagos</CardTitle>
                  <CardDescription>Pagos registrados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        payment.status === 'PAID' ? 'bg-green-500/20' :
                        payment.status === 'PENDING' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          payment.status === 'PAID' ? 'text-green-600' :
                          payment.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.student.firstName} - S/. {payment.amount.toFixed(2)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'PAID' ? 'bg-green-500/20 text-green-600' :
                        payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'
                      }`}>
                        {payment.status === 'PAID' ? 'Pagado' :
                         payment.status === 'PENDING' ? 'Pendiente' : 'Vencido'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
