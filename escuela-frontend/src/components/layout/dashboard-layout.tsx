'use client'

import { motion } from 'framer-motion'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }
  basePath: string
  onLogout: () => void
}

export function DashboardLayout({
  children,
  user,
  basePath,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar role={user.role} basePath={basePath} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar user={user} onLogout={onLogout} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
