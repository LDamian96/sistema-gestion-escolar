// Auth types
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface User {
  id: string
  email: string
  code: string
  role: UserRole
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
}
