# Sistema de Gestión Escolar - Especificación Técnica

---

## INSTRUCCIONES DE TRABAJO (IMPORTANTE)

> **REGLAS OBLIGATORIAS** para el desarrollo de este proyecto:

### 1. Actualización de Tareas
- **SIEMPRE** actualizar `tasks.md` después de completar cada tarea
- Marcar con `[x]` las tareas completadas
- Si una tarea queda **incompleta**, agregar una nota indicando qué falta:
  ```
  - [~] Crear módulo de horarios
    - **INCOMPLETO:** Falta validación de conflictos y vista semanal
  ```

### 2. Flujo de Trabajo
1. Completar una tarea
2. Actualizar `tasks.md` marcando completada
3. Continuar con la siguiente tarea
4. Repetir

### 3. Documentación de Trabajo Incompleto
Si el contexto se agota o hay interrupción:
- Documentar en `tasks.md` exactamente dónde se quedó
- Listar los archivos creados/modificados
- Indicar los pasos pendientes específicos

### 4. Actualización del Changelog
- Actualizar la sección **Changelog** de este archivo al final de cada sesión de trabajo
- Incluir: fecha, qué se hizo, qué archivos se modificaron

### 5. Nombres de Proyectos
- **Frontend:** `escuela-frontend`
- **Backend:** `escuela-backend` (cuando se implemente)

---

## Información del Proyecto

- **Nombre:** Sistema de Gestión Escolar
- **Tipo:** Aplicación Web Profesional
- **Arquitectura:** Monorepo con Frontend y Backend separados
- **Propósito:** Gestión integral de colegios físicos (multi-tenant ready)

### Configuración de Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend (Next.js) | 3000 |
| Backend (NestJS) | 4000 |
| MySQL | 3306 |

### Credenciales de Desarrollo

**MySQL:**
```
Usuario: root
Contraseña: 1234
Host: localhost
Puerto: 3306
Base de datos: school_db
```

**MercadoPago (TEST):**
```
MERCADOPAGO_ACCESS_TOKEN=TEST-7533682258184666-121221-10b0bcd47b0afd3cc810111603e6c1d6-2153656036
MERCADOPAGO_PUBLIC_KEY=TEST-47571ab9-8016-4bcc-97c8-4edd525d6008
```

---

## Stack Tecnológico

### Frontend

#### Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.1.0 | Framework React con SSR/SSG |
| React | 19.0.0 | Librería UI |
| TypeScript | 5.7.2 | Tipado estático |
| Tailwind CSS | 3.4.17 | Estilos utilitarios |
| tailwindcss-animate | 1.0.7 | Animaciones CSS para Tailwind |
| Framer Motion | 11.15.0 | Animaciones y transiciones profesionales |

#### UI Components (shadcn/ui + Radix UI)

> **shadcn/ui** es el sistema de componentes que usamos. No es una librería instalable, sino componentes copiados a `src/components/ui/` que combinan Radix UI + Tailwind + CVA. Esto permite personalización total del diseño.

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| @radix-ui/react-avatar | 1.1.2 | Componente Avatar |
| @radix-ui/react-dialog | 1.1.4 | Modales y diálogos |
| @radix-ui/react-dropdown-menu | 2.1.4 | Menús desplegables |
| @radix-ui/react-label | 2.1.1 | Labels accesibles |
| @radix-ui/react-progress | 1.1.1 | Barras de progreso |
| @radix-ui/react-select | 2.1.4 | Selectores |
| @radix-ui/react-separator | 1.1.1 | Separadores |
| @radix-ui/react-slot | 1.1.1 | Composición de componentes |
| @radix-ui/react-tabs | 1.1.2 | Pestañas |
| @radix-ui/react-tooltip | 1.1.6 | Tooltips |
| @radix-ui/react-checkbox | 1.1.3 | Checkboxes |
| @radix-ui/react-switch | 1.1.2 | Switches/toggles |
| @radix-ui/react-popover | 1.1.4 | Popovers |
| @radix-ui/react-accordion | 1.2.2 | Acordeones |
| @radix-ui/react-alert-dialog | 1.1.4 | Diálogos de confirmación |
| @radix-ui/react-scroll-area | 1.2.2 | Áreas de scroll personalizadas |
| class-variance-authority | 0.7.1 | Variantes de componentes (CVA) |

**Componentes shadcn/ui a implementar:**

| Componente | Uso |
|------------|-----|
| Button | Botones con variantes (default, outline, ghost, destructive) |
| Input | Campos de texto |
| Label | Etiquetas accesibles |
| Card | Contenedores con header, content, footer |
| Avatar | Fotos de perfil con fallback |
| Badge | Etiquetas de estado |
| Dialog | Modales |
| AlertDialog | Confirmaciones |
| DropdownMenu | Menús contextuales |
| Select | Selectores |
| Tabs | Pestañas |
| Table | Tablas de datos |
| Checkbox | Casillas de verificación |
| Switch | Toggles |
| Tooltip | Información emergente |
| Skeleton | Estados de carga |
| Separator | Divisores |
| Progress | Barras de progreso |
| Calendar | Selector de fechas |
| Popover | Contenido emergente |

#### Formularios y Validación
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Hook Form | 7.54.2 | Manejo de formularios |
| @hookform/resolvers | 3.9.1 | Resolvers para React Hook Form |
| Zod | 3.24.1 | Validación de esquemas |

#### Estado y Data Fetching
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| @tanstack/react-query | 5.62.8 | Estado del servidor y caché |
| Zustand | 5.0.2 | Estado global ligero |
| axios | 1.7.9 | Cliente HTTP |

#### Utilidades
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| date-fns | 4.1.0 | Manipulación de fechas |
| Lucide React | 0.468.0 | Iconografía moderna |
| clsx | 2.1.1 | Utilidad para classNames |
| tailwind-merge | 2.6.0 | Merge de clases Tailwind |
| js-cookie | 3.0.5 | Manejo de cookies en cliente |
| sonner | 1.7.1 | Toasts/notificaciones elegantes |
| next-themes | 0.4.4 | Soporte dark/light mode |
| recharts | 2.15.0 | Gráficos y charts |
| @tanstack/react-table | 8.20.6 | Tablas avanzadas |
| react-dropzone | 14.3.5 | Drag & drop de archivos |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| NestJS | 10.4.15 | Framework backend |
| @nestjs/platform-express | 10.4.15 | Plataforma Express |
| TypeScript | 5.7.2 | Tipado estático |
| Prisma ORM | 6.1.0 | ORM y migraciones |
| @prisma/client | 6.1.0 | Cliente Prisma |
| MySQL | 8.0 | Base de datos |
| @nestjs/passport | 10.0.3 | Integración Passport |
| passport | 0.7.0 | Autenticación |
| passport-jwt | 4.0.1 | Estrategia JWT |
| @nestjs/jwt | 10.2.0 | Módulo JWT para NestJS |
| bcrypt | 5.1.1 | Hash de contraseñas |
| class-validator | 0.14.1 | Validación de DTOs |
| class-transformer | 0.5.1 | Transformación de datos |
| helmet | 8.0.0 | Headers de seguridad |
| @nestjs/throttler | 6.3.0 | Rate limiting |
| winston | 3.17.0 | Logging |
| nest-winston | 1.10.2 | Integración Winston-NestJS |
| multer | 1.4.5-lts.1 | Subida de archivos |
| @nestjs/config | 3.3.0 | Configuración |
| @nestjs/swagger | 8.1.0 | Documentación API |
| uuid | 11.0.3 | Generación de UUIDs |
| cookie-parser | 1.4.7 | Parseo de cookies |

### Pagos
| Proveedor | Versión SDK | Uso |
|-----------|-------------|-----|
| MercadoPago | mercadopago 2.0.15 | Tarjetas, transferencias |
| Yape | API REST | Billetera digital (Perú) |

### DevOps / Infraestructura
| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Docker | 27.x | Contenedorización |
| Docker Compose | 2.x | Orquestación local |
| GitHub Actions | - | CI/CD |
| Nginx | 1.27 | Reverse proxy (producción) |
| PM2 | 5.4.3 | Process manager (producción) |
| Redis | 7.4 | Caché y sesiones (opcional) |

**NOTA IMPORTANTE SOBRE DOCKER:**
> Antes de ejecutar comandos de Docker, te avisaré para que puedas iniciar Docker Desktop. No usaré Docker sin confirmación previa.

### Testing
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Jest | 29.7.0 | Test runner |
| @nestjs/testing | 10.4.15 | Testing en NestJS |
| supertest | 7.0.0 | Tests de integración HTTP |
| @testing-library/react | 16.1.0 | Testing de componentes React |
| @testing-library/jest-dom | 6.6.3 | Matchers para DOM |
| playwright | 1.49.1 | E2E testing |

---

## Framer Motion - Guía de Animaciones

Framer Motion será usado extensivamente para crear una experiencia de usuario profesional y moderna.

### Animaciones Globales

#### Page Transitions (Transiciones entre páginas)
```typescript
// Variantes para transiciones de página
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
}
```

#### Stagger Children (Animación escalonada de listas)
```typescript
// Para listas de cards, tablas, etc.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}
```

### Componentes con Animación

| Componente | Animación | Trigger |
|------------|-----------|---------|
| **Sidebar** | Slide in/out desde la izquierda | Toggle de menú |
| **Modal** | Scale + Fade con backdrop blur | Abrir/cerrar |
| **Dropdown** | Scale Y desde arriba | Hover/Click |
| **Cards** | Hover lift + shadow | Mouse enter/leave |
| **Buttons** | Tap scale (0.95) + ripple | Click |
| **Tables rows** | Stagger fade in | Carga de datos |
| **Toasts** | Slide in desde derecha | Notificación |
| **Forms** | Shake en error | Validación fallida |
| **Tabs** | Underline slide | Cambio de tab |
| **Accordion** | Height auto + rotate chevron | Expand/collapse |
| **Loading** | Skeleton pulse + shimmer | Carga |
| **Avatar** | Bounce on load | Imagen cargada |
| **Badge** | Pop in con spring | Aparición |
| **Progress** | Width animate | Actualización |
| **Charts** | Draw path + stagger bars | Datos cargados |

### Animaciones por Sección

#### Login / Auth
- Logo: Fade in + subtle float
- Form: Slide up con stagger en inputs
- Button: Pulse mientras carga, shake en error
- Success: Checkmark draw animation

#### Dashboard
- Stats cards: Counter animation (números incrementan)
- Charts: Path drawing animation
- Recent activity: Stagger list items
- Welcome message: Typewriter effect (opcional)

#### Tablas de Datos
- Header: Fade in
- Rows: Stagger con 50ms delay
- Hover row: Background color transition
- Sort: Flip animation en indicador
- Pagination: Fade transition entre páginas

#### Formularios
- Campos: Focus ring animation
- Labels: Float up animation
- Errores: Shake + fade in mensaje
- Submit: Loading spinner morphing
- Success: Confetti o checkmark

#### Sidebar / Navegación
- Open/Close: Slide + resize content
- Menu items: Stagger con hover highlight
- Submenu: Height animation
- Active indicator: Slide to position

#### Modales
- Backdrop: Fade in con blur
- Content: Scale from 0.95 + fade
- Close: Reverse animation
- Confirm dialogs: Subtle bounce

#### Notificaciones / Toasts
- Enter: Slide from right + fade
- Exit: Slide to right + fade
- Stack: Reorder animation
- Progress bar: Width decrease

#### File Upload
- Drag zone: Border dash animation
- Drop: Pulse effect
- Progress: Animated bar
- Complete: Checkmark draw

### Micro-interacciones

```typescript
// Hover en cards
whileHover={{
  y: -4,
  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
  transition: { duration: 0.2 }
}}

// Tap en botones
whileTap={{ scale: 0.97 }}

// Focus en inputs
whileFocus={{
  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
  borderColor: "#3B82F6"
}}
```

### Layout Animations

```typescript
// Para cuando elementos cambian de posición
<motion.div layout layoutId="unique-id">
  {/* Animación automática de posición/tamaño */}
</motion.div>

// Shared layout animations (transición entre estados)
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      layoutId="expandable-card"
      initial={{ borderRadius: 20 }}
      animate={{ borderRadius: 0 }}
    />
  )}
</AnimatePresence>
```

### Scroll Animations

```typescript
// Elementos que aparecen al hacer scroll
const { scrollYProgress } = useScroll()
const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

// Parallax effects
const y = useTransform(scrollYProgress, [0, 1], [0, -100])
```

### Gestos

```typescript
// Drag and drop (para reordenar)
<Reorder.Group values={items} onReorder={setItems}>
  {items.map((item) => (
    <Reorder.Item key={item.id} value={item}>
      {item.content}
    </Reorder.Item>
  ))}
</Reorder.Group>

// Swipe para eliminar (mobile)
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -50) handleDelete()
  }}
/>
```

### Principios de Animación

1. **Duración:** 200-400ms para la mayoría de animaciones
2. **Easing:** "easeOut" para entradas, "easeIn" para salidas
3. **Spring:** Para animaciones más naturales (stiffness: 300, damping: 25)
4. **Stagger:** 50-100ms entre elementos de lista
5. **No exagerar:** Las animaciones deben mejorar UX, no distraer

---

## Estructura del Proyecto

```
sistema-gestion-escolar/
├── frontend/                      # Next.js App
│   ├── public/
│   │   ├── images/
│   │   └── fonts/
│   ├── src/
│   │   ├── app/                   # App Router (Next.js 14)
│   │   │   ├── (auth)/            # Rutas de autenticación
│   │   │   │   ├── login/
│   │   │   │   └── recuperar/
│   │   │   ├── (dashboard)/       # Rutas protegidas
│   │   │   │   ├── admin/
│   │   │   │   │   ├── usuarios/
│   │   │   │   │   ├── estudiantes/
│   │   │   │   │   ├── profesores/
│   │   │   │   │   ├── tutores/
│   │   │   │   │   ├── estructura-academica/
│   │   │   │   │   ├── materias/
│   │   │   │   │   ├── horarios/
│   │   │   │   │   ├── tareas/
│   │   │   │   │   ├── examenes/
│   │   │   │   │   ├── asistencia/
│   │   │   │   │   ├── pagos/
│   │   │   │   │   ├── eventos/
│   │   │   │   │   ├── reportes/
│   │   │   │   │   └── auditoria/
│   │   │   │   ├── profesor/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── mis-cursos/
│   │   │   │   │   ├── horario/
│   │   │   │   │   ├── asistencia/
│   │   │   │   │   ├── tareas/
│   │   │   │   │   └── examenes/
│   │   │   │   ├── estudiante/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── horario/
│   │   │   │   │   ├── materias/
│   │   │   │   │   ├── tareas/
│   │   │   │   │   ├── examenes/
│   │   │   │   │   ├── calificaciones/
│   │   │   │   │   ├── asistencia/
│   │   │   │   │   └── material/
│   │   │   │   └── tutor/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── estudiantes/
│   │   │   │       ├── calificaciones/
│   │   │   │       ├── asistencia/
│   │   │   │       ├── tareas/
│   │   │   │       └── pagos/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Home público
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/                # Componentes base reutilizables
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Select/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Table/
│   │   │   │   ├── Card/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Avatar/
│   │   │   │   ├── Skeleton/
│   │   │   │   ├── Toast/
│   │   │   │   ├── Dropdown/
│   │   │   │   ├── Tabs/
│   │   │   │   ├── Pagination/
│   │   │   │   └── DatePicker/
│   │   │   ├── layout/            # Componentes de layout
│   │   │   │   ├── Navbar/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Footer/
│   │   │   │   └── PageHeader/
│   │   │   ├── forms/             # Formularios específicos
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── StudentForm/
│   │   │   │   ├── TeacherForm/
│   │   │   │   ├── TaskForm/
│   │   │   │   └── ExamForm/
│   │   │   ├── tables/            # Tablas específicas
│   │   │   │   ├── StudentsTable/
│   │   │   │   ├── GradesTable/
│   │   │   │   └── AttendanceTable/
│   │   │   └── shared/            # Componentes compartidos
│   │   │       ├── FileUploader/
│   │   │       ├── FileDownloader/
│   │   │       ├── GradeDisplay/
│   │   │       ├── StatusBadge/
│   │   │       └── ConfirmDialog/
│   │   ├── hooks/                 # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useStudents.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useExams.ts
│   │   │   ├── useAttendance.ts
│   │   │   ├── usePayments.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── lib/                   # Utilidades
│   │   │   ├── api/               # Cliente API
│   │   │   │   ├── client.ts      # Axios instance
│   │   │   │   ├── auth.ts
│   │   │   │   ├── students.ts
│   │   │   │   ├── teachers.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── exams.ts
│   │   │   │   └── payments.ts
│   │   │   ├── utils/
│   │   │   │   ├── cn.ts          # Classnames helper
│   │   │   │   ├── formatters.ts  # Formateo de fechas, números
│   │   │   │   ├── validators.ts  # Validaciones comunes
│   │   │   │   └── constants.ts   # Constantes globales
│   │   │   └── validations/       # Esquemas Zod
│   │   │       ├── auth.schema.ts
│   │   │       ├── student.schema.ts
│   │   │       ├── task.schema.ts
│   │   │       └── exam.schema.ts
│   │   ├── stores/                # Estado global (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── types/                 # Tipos TypeScript
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── student.types.ts
│   │   │   ├── teacher.types.ts
│   │   │   ├── task.types.ts
│   │   │   ├── exam.types.ts
│   │   │   ├── attendance.types.ts
│   │   │   ├── payment.types.ts
│   │   │   └── api.types.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── middleware.ts          # Middleware de autenticación
│   ├── .env.local
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                       # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de BD
│   │   ├── migrations/            # Migraciones
│   │   └── seed.ts                # Datos iniciales
│   ├── src/
│   │   ├── main.ts                # Entry point
│   │   ├── app.module.ts          # Módulo principal
│   │   ├── common/                # Código compartido
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── api-paginated.decorator.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── throttle.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   └── timeout.interceptor.ts
│   │   │   ├── filters/
│   │   │   │   ├── http-exception.filter.ts
│   │   │   │   └── prisma-exception.filter.ts
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── dto/
│   │   │   │   ├── pagination.dto.ts
│   │   │   │   └── api-response.dto.ts
│   │   │   └── utils/
│   │   │       ├── hash.util.ts
│   │   │       ├── code-generator.util.ts
│   │   │       └── file.util.ts
│   │   ├── config/                # Configuraciones
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── cors.config.ts
│   │   │   ├── throttle.config.ts
│   │   │   └── multer.config.ts
│   │   ├── modules/
│   │   │   ├── auth/              # Autenticación
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── refresh.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       ├── register.dto.ts
│   │   │   │       └── refresh-token.dto.ts
│   │   │   ├── users/             # Usuarios base
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   ├── students/          # Estudiantes
│   │   │   │   ├── students.module.ts
│   │   │   │   ├── students.controller.ts
│   │   │   │   ├── students.service.ts
│   │   │   │   └── dto/
│   │   │   ├── teachers/          # Profesores
│   │   │   │   ├── teachers.module.ts
│   │   │   │   ├── teachers.controller.ts
│   │   │   │   ├── teachers.service.ts
│   │   │   │   └── dto/
│   │   │   ├── tutors/            # Tutores
│   │   │   │   ├── tutors.module.ts
│   │   │   │   ├── tutors.controller.ts
│   │   │   │   ├── tutors.service.ts
│   │   │   │   └── dto/
│   │   │   ├── academic/          # Estructura académica
│   │   │   │   ├── academic.module.ts
│   │   │   │   ├── levels/
│   │   │   │   ├── grades/
│   │   │   │   ├── sections/
│   │   │   │   └── periods/
│   │   │   ├── subjects/          # Materias
│   │   │   │   ├── subjects.module.ts
│   │   │   │   ├── subjects.controller.ts
│   │   │   │   ├── subjects.service.ts
│   │   │   │   └── dto/
│   │   │   ├── courses/           # Cursos (Profesor+Materia+Grupo)
│   │   │   │   ├── courses.module.ts
│   │   │   │   ├── courses.controller.ts
│   │   │   │   ├── courses.service.ts
│   │   │   │   └── dto/
│   │   │   ├── enrollments/       # Inscripciones
│   │   │   │   ├── enrollments.module.ts
│   │   │   │   ├── enrollments.controller.ts
│   │   │   │   ├── enrollments.service.ts
│   │   │   │   └── dto/
│   │   │   ├── schedules/         # Horarios
│   │   │   │   ├── schedules.module.ts
│   │   │   │   ├── schedules.controller.ts
│   │   │   │   ├── schedules.service.ts
│   │   │   │   └── dto/
│   │   │   ├── tasks/             # Tareas
│   │   │   │   ├── tasks.module.ts
│   │   │   │   ├── tasks.controller.ts
│   │   │   │   ├── tasks.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-task.dto.ts
│   │   │   │       ├── update-task.dto.ts
│   │   │   │       └── grade-task.dto.ts
│   │   │   ├── task-submissions/  # Entregas de tareas
│   │   │   │   ├── task-submissions.module.ts
│   │   │   │   ├── task-submissions.controller.ts
│   │   │   │   ├── task-submissions.service.ts
│   │   │   │   └── dto/
│   │   │   ├── exams/             # Exámenes
│   │   │   │   ├── exams.module.ts
│   │   │   │   ├── exams.controller.ts
│   │   │   │   ├── exams.service.ts
│   │   │   │   └── dto/
│   │   │   ├── exam-grades/       # Calificaciones de exámenes
│   │   │   │   ├── exam-grades.module.ts
│   │   │   │   ├── exam-grades.controller.ts
│   │   │   │   ├── exam-grades.service.ts
│   │   │   │   └── dto/
│   │   │   ├── attendance/        # Asistencia
│   │   │   │   ├── attendance.module.ts
│   │   │   │   ├── attendance.controller.ts
│   │   │   │   ├── attendance.service.ts
│   │   │   │   └── dto/
│   │   │   ├── payments/          # Pagos
│   │   │   │   ├── payments.module.ts
│   │   │   │   ├── payments.controller.ts
│   │   │   │   ├── payments.service.ts
│   │   │   │   ├── mercadopago.service.ts
│   │   │   │   ├── yape.service.ts
│   │   │   │   └── dto/
│   │   │   ├── events/            # Eventos públicos
│   │   │   │   ├── events.module.ts
│   │   │   │   ├── events.controller.ts
│   │   │   │   ├── events.service.ts
│   │   │   │   └── dto/
│   │   │   ├── uploads/           # Subida de archivos
│   │   │   │   ├── uploads.module.ts
│   │   │   │   ├── uploads.controller.ts
│   │   │   │   ├── uploads.service.ts
│   │   │   │   └── dto/
│   │   │   ├── notifications/     # Notificaciones
│   │   │   │   ├── notifications.module.ts
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   ├── notifications.service.ts
│   │   │   │   └── dto/
│   │   │   ├── audit/             # Auditoría
│   │   │   │   ├── audit.module.ts
│   │   │   │   ├── audit.controller.ts
│   │   │   │   ├── audit.service.ts
│   │   │   │   ├── audit.interceptor.ts
│   │   │   │   └── dto/
│   │   │   └── reports/           # Reportes
│   │   │       ├── reports.module.ts
│   │   │       ├── reports.controller.ts
│   │   │       ├── reports.service.ts
│   │   │       └── dto/
│   │   └── prisma/                # Prisma Service
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── uploads/                   # Carpeta de archivos subidos
│   ├── logs/                      # Logs de la aplicación
│   ├── .env
│   ├── .env.example
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml             # Orquestación Docker
├── docker-compose.prod.yml        # Docker producción
├── .gitignore
├── .prettierrc
├── .eslintrc.js
└── README.md
```

---

## Arquitectura y Patrones

### Backend (NestJS)

**Arquitectura:** Modular por dominio

**Patrones implementados:**
- **Repository Pattern:** Prisma como capa de acceso a datos
- **DTO Pattern:** Validación y transformación de entrada/salida
- **Guard Pattern:** Autenticación y autorización
- **Interceptor Pattern:** Logging, transformación, auditoría
- **Filter Pattern:** Manejo centralizado de excepciones
- **Strategy Pattern:** Estrategias de autenticación (JWT, Refresh)
- **Decorator Pattern:** Decoradores personalizados para roles y usuario actual

**Flujo de una petición:**
```
Request
  → Middleware (CORS, Helmet, Rate Limit)
  → Guard (JWT Auth, Roles)
  → Interceptor (Logging, Transform)
  → Pipe (Validation)
  → Controller
  → Service
  → Prisma/Repository
  → Response
  → Interceptor (Audit Log)
```

### Frontend (Next.js 14)

**Arquitectura:** App Router con Server Components

**Patrones implementados:**
- **Compound Components:** Componentes UI complejos
- **Container/Presentational:** Separación de lógica y vista
- **Custom Hooks:** Lógica reutilizable
- **Provider Pattern:** Contextos de autenticación y UI
- **Render Props / HOC:** Cuando sea necesario

**Estrategia de Rendering:**

| Página | Tipo | Justificación |
|--------|------|---------------|
| Home público | SSG | Contenido estático, máximo rendimiento |
| Login | SSR | SEO no necesario, seguridad |
| Dashboard | CSR | Datos dinámicos, interactividad |
| Lista de estudiantes | SSR + CSR | Datos iniciales en servidor, paginación cliente |
| Detalle de estudiante | SSR | SEO interno, datos principales en servidor |
| Reportes | CSR | Altamente interactivo, filtros dinámicos |

**Data Fetching:**
- **Server Components:** fetch() con revalidación
- **Client Components:** TanStack Query con caché
- **Mutaciones:** TanStack Query mutations con invalidación

---

## Seguridad (OWASP + Mejoras)

### Autenticación y Sesiones

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Login Request (email + password)                        │
│         │                                                   │
│         ▼                                                   │
│  2. Validar credenciales                                    │
│         │                                                   │
│         ▼                                                   │
│  3. Generar tokens:                                         │
│     ├── Access Token (JWT, 15 min, en memoria)              │
│     └── Refresh Token (JWT, 7 días, HttpOnly Cookie)        │
│         │                                                   │
│         ▼                                                   │
│  4. Response:                                               │
│     ├── Body: { accessToken, user }                         │
│     └── Cookie: refreshToken (HttpOnly, Secure, SameSite)   │
│                                                             │
│  5. Peticiones subsecuentes:                                │
│     └── Header: Authorization: Bearer <accessToken>         │
│                                                             │
│  6. Token expirado:                                         │
│     └── POST /auth/refresh (usa cookie refreshToken)        │
│         └── Retorna nuevo accessToken                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configuración de Cookies (HttpOnly)

```typescript
// Configuración del Refresh Token Cookie
{
  httpOnly: true,          // No accesible desde JavaScript
  secure: true,            // Solo HTTPS (producción)
  sameSite: 'strict',      // Protección CSRF
  path: '/api/auth',       // Solo para rutas de auth
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  domain: '.tudominio.com' // Producción
}
```

### Medidas de Seguridad Implementadas

#### OWASP Top 10 - Mitigaciones

| Vulnerabilidad | Mitigación |
|----------------|------------|
| A01 - Broken Access Control | Guards de roles, validación de ownership |
| A02 - Cryptographic Failures | bcrypt para passwords, HTTPS obligatorio |
| A03 - Injection | Prisma ORM (queries parametrizadas), validación Zod/class-validator |
| A04 - Insecure Design | Arquitectura segura por defecto, principio de mínimo privilegio |
| A05 - Security Misconfiguration | Helmet, CORS estricto, variables de entorno |
| A06 - Vulnerable Components | Auditoría de dependencias, actualizaciones |
| A07 - Auth Failures | JWT con refresh, rate limiting en login, bloqueo por intentos |
| A08 - Data Integrity | Validación estricta, sanitización de entrada |
| A09 - Logging Failures | Winston logging, auditoría completa |
| A10 - SSRF | Validación de URLs, whitelist de dominios |

#### Medidas Adicionales

**Rate Limiting:**
```
- Login: 5 intentos por minuto por IP
- API general: 100 peticiones por minuto por usuario
- Subida de archivos: 10 por minuto
- Webhooks de pago: Sin límite (IPs whitelist)
```

**Headers de Seguridad (Helmet):**
```
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'
- Referrer-Policy: strict-origin-when-cross-origin
```

**Validación de Archivos:**
```
- Whitelist de extensiones: .pdf, .doc, .docx, .jpg, .png, .jpeg
- Tamaño máximo: 10MB
- Verificación de MIME type real (magic bytes)
- Renombrado de archivos (UUID)
- Almacenamiento fuera de webroot
- Escaneo antivirus (opcional)
```

**Protección de Datos Sensibles:**
```
- Passwords: bcrypt con salt rounds = 12
- Tokens: Firmados con secreto rotativo
- Datos en tránsito: TLS 1.3
- Datos en reposo: Encriptación de BD (opcional)
- Logs: Sin datos sensibles (passwords, tokens)
```

**Auditoría de Seguridad:**
```
- Login exitoso/fallido
- Cambios de contraseña
- Cambios de rol
- Acceso a datos sensibles
- Modificación de calificaciones
- Exportación de datos
```

---

## Optimización y Rendimiento

### Frontend

**Next.js Optimizations:**
```typescript
// next.config.js
{
  images: {
    domains: ['tu-cdn.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}
```

**Estrategias de Caché:**
```
- Static assets: Cache-Control max-age=31536000
- API responses: TanStack Query staleTime por tipo
- Images: Next/Image con optimización automática
- Fonts: next/font con preload
```

**Code Splitting:**
```
- Rutas: Automático con App Router
- Componentes pesados: dynamic() con ssr: false
- Librerías grandes: Importación dinámica
```

**Bundle Optimization:**
```
- Tree shaking automático
- Análisis con @next/bundle-analyzer
- Lazy loading de componentes no críticos
- Prefetch de rutas probables
```

### Backend

**Prisma Optimizations:**
```typescript
// Queries eficientes
- Select solo campos necesarios
- Include con límites
- Paginación cursor-based para grandes datasets
- Índices en campos frecuentes (schema.prisma)
```

**Caché (Redis opcional):**
```
- Sesiones de usuario
- Resultados de queries frecuentes
- Rate limiting counters
- Cache de configuraciones
```

**Connection Pooling:**
```
- Prisma: connection_limit en DATABASE_URL
- MySQL: max_connections configurado
```

### Base de Datos

**Índices Recomendados:**
```sql
-- Usuarios
INDEX idx_users_email ON users(email)
INDEX idx_users_code ON users(code)
INDEX idx_users_role ON users(role)

-- Estudiantes
INDEX idx_students_user_id ON students(user_id)
INDEX idx_enrollments_student_period ON enrollments(student_id, period_id)

-- Tareas y Exámenes
INDEX idx_tasks_course_id ON tasks(course_id)
INDEX idx_task_submissions_task_student ON task_submissions(task_id, student_id)
INDEX idx_exams_course_id ON exams(course_id)
INDEX idx_exam_grades_exam_student ON exam_grades(exam_id, student_id)

-- Auditoría
INDEX idx_audit_user_id ON audit_logs(user_id)
INDEX idx_audit_created_at ON audit_logs(created_at)
INDEX idx_audit_action_module ON audit_logs(action, module)
```

---

## Integración de Pagos

### MercadoPago

**Flujo de Pago:**
```
1. Tutor selecciona conceptos a pagar
2. Frontend solicita preferencia al backend
3. Backend crea preferencia en MercadoPago
4. Backend retorna ID de preferencia
5. Frontend abre checkout de MercadoPago
6. Usuario completa pago
7. MercadoPago envía webhook al backend
8. Backend valida firma del webhook
9. Backend actualiza estado del pago
10. Backend notifica al tutor
```

**Configuración:**
```typescript
// Variables de entorno
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=xxx
MERCADOPAGO_NOTIFICATION_URL=https://api.tudominio.com/payments/webhook/mercadopago
```

### Yape (QR)

**Flujo de Pago:**
```
1. Tutor selecciona pagar con Yape
2. Backend genera código QR con monto
3. Frontend muestra QR al tutor
4. Tutor escanea con app Yape
5. Tutor confirma pago en su app
6. Backend recibe confirmación (webhook o polling)
7. Backend actualiza estado del pago
8. Frontend muestra confirmación
```

**Nota:** Yape empresarial requiere integración específica con BCP.

---

## Escalabilidad

### Horizontal Scaling Ready

**Frontend:**
```
- Stateless: Sin estado en servidor
- CDN: Assets estáticos en CDN
- Edge: Middleware en Edge Runtime
```

**Backend:**
```
- Stateless: Sesiones en Redis (no en memoria)
- Load Balancer: Nginx/HAProxy ready
- Múltiples instancias: PM2 cluster mode
```

**Base de Datos:**
```
- Read replicas para reportes
- Connection pooling con PgBouncer/ProxySQL
- Particionamiento de tablas grandes (auditoría)
```

### Multi-Tenancy Ready

**Estrategia:** Base de datos compartida con discriminador

```
- Cada tabla principal tiene school_id
- Todas las queries filtran por school_id
- Guards validan acceso al tenant correcto
- Índices incluyen school_id
```

---

## Deployment

### Desarrollo Local

```bash
# Requisitos
- Node.js 18+
- MySQL 8+
- npm o yarn

# Setup
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Producción

**Docker Compose:**
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.tudominio.com

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=mysql://...
      - JWT_SECRET=...
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
```

---

## Testing

### Backend

```
- Unit Tests: Jest + mocks de Prisma
- Integration Tests: Jest + Supertest + BD de prueba
- E2E Tests: Jest + Supertest
- Cobertura mínima: 80%
```

### Frontend

```
- Unit Tests: Jest + React Testing Library
- Component Tests: Storybook + Chromatic
- E2E Tests: Playwright o Cypress
- Cobertura mínima: 70%
```

---

## Monitoreo y Logging

### Logging (Winston)

```typescript
// Niveles
- error: Errores críticos
- warn: Advertencias
- info: Información general
- debug: Debugging (solo desarrollo)

// Formato producción
{ timestamp, level, message, context, requestId, userId }

// Rotación de logs
- Diario
- Máximo 14 días
- Compresión de logs antiguos
```

### Monitoreo (Recomendado)

```
- Uptime: UptimeRobot o similar
- APM: New Relic, Datadog o similar
- Errores: Sentry
- Métricas: Prometheus + Grafana
```

---

## Variables de Entorno

### Backend (.env)

```env
# App
NODE_ENV=development
PORT=4000
API_PREFIX=api

# Database
DATABASE_URL=mysql://user:password@localhost:3306/school_db

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=otro-secreto-super-seguro
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECRET=secreto-para-cookies
COOKIE_DOMAIN=localhost

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_DEST=./uploads

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

# Yape
YAPE_MERCHANT_CODE=
YAPE_API_KEY=

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# App
NEXT_PUBLIC_APP_NAME=Sistema de Gestión Escolar
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MercadoPago (public key)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
```

---

## Comandos Útiles

### Backend

```bash
# Desarrollo
npm run start:dev          # Servidor con hot reload
npm run start:debug        # Con debugger

# Base de datos
npx prisma migrate dev     # Crear migración
npx prisma migrate deploy  # Aplicar migraciones
npx prisma db seed         # Poblar datos iniciales
npx prisma studio          # GUI de BD

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Cobertura

# Build
npm run build              # Compilar
npm run start:prod         # Producción
```

### Frontend

```bash
# Desarrollo
npm run dev                # Servidor desarrollo

# Build
npm run build              # Compilar
npm run start              # Producción
npm run analyze            # Analizar bundle

# Testing
npm run test               # Tests
npm run test:watch         # Watch mode
npm run cypress            # E2E

# Linting
npm run lint               # ESLint
npm run lint:fix           # Fix automático
```

---

## Convenciones de Código

### Nombres

```
- Archivos: kebab-case (create-student.dto.ts)
- Clases: PascalCase (CreateStudentDto)
- Funciones: camelCase (createStudent)
- Constantes: UPPER_SNAKE_CASE (MAX_FILE_SIZE)
- Variables: camelCase (studentName)
- Tipos/Interfaces: PascalCase con prefijo I opcional (IStudent o Student)
```

### Estructura de Commits

```
tipo(alcance): descripción corta

Tipos:
- feat: Nueva funcionalidad
- fix: Corrección de bug
- docs: Documentación
- style: Formato (no afecta código)
- refactor: Refactorización
- test: Tests
- chore: Mantenimiento

Ejemplos:
feat(students): agregar endpoint de búsqueda avanzada
fix(auth): corregir expiración de refresh token
docs(readme): actualizar instrucciones de instalación
```

### Branches

```
- main: Producción
- develop: Desarrollo
- feature/nombre: Nueva funcionalidad
- fix/nombre: Corrección
- hotfix/nombre: Corrección urgente en producción
```

---

## Checklist de Implementación

### Fase 1: Fundamentos
- [ ] Setup proyecto (monorepo)
- [ ] Configurar Next.js con App Router
- [ ] Configurar NestJS con estructura modular
- [ ] Configurar Prisma con MySQL
- [ ] Implementar sistema de autenticación (JWT + Refresh)
- [ ] Implementar guards de roles
- [ ] Configurar seguridad básica (Helmet, CORS, Rate Limit)
- [ ] Crear componentes UI base

### Fase 2: Gestión de Usuarios
- [ ] CRUD de usuarios (Admin, Profesor, Estudiante, Tutor)
- [ ] Generación automática de códigos
- [ ] Vinculación Tutor-Estudiante
- [ ] Gestión de estados (activo/inactivo)

### Fase 3: Estructura Académica
- [ ] Gestión de periodos
- [ ] Gestión de niveles
- [ ] Gestión de grados
- [ ] Gestión de secciones/grupos
- [ ] Gestión de materias
- [ ] Creación de cursos (asignaciones)
- [ ] Inscripción de estudiantes

### Fase 4: Horarios
- [ ] Configuración de bloques horarios
- [ ] Asignación de horarios
- [ ] Validación de conflictos
- [ ] Visualización por rol

### Fase 5: Evaluaciones
- [ ] CRUD de tareas
- [ ] Subida/descarga de archivos
- [ ] Entregas de estudiantes
- [ ] Calificación de tareas
- [ ] CRUD de exámenes
- [ ] Registro de calificaciones

### Fase 6: Asistencia
- [ ] Registro de asistencia
- [ ] Justificaciones
- [ ] Reportes de asistencia

### Fase 7: Pagos
- [ ] Gestión de conceptos de pago
- [ ] Generación de cargos
- [ ] Integración MercadoPago
- [ ] Integración Yape
- [ ] Estados de cuenta

### Fase 8: Auditoría y Reportes
- [ ] Sistema de auditoría completo
- [ ] Reportes académicos
- [ ] Reportes de asistencia
- [ ] Reportes financieros
- [ ] Exportación a Excel/PDF

### Fase 9: Comunicación
- [ ] Sistema de notificaciones
- [ ] Eventos públicos
- [ ] Home público

### Fase 10: Optimización y Deploy
- [ ] Optimización de queries
- [ ] Optimización de frontend
- [ ] Configuración Docker
- [ ] CI/CD pipeline
- [ ] Monitoreo y logging
- [ ] Documentación final

---

## Archivo de Tareas

Ver el archivo **[tasks.md](tasks.md)** para el seguimiento detallado de tareas completadas y pendientes.

---

## Changelog (Historial de Modificaciones)

### 2024-12-13 - Configuración Inicial

**Agregado:**
- Estructura completa del documento de especificación técnica
- Definición de 4 roles: Admin, Profesor, Estudiante, Tutor
- Stack tecnológico completo (Frontend + Backend)
- Guía de animaciones con Framer Motion
- Estructura de carpetas del proyecto
- Patrones de arquitectura y seguridad OWASP
- Sistema de autenticación JWT + HttpOnly cookies
- Checklist de implementación por fases

### 2024-12-13 - Actualización de Versiones y Credenciales

**Agregado:**
- Versiones exactas de todos los paquetes (Diciembre 2024)
- Credenciales de MySQL (root/1234)
- Credenciales de MercadoPago (TEST)
- Configuración de puertos (Frontend: 3000, Backend: 4000)
- Paquetes de Radix UI para shadcn/ui
- Utilidades adicionales: recharts, react-table, react-dropzone, next-themes
- Documentación de shadcn/ui y componentes a implementar

**Modificado:**
- Sección de UI Components ahora incluye shadcn/ui
- Tabla de componentes shadcn/ui a implementar

---

## Contacto y Soporte

Para dudas sobre la implementación, consultar este documento o los comentarios en el código.

**Última actualización:** 13 Diciembre 2024
