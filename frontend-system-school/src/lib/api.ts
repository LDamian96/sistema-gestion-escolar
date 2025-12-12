// API Client configurado para HTTP-Only cookies
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      response.statusText,
      error.message || 'Error en la solicitud',
    );
  }
  return response.json();
}

// Cliente API principal
export const api = {
  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include', // CRÍTICO: Enviar cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return handleResponse<T>(response);
  },

  async upload<T>(endpoint: string, formData: FormData, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      ...options,
    });
    return handleResponse<T>(response);
  },
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ message: string; user: User }>('/auth/login', { email, password }),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  refresh: () => api.post<{ message: string }>('/auth/refresh'),

  me: () => api.get<User>('/auth/me'),

  check: () => api.get<{ authenticated: boolean; user: User }>('/auth/check'),
};

// Types
export interface User {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  schoolId: string;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  school?: {
    id: string;
    name: string;
  };
}

export interface LoginResponse {
  message: string;
  user: User;
}

export { ApiError };
