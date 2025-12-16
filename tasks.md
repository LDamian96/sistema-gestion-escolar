# Sistema de Gestión Escolar - Tareas

> Este archivo rastrea todas las tareas completadas y pendientes del proyecto.

---

## Estado General del Proyecto

| Fase | Estado | Progreso |
|------|--------|----------|
| Planificación | Completado | 100% |
| Frontend | En progreso | 35% |
| Backend | Pendiente | 0% |
| Integración | Pendiente | 0% |
| Testing | Pendiente | 0% |
| Deploy | Pendiente | 0% |

---

## Fase 0: Planificación y Documentación

### Completadas

- [x] Definir estructura teórica del sistema
- [x] Definir roles (Admin, Profesor, Estudiante, Tutor)
- [x] Definir entidades y relaciones
- [x] Crear flujos de ejemplo
- [x] Crear archivo agente `system-school.md`
- [x] Definir stack tecnológico
- [x] Definir versiones de paquetes
- [x] Agregar credenciales (MySQL, MercadoPago)
- [x] Definir guía de animaciones Framer Motion
- [x] Documentar componentes shadcn/ui a usar
- [x] Analizar proyecto existente `frontend-system-school`
- [x] Crear archivo de tareas `tasks.md`

### Pendientes

- [ ] Crear diagrama ER de base de datos (opcional)

---

## Fase 1: Setup Frontend

### Completadas

- [x] Crear proyecto Next.js 15 con App Router (`escuela-frontend`)
- [x] Configurar TypeScript (incluido en create-next-app)
- [x] Configurar Tailwind CSS base (incluido en create-next-app)
- [x] Configurar ESLint (incluido en create-next-app)
- [x] Configurar paths aliases (@/) (incluido en create-next-app)
- [x] Instalar dependencias principales (Framer Motion, TanStack Query, Zustand, etc.)
- [x] Instalar componentes Radix UI (16 componentes)
- [x] Instalar utilidades (tailwindcss-animate, recharts, react-table, react-dropzone)
- [x] Crear estructura de carpetas completa (App Router con route groups)
- [x] Crear archivo globals.css con variables CSS personalizadas (tema verde esmeralda)
- [x] Personalizar tailwind.config.js (colores, tipografía, animaciones)
- [x] Configurar fuentes (Inter + Poppins)
- [x] Configurar next-themes (dark/light mode)

### Notas
- Nota: El build de producción tiene un error con PostCSS en Next.js 15, pero el servidor de desarrollo funciona correctamente.

---

## Fase 2: Componentes UI Base (shadcn/ui)

### Completadas

- [x] Crear lib/utils.ts (cn helper)
- [x] Componente Button (con variantes CVA)
- [x] Componente Input
- [x] Componente Label
- [x] Componente Card (Header, Content, Footer)
- [x] Componente Avatar
- [x] Componente Badge
- [x] Componente Separator
- [x] Componente Skeleton
- [x] Componente Dialog/Modal
- [x] Componente AlertDialog
- [x] Componente Select
- [x] Componente DropdownMenu
- [x] Componente Tabs
- [x] Componente Checkbox
- [x] Componente Switch
- [x] Componente Progress
- [x] Componente Tooltip
- [x] Componente Popover
- [x] Componente Table
- [x] Componente ScrollArea
- [x] Componente Textarea

### Pendientes

- [ ] Componente Calendar/DatePicker

---

## Fase 3: Layout del Dashboard

### Completadas

- [x] Crear layout público (/)
- [x] Crear layout dashboard (/dashboard)
- [x] Componente Sidebar (colapsable con animaciones Framer Motion)
- [x] Componente DashboardNavbar (búsqueda, notificaciones, usuario)
- [x] Animaciones de sidebar (Framer Motion)
- [x] Sistema de navegación por rol
- [x] Componente DashboardLayout (integra Sidebar + Navbar)

### Pendientes

- [ ] Componente Navbar público (landing page)
- [ ] Menú móvil responsive

---

## Fase 4: Páginas Públicas

### Completadas

- [x] Página de login (con validación Zod + React Hook Form)

### Pendientes

- [ ] Home público (landing page)
- [ ] Página de recuperar contraseña
- [ ] Hero Section con animaciones
- [ ] Features Section
- [ ] Footer

---

## Fase 5: Autenticación Frontend

### Completadas

- [x] Crear AuthContext
- [x] Crear hooks useAuth
- [x] Configurar axios con interceptors (refresh token automático)
- [x] Manejo de tokens (access + refresh en HttpOnly cookie)
- [x] Protección de rutas por rol
- [x] Redirección automática según rol
- [x] Formulario de login con validación (Zod + React Hook Form)
- [x] Estados de loading y error

---

## Fase 6: Dashboard Admin

### Completadas

- [x] Dashboard principal con estadísticas (cards, actividad reciente, tareas pendientes)

### Pendientes

- [ ] Gestión de usuarios (CRUD)
- [ ] Gestión de estudiantes
- [ ] Gestión de profesores
- [ ] Gestión de tutores
- [ ] Estructura académica (niveles, grados, secciones)
- [ ] Gestión de materias
- [ ] Gestión de cursos (asignaciones)
- [ ] Gestión de horarios
- [ ] Gestión de tareas
- [ ] Gestión de exámenes
- [ ] Control de asistencia
- [ ] Gestión de pagos
- [ ] Reportes y estadísticas
- [ ] Auditoría del sistema
- [ ] Eventos públicos

---

## Fase 7: Dashboard Profesor

### Pendientes

- [ ] Dashboard con resumen
- [ ] Mis cursos
- [ ] Mi horario
- [ ] Registro de asistencia
- [ ] Crear/gestionar tareas
- [ ] Crear/gestionar exámenes
- [ ] Calificar entregas
- [ ] Ver estudiantes de mis cursos

---

## Fase 8: Dashboard Estudiante

### Pendientes

- [ ] Dashboard con pendientes
- [ ] Mi horario
- [ ] Mis materias
- [ ] Mis tareas (ver, entregar)
- [ ] Mis exámenes (ver calificaciones)
- [ ] Mi asistencia
- [ ] Descargar material

---

## Fase 9: Dashboard Tutor

### Pendientes

- [ ] Dashboard con resumen de hijos
- [ ] Selector de estudiante (si tiene varios hijos)
- [ ] Ver calificaciones
- [ ] Ver asistencia
- [ ] Ver tareas pendientes
- [ ] Módulo de pagos
- [ ] Estado de cuenta
- [ ] Realizar pago (MercadoPago/Yape)

---

## Fase 10: Backend NestJS

### Pendientes

- [ ] Setup proyecto NestJS
- [ ] Configurar Prisma con MySQL
- [ ] Crear schema de base de datos
- [ ] Módulo de autenticación (JWT + Refresh)
- [ ] Módulo de usuarios
- [ ] Módulo de estudiantes
- [ ] Módulo de profesores
- [ ] Módulo de tutores
- [ ] Módulo académico (niveles, grados, secciones)
- [ ] Módulo de materias
- [ ] Módulo de cursos
- [ ] Módulo de horarios
- [ ] Módulo de tareas
- [ ] Módulo de exámenes
- [ ] Módulo de asistencia
- [ ] Módulo de pagos (MercadoPago + Yape)
- [ ] Módulo de archivos (uploads)
- [ ] Módulo de auditoría
- [ ] Módulo de notificaciones
- [ ] Módulo de reportes

---

## Fase 11: Integración y Testing

### Pendientes

- [ ] Conectar frontend con backend
- [ ] Tests unitarios frontend
- [ ] Tests unitarios backend
- [ ] Tests de integración
- [ ] Tests E2E

---

## Fase 12: Optimización y Deploy

### Pendientes

- [ ] Optimizar rendimiento frontend
- [ ] Optimizar queries backend
- [ ] Configurar Docker (cuando el usuario confirme)
- [ ] CI/CD pipeline
- [ ] Documentación final

---

## Historial de Cambios

### 2024-12-13

- Creado archivo tasks.md
- Definidas todas las fases del proyecto
- Completada Fase 0 (Planificación)

---

## Notas

- El proyecto `frontend-system-school` existente será usado como referencia de diseño
- Se adaptará el diseño y animaciones al nuevo proyecto
- Docker solo se usará cuando el usuario lo confirme
- Prioridad: Frontend primero, luego Backend
