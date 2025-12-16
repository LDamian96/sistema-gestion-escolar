'use client'

import { useAuth } from '@/lib/auth-context'
import { DashboardLayout } from '@/components/layout'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout
      user={user}
      basePath="/student"
      onLogout={logout}
    >
      {children}
    </DashboardLayout>
  )
}
