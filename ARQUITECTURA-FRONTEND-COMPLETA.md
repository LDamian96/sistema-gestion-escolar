# 🎓 ARQUITECTURA COMPLETA - FRONTEND SISTEMA DE GESTIÓN ESCOLAR

**Proyecto:** Sistema de Gestión Escolar San José
**Frontend:** Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS + Framer Motion
**Backend:** NestJS + Prisma + MySQL (✅ COMPLETO Y FUNCIONANDO)
**Fecha:** Diciembre 2025

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ BACKEND COMPLETO (100%)

**Ubicación:** `c:\Users\jcdam\Desktop\claude-sistema de gestion escolar\backend`

**Características Implementadas:**
- ✅ NestJS 11 con TypeScript
- ✅ Prisma ORM 6 con MySQL 8
- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ Multi-tenant (aislamiento por schoolId)
- ✅ 4 Roles: ADMIN, TEACHER, STUDENT, PARENT
- ✅ 18+ Endpoints funcionando (todos probados)
- ✅ **Upload/Download de archivos (NUEVO - Recién implementado)**
- ✅ Validaciones con class-validator
- ✅ Guards y decoradores de autorización
- ✅ Rate limiting (protección DDoS)
- ✅ Swagger documentation en `/api/docs`
- ✅ Servidor corriendo en `http://localhost:4000`

**Módulos del Backend:**
1. Auth (login, register, refresh, logout)
2. Students (CRUD + estadísticas)
3. Teachers (CRUD)
4. Parents (CRUD)
5. Subjects (materias)
6. Curriculum (unidades y temas curriculares)
7. Courses (cursos)
8. Grade Levels (niveles educativos)
9. Sections (secciones)
10. Tasks (tareas con submissions)
11. Grades (calificaciones)
12. Attendance (asistencia)
13. Schedules (horarios)
14. Enrollments (matrículas)
15. Workshops (talleres)
16. Payments (pagos)
17. Analytics (dashboard con estadísticas)
18. **Uploads (subir/bajar archivos)** ← NUEVO

**Endpoints de Upload:**
- `POST /api/uploads/image` - Subir imágenes (.jpg, .jpeg, .png, .gif, .webp)
- `POST /api/uploads/document` - Subir documentos (.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx)
- `POST /api/uploads/file` - Subir cualquier tipo permitido
- `GET /uploads/images/:filename` - Descargar imagen
- `GET /uploads/documents/:filename` - Descargar documento
- `GET /uploads/files/:filename` - Descargar archivo

**Configuración de Base de Datos:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Chimbote@23
DB_NAME=school_management
```

**GitHub Repository:** https://github.com/LDamian96/sistema-gestion-escolar-backend-nestjs

---

## 🎯 FRONTEND A IMPLEMENTAR (0% - PENDIENTE)

### Stack Tecnológico Definido

**Core:**
- Next.js 14.2+ (App Router)
- React 18+
- TypeScript 5+
- Node.js 18+

**UI Framework:**
- shadcn/ui (componentes base)
- Tailwind CSS 3.4+ (estilos utility-first)
- Radix UI (primitivas accesibles)
- Lucide Icons (iconografía)

**Animaciones:**
- Framer Motion 11+ (todas las animaciones y transiciones)
- Animaciones en:
  - Page transitions
  - Component mounts/unmounts
  - Hover states
  - Loading states
  - Modal/Dialog animations
  - List animations (stagger)
  - Scroll animations

**State Management:**
- Zustand (estado global ligero)
- React Query / TanStack Query (server state + cache)
- React Hook Form + Zod (formularios + validación)

**HTTP Client:**
- Axios (configurado para http://localhost:4000/api)
- Interceptors para tokens
- Refresh token automático

**SEO & Performance (FUNDAMENTAL):**
- next-seo (meta tags optimizados)
- next-sitemap (sitemap.xml dinámico)
- next/image (optimización de imágenes)
- Dynamic imports (code splitting)
- ISR (Incremental Static Regeneration)
- Metadata API de Next.js 14

**Testing (Opcional - Fase futura):**
- Jest + React Testing Library
- Playwright (E2E)

---

## 🏗️ ARQUITECTURA DEL FRONTEND

### Estructura de Rutas (App Router)

```
src/app/
├── (public)/              # Grupo de rutas públicas (sin auth)
│   ├── layout.tsx         # Layout público (navbar + footer)
│   ├── page.tsx           # Landing page (/)
│   ├── nosotros/
│   │   └── page.tsx       # About page (/nosotros)
│   ├── servicios/
│   │   └── page.tsx       # Services page (/servicios)
│   ├── contacto/
│   │   └── page.tsx       # Contact page (/contacto)
│   └── login/
│       └── page.tsx       # Login page (/login)
│
├── (dashboard)/           # Grupo de rutas privadas (con auth)
│   ├── layout.tsx         # Layout dashboard (sidebar + navbar)
│   ├── middleware.ts      # Auth middleware
│   │
│   ├── admin/             # Dashboard ADMIN
│   │   ├── dashboard/
│   │   │   └── page.tsx   # /admin/dashboard
│   │   ├── usuarios/
│   │   │   ├── page.tsx              # Lista usuarios
│   │   │   ├── crear/page.tsx        # Crear usuario
│   │   │   └── [id]/editar/page.tsx  # Editar usuario
│   │   ├── estructura/
│   │   │   └── page.tsx   # Niveles, grados, secciones
│   │   ├── materias/
│   │   │   └── page.tsx   # Gestión de materias
│   │   ├── cursos/
│   │   │   └── page.tsx   # Gestión de cursos
│   │   ├── matriculas/
│   │   │   └── page.tsx   # Gestión de matrículas
│   │   ├── pagos/
│   │   │   └── page.tsx   # Gestión de pagos
│   │   └── reportes/
│   │       └── page.tsx   # Reportes y analytics
│   │
│   ├── teacher/           # Dashboard TEACHER
│   │   ├── dashboard/
│   │   │   └── page.tsx   # /teacher/dashboard
│   │   ├── cursos/
│   │   │   ├── page.tsx              # Mis cursos
│   │   │   └── [id]/page.tsx         # Detalle curso
│   │   ├── horario/
│   │   │   └── page.tsx   # Mi horario semanal
│   │   ├── curriculum/
│   │   │   └── page.tsx   # Gestión de curriculum
│   │   ├── asistencia/
│   │   │   └── page.tsx   # Tomar asistencia
│   │   ├── tareas/
│   │   │   ├── page.tsx              # Lista tareas
│   │   │   ├── crear/page.tsx        # Crear tarea
│   │   │   └── [id]/page.tsx         # Ver entregas
│   │   ├── examenes/
│   │   │   └── page.tsx   # Gestión de exámenes
│   │   ├── calificaciones/
│   │   │   └── page.tsx   # Calificar trabajos
│   │   └── estudiantes/
│   │       └── page.tsx   # Lista estudiantes
│   │
│   ├── student/           # Dashboard STUDENT
│   │   ├── dashboard/
│   │   │   └── page.tsx   # /student/dashboard
│   │   ├── perfil/
│   │   │   └── page.tsx   # Mi perfil
│   │   ├── profesores/
│   │   │   └── page.tsx   # Mis profesores
│   │   ├── horario/
│   │   │   └── page.tsx   # Mi horario
│   │   ├── curriculum/
│   │   │   └── page.tsx   # Qué estoy aprendiendo
│   │   ├── tareas/
│   │   │   ├── page.tsx              # Mis tareas
│   │   │   └── [id]/page.tsx         # Entregar tarea
│   │   ├── examenes/
│   │   │   └── page.tsx   # Mis exámenes
│   │   ├── calificaciones/
│   │   │   └── page.tsx   # Mis notas
│   │   └── asistencia/
│   │       └── page.tsx   # Mi asistencia
│   │
│   └── parent/            # Dashboard PARENT
│       ├── dashboard/
│       │   └── page.tsx   # /parent/dashboard
│       └── (hijo)/        # Similar a student (read-only)
│
├── layout.tsx             # Root layout (providers, fonts)
├── loading.tsx            # Global loading state
├── error.tsx              # Error boundary
├── not-found.tsx          # 404 page
└── globals.css            # Global CSS + Tailwind
```

### Estructura de Componentes

```
src/components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── form.tsx
│   └── ... (30+ componentes shadcn)
│
├── landing/               # Componentes landing page
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   ├── stats-section.tsx
│   ├── testimonials-section.tsx
│   ├── cta-section.tsx
│   ├── navbar.tsx
│   └── footer.tsx
│
├── dashboard/             # Componentes dashboard
│   ├── sidebar.tsx
│   ├── navbar.tsx
│   ├── stats-card.tsx
│   ├── recent-activity.tsx
│   └── quick-actions.tsx
│
├── forms/                 # Formularios específicos
│   ├── login-form.tsx
│   ├── create-user-form.tsx
│   ├── create-task-form.tsx
│   ├── submit-task-form.tsx
│   ├── grade-form.tsx
│   └── attendance-form.tsx
│
├── tables/                # Tablas de datos
│   ├── students-table.tsx
│   ├── teachers-table.tsx
│   ├── tasks-table.tsx
│   ├── grades-table.tsx
│   └── data-table.tsx     # Tabla genérica reutilizable
│
├── charts/                # Gráficos y visualizaciones
│   ├── attendance-chart.tsx
│   ├── grades-chart.tsx
│   └── stats-chart.tsx
│
├── uploads/               # Componentes de upload
│   ├── file-upload.tsx
│   ├── image-upload.tsx
│   └── file-preview.tsx
│
└── shared/                # Componentes compartidos
    ├── loading-spinner.tsx
    ├── empty-state.tsx
    ├── error-message.tsx
    ├── page-header.tsx
    └── breadcrumbs.tsx
```

### Estructura de Librerías y Utilities

```
src/lib/
├── api/
│   ├── client.ts          # Axios instance configurada
│   ├── auth.ts            # API calls de auth
│   ├── students.ts        # API calls de students
│   ├── teachers.ts
│   ├── tasks.ts
│   ├── grades.ts
│   ├── uploads.ts         # API calls de uploads
│   └── index.ts
│
├── hooks/
│   ├── use-auth.ts        # Hook de autenticación
│   ├── use-user.ts        # Hook del usuario actual
│   ├── use-upload.ts      # Hook para uploads
│   └── use-debounce.ts
│
├── utils/
│   ├── cn.ts              # className merger (clsx + tailwind-merge)
│   ├── format-date.ts     # Formateo de fechas
│   ├── format-number.ts
│   └── constants.ts       # Constantes de la app
│
├── validations/
│   ├── auth.schema.ts     # Schemas de Zod
│   ├── task.schema.ts
│   ├── student.schema.ts
│   └── index.ts
│
└── seo/
    ├── metadata.ts        # Metadata helpers
    ├── schema-org.ts      # JSON-LD generators
    └── constants.ts       # SEO constants
```

### Estructura de Estado (Zustand)

```
src/store/
├── auth-store.ts          # Estado de autenticación
│   ├── user: User | null
│   ├── accessToken: string | null
│   ├── refreshToken: string | null
│   ├── login()
│   ├── logout()
│   ├── refreshAccessToken()
│   └── isAuthenticated()
│
├── ui-store.ts            # Estado de UI
│   ├── sidebarCollapsed: boolean
│   ├── theme: 'light' | 'dark'
│   ├── notifications: Notification[]
│   ├── toggleSidebar()
│   ├── setTheme()
│   └── addNotification()
│
└── user-store.ts          # Datos del usuario actual
    ├── profile: UserProfile | null
    ├── courses: Course[]
    └── updateProfile()
```

### Estructura de Tipos (TypeScript)

```
src/types/
├── auth.types.ts          # User, LoginResponse, JWTPayload
├── api.types.ts           # ApiResponse, PaginatedResponse
├── student.types.ts       # Student, CreateStudentDto
├── teacher.types.ts
├── task.types.ts
├── grade.types.ts
├── curriculum.types.ts
└── index.ts
```

---

## 🎨 DISEÑO Y UX

### Sistema de Diseño

**Colores (Tailwind Config):**
```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... hasta 950
    DEFAULT: '#0ea5e9', // Sky-500
  },
  secondary: {
    DEFAULT: '#8b5cf6', // Violet-500
  },
  success: '#10b981',   // Green-500
  warning: '#f59e0b',   // Amber-500
  error: '#ef4444',     // Red-500
}
```

**Tipografía:**
- Font Principal: `Inter` (variable font)
- Font Headings: `Poppins` (bold)
- Tamaños base: 16px
- Line height: 1.5
- Tracking optimizado

**Espaciado:**
- Sistema de 4px base
- Spacing scale: 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24

**Sombras:**
```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

**Bordes:**
- Border radius: `rounded-lg` (8px) por defecto
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-md` (6px)

### Animaciones con Framer Motion

**Page Transitions:**
```javascript
// Fade in/out
variants={{
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}}
transition={{ duration: 0.3, ease: 'easeOut' }}
```

**List Animations (Stagger):**
```javascript
container={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}}
```

**Modal Animations:**
```javascript
// Scale + fade
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
```

**Hover Effects:**
```javascript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Loading Spinner:**
```javascript
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
```

---

## 🔍 SEO STRATEGY (FUNDAMENTAL)

### Configuración SEO por Tipo de Página

**Landing Page (/):**
```typescript
export const metadata: Metadata = {
  title: 'Sistema de Gestión Escolar San José | Plataforma Educativa',
  description: 'Plataforma completa de gestión escolar. Administra estudiantes, profesores, tareas, calificaciones y más. Optimiza la gestión de tu institución educativa.',
  keywords: ['gestión escolar', 'sistema educativo', 'plataforma escolar', 'administración educativa'],
  authors: [{ name: 'Colegio San José' }],
  openGraph: {
    title: 'Sistema de Gestión Escolar San José',
    description: 'Plataforma completa de gestión escolar',
    url: 'https://escuelasanjose.edu.pe',
    siteName: 'Sistema Escolar San José',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
    }],
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Gestión Escolar San José',
    description: 'Plataforma completa de gestión escolar',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

**Páginas Privadas (Dashboard):**
```typescript
export const metadata: Metadata = {
  title: 'Dashboard | Sistema Escolar',
  robots: {
    index: false,  // NO indexar páginas privadas
    follow: false,
  },
}
```

### Structured Data (JSON-LD)

**Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Colegio San José",
  "url": "https://escuelasanjose.edu.pe",
  "logo": "https://escuelasanjose.edu.pe/logo.png",
  "description": "Institución educativa de excelencia",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PE",
    "addressLocality": "Lima"
  }
}
```

**BreadcrumbList Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Inicio",
    "item": "https://escuelasanjose.edu.pe"
  }]
}
```

### Sitemap Dinámico

**next-sitemap.config.js:**
```javascript
module.exports = {
  siteUrl: 'https://escuelasanjose.edu.pe',
  generateRobotsTxt: true,
  exclude: [
    '/admin/*',
    '/teacher/*',
    '/student/*',
    '/parent/*',
    '/login'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/teacher', '/student', '/parent', '/login']
      }
    ]
  }
}
```

### Performance Optimizations

**Image Optimization:**
```jsx
<Image
  src="/hero.jpg"
  alt="Sistema de gestión escolar"
  width={1200}
  height={600}
  priority  // LCP optimization
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Code Splitting:**
```javascript
// Dynamic imports
const ChartComponent = dynamic(() => import('@/components/charts/attendance-chart'), {
  loading: () => <LoadingSpinner />,
  ssr: false  // Client-side only
})
```

**Font Optimization:**
```typescript
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const poppins = Poppins({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins'
})
```

**Bundle Size Targets:**
- First Load JS: < 80 KB
- Page JS: < 50 KB per route
- Total size: < 200 KB

**Core Web Vitals Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 📦 CONFIGURACIÓN DE ARCHIVOS CLAVE

### package.json
```json
{
  "name": "school-management-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.7",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "lucide-react": "^0.359.0",
    "tailwindcss": "^3.4.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "next-themes": "^0.3.0",
    "date-fns": "^3.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
  }
}

module.exports = nextConfig
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-poppins)'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### .env.example
```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# App
NEXT_PUBLIC_APP_NAME=Sistema Escolar San José
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SEO
NEXT_PUBLIC_SITE_URL=https://escuelasanjose.edu.pe
NEXT_PUBLIC_OG_IMAGE=/og-image.jpg
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1: Configuración Base (Archivos: ~25-30)

**1.1 Inicializar Proyecto**
- `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir`
- Configurar package.json con todas las dependencias
- Configurar next.config.js
- Configurar tailwind.config.ts
- Configurar tsconfig.json

**1.2 Configurar shadcn/ui**
- `npx shadcn-ui@latest init`
- Configurar components.json
- Instalar componentes base:
  - button, card, input, select, dialog, dropdown-menu
  - form, label, table, tabs, toast, skeleton

**1.3 Estructura Base**
- Crear carpetas: src/app, src/components, src/lib, src/types
- Root layout con providers
- Global CSS con variables CSS
- Configurar fonts (Inter + Poppins)

**1.4 SEO Base**
- Archivo robots.txt
- Archivo manifest.json
- Configurar sitemap.ts
- Crear lib/seo con helpers
- Metadata por defecto

**Archivos creados:**
- package.json
- next.config.js
- tailwind.config.ts
- tsconfig.json
- components.json
- .env.example
- src/app/layout.tsx
- src/app/globals.css
- src/lib/utils/cn.ts
- src/lib/seo/metadata.ts
- src/lib/seo/schema-org.ts
- public/robots.txt
- public/manifest.json
- src/app/sitemap.ts
- + ~15 componentes shadcn/ui base

### FASE 2: Autenticación y Estado (Archivos: ~15-20)

**2.1 Configurar Axios**
- Cliente HTTP con interceptors
- Refresh token automático
- Error handling

**2.2 Zustand Stores**
- auth-store.ts (autenticación)
- ui-store.ts (UI state)
- user-store.ts (usuario actual)

**2.3 React Query**
- QueryClient provider
- Hooks de queries
- Mutations configuradas

**2.4 Types TypeScript**
- auth.types.ts
- api.types.ts
- user.types.ts

**2.5 Login Page**
- src/app/(public)/login/page.tsx
- src/components/forms/login-form.tsx
- Validación con Zod
- Integración con backend

**Archivos creados:**
- src/lib/api/client.ts
- src/lib/api/auth.ts
- src/store/auth-store.ts
- src/store/ui-store.ts
- src/store/user-store.ts
- src/types/auth.types.ts
- src/types/api.types.ts
- src/app/(public)/login/page.tsx
- src/components/forms/login-form.tsx
- src/lib/validations/auth.schema.ts
- src/lib/hooks/use-auth.ts

### FASE 3: Landing Page (Archivos: ~15-20)

**3.1 Layout Público**
- src/app/(public)/layout.tsx
- Navbar con navegación
- Footer completo

**3.2 Landing Page**
- Hero section con animaciones
- Features section
- Stats section
- Testimonials section
- CTA section

**3.3 Páginas Estáticas**
- /nosotros (About)
- /servicios (Services)
- /contacto (Contact)

**3.4 Animaciones Framer Motion**
- Page transitions
- Scroll animations
- Hover effects

**Archivos creados:**
- src/app/(public)/layout.tsx
- src/app/(public)/page.tsx
- src/app/(public)/nosotros/page.tsx
- src/app/(public)/servicios/page.tsx
- src/app/(public)/contacto/page.tsx
- src/components/landing/hero-section.tsx
- src/components/landing/features-section.tsx
- src/components/landing/stats-section.tsx
- src/components/landing/navbar.tsx
- src/components/landing/footer.tsx

### FASE 4: Dashboard Layout (Archivos: ~10-15)

**4.1 Layout Dashboard**
- src/app/(dashboard)/layout.tsx
- Sidebar responsive
- Navbar con user menu
- Protected routes

**4.2 Componentes Dashboard**
- Sidebar component
- Navbar component
- Stats cards
- Quick actions

**4.3 Middleware**
- Auth middleware
- Role-based routing

**Archivos creados:**
- src/app/(dashboard)/layout.tsx
- src/components/dashboard/sidebar.tsx
- src/components/dashboard/navbar.tsx
- src/components/dashboard/stats-card.tsx
- src/middleware.ts

### FASE 5: Dashboard Admin (Archivos: ~25-30)

**5.1 Admin Dashboard**
- src/app/(dashboard)/admin/dashboard/page.tsx
- Analytics y estadísticas
- Gráficos con Chart.js

**5.2 Gestión de Usuarios**
- Lista de usuarios (tabla)
- Crear usuario (form)
- Editar usuario (form)
- Eliminar usuario

**5.3 Estructura Académica**
- Gestión de niveles
- Gestión de grados
- Gestión de secciones

**5.4 Otras Páginas Admin**
- Materias
- Cursos
- Matrículas
- Pagos
- Reportes

**Archivos creados:**
- src/app/(dashboard)/admin/dashboard/page.tsx
- src/app/(dashboard)/admin/usuarios/page.tsx
- src/app/(dashboard)/admin/usuarios/crear/page.tsx
- src/components/tables/users-table.tsx
- src/components/forms/create-user-form.tsx
- src/lib/api/students.ts
- src/lib/api/teachers.ts
- src/types/student.types.ts
- src/types/teacher.types.ts
- + ~15-20 archivos más

### FASE 6: Dashboard Teacher (Archivos: ~25-30)

**6.1 Teacher Dashboard**
- Vista general con estadísticas
- Cursos asignados
- Tareas pendientes de calificar

**6.2 Gestión de Tareas**
- Crear tarea con upload de PDF
- Ver entregas de estudiantes
- Calificar entregas
- Exportar calificaciones

**6.3 Asistencia**
- Tomar asistencia por curso
- Ver historial de asistencia

**6.4 Calificaciones**
- Ingresar calificaciones
- Ver promedios por curso

**6.5 Curriculum**
- Ver unidades y temas
- Marcar temas completados

**Archivos creados:**
- src/app/(dashboard)/teacher/dashboard/page.tsx
- src/app/(dashboard)/teacher/tareas/page.tsx
- src/app/(dashboard)/teacher/tareas/crear/page.tsx
- src/components/forms/create-task-form.tsx
- src/components/uploads/file-upload.tsx
- src/lib/api/tasks.ts
- src/lib/api/uploads.ts
- src/lib/hooks/use-upload.ts
- + ~20 archivos más

### FASE 7: Dashboard Student (Archivos: ~20-25)

**7.1 Student Dashboard**
- Vista general con tareas pendientes
- Próximos exámenes
- Asistencia del mes

**7.2 Mis Tareas**
- Ver tareas pendientes
- Descargar archivos del profesor
- Subir entregas (upload de imagen)
- Ver calificaciones

**7.3 Mis Calificaciones**
- Ver notas por materia
- Gráfico de evolución
- Promedio general

**7.4 Mi Curriculum**
- Ver qué estoy aprendiendo
- Unidades y temas por materia

**Archivos creados:**
- src/app/(dashboard)/student/dashboard/page.tsx
- src/app/(dashboard)/student/tareas/page.tsx
- src/app/(dashboard)/student/tareas/[id]/page.tsx
- src/components/forms/submit-task-form.tsx
- src/components/uploads/image-upload.tsx
- + ~15 archivos más

### FASE 8: Dashboard Parent (Archivos: ~15-20)

**8.1 Parent Dashboard**
- Selector de hijo
- Vista similar a student (read-only)
- Resumen de rendimiento

**8.2 Monitoreo**
- Ver tareas del hijo
- Ver calificaciones
- Ver asistencia
- Ver curriculum

**Archivos creados:**
- src/app/(dashboard)/parent/dashboard/page.tsx
- src/components/dashboard/child-selector.tsx
- + ~10-15 archivos más

### FASE 9: Optimización y Testing (Archivos: ~10)

**9.1 Performance**
- Lazy loading de componentes
- Image optimization
- Code splitting
- Bundle analysis

**9.2 SEO Final**
- Metadata completa en todas las páginas
- Schema.org en páginas públicas
- Sitemap generado
- robots.txt final

**9.3 Accesibilidad**
- ARIA labels
- Keyboard navigation
- Screen reader support

**9.4 Testing (Opcional)**
- Unit tests con Jest
- Integration tests
- E2E tests con Playwright

---

## 📊 RESUMEN DE ARCHIVOS TOTAL

**Total Estimado: ~200-250 archivos**

Por Fase:
- Fase 1 (Config Base): ~30 archivos
- Fase 2 (Auth & Estado): ~20 archivos
- Fase 3 (Landing): ~20 archivos
- Fase 4 (Dashboard Layout): ~15 archivos
- Fase 5 (Admin Dashboard): ~30 archivos
- Fase 6 (Teacher Dashboard): ~30 archivos
- Fase 7 (Student Dashboard): ~25 archivos
- Fase 8 (Parent Dashboard): ~20 archivos
- Fase 9 (Optimización): ~10 archivos

shadcn/ui components: ~30-40 componentes

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-requisitos
- [ ] Node.js 18+ instalado
- [ ] Backend corriendo en http://localhost:4000
- [ ] MySQL con datos seed

### Fase 1: Config Base
- [ ] Crear proyecto Next.js
- [ ] Instalar dependencias
- [ ] Configurar Tailwind
- [ ] Configurar shadcn/ui
- [ ] Configurar SEO base
- [ ] Configurar fonts

### Fase 2: Auth
- [ ] Axios client
- [ ] Zustand stores
- [ ] React Query
- [ ] Login page
- [ ] Protected routes

### Fase 3: Landing
- [ ] Hero section
- [ ] Features
- [ ] Stats
- [ ] Navbar & Footer
- [ ] Páginas estáticas

### Fase 4-8: Dashboards
- [ ] Dashboard layout
- [ ] Admin dashboard
- [ ] Teacher dashboard
- [ ] Student dashboard
- [ ] Parent dashboard

### Fase 9: Optimización
- [ ] Performance audit
- [ ] SEO completo
- [ ] Accesibilidad
- [ ] Testing

---

## 🎯 PRÓXIMO PASO INMEDIATO

**INICIAR FASE 1: Configuración Base**

1. Crear carpeta `frontend` en el proyecto
2. Inicializar Next.js 14
3. Instalar todas las dependencias
4. Configurar archivos base
5. Inicializar shadcn/ui

**Comando inicial:**
```bash
cd "c:\Users\jcdam\Desktop\claude-sistema de gestion escolar"
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
```

---

**Documento creado:** Diciembre 9, 2025
**Última actualización:** Diciembre 9, 2025
**Estado Backend:** ✅ 100% Completo
**Estado Frontend:** ⏳ 0% - Listo para iniciar

Este documento sirve como referencia completa para continuar el desarrollo en cualquier momento.
