'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  ClipboardCheck,
  CreditCard,
  Bell,
  Shield,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Gestión de Usuarios',
    description: 'Administra estudiantes, profesores, padres y personal administrativo desde un solo lugar.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BookOpen,
    title: 'Curriculum Digital',
    description: 'Organiza unidades, temas y contenido educativo de forma estructurada y accesible.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Tareas y Evaluaciones',
    description: 'Crea, asigna y califica tareas y exámenes con seguimiento en tiempo real.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Calendar,
    title: 'Horarios Inteligentes',
    description: 'Gestiona horarios de clases, evita conflictos y optimiza el uso de aulas.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Reportes y Analytics',
    description: 'Visualiza estadísticas de rendimiento, asistencia y progreso académico.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: CreditCard,
    title: 'Gestión de Pagos',
    description: 'Controla matrículas, pensiones y pagos con reportes financieros detallados.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Bell,
    title: 'Control de Asistencia',
    description: 'Registra y monitorea la asistencia diaria con alertas automáticas.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Shield,
    title: 'Seguridad Avanzada',
    description: 'Protección de datos con autenticación segura y roles personalizados.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-medium mb-4 block">
            Características
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para gestionar tu institución
          </h2>
          <p className="text-muted-foreground text-lg">
            Una plataforma completa diseñada para simplificar la administración
            educativa y mejorar la comunicación.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-transparent hover:border-primary/20">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </motion.div>
                  <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
