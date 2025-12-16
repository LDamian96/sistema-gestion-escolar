'use client'

import { useAuth } from '@/lib/auth-context'
import { DashboardLayout } from '@/components/layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout
      user={user}
      basePath="/admin"
      onLogout={logout}
    >
      {children}
    </DashboardLayout>
  )
}
