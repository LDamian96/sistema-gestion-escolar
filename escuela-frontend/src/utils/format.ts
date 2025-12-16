// Utility functions for formatting

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount)
}

export function formatUserCode(code: string, role: string): string {
  const prefixes: Record<string, string> = {
    ADMIN: 'ADM',
    TEACHER: 'PRF',
    STUDENT: 'EST',
    PARENT: 'TUT',
  }
  return `${prefixes[role] || ''}-${code}`
}
