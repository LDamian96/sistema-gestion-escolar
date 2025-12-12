'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BookOpen,
  Calendar,
  Download,
  FileText,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const stats = [
  { label: 'Total Estudiantes', value: '1,284', change: '+12%', trend: 'up', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Ingresos Mensuales', value: '$45,280', change: '+8%', trend: 'up', icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: 'Cursos Activos', value: '24', change: '+2', trend: 'up', icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { label: 'Tasa de Asistencia', value: '94.5%', change: '-1.2%', trend: 'down', icon: Calendar, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
]

const reports = [
  { name: 'Reporte de Matrículas', description: 'Resumen mensual de nuevas matrículas', type: 'PDF', date: 'Hace 2 días' },
  { name: 'Informe Financiero', description: 'Balance de ingresos y gastos', type: 'Excel', date: 'Hace 1 semana' },
  { name: 'Reporte de Asistencia', description: 'Estadísticas de asistencia por grado', type: 'PDF', date: 'Hace 3 días' },
  { name: 'Rendimiento Académico', description: 'Promedios y calificaciones por curso', type: 'PDF', date: 'Ayer' },
  { name: 'Pagos Pendientes', description: 'Lista de pagos vencidos', type: 'Excel', date: 'Hoy' },
]

const monthlyData = [
  { month: 'Ene', students: 1200, income: 42000 },
  { month: 'Feb', students: 1220, income: 43500 },
  { month: 'Mar', students: 1245, income: 44200 },
  { month: 'Abr', students: 1260, income: 44800 },
  { month: 'May', students: 1270, income: 45000 },
  { month: 'Jun', students: 1284, income: 45280 },
]

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground mt-1">Análisis y métricas del sistema</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Generar Reporte
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
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Crecimiento de Estudiantes
              </CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {monthlyData.map((data, index) => (
                  <motion.div
                    key={data.month}
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.students / 1300) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="flex-1 bg-primary/80 rounded-t-lg relative group cursor-pointer hover:bg-primary transition-colors"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.students} estudiantes
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                      {data.month}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución de Ingresos
              </CardTitle>
              <CardDescription>Por concepto de pago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Mensualidades', value: 65, color: 'bg-blue-500' },
                  { label: 'Matrículas', value: 20, color: 'bg-green-500' },
                  { label: 'Uniformes', value: 8, color: 'bg-purple-500' },
                  { label: 'Excursiones', value: 5, color: 'bg-orange-500' },
                  { label: 'Otros', value: 2, color: 'bg-pink-500' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reportes Recientes</CardTitle>
                <CardDescription>Documentos generados recientemente</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <motion.div
                  key={report.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-3 rounded-xl ${
                    report.type === 'PDF' ? 'bg-red-500/10' : 'bg-green-500/10'
                  }`}>
                    <FileText className={`h-5 w-5 ${
                      report.type === 'PDF' ? 'text-red-500' : 'text-green-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.type === 'PDF' ? 'bg-red-500/20 text-red-600' : 'bg-green-500/20 text-green-600'
                    }`}>
                      {report.type}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{report.date}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
