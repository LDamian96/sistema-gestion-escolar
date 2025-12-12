'use client'

import { motion } from 'framer-motion'
import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardNavbarProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export function DashboardNavbar({ onMenuClick, sidebarCollapsed }: DashboardNavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b bg-card/80 backdrop-blur-lg flex items-center justify-between px-6 sticky top-0 z-30"
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="w-64 pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">Usuario Demo</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-primary text-white text-sm">UD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </motion.header>
  )
}
