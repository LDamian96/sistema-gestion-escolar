'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  FileText,
  Calendar,
  GraduationCap,
  BookOpen,
  Loader2,
  FileDown,
  FileSpreadsheet,
  CheckSquare,
  ClipboardCheck,
  Sun
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  studentsService,
  teachersService,
  paymentsService,
  gradeSectionsService,
  tasksService,
  examsService,
  type Student,
  type Teacher,
  type Payment,
  type GradeSection,
  type Task,
  type Exam
} from '@/services/mock-data'

type ReportType = 'asistencia' | 'tareas' | 'examenes' | 'pagos' | 'estudiantes' | 'profesores'

interface ReportFilters {
  reportType: ReportType
  dateFrom: string
  dateTo: string
  gradeSection: string
  turno: string
}

interface ReportStats {
  total: number
  active: number
  inactive: number
  percentage?: number
  amount?: number
}

export default function ReportesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [exams, setExams] = useState<Exam[]>([])

  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'estudiantes',
    dateFrom: '2024-12-01',
    dateTo: '2024-12-15',
    gradeSection: 'todos',
    turno: 'todos'
  })

  const [reportStats, setReportStats] = useState<ReportStats>({
    total: 0,
    active: 0,
    inactive: 0
  })

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [studentsData, teachersData, paymentsData, gradeSectionsData, tasksData, examsData] = await Promise.all([
        studentsService.getAll(),
        teachersService.getAll(),
        paymentsService.getAll(),
        gradeSectionsService.getAll(),
        tasksService.getAll(),
        examsService.getAll()
      ])
      setStudents(studentsData)
      setTeachers(teachersData)
      setPayments(paymentsData)
      setGradeSections(gradeSectionsData)
      setTasks(tasksData)
      setExams(examsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      })
    }
  }

  // Get unique turnos
  const turnos = [...new Set(gradeSections.map(gs => gs.turno))]

  const handleGenerateReport = async () => {
    setLoading(true)
    setReportGenerated(false)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Calculate stats based on report type
    let stats: ReportStats = { total: 0, active: 0, inactive: 0 }

    switch (filters.reportType) {
      case 'estudiantes':
        const filteredStudents = filters.gradeSection === 'todos'
          ? students
          : students.filter(s => s.gradeSection === filters.gradeSection)
        stats = {
          total: filteredStudents.length,
          active: filteredStudents.filter(s => s.status === 'active').length,
          inactive: filteredStudents.filter(s => s.status === 'inactive').length,
          percentage: filteredStudents.length > 0
            ? (filteredStudents.filter(s => s.status === 'active').length / filteredStudents.length) * 100
            : 0
        }
        break

      case 'profesores':
        stats = {
          total: teachers.length,
          active: teachers.filter(t => t.status === 'active').length,
          inactive: teachers.filter(t => t.status === 'inactive').length,
          percentage: teachers.length > 0
            ? (teachers.filter(t => t.status === 'active').length / teachers.length) * 100
            : 0
        }
        break

      case 'pagos':
        const filteredPayments = payments.filter(p => {
          const dueDate = new Date(p.dueDate)
          const from = new Date(filters.dateFrom)
          const to = new Date(filters.dateTo)
          return dueDate >= from && dueDate <= to
        })
        const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
        const paidAmount = filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
        stats = {
          total: filteredPayments.length,
          active: filteredPayments.filter(p => p.status === 'paid').length,
          inactive: filteredPayments.filter(p => p.status !== 'paid').length,
          amount: totalAmount,
          percentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
        }
        break

      case 'asistencia':
        // Mock attendance data
        stats = {
          total: 100,
          active: 94,
          inactive: 6,
          percentage: 94
        }
        break

      case 'tareas':
        const filteredTasks = tasks.filter(t => {
          const dueDate = new Date(t.dueDate)
          const from = new Date(filters.dateFrom)
          const to = new Date(filters.dateTo)
          const matchesDate = dueDate >= from && dueDate <= to
          const matchesGradeSection = filters.gradeSection === 'todos' || t.gradeSection === filters.gradeSection
          return matchesDate && matchesGradeSection
        })
        const completedTasks = filteredTasks.filter(t => t.status === 'closed').length
        stats = {
          total: filteredTasks.length,
          active: completedTasks,
          inactive: filteredTasks.length - completedTasks,
          percentage: filteredTasks.length > 0 ? (completedTasks / filteredTasks.length) * 100 : 0
        }
        break

      case 'examenes':
        const filteredExams = exams.filter(e => {
          const examDate = new Date(e.date)
          const from = new Date(filters.dateFrom)
          const to = new Date(filters.dateTo)
          const matchesDate = examDate >= from && examDate <= to
          const matchesGradeSection = filters.gradeSection === 'todos' || e.gradeSection === filters.gradeSection
          return matchesDate && matchesGradeSection
        })
        const completedExams = filteredExams.filter(e => e.status === 'completed').length
        stats = {
          total: filteredExams.length,
          active: completedExams,
          inactive: filteredExams.length - completedExams,
          percentage: filteredExams.length > 0 ? (completedExams / filteredExams.length) * 100 : 0
        }
        break
    }

    setReportStats(stats)
    setLoading(false)
    setReportGenerated(true)

    toast({
      title: 'Reporte Generado',
      description: 'El reporte se ha generado correctamente',
    })
  }

  const handleExportPDF = () => {
    toast({
      title: 'Exportando a PDF',
      description: 'El archivo se descargará en breve...',
    })
  }

  const handleExportExcel = () => {
    toast({
      title: 'Exportando a Excel',
      description: 'El archivo se descargará en breve...',
    })
  }

  const getReportTitle = () => {
    const titles = {
      asistencia: 'Reporte de Asistencia',
      tareas: 'Reporte de Tareas',
      examenes: 'Reporte de Exámenes',
      pagos: 'Reporte de Pagos',
      estudiantes: 'Reporte de Estudiantes',
      profesores: 'Reporte de Profesores'
    }
    return titles[filters.reportType]
  }

  const getReportIcon = () => {
    const icons = {
      asistencia: Calendar,
      tareas: CheckSquare,
      examenes: ClipboardCheck,
      pagos: DollarSign,
      estudiantes: Users,
      profesores: GraduationCap
    }
    return icons[filters.reportType]
  }

  const summaryStats = [
    {
      label: 'Total de Estudiantes',
      value: students.length.toString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Tasa de Asistencia',
      value: '94%',
      change: '+2%',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Recaudación Mensual',
      value: `S/ ${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      change: '+8%',
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Profesores Activos',
      value: teachers.filter(t => t.status === 'active').length.toString(),
      change: '+3',
      icon: GraduationCap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground mt-1">Generación de reportes personalizados</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value) => setFilters({ ...filters, reportType: value as ReportType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asistencia">Asistencia</SelectItem>
                  <SelectItem value="tareas">Tareas</SelectItem>
                  <SelectItem value="examenes">Exámenes</SelectItem>
                  <SelectItem value="pagos">Pagos</SelectItem>
                  <SelectItem value="estudiantes">Estudiantes</SelectItem>
                  <SelectItem value="profesores">Profesores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Grado/Sección</Label>
              <Select
                value={filters.gradeSection}
                onValueChange={(value) => setFilters({ ...filters, gradeSection: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {gradeSections.map((gs) => (
                    <SelectItem key={gs.id} value={`${gs.grade} ${gs.section}`}>
                      {gs.grade} {gs.section} - {gs.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Turno</Label>
              <Select
                value={filters.turno}
                onValueChange={(value) => setFilters({ ...filters, turno: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {turnos.map((turno) => (
                    <SelectItem key={turno} value={turno}>
                      {turno}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>

            {reportGenerated && (
              <>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-medium">Generando reporte...</h3>
                  <p className="text-sm text-muted-foreground">Por favor espere un momento</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {reportGenerated && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Report Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{reportStats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">{reportStats.active}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filters.reportType === 'pagos' ? 'Pagados' :
                       filters.reportType === 'tareas' ? 'Cerradas' :
                       filters.reportType === 'examenes' ? 'Completados' : 'Activos'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-500">{reportStats.inactive}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filters.reportType === 'pagos' ? 'Pendientes' :
                       filters.reportType === 'tareas' ? 'Pendientes' :
                       filters.reportType === 'examenes' ? 'Programados' : 'Inactivos'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-500">
                      {reportStats.percentage?.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Tasa</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = getReportIcon()
                      return <Icon className="h-6 w-6 text-primary" />
                    })()}
                    <CardTitle>{getReportTitle()}</CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filters.dateFrom} - {filters.dateTo}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Chart */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {filters.reportType === 'pagos' ? 'Tasa de Pago' :
                         filters.reportType === 'tareas' ? 'Tasa de Cierre' :
                         filters.reportType === 'examenes' ? 'Tasa de Completitud' : 'Tasa de Actividad'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportStats.percentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${reportStats.percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {filters.reportType === 'pagos' && reportStats.amount && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Monto Total</span>
                        <span className="text-sm font-bold text-green-600">
                          S/ {reportStats.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          {filters.reportType === 'estudiantes' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Grado</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                            </>
                          )}
                          {filters.reportType === 'profesores' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Especialización</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                            </>
                          )}
                          {filters.reportType === 'pagos' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estudiante</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Concepto</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Monto</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                            </>
                          )}
                          {filters.reportType === 'asistencia' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estudiante</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Grado</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Asistencias</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                            </>
                          )}
                          {filters.reportType === 'tareas' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-medium">Título</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Materia</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Grado</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Fecha Entrega</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                            </>
                          )}
                          {filters.reportType === 'examenes' && (
                            <>
                              <th className="px-4 py-3 text-left text-sm font-medium">Título</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Materia</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Grado</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Promedio</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filters.reportType === 'estudiantes' &&
                          (filters.gradeSection === 'todos'
                            ? students
                            : students.filter(s => s.gradeSection === filters.gradeSection)
                          ).slice(0, 10).map((student, index) => (
                            <motion.tr
                              key={student.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-muted/30"
                            >
                              <td className="px-4 py-3 text-sm">{student.code}</td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {student.firstName} {student.lastName}
                              </td>
                              <td className="px-4 py-3 text-sm">{student.gradeSection}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  student.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {student.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                            </motion.tr>
                          ))
                        }

                        {filters.reportType === 'profesores' &&
                          teachers.slice(0, 10).map((teacher, index) => (
                            <motion.tr
                              key={teacher.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-muted/30"
                            >
                              <td className="px-4 py-3 text-sm">{teacher.code}</td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {teacher.firstName} {teacher.lastName}
                              </td>
                              <td className="px-4 py-3 text-sm">{teacher.specialization}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  teacher.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {teacher.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                            </motion.tr>
                          ))
                        }

                        {filters.reportType === 'pagos' &&
                          payments
                            .filter(p => {
                              const dueDate = new Date(p.dueDate)
                              const from = new Date(filters.dateFrom)
                              const to = new Date(filters.dateTo)
                              return dueDate >= from && dueDate <= to
                            })
                            .slice(0, 10)
                            .map((payment, index) => (
                              <motion.tr
                                key={payment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-muted/30"
                              >
                                <td className="px-4 py-3 text-sm font-medium">{payment.studentName}</td>
                                <td className="px-4 py-3 text-sm">{payment.concept}</td>
                                <td className="px-4 py-3 text-sm font-semibold">S/ {payment.amount}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'paid'
                                      ? 'bg-green-100 text-green-700'
                                      : payment.status === 'overdue'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {payment.status === 'paid' ? 'Pagado' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                        }

                        {filters.reportType === 'asistencia' &&
                          students.slice(0, 10).map((student, index) => {
                            const mockValue = `${Math.floor(85 + Math.random() * 15)}%`
                            return (
                              <motion.tr
                                key={student.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-muted/30"
                              >
                                <td className="px-4 py-3 text-sm font-medium">
                                  {student.firstName} {student.lastName}
                                </td>
                                <td className="px-4 py-3 text-sm">{student.gradeSection}</td>
                                <td className="px-4 py-3 text-sm font-semibold">{mockValue}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Regular
                                  </span>
                                </td>
                              </motion.tr>
                            )
                          })
                        }

                        {filters.reportType === 'tareas' &&
                          tasks
                            .filter(t => {
                              const dueDate = new Date(t.dueDate)
                              const from = new Date(filters.dateFrom)
                              const to = new Date(filters.dateTo)
                              const matchesDate = dueDate >= from && dueDate <= to
                              const matchesGradeSection = filters.gradeSection === 'todos' || t.gradeSection === filters.gradeSection
                              return matchesDate && matchesGradeSection
                            })
                            .slice(0, 10)
                            .map((task, index) => (
                              <motion.tr
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-muted/30"
                              >
                                <td className="px-4 py-3 text-sm font-medium">{task.title}</td>
                                <td className="px-4 py-3 text-sm">{task.courseName}</td>
                                <td className="px-4 py-3 text-sm">{task.gradeSection}</td>
                                <td className="px-4 py-3 text-sm">{task.dueDate}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    task.status === 'closed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {task.status === 'closed' ? 'Cerrada' : 'Pendiente'}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                        }

                        {filters.reportType === 'examenes' &&
                          exams
                            .filter(e => {
                              const examDate = new Date(e.date)
                              const from = new Date(filters.dateFrom)
                              const to = new Date(filters.dateTo)
                              const matchesDate = examDate >= from && examDate <= to
                              const matchesGradeSection = filters.gradeSection === 'todos' || e.gradeSection === filters.gradeSection
                              return matchesDate && matchesGradeSection
                            })
                            .slice(0, 10)
                            .map((exam, index) => (
                              <motion.tr
                                key={exam.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-muted/30"
                              >
                                <td className="px-4 py-3 text-sm font-medium">{exam.title}</td>
                                <td className="px-4 py-3 text-sm">{exam.courseName}</td>
                                <td className="px-4 py-3 text-sm">{exam.gradeSection}</td>
                                <td className="px-4 py-3 text-sm">{exam.date}</td>
                                <td className="px-4 py-3 text-sm font-semibold">
                                  {exam.averageScore ? `${exam.averageScore.toFixed(1)} / ${exam.maxScore}` : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    exam.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : exam.status === 'scheduled'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {exam.status === 'completed' ? 'Completado' : exam.status === 'scheduled' ? 'Programado' : 'En progreso'}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground text-center">
                  Mostrando primeros 10 resultados del reporte
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualization Charts */}
      {!loading && !reportGenerated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Grado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gradeSections.slice(0, 6).map((gs, index) => {
                  const percentage = (gs.currentStudents / gs.capacity) * 100
                  return (
                    <motion.div
                      key={gs.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{gs.grade} {gs.section}</span>
                        <span className="text-sm text-muted-foreground">
                          {gs.currentStudents}/{gs.capacity} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Pagados', 'Pendientes', 'Vencidos'].map((status, index) => {
                  const count = status === 'Pagados'
                    ? payments.filter(p => p.status === 'paid').length
                    : status === 'Pendientes'
                    ? payments.filter(p => p.status === 'pending').length
                    : payments.filter(p => p.status === 'overdue').length
                  const percentage = (count / payments.length) * 100
                  const color = status === 'Pagados'
                    ? 'bg-green-500'
                    : status === 'Pendientes'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'

                  return (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{status}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className={`h-full ${color} rounded-full`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
