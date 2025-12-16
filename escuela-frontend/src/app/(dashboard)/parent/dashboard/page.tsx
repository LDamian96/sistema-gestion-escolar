'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  User,
  Users,
  FileText,
  CreditCard,
  ArrowRight,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import {
  studentsService,
  parentsService,
  gradeSectionsService,
  type Parent,
  type Student,
  type GradeSection
} from '@/services/mock-data'

interface ChildData {
  student: Student
  gradeSection: GradeSection | null
}

export default function ParentDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [parent, setParent] = useState<Parent | null>(null)
  const [childrenData, setChildrenData] = useState<ChildData[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const parents = await parentsService.getAll()
      const currentParent = parents.find(p => p.id === 'p1')

      if (currentParent) {
        setParent(currentParent)

        const [students, gradeSections] = await Promise.all([
          studentsService.getAll(),
          gradeSectionsService.getAll()
        ])

        const children: ChildData[] = []
        currentParent.childrenIds.forEach((childId) => {
          const student = students.find(s => s.id === childId)
          if (student) {
            const gs = gradeSections.find(g => `${g.grade} ${g.section}` === student.gradeSection)
            children.push({ student, gradeSection: gs || null })
          }
        })

        setChildrenData(children)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se pudo cargar la informacion</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {parent.firstName}</h1>
          <p className="text-muted-foreground">Panel de Padre/Tutor</p>
        </div>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Notificaciones
        </Button>
      </div>

      {/* Hijos Registrados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mis Hijos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childrenData.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay hijos registrados</p>
          ) : (
            <div className="space-y-3">
              {childrenData.map((child, index) => (
                <motion.div
                  key={child.student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {child.student.firstName[0]}{child.student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{child.student.firstName} {child.student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{child.student.code}</p>
                  </div>
                  <Badge variant="secondary">{child.student.gradeSection}</Badge>
                  {child.gradeSection && (
                    <Badge variant="outline">{child.gradeSection.turno}</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enlaces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: 'Pagos',
            description: 'Historial de pagos',
            icon: CreditCard,
            href: '/parent/pagos',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
          },
          {
            title: 'Mensajes',
            description: 'Comunicacion con profesores',
            icon: FileText,
            href: '/parent/mensajes',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
          },
        ].map((link, index) => (
          <motion.div
            key={link.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Link href={link.href}>
              <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${link.bgColor}`}>
                      <link.icon className={`h-6 w-6 ${link.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
