# Sistema de Gestion Escolar - Backend Specification

## Documento de Especificacion Tecnica para Backend

**Version:** 1.0
**Stack:** NestJS + Prisma ORM + PostgreSQL + Redis + Socket.IO
**Seguridad:** OWASP Top 10 + HTTP-Only Cookies
**Objetivo:** API REST + WebSocket para aplicacion web y movil

---

## TABLA DE CONTENIDOS

1. [Stack Tecnologico](#1-stack-tecnologico)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Esquema de Base de Datos (Prisma)](#3-esquema-de-base-de-datos-prisma)
4. [Modulos NestJS](#4-modulos-nestjs)
5. [Endpoints API REST](#5-endpoints-api-rest)
6. [WebSocket con Redis](#6-websocket-con-redis)
7. [Autenticacion y Autorizacion](#7-autenticacion-y-autorizacion)
8. [Seguridad OWASP Completa](#8-seguridad-owasp-completa)
9. [Optimizacion y Rendimiento](#9-optimizacion-y-rendimiento)
10. [Compatibilidad Movil](#10-compatibilidad-movil)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Estructura de Carpetas](#12-estructura-de-carpetas)
13. [Principios SOLID](#13-principios-solid)
14. [Patrones de Diseno](#14-patrones-de-diseno)
15. [Codigo Reutilizable](#15-codigo-reutilizable)
16. [Manejo de Errores](#16-manejo-de-errores)
17. [Testing](#17-testing)
18. [Logging y Monitoreo](#18-logging-y-monitoreo)
19. [Buenas Practicas](#19-buenas-practicas)
20. [Checklist de Implementacion](#20-checklist-de-implementacion)

---

## 1. STACK TECNOLOGICO

### 1.1 Core
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| NestJS | ^10.x | Framework backend |
| TypeScript | ^5.x | Lenguaje |
| PostgreSQL | ^15.x | Base de datos principal |
| Prisma ORM | ^5.x | ORM y migraciones |
| Redis | ^7.x | Cache, sesiones, WebSocket adapter |
| Socket.IO | ^4.x | Comunicacion en tiempo real |

### 1.2 Seguridad
| Paquete | Proposito |
|---------|-----------|
| @nestjs/passport | Autenticacion |
| passport-jwt | Estrategia JWT |
| bcrypt | Hash de passwords |
| helmet | Headers de seguridad |
| @nestjs/throttler | Rate limiting |
| class-validator | Validacion de DTOs |
| class-transformer | Transformacion de datos |

### 1.3 Dependencias Adicionales
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "helmet": "^7.0.0",
    "cookie-parser": "^1.4.6",
    "socket.io": "^4.7.0",
    "@socket.io/redis-adapter": "^8.2.0",
    "ioredis": "^5.3.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "@nestjs/serve-static": "^4.0.0"
  }
}
```

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Diagrama de Arquitectura

```
                              ┌─────────────────────────────────────┐
                              │          LOAD BALANCER              │
                              │            (Nginx)                  │
                              └─────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
            ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
            │   Frontend    │       │    Mobile     │       │    Mobile     │
            │   (Next.js)   │       │   (Android)   │       │    (iOS)      │
            └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
                    │                       │                       │
                    └───────────────────────┼───────────────────────┘
                                            │
                              ┌─────────────▼───────────────────────┐
                              │         API GATEWAY                 │
                              │         (NestJS)                    │
                              │                                     │
                              │  ┌─────────────┐ ┌───────────────┐  │
                              │  │   REST API  │ │   WebSocket   │  │
                              │  │  (HTTP/S)   │ │  (Socket.IO)  │  │
                              │  └──────┬──────┘ └───────┬───────┘  │
                              │         │               │           │
                              │  ┌──────▼───────────────▼───────┐   │
                              │  │      Service Layer           │   │
                              │  │  (Business Logic)            │   │
                              │  └──────────────┬───────────────┘   │
                              │                 │                   │
                              └─────────────────┼───────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────┐
                    │                           │                       │
            ┌───────▼───────┐           ┌───────▼───────┐       ┌───────▼───────┐
            │  PostgreSQL   │           │    Redis      │       │   File        │
            │  (Primary DB) │           │ (Cache/WS)    │       │   Storage     │
            └───────────────┘           └───────────────┘       └───────────────┘
```

### 2.2 Flujo de Autenticacion con HTTP-Only Cookies

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Cliente │                    │  API    │                    │  Redis  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  POST /auth/login            │                              │
     │  {email, password}           │                              │
     │─────────────────────────────>│                              │
     │                              │                              │
     │                              │  Validate credentials        │
     │                              │  Generate JWT tokens         │
     │                              │                              │
     │                              │  Store refresh token         │
     │                              │─────────────────────────────>│
     │                              │                              │
     │  Set-Cookie: accessToken     │                              │
     │  Set-Cookie: refreshToken    │                              │
     │  (HttpOnly, Secure, SameSite)│                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │  GET /api/protected          │                              │
     │  Cookie: accessToken         │                              │
     │─────────────────────────────>│                              │
     │                              │                              │
     │                              │  Verify JWT from cookie      │
     │                              │                              │
     │  200 OK + data               │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
```

---

## 3. ESQUEMA DE BASE DE DATOS (PRISMA)

### 3.1 Archivo schema.prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
  PARENT
}

enum Status {
  active
  inactive
}

enum Level {
  Inicial
  Primaria
  Secundaria
}

enum Turno {
  Manana
  Tarde
  Noche
}

enum TaskStatus {
  pending
  closed
}

enum StudentTaskStatus {
  pending
  submitted
  graded
  not_submitted
}

enum ExamStatus {
  scheduled
  completed
  graded
}

enum ExamType {
  partial
  final
  quiz
}

enum PaymentStatus {
  paid
  pending
  overdue
}

enum PaymentMethod {
  cash
  card
  transfer
  mercadopago
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

enum NotificationType {
  info
  warning
  success
  error
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  VIEW
}

enum CurriculumStatus {
  planned
  taught
  rescheduled
}

enum ParticipantRole {
  TEACHER
  PARENT
  ADMIN
}

enum AttachmentType {
  image
  pdf
  document
}

// ============================================
// MODELOS PRINCIPALES
// ============================================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  code          String    @unique
  firstName     String
  lastName      String
  phone         String?
  role          UserRole
  status        Status    @default(active)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  // Relaciones segun rol
  student       Student?
  teacher       Teacher?
  parent        Parent?

  // Relaciones comunes
  notifications Notification[]
  auditLogs     AuditLog[]
  refreshTokens RefreshToken[]

  @@index([email])
  @@index([role])
  @@index([status])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  isRevoked Boolean  @default(false)

  @@index([userId])
  @@index([token])
}

model Student {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  code            String    @unique
  birthDate       DateTime
  address         String?
  enrollmentDate  DateTime  @default(now())

  // Relaciones
  gradeSectionId  String
  gradeSection    GradeSection @relation(fields: [gradeSectionId], references: [id])
  parentId        String?
  parent          Parent?   @relation(fields: [parentId], references: [id])

  attendances     Attendance[]
  taskSubmissions TaskSubmission[]
  examAttempts    ExamAttempt[]
  payments        Payment[]

  @@index([gradeSectionId])
  @@index([parentId])
  @@index([code])
}

model Teacher {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  code            String    @unique
  specialization  String
  hireDate        DateTime

  // Relaciones
  subjects        Subject[]
  courses         Course[]
  schedules       Schedule[]
  tasks           Task[]
  exams           Exam[]
  curriculumTopics CurriculumTopic[]
  monthlyTopics   MonthlyTopic[]

  // Tutor de grado
  gradeSectionsTutor GradeSection[] @relation("TutorRelation")

  // Participacion en conversaciones
  conversationParticipants ConversationParticipant[]

  @@index([code])
  @@index([specialization])
}

model Parent {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  address     String?
  occupation  String?

  // Relaciones
  children    Student[]
  payments    Payment[]

  // Participacion en conversaciones
  conversationParticipants ConversationParticipant[]

  @@index([userId])
}

// ============================================
// ESTRUCTURA ACADEMICA
// ============================================

model TurnoConfig {
  id          String   @id @default(uuid())
  nombre      Turno    @unique
  horaInicio  String   // "07:30"
  horaFin     String   // "12:30"
  status      Status   @default(active)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  gradeSections GradeSection[]
}

model GradeSection {
  id              String   @id @default(uuid())
  grade           String   // "5to", "6to"
  section         String   // "A", "B"
  level           Level
  capacity        Int      @default(30)
  currentStudents Int      @default(0)
  status          Status   @default(active)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Turno
  turnoId         String
  turno           TurnoConfig @relation(fields: [turnoId], references: [id])

  // Tutor
  tutorId         String?
  tutor           Teacher? @relation("TutorRelation", fields: [tutorId], references: [id])

  // Relaciones
  students        Student[]
  subjects        Subject[]
  courses         Course[]
  group           Group?

  @@unique([grade, section, level])
  @@index([level])
  @@index([turnoId])
}

model Group {
  id              String   @id @default(uuid())
  name            String
  gradeSectionId  String   @unique
  gradeSection    GradeSection @relation(fields: [gradeSectionId], references: [id], onDelete: Cascade)
  status          Status   @default(active)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([gradeSectionId])
}

model Subject {
  id              String   @id @default(uuid())
  name            String
  code            String   @unique
  description     String?
  hoursPerWeek    Int      @default(2)
  color           String   @default("#3B82F6")
  status          Status   @default(active)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relaciones
  gradeSectionId  String
  gradeSection    GradeSection @relation(fields: [gradeSectionId], references: [id])
  teacherId       String?
  teacher         Teacher? @relation(fields: [teacherId], references: [id])

  courses         Course[]

  @@index([gradeSectionId])
  @@index([teacherId])
}

model Course {
  id              String   @id @default(uuid())
  room            String?
  status          Status   @default(active)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relaciones
  subjectId       String
  subject         Subject  @relation(fields: [subjectId], references: [id])
  gradeSectionId  String
  gradeSection    GradeSection @relation(fields: [gradeSectionId], references: [id])
  teacherId       String
  teacher         Teacher  @relation(fields: [teacherId], references: [id])

  schedules       Schedule[]
  tasks           Task[]
  exams           Exam[]
  attendances     Attendance[]
  curriculumTopics CurriculumTopic[]
  monthlyTopics   MonthlyTopic[]

  @@unique([subjectId, gradeSectionId])
  @@index([teacherId])
}

model Schedule {
  id          String   @id @default(uuid())
  dayOfWeek   Int      // 1=Lunes, 5=Viernes
  startTime   String   // "08:00"
  endTime     String   // "09:30"
  room        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  teacherId   String
  teacher     Teacher  @relation(fields: [teacherId], references: [id])

  @@index([courseId])
  @@index([teacherId])
  @@index([dayOfWeek])
}

// ============================================
// TAREAS Y EXAMENES
// ============================================

model Task {
  id            String     @id @default(uuid())
  title         String
  description   String
  dueDate       DateTime
  assignedDate  DateTime   @default(now())
  maxScore      Int        @default(100)
  status        TaskStatus @default(pending)
  totalStudents Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relaciones
  courseId      String
  course        Course     @relation(fields: [courseId], references: [id])
  teacherId     String
  teacher       Teacher    @relation(fields: [teacherId], references: [id])

  submissions   TaskSubmission[]
  attachments   TaskAttachment[]

  @@index([courseId])
  @@index([teacherId])
  @@index([dueDate])
  @@index([status])
}

model TaskSubmission {
  id            String            @id @default(uuid())
  score         Float?
  feedback      String?
  submittedAt   DateTime?
  gradedAt      DateTime?
  status        StudentTaskStatus @default(pending)

  // Relaciones
  taskId        String
  task          Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])

  attachments   SubmissionAttachment[]

  @@unique([taskId, studentId])
  @@index([taskId])
  @@index([studentId])
  @@index([status])
}

model TaskAttachment {
  id        String   @id @default(uuid())
  name      String
  url       String
  type      String
  size      Int
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([taskId])
}

model SubmissionAttachment {
  id           String   @id @default(uuid())
  name         String
  url          String
  type         String
  size         Int
  submissionId String
  submission   TaskSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())

  @@index([submissionId])
}

model Exam {
  id            String     @id @default(uuid())
  title         String
  description   String?
  examDate      DateTime
  startTime     String     // "08:00"
  endTime       String     // "10:00"
  type          ExamType
  maxScore      Int        @default(100)
  status        ExamStatus @default(scheduled)
  averageScore  Float?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relaciones
  courseId      String
  course        Course     @relation(fields: [courseId], references: [id])
  teacherId     String
  teacher       Teacher    @relation(fields: [teacherId], references: [id])

  attempts      ExamAttempt[]

  @@index([courseId])
  @@index([teacherId])
  @@index([examDate])
  @@index([status])
}

model ExamAttempt {
  id          String    @id @default(uuid())
  score       Float?
  feedback    String?
  completedAt DateTime?
  gradedAt    DateTime?

  // Relaciones
  examId      String
  exam        Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  studentId   String
  student     Student   @relation(fields: [studentId], references: [id])

  @@unique([examId, studentId])
  @@index([examId])
  @@index([studentId])
}

// ============================================
// ASISTENCIA
// ============================================

model Attendance {
  id        String           @id @default(uuid())
  date      DateTime
  status    AttendanceStatus
  notes     String?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  // Relaciones
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  studentId String
  student   Student  @relation(fields: [studentId], references: [id])

  @@unique([courseId, studentId, date])
  @@index([courseId])
  @@index([studentId])
  @@index([date])
}

model AttendanceSessionFile {
  id          String   @id @default(uuid())
  courseId    String
  date        DateTime
  fileName    String
  fileUrl     String
  fileType    String
  fileSize    Int
  uploadedBy  String
  uploadedAt  DateTime @default(now())

  @@unique([courseId, date])
  @@index([courseId])
}

// ============================================
// PAGOS
// ============================================

model Payment {
  id            String        @id @default(uuid())
  concept       String
  amount        Float
  dueDate       DateTime
  paidDate      DateTime?
  status        PaymentStatus @default(pending)
  paymentMethod PaymentMethod?
  invoiceNumber String?       @unique
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relaciones
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  parentId      String
  parent        Parent    @relation(fields: [parentId], references: [id])

  @@index([studentId])
  @@index([parentId])
  @@index([status])
  @@index([dueDate])
}

// ============================================
// NOTIFICACIONES
// ============================================

model Notification {
  id           String           @id @default(uuid())
  title        String
  message      String
  type         NotificationType @default(info)
  targetRole   UserRole?
  targetUserId String?
  targetUser   User?            @relation(fields: [targetUserId], references: [id])
  read         Boolean          @default(false)
  readAt       DateTime?
  createdAt    DateTime         @default(now())

  @@index([targetUserId])
  @@index([targetRole])
  @@index([read])
}

// ============================================
// AUDITORIA
// ============================================

model AuditLog {
  id          String      @id @default(uuid())
  action      AuditAction
  module      String
  description String
  ipAddress   String?
  userAgent   String?
  details     Json?
  timestamp   DateTime    @default(now())

  // Relaciones
  userId      String
  user        User        @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([module])
  @@index([action])
  @@index([timestamp])
}

// ============================================
// CURRICULUM
// ============================================

model CurriculumTopic {
  id             String           @id @default(uuid())
  unit           Int
  title          String
  description    String?
  objectives     String[]
  estimatedHours Int              @default(2)
  month          Int
  status         CurriculumStatus @default(planned)
  attachmentUrl  String?
  attachmentName String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  // Relaciones
  courseId       String
  course         Course   @relation(fields: [courseId], references: [id])
  teacherId      String
  teacher        Teacher  @relation(fields: [teacherId], references: [id])

  monthlyTopics  MonthlyTopic[]

  @@index([courseId])
  @@index([teacherId])
  @@index([month])
}

model MonthlyTopic {
  id                String    @id @default(uuid())
  date              DateTime
  month             Int
  year              Int
  title             String
  description       String?
  attachmentUrl     String?
  attachmentName    String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relaciones
  curriculumTopicId String?
  curriculumTopic   CurriculumTopic? @relation(fields: [curriculumTopicId], references: [id])
  courseId          String
  course            Course    @relation(fields: [courseId], references: [id])
  teacherId         String
  teacher           Teacher   @relation(fields: [teacherId], references: [id])

  @@index([courseId])
  @@index([teacherId])
  @@index([month, year])
}

// ============================================
// MENSAJERIA
// ============================================

model Conversation {
  id                String    @id @default(uuid())
  studentId         String?   // Conversacion puede ser sobre un estudiante
  studentName       String?
  gradeSection      String?
  lastMessage       String?
  lastMessageAt     DateTime  @default(now())
  lastMessageSenderId String?
  createdBy         String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relaciones
  participants      ConversationParticipant[]
  messages          Message[]

  @@index([studentId])
  @@index([createdBy])
}

model ConversationParticipant {
  id             String          @id @default(uuid())
  role           ParticipantRole
  unreadCount    Int             @default(0)
  joinedAt       DateTime        @default(now())

  // Relaciones
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  // Puede ser Teacher o Parent
  teacherId      String?
  teacher        Teacher?     @relation(fields: [teacherId], references: [id])
  parentId       String?
  parent         Parent?      @relation(fields: [parentId], references: [id])

  @@unique([conversationId, teacherId])
  @@unique([conversationId, parentId])
  @@index([conversationId])
  @@index([teacherId])
  @@index([parentId])
}

model Message {
  id             String   @id @default(uuid())
  content        String
  senderId       String
  senderName     String
  senderRole     ParticipantRole
  createdAt      DateTime @default(now())

  // Relaciones
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  readBy         MessageRead[]
  attachments    MessageAttachment[]

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}

model MessageRead {
  id        String   @id @default(uuid())
  userId    String
  readAt    DateTime @default(now())

  messageId String
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
  @@index([messageId])
}

model MessageAttachment {
  id        String         @id @default(uuid())
  name      String
  type      AttachmentType
  url       String
  size      Int

  messageId String
  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@index([messageId])
}
```

---

## 4. MODULOS NESTJS

### 4.1 Estructura de Modulos

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── ws-auth.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   └── timeout.interceptor.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── ws-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── middleware/
│       ├── logger.middleware.ts
│       └── cors.middleware.ts
├── config/
│   ├── config.module.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── jwt.config.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts
└── modules/
    ├── auth/
    ├── users/
    ├── students/
    ├── teachers/
    ├── parents/
    ├── grade-sections/
    ├── groups/
    ├── subjects/
    ├── courses/
    ├── schedules/
    ├── tasks/
    ├── exams/
    ├── attendance/
    ├── payments/
    ├── notifications/
    ├── audit/
    ├── curriculum/
    ├── messages/
    └── uploads/
```

### 4.2 Modulo de Autenticacion (auth)

```typescript
// src/modules/auth/auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
```

### 4.3 DTOs de Autenticacion

```typescript
// src/modules/auth/dto/login.dto.ts
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// src/modules/auth/dto/auth-response.dto.ts
export class AuthResponseDto {
  user: UserResponseDto;
  // Tokens van en cookies HTTP-Only
}

// src/modules/auth/dto/refresh-token.dto.ts
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

### 4.4 Servicio de Autenticacion

```typescript
// src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.validateUser(dto.email, dto.password);
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    return user;
  }

  async generateTokens(user: User): Promise<Tokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });

    // Tambien guardar en Redis para busqueda rapida
    await this.redisService.set(
      `refresh_token:${userId}`,
      hashedToken,
      7 * 24 * 60 * 60, // 7 dias en segundos
    );
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar token en Redis primero (mas rapido)
    const storedToken = await this.redisService.get(`refresh_token:${userId}`);
    if (!storedToken) {
      throw new UnauthorizedException('Token de refresco invalido');
    }

    const isValid = await bcrypt.compare(refreshToken, storedToken);
    if (!isValid) {
      throw new UnauthorizedException('Token de refresco invalido');
    }

    // Revocar token anterior y generar nuevos
    await this.revokeRefreshToken(userId);
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.revokeRefreshToken(userId);
    await this.redisService.del(`refresh_token:${userId}`);
  }

  private async revokeRefreshToken(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
```

### 4.5 Controlador de Autenticacion

```typescript
// src/modules/auth/auth.controller.ts
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const { user, tokens } = await this.authService.login(dto);

    // Configurar cookies HTTP-Only
    this.setAuthCookies(response, tokens);

    return { user: new UserResponseDto(user) };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = request.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresco no proporcionado');
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    const tokens = await this.authService.refreshTokens(payload.sub, refreshToken);

    this.setAuthCookies(response, tokens);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(user.sub);
    this.clearAuthCookies(response);
    return { message: 'Sesion cerrada exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    const userData = await this.authService.getProfile(user.sub);
    return new UserResponseDto(userData);
  }

  private setAuthCookies(response: Response, tokens: Tokens): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access Token - 15 minutos
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    // Refresh Token - 7 dias
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      path: '/auth/refresh', // Solo accesible en ruta de refresh
    });
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
  }
}
```

---

## 5. ENDPOINTS API REST

### 5.1 Autenticacion

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/auth/login` | Iniciar sesion | No | - |
| POST | `/auth/refresh` | Refrescar token | Cookie | - |
| POST | `/auth/logout` | Cerrar sesion | Si | All |
| GET | `/auth/me` | Obtener perfil actual | Si | All |
| POST | `/auth/forgot-password` | Solicitar reset | No | - |
| POST | `/auth/reset-password` | Resetear password | No | - |

### 5.2 Usuarios

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/users` | Listar usuarios | Si | ADMIN |
| GET | `/users/:id` | Obtener usuario | Si | ADMIN |
| POST | `/users` | Crear usuario | Si | ADMIN |
| PUT | `/users/:id` | Actualizar usuario | Si | ADMIN |
| DELETE | `/users/:id` | Eliminar usuario | Si | ADMIN |
| PATCH | `/users/:id/status` | Cambiar status | Si | ADMIN |

### 5.3 Estudiantes

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/students` | Listar estudiantes | Si | ADMIN, TEACHER |
| GET | `/students/:id` | Obtener estudiante | Si | ADMIN, TEACHER, PARENT |
| POST | `/students` | Crear estudiante | Si | ADMIN |
| PUT | `/students/:id` | Actualizar estudiante | Si | ADMIN |
| DELETE | `/students/:id` | Eliminar estudiante | Si | ADMIN |
| GET | `/students/grade-section/:id` | Por seccion | Si | ADMIN, TEACHER |
| GET | `/students/:id/attendance` | Asistencia | Si | All |
| GET | `/students/:id/tasks` | Tareas | Si | All |
| GET | `/students/:id/exams` | Examenes | Si | All |
| GET | `/students/:id/payments` | Pagos | Si | ADMIN, PARENT |

### 5.4 Profesores

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teachers` | Listar profesores | Si | ADMIN |
| GET | `/teachers/:id` | Obtener profesor | Si | ADMIN, TEACHER |
| POST | `/teachers` | Crear profesor | Si | ADMIN |
| PUT | `/teachers/:id` | Actualizar profesor | Si | ADMIN |
| DELETE | `/teachers/:id` | Eliminar profesor | Si | ADMIN |
| GET | `/teachers/:id/courses` | Cursos asignados | Si | ADMIN, TEACHER |
| GET | `/teachers/:id/schedule` | Horario | Si | ADMIN, TEACHER |

### 5.5 Padres/Tutores

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/parents` | Listar padres | Si | ADMIN |
| GET | `/parents/:id` | Obtener padre | Si | ADMIN, PARENT |
| POST | `/parents` | Crear padre | Si | ADMIN |
| PUT | `/parents/:id` | Actualizar padre | Si | ADMIN |
| DELETE | `/parents/:id` | Eliminar padre | Si | ADMIN |
| GET | `/parents/:id/children` | Hijos | Si | ADMIN, PARENT |

### 5.6 Estructura Academica

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/grade-sections` | Listar secciones | Si | ADMIN, TEACHER |
| GET | `/grade-sections/:id` | Obtener seccion | Si | ADMIN, TEACHER |
| POST | `/grade-sections` | Crear seccion | Si | ADMIN |
| PUT | `/grade-sections/:id` | Actualizar seccion | Si | ADMIN |
| DELETE | `/grade-sections/:id` | Eliminar seccion | Si | ADMIN |
| GET | `/groups` | Listar grupos | Si | ADMIN, TEACHER |
| GET | `/groups/:id` | Obtener grupo | Si | ADMIN, TEACHER |
| GET | `/groups/:id/students` | Estudiantes del grupo | Si | ADMIN, TEACHER |
| GET | `/turnos` | Listar turnos | Si | ADMIN |
| POST | `/turnos` | Crear turno | Si | ADMIN |

### 5.7 Materias y Cursos

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/subjects` | Listar materias | Si | ADMIN, TEACHER |
| GET | `/subjects/:id` | Obtener materia | Si | ADMIN, TEACHER |
| POST | `/subjects` | Crear materia | Si | ADMIN |
| PUT | `/subjects/:id` | Actualizar materia | Si | ADMIN |
| DELETE | `/subjects/:id` | Eliminar materia | Si | ADMIN |
| GET | `/courses` | Listar cursos | Si | ADMIN, TEACHER |
| GET | `/courses/:id` | Obtener curso | Si | ADMIN, TEACHER |
| POST | `/courses` | Crear curso | Si | ADMIN |
| PUT | `/courses/:id` | Actualizar curso | Si | ADMIN |
| DELETE | `/courses/:id` | Eliminar curso | Si | ADMIN |

### 5.8 Horarios

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/schedules` | Listar horarios | Si | All |
| GET | `/schedules/grade-section/:id` | Por seccion | Si | All |
| GET | `/schedules/teacher/:id` | Por profesor | Si | ADMIN, TEACHER |
| POST | `/schedules` | Crear horario | Si | ADMIN |
| PUT | `/schedules/:id` | Actualizar horario | Si | ADMIN |
| DELETE | `/schedules/:id` | Eliminar horario | Si | ADMIN |

### 5.9 Tareas

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/tasks` | Listar tareas | Si | All |
| GET | `/tasks/:id` | Obtener tarea | Si | All |
| POST | `/tasks` | Crear tarea | Si | ADMIN, TEACHER |
| PUT | `/tasks/:id` | Actualizar tarea | Si | ADMIN, TEACHER |
| DELETE | `/tasks/:id` | Eliminar tarea | Si | ADMIN, TEACHER |
| GET | `/tasks/course/:id` | Por curso | Si | TEACHER, STUDENT |
| GET | `/tasks/teacher/:id` | Por profesor | Si | ADMIN, TEACHER |
| POST | `/tasks/:id/submit` | Entregar tarea | Si | STUDENT |
| PUT | `/tasks/:id/grade` | Calificar tarea | Si | TEACHER |
| PATCH | `/tasks/:id/close` | Cerrar tarea | Si | TEACHER |

### 5.10 Examenes

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/exams` | Listar examenes | Si | All |
| GET | `/exams/:id` | Obtener examen | Si | All |
| POST | `/exams` | Crear examen | Si | ADMIN, TEACHER |
| PUT | `/exams/:id` | Actualizar examen | Si | ADMIN, TEACHER |
| DELETE | `/exams/:id` | Eliminar examen | Si | ADMIN, TEACHER |
| GET | `/exams/course/:id` | Por curso | Si | TEACHER, STUDENT |
| PUT | `/exams/:id/grade` | Calificar examen | Si | TEACHER |
| PATCH | `/exams/:id/status` | Cambiar status | Si | TEACHER |

### 5.11 Asistencia

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/attendance` | Listar asistencia | Si | All |
| GET | `/attendance/course/:id` | Por curso | Si | TEACHER |
| GET | `/attendance/student/:id` | Por estudiante | Si | All |
| POST | `/attendance` | Registrar asistencia | Si | TEACHER |
| PUT | `/attendance/:id` | Actualizar asistencia | Si | TEACHER |
| DELETE | `/attendance/:id` | Eliminar asistencia | Si | TEACHER |
| POST | `/attendance/mark-all` | Marcar todos | Si | TEACHER |
| GET | `/attendance/summary/:studentId` | Resumen | Si | All |
| POST | `/attendance/session-file` | Subir archivo | Si | TEACHER |
| GET | `/attendance/session-file/:courseId/:date` | Obtener archivo | Si | TEACHER |

### 5.12 Pagos

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/payments` | Listar pagos | Si | ADMIN, PARENT |
| GET | `/payments/:id` | Obtener pago | Si | ADMIN, PARENT |
| POST | `/payments` | Crear pago | Si | ADMIN |
| PUT | `/payments/:id` | Actualizar pago | Si | ADMIN |
| DELETE | `/payments/:id` | Eliminar pago | Si | ADMIN |
| GET | `/payments/student/:id` | Por estudiante | Si | ADMIN, PARENT |
| GET | `/payments/parent/:id` | Por padre | Si | ADMIN, PARENT |
| POST | `/payments/:id/pay` | Marcar como pagado | Si | ADMIN, PARENT |
| POST | `/payments/mercadopago/create` | Crear pago MP | Si | PARENT |
| POST | `/payments/mercadopago/webhook` | Webhook MP | No | - |

### 5.13 Notificaciones

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/notifications` | Mis notificaciones | Si | All |
| GET | `/notifications/all` | Todas (admin) | Si | ADMIN |
| POST | `/notifications` | Crear notificacion | Si | ADMIN |
| PUT | `/notifications/:id/read` | Marcar leida | Si | All |
| PUT | `/notifications/read-all` | Marcar todas | Si | All |
| DELETE | `/notifications/:id` | Eliminar | Si | ADMIN |

### 5.14 Auditoria

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/audit-logs` | Listar logs | Si | ADMIN |
| GET | `/audit-logs/user/:id` | Por usuario | Si | ADMIN |
| GET | `/audit-logs/module/:name` | Por modulo | Si | ADMIN |
| GET | `/audit-logs/date-range` | Por rango fecha | Si | ADMIN |

### 5.15 Curriculum

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/curriculum` | Listar temas | Si | ADMIN, TEACHER |
| GET | `/curriculum/:id` | Obtener tema | Si | ADMIN, TEACHER |
| POST | `/curriculum` | Crear tema | Si | ADMIN, TEACHER |
| PUT | `/curriculum/:id` | Actualizar tema | Si | ADMIN, TEACHER |
| DELETE | `/curriculum/:id` | Eliminar tema | Si | ADMIN, TEACHER |
| GET | `/curriculum/course/:id` | Por curso | Si | ADMIN, TEACHER |
| GET | `/monthly-topics` | Listar topicos | Si | ADMIN, TEACHER |
| POST | `/monthly-topics` | Crear topico | Si | TEACHER |
| PUT | `/monthly-topics/:id` | Actualizar topico | Si | TEACHER |
| DELETE | `/monthly-topics/:id` | Eliminar topico | Si | TEACHER |

### 5.16 Mensajeria

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/conversations` | Mis conversaciones | Si | TEACHER, PARENT |
| GET | `/conversations/:id` | Obtener conversacion | Si | TEACHER, PARENT |
| POST | `/conversations` | Crear conversacion | Si | TEACHER, PARENT |
| DELETE | `/conversations/:id` | Eliminar conversacion | Si | TEACHER, PARENT |
| GET | `/conversations/:id/messages` | Mensajes | Si | TEACHER, PARENT |
| POST | `/messages` | Enviar mensaje | Si | TEACHER, PARENT |
| PUT | `/messages/:id/read` | Marcar leido | Si | TEACHER, PARENT |
| GET | `/conversations/unread-count` | Conteo no leidos | Si | TEACHER, PARENT |

### 5.17 Uploads

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/uploads` | Subir archivo | Si | All |
| POST | `/uploads/image` | Subir imagen | Si | All |
| DELETE | `/uploads/:id` | Eliminar archivo | Si | All |
| GET | `/uploads/:id` | Obtener archivo | Si | All |

---

## 6. WEBSOCKET CON REDIS

### 6.1 Configuracion de Socket.IO con Redis Adapter

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser para HTTP-Only cookies
  app.use(cookieParser());

  // Configurar Redis Adapter para Socket.IO
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  const redisIoAdapter = new IoAdapter(app);
  redisIoAdapter.createIOServer = (port: number, options?: any) => {
    const server = require('socket.io')(port, options);
    server.adapter(createAdapter(pubClient, subClient));
    return server;
  };

  app.useWebSocketAdapter(redisIoAdapter);

  // Configuracion CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

### 6.2 WebSocket Gateway para Chat

```typescript
// src/modules/messages/messages.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '@/common/guards/ws-auth.guard';
import { MessagesService } from './messages.service';
import { RedisService } from '@/redis/redis.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extraer y verificar token de cookie o header
      const token = this.extractToken(client);
      const user = await this.verifyToken(token);

      if (!user) {
        client.disconnect();
        return;
      }

      // Guardar socket ID en Redis para el usuario
      await this.redisService.hSet(
        'online_users',
        user.id,
        JSON.stringify({
          socketId: client.id,
          role: user.role,
          connectedAt: new Date().toISOString(),
        }),
      );

      // Unir a salas personales
      client.join(`user:${user.id}`);
      client.data.user = user;

      // Cargar conversaciones del usuario y unir a sus salas
      const conversations = await this.messagesService.getUserConversations(user.id);
      for (const conv of conversations) {
        client.join(`conversation:${conv.id}`);
      }

      console.log(`Usuario ${user.id} conectado - Socket: ${client.id}`);

      // Notificar a otros usuarios que este usuario esta online
      this.server.emit('user:online', { userId: user.id });
    } catch (error) {
      console.error('Error en conexion WebSocket:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      await this.redisService.hDel('online_users', user.id);
      this.server.emit('user:offline', { userId: user.id });
      console.log(`Usuario ${user.id} desconectado`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; attachments?: any[] },
  ) {
    const user = client.data.user;

    const message = await this.messagesService.create({
      conversationId: data.conversationId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role,
      content: data.content,
      attachments: data.attachments || [],
    });

    // Emitir a todos los participantes de la conversacion
    this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
      message,
      conversationId: data.conversationId,
    });

    // Actualizar contadores de no leidos para otros participantes
    await this.updateUnreadCounters(data.conversationId, user.id);

    return { success: true, message };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageIds: string[] },
  ) {
    const user = client.data.user;

    await this.messagesService.markAsRead(data.messageIds, user.id);

    // Notificar al remitente que sus mensajes fueron leidos
    this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
      conversationId: data.conversationId,
      messageIds: data.messageIds,
      readBy: user.id,
    });

    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user;

    client.to(`conversation:${data.conversationId}`).emit('typing:start', {
      conversationId: data.conversationId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user;

    client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      conversationId: data.conversationId,
      userId: user.id,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user;

    // Verificar que el usuario es participante
    const isParticipant = await this.messagesService.isParticipant(
      data.conversationId,
      user.id,
    );

    if (isParticipant) {
      client.join(`conversation:${data.conversationId}`);
      return { success: true };
    }

    return { success: false, error: 'No autorizado' };
  }

  // Metodo para enviar notificaciones en tiempo real
  async sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  // Metodo para broadcast a un rol especifico
  async broadcastToRole(role: string, event: string, data: any) {
    const onlineUsers = await this.redisService.hGetAll('online_users');

    for (const [userId, userData] of Object.entries(onlineUsers)) {
      const user = JSON.parse(userData as string);
      if (user.role === role) {
        this.server.to(`user:${userId}`).emit(event, data);
      }
    }
  }

  private extractToken(client: Socket): string | null {
    // Intentar obtener de cookie primero
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const accessToken = cookies
        .split(';')
        .find((c) => c.trim().startsWith('accessToken='));
      if (accessToken) {
        return accessToken.split('=')[1];
      }
    }

    // Fallback a header de autorizacion (para mobile)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private async verifyToken(token: string): Promise<any> {
    // Implementar verificacion de JWT
    // Retornar datos del usuario o null si es invalido
  }

  private async updateUnreadCounters(conversationId: string, senderId: string) {
    const participants = await this.messagesService.getConversationParticipants(
      conversationId,
    );

    for (const participant of participants) {
      if (participant.id !== senderId) {
        await this.messagesService.incrementUnreadCount(
          conversationId,
          participant.id,
        );

        // Emitir actualizacion de contador
        this.server.to(`user:${participant.id}`).emit('unread:update', {
          conversationId,
          count: await this.messagesService.getUnreadCount(
            conversationId,
            participant.id,
          ),
        });
      }
    }
  }
}
```

### 6.3 Gateway de Notificaciones

```typescript
// src/modules/notifications/notifications.gateway.ts
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private redisService: RedisService) {}

  // Enviar notificacion a usuario especifico
  async sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Enviar a todos los usuarios de un rol
  async sendToRole(role: UserRole, notification: any) {
    this.server.to(`role:${role}`).emit('notification', notification);
  }

  // Broadcast a todos los usuarios
  async broadcast(notification: any) {
    this.server.emit('notification', notification);
  }

  // Enviar actualizacion de contador
  async sendUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unread:count', { count });
  }
}
```

### 6.4 Servicio Redis

```typescript
// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  // String operations
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Hash operations
  async hGet(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, field, value);
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.redis.hdel(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  // Set operations
  async sAdd(key: string, ...members: string[]): Promise<void> {
    await this.redis.sadd(key, ...members);
  }

  async sRem(key: string, ...members: string[]): Promise<void> {
    await this.redis.srem(key, ...members);
  }

  async sMembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    return (await this.redis.sismember(key, member)) === 1;
  }

  // Cache helpers
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const value = await factory();
    await this.set(key, JSON.stringify(value), ttl);
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Pub/Sub
  async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = this.redis.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }
}
```

### 6.5 Eventos WebSocket

| Namespace | Evento | Direccion | Descripcion |
|-----------|--------|-----------|-------------|
| `/chat` | `message:send` | Client -> Server | Enviar mensaje |
| `/chat` | `message:new` | Server -> Client | Nuevo mensaje recibido |
| `/chat` | `message:read` | Bidireccional | Marcar como leido |
| `/chat` | `typing:start` | Client -> Server | Usuario escribiendo |
| `/chat` | `typing:stop` | Client -> Server | Usuario dejo de escribir |
| `/chat` | `conversation:join` | Client -> Server | Unirse a conversacion |
| `/chat` | `user:online` | Server -> Client | Usuario conectado |
| `/chat` | `user:offline` | Server -> Client | Usuario desconectado |
| `/chat` | `unread:update` | Server -> Client | Actualizar no leidos |
| `/notifications` | `notification` | Server -> Client | Nueva notificacion |
| `/notifications` | `unread:count` | Server -> Client | Contador actualizado |

---

## 7. AUTENTICACION Y AUTORIZACION

### 7.1 Estrategia JWT

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extraer de cookie HTTP-Only
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
        // Fallback a header Authorization (para mobile)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return payload;
  }
}
```

### 7.2 Guard de Roles

```typescript
// src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### 7.3 Decorador de Roles

```typescript
// src/common/decorators/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Uso:
@Roles(UserRole.ADMIN, UserRole.TEACHER)
@Get('protected-route')
async protectedRoute() {}
```

### 7.4 Decorador de Usuario Actual

```typescript
// src/common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Uso:
@Get('me')
async getMe(@CurrentUser() user: JwtPayload) {}

@Get('my-id')
async getMyId(@CurrentUser('sub') userId: string) {}
```

---

## 8. SEGURIDAD OWASP

### 8.1 Configuracion de Helmet

```typescript
// src/main.ts
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),
);
```

### 8.2 Rate Limiting

```typescript
// src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 segundo
        limit: 3,      // 3 requests
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 segundos
        limit: 20,     // 20 requests
      },
      {
        name: 'long',
        ttl: 60000,   // 1 minuto
        limit: 100,    // 100 requests
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 8.3 Rate Limiting Especifico para Login

```typescript
// src/modules/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(@Body() dto: LoginDto) {}

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 por hora
  async forgotPassword(@Body() dto: ForgotPasswordDto) {}
}
```

### 8.4 Validacion de Input (A03: Injection)

```typescript
// src/modules/students/dto/create-student.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsDateString, IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitize } from 'class-sanitizer';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => sanitize(value.trim()))
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => sanitize(value.trim()))
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[\d\s-]{7,15}$/, {
    message: 'Numero de telefono invalido',
  })
  phone?: string;

  @IsDateString()
  birthDate: string;

  @IsUUID()
  gradeSectionId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
```

### 8.5 Configuracion CORS Segura

```typescript
// src/main.ts
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.MOBILE_APP_ORIGIN,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 horas
});
```

### 8.6 Prevencion de SQL Injection

```typescript
// Prisma ORM maneja esto automaticamente con queries parametrizadas
// NUNCA usar raw queries sin parametros

// MAL:
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = '${email}'`;

// BIEN:
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

// MEJOR - usar el cliente de Prisma:
const users = await prisma.user.findMany({
  where: { email },
});
```

### 8.7 Hash de Passwords Seguro

```typescript
// src/modules/auth/auth.service.ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Factor de costo recomendado

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 8.8 Proteccion contra XSS

```typescript
// src/common/pipes/sanitize.pipe.ts
import { PipeTransform, Injectable } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    const sanitized: any = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeHtml(obj[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
}
```

### 8.9 Checklist OWASP Top 10

| # | Vulnerabilidad | Mitigacion |
|---|----------------|------------|
| A01 | Broken Access Control | Guards de roles, validacion de ownership |
| A02 | Cryptographic Failures | bcrypt, HTTPS, cookies seguras |
| A03 | Injection | Prisma ORM, validacion de DTOs |
| A04 | Insecure Design | Arquitectura segura por defecto |
| A05 | Security Misconfiguration | Helmet, CORS, env vars |
| A06 | Vulnerable Components | Auditorias npm, actualizaciones |
| A07 | Auth Failures | JWT HTTP-Only, rate limiting |
| A08 | Data Integrity Failures | Validacion, sanitizacion |
| A09 | Logging Failures | Audit logs, no logs de datos sensibles |
| A10 | SSRF | Validacion de URLs, whitelist |

---

## 9. OPTIMIZACION Y RENDIMIENTO

### 9.1 Caching con Redis

```typescript
// src/common/decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

export const Cache = (key: string, ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL, ttl)(target, propertyKey, descriptor);
  };
};
```

```typescript
// src/common/interceptors/cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService, private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY, context.getHandler());
    const cacheTtl = this.reflector.get<number>(CACHE_TTL, context.getHandler()) || 300;

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullKey = `${cacheKey}:${JSON.stringify(request.query)}`;

    const cached = await this.redisService.get(fullKey);
    if (cached) {
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.set(fullKey, JSON.stringify(data), cacheTtl);
      }),
    );
  }
}
```

### 9.2 Estrategias de Cache

```typescript
// src/modules/students/students.service.ts
@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async findAll(filters: StudentFilters): Promise<Student[]> {
    const cacheKey = `students:list:${JSON.stringify(filters)}`;

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.student.findMany({
          where: this.buildWhere(filters),
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            gradeSection: true,
            parent: { include: { user: true } },
          },
        });
      },
      300, // 5 minutos
    );
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = await this.prisma.student.create({ ... });

    // Invalidar cache relacionado
    await this.redisService.invalidate('students:*');

    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.prisma.student.update({ ... });

    // Invalidar cache especifico y listas
    await Promise.all([
      this.redisService.del(`students:${id}`),
      this.redisService.invalidate('students:list:*'),
    ]);

    return student;
  }
}
```

### 9.3 Paginacion Eficiente

```typescript
// src/common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// src/common/interfaces/paginated-response.interface.ts
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

```typescript
// src/common/utils/pagination.util.ts
export async function paginate<T>(
  prisma: any,
  model: string,
  paginationDto: PaginationDto,
  where: any = {},
  include: any = {},
): Promise<PaginatedResponse<T>> {
  const { page, limit, sortBy, sortOrder } = paginationDto;

  const [data, total] = await Promise.all([
    prisma[model].findMany({
      where,
      include,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    }),
    prisma[model].count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
```

### 9.4 Indices de Base de Datos

```sql
-- Indices adicionales recomendados (agregar en migraciones)

-- Busqueda por nombre completo
CREATE INDEX idx_user_fullname ON "User" (("firstName" || ' ' || "lastName"));

-- Busqueda de asistencia por fecha
CREATE INDEX idx_attendance_date ON "Attendance" ("date" DESC);

-- Busqueda de pagos pendientes
CREATE INDEX idx_payment_pending ON "Payment" ("status", "dueDate") WHERE "status" = 'pending';

-- Busqueda de mensajes recientes
CREATE INDEX idx_message_recent ON "Message" ("conversationId", "createdAt" DESC);

-- Busqueda de notificaciones no leidas
CREATE INDEX idx_notification_unread ON "Notification" ("targetUserId", "read") WHERE "read" = false;
```

### 9.5 Compresion de Respuestas

```typescript
// src/main.ts
import * as compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024, // Solo comprimir respuestas > 1KB
}));
```

### 9.6 Connection Pooling (Prisma)

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// .env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=10"
```

### 9.7 Query Optimization

```typescript
// Seleccionar solo campos necesarios
const students = await this.prisma.student.findMany({
  select: {
    id: true,
    code: true,
    user: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  },
});

// Usar include solo cuando sea necesario
const studentWithDetails = await this.prisma.student.findUnique({
  where: { id },
  include: {
    user: true,
    gradeSection: true,
    // Solo incluir relaciones necesarias
  },
});

// Batch operations
const [students, total] = await this.prisma.$transaction([
  this.prisma.student.findMany({ where, take: limit, skip: offset }),
  this.prisma.student.count({ where }),
]);
```

---

## 10. COMPATIBILIDAD MOVIL

### 10.1 Autenticacion para Mobile

```typescript
// src/modules/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  // Login para web (usa cookies)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    this.setAuthCookies(res, tokens);
    return { user };
  }

  // Login para mobile (retorna tokens en body)
  @Post('login/mobile')
  async loginMobile(@Body() dto: LoginDto) {
    const { user, tokens } = await this.authService.login(dto);
    return { user, ...tokens }; // Retorna accessToken y refreshToken
  }

  // Refresh para mobile
  @Post('refresh/mobile')
  async refreshMobile(@Body() dto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokenFromBody(dto.refreshToken);
    return tokens;
  }
}
```

### 10.2 Estrategia JWT Hibrida

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Intentar cookie (web)
        (request: Request) => request?.cookies?.accessToken,
        // 2. Fallback a header (mobile)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }
}
```

### 10.3 WebSocket para Mobile

```typescript
// Conexion WebSocket desde mobile
// El token se pasa en el header de handshake

const socket = io('https://api.escuela.com/chat', {
  extraHeaders: {
    Authorization: `Bearer ${accessToken}`,
  },
  transports: ['websocket'],
});
```

### 10.4 Endpoints Optimizados para Mobile

```typescript
// src/modules/students/students.controller.ts
@Controller('students')
export class StudentsController {
  // Endpoint completo para web
  @Get()
  async findAll(@Query() query: StudentFilters) {
    return this.studentsService.findAll(query);
  }

  // Endpoint ligero para mobile
  @Get('mobile/list')
  async findAllMobile(@Query() query: StudentFilters) {
    return this.studentsService.findAllLite(query);
  }
}

// Service
async findAllLite(filters: StudentFilters) {
  return this.prisma.student.findMany({
    where: this.buildWhere(filters),
    select: {
      id: true,
      code: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          // Sin email, phone, etc.
        },
      },
      gradeSection: {
        select: {
          grade: true,
          section: true,
        },
      },
    },
  });
}
```

### 10.5 Push Notifications

```typescript
// src/modules/notifications/push-notification.service.ts
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
  }

  async sendToUser(userId: string, notification: { title: string; body: string; data?: any }) {
    const userDevices = await this.getUserDeviceTokens(userId);

    if (userDevices.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
      tokens: userDevices,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'escuela_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    await admin.messaging().sendEachForMulticast(message);
  }
}
```

### 10.6 Registro de Dispositivos

```typescript
// src/modules/devices/devices.controller.ts
@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  @Post('register')
  async registerDevice(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.devicesService.register({
      userId: user.sub,
      deviceToken: dto.deviceToken,
      platform: dto.platform, // 'ios' | 'android'
      deviceId: dto.deviceId,
    });
  }

  @Delete('unregister')
  async unregisterDevice(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UnregisterDeviceDto,
  ) {
    return this.devicesService.unregister(user.sub, dto.deviceId);
  }
}
```

---

## 11. VARIABLES DE ENTORNO

### 11.1 Archivo .env.example

```env
# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
PORT=4000
API_VERSION=v1
API_PREFIX=/api

# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/escuela_db?schema=public"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=10

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379

# ===========================================
# JWT & AUTH
# ===========================================
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ===========================================
# CORS
# ===========================================
FRONTEND_URL=http://localhost:3000
MOBILE_APP_ORIGIN=

# ===========================================
# RATE LIMITING
# ===========================================
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# ===========================================
# FILE UPLOAD
# ===========================================
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf,application/msword
UPLOAD_DEST=./uploads

# ===========================================
# CLOUD STORAGE (Optional - S3/GCS/Azure)
# ===========================================
STORAGE_PROVIDER=local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=

# ===========================================
# PAYMENT GATEWAY (MercadoPago)
# ===========================================
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

# ===========================================
# EMAIL (Optional)
# ===========================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@escuela.com

# ===========================================
# PUSH NOTIFICATIONS (Firebase)
# ===========================================
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug
LOG_FORMAT=json

# ===========================================
# SECURITY
# ===========================================
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
```

---

## 12. ESTRUCTURA DE CARPETAS

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── cache.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── ws-auth.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── timeout.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── ws-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── sanitize.pipe.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   └── correlation-id.middleware.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── interfaces/
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── paginated-response.interface.ts
│   │   └── utils/
│   │       ├── pagination.util.ts
│   │       ├── hash.util.ts
│   │       └── date.util.ts
│   │
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── configuration.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── validation.schema.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   ├── register.dto.ts
│       │   │   ├── refresh-token.dto.ts
│       │   │   └── auth-response.dto.ts
│       │   └── strategies/
│       │       ├── jwt.strategy.ts
│       │       └── jwt-refresh.strategy.ts
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── dto/
│       │   │   ├── create-user.dto.ts
│       │   │   ├── update-user.dto.ts
│       │   │   └── user-response.dto.ts
│       │   └── entities/
│       │       └── user.entity.ts
│       │
│       ├── students/
│       │   ├── students.module.ts
│       │   ├── students.controller.ts
│       │   ├── students.service.ts
│       │   └── dto/
│       │       ├── create-student.dto.ts
│       │       ├── update-student.dto.ts
│       │       └── student-filters.dto.ts
│       │
│       ├── teachers/
│       │   ├── teachers.module.ts
│       │   ├── teachers.controller.ts
│       │   ├── teachers.service.ts
│       │   └── dto/
│       │
│       ├── parents/
│       │   ├── parents.module.ts
│       │   ├── parents.controller.ts
│       │   ├── parents.service.ts
│       │   └── dto/
│       │
│       ├── grade-sections/
│       │   ├── grade-sections.module.ts
│       │   ├── grade-sections.controller.ts
│       │   ├── grade-sections.service.ts
│       │   └── dto/
│       │
│       ├── groups/
│       │   ├── groups.module.ts
│       │   ├── groups.controller.ts
│       │   ├── groups.service.ts
│       │   └── dto/
│       │
│       ├── subjects/
│       │   ├── subjects.module.ts
│       │   ├── subjects.controller.ts
│       │   ├── subjects.service.ts
│       │   └── dto/
│       │
│       ├── courses/
│       │   ├── courses.module.ts
│       │   ├── courses.controller.ts
│       │   ├── courses.service.ts
│       │   └── dto/
│       │
│       ├── schedules/
│       │   ├── schedules.module.ts
│       │   ├── schedules.controller.ts
│       │   ├── schedules.service.ts
│       │   └── dto/
│       │
│       ├── tasks/
│       │   ├── tasks.module.ts
│       │   ├── tasks.controller.ts
│       │   ├── tasks.service.ts
│       │   └── dto/
│       │       ├── create-task.dto.ts
│       │       ├── update-task.dto.ts
│       │       ├── submit-task.dto.ts
│       │       └── grade-task.dto.ts
│       │
│       ├── exams/
│       │   ├── exams.module.ts
│       │   ├── exams.controller.ts
│       │   ├── exams.service.ts
│       │   └── dto/
│       │
│       ├── attendance/
│       │   ├── attendance.module.ts
│       │   ├── attendance.controller.ts
│       │   ├── attendance.service.ts
│       │   └── dto/
│       │
│       ├── payments/
│       │   ├── payments.module.ts
│       │   ├── payments.controller.ts
│       │   ├── payments.service.ts
│       │   ├── mercadopago.service.ts
│       │   └── dto/
│       │
│       ├── notifications/
│       │   ├── notifications.module.ts
│       │   ├── notifications.controller.ts
│       │   ├── notifications.service.ts
│       │   ├── notifications.gateway.ts
│       │   ├── push-notification.service.ts
│       │   └── dto/
│       │
│       ├── messages/
│       │   ├── messages.module.ts
│       │   ├── messages.controller.ts
│       │   ├── messages.service.ts
│       │   ├── messages.gateway.ts
│       │   └── dto/
│       │       ├── create-conversation.dto.ts
│       │       ├── send-message.dto.ts
│       │       └── message-response.dto.ts
│       │
│       ├── audit/
│       │   ├── audit.module.ts
│       │   ├── audit.controller.ts
│       │   ├── audit.service.ts
│       │   ├── audit.interceptor.ts
│       │   └── dto/
│       │
│       ├── curriculum/
│       │   ├── curriculum.module.ts
│       │   ├── curriculum.controller.ts
│       │   ├── curriculum.service.ts
│       │   ├── monthly-topics.controller.ts
│       │   ├── monthly-topics.service.ts
│       │   └── dto/
│       │
│       ├── uploads/
│       │   ├── uploads.module.ts
│       │   ├── uploads.controller.ts
│       │   ├── uploads.service.ts
│       │   ├── storage.service.ts
│       │   └── dto/
│       │
│       └── devices/
│           ├── devices.module.ts
│           ├── devices.controller.ts
│           ├── devices.service.ts
│           └── dto/
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .env
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## RESUMEN EJECUTIVO

Este documento especifica la arquitectura completa para el backend del Sistema de Gestion Escolar con:

### Tecnologias Core
- **NestJS** como framework principal
- **PostgreSQL** como base de datos relacional
- **Prisma ORM** para queries y migraciones
- **Redis** para cache y WebSocket adapter
- **Socket.IO** para comunicacion en tiempo real

### Seguridad (OWASP)
- Autenticacion JWT con **HTTP-Only Cookies**
- Rate limiting con **Throttler**
- Validacion de inputs con **class-validator**
- Headers de seguridad con **Helmet**
- Prevencion de inyecciones SQL con Prisma
- Hash seguro de passwords con **bcrypt**

### Optimizacion
- Cache multinivel con Redis
- Paginacion eficiente
- Compresion de respuestas
- Connection pooling
- Indices de base de datos optimizados

### Compatibilidad Movil
- Autenticacion dual (cookies + Bearer token)
- Endpoints optimizados para mobile
- Push notifications con Firebase
- WebSocket con fallback de headers

### Modulos Implementar
1. Auth (login, refresh, logout)
2. Users (CRUD)
3. Students, Teachers, Parents
4. GradeSections, Groups
5. Subjects, Courses, Schedules
6. Tasks (con entregas y calificaciones)
7. Exams (con intentos y calificaciones)
8. Attendance (con archivos de sesion)
9. Payments (con MercadoPago)
10. Notifications (con push)
11. Messages (chat en tiempo real)
12. Audit (logs de auditoria)
13. Curriculum (malla curricular)
14. Uploads (archivos)

---

## 13. PRINCIPIOS SOLID

### 13.1 S - Single Responsibility Principle (Responsabilidad Unica)

Cada clase/modulo debe tener UNA sola razon para cambiar.

```typescript
// MAL - Una clase hace demasiado
class StudentService {
  async createStudent() { /* ... */ }
  async sendWelcomeEmail() { /* ... */ }  // No deberia estar aqui
  async generatePDF() { /* ... */ }        // No deberia estar aqui
  async validatePayment() { /* ... */ }    // No deberia estar aqui
}

// BIEN - Separar responsabilidades
@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,      // Inyectar servicios especializados
    private pdfService: PdfService,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = await this.prisma.student.create({ data: dto });
    await this.emailService.sendWelcomeEmail(student.email);
    return student;
  }
}

@Injectable()
export class EmailService {
  async sendWelcomeEmail(email: string): Promise<void> { /* ... */ }
  async sendPasswordReset(email: string): Promise<void> { /* ... */ }
}

@Injectable()
export class PdfService {
  async generateReport(data: any): Promise<Buffer> { /* ... */ }
  async generateInvoice(payment: Payment): Promise<Buffer> { /* ... */ }
}
```

### 13.2 O - Open/Closed Principle (Abierto/Cerrado)

Las clases deben estar abiertas para extension pero cerradas para modificacion.

```typescript
// Definir interfaces para extensibilidad
interface PaymentGateway {
  processPayment(amount: number, data: any): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
  getStatus(transactionId: string): Promise<PaymentStatus>;
}

// Implementaciones especificas
@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  async processPayment(amount: number, data: any): Promise<PaymentResult> {
    // Logica especifica de MercadoPago
  }
  async refund(transactionId: string): Promise<RefundResult> { /* ... */ }
  async getStatus(transactionId: string): Promise<PaymentStatus> { /* ... */ }
}

@Injectable()
export class StripeGateway implements PaymentGateway {
  async processPayment(amount: number, data: any): Promise<PaymentResult> {
    // Logica especifica de Stripe
  }
  async refund(transactionId: string): Promise<RefundResult> { /* ... */ }
  async getStatus(transactionId: string): Promise<PaymentStatus> { /* ... */ }
}

// Servicio que usa la abstraccion
@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYMENT_GATEWAY') private gateway: PaymentGateway,
  ) {}

  async pay(amount: number, data: any): Promise<PaymentResult> {
    return this.gateway.processPayment(amount, data);
  }
}

// Configuracion en el modulo
@Module({
  providers: [
    {
      provide: 'PAYMENT_GATEWAY',
      useClass: process.env.PAYMENT_PROVIDER === 'stripe'
        ? StripeGateway
        : MercadoPagoGateway,
    },
    PaymentsService,
  ],
})
export class PaymentsModule {}
```

### 13.3 L - Liskov Substitution Principle (Sustitucion de Liskov)

Las clases derivadas deben ser sustituibles por sus clases base.

```typescript
// Clase base abstracta
abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaService) {}

  abstract findAll(filters?: any): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

// Implementacion que respeta el contrato
@Injectable()
export class StudentsRepository extends BaseRepository<Student> {
  async findAll(filters?: StudentFilters): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: this.buildWhereClause(filters),
      include: { user: true, gradeSection: true },
    });
  }

  async findById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { id },
      include: { user: true, gradeSection: true },
    });
  }

  async create(data: CreateStudentDto): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async update(id: string, data: UpdateStudentDto): Promise<Student> {
    return this.prisma.student.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({ where: { id } });
  }

  private buildWhereClause(filters?: StudentFilters) { /* ... */ }
}
```

### 13.4 I - Interface Segregation Principle (Segregacion de Interfaces)

Los clientes no deben depender de interfaces que no usan.

```typescript
// MAL - Interface muy grande
interface IUserOperations {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  create(data: any): Promise<User>;
  update(id: string, data: any): Promise<User>;
  delete(id: string): Promise<void>;
  sendEmail(id: string, message: string): Promise<void>;
  generateReport(id: string): Promise<Buffer>;
  processPayment(id: string, amount: number): Promise<void>;
}

// BIEN - Interfaces segregadas
interface IReadable<T> {
  findAll(filters?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  count(filters?: any): Promise<number>;
}

interface IWritable<T> {
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}

interface ICrudRepository<T> extends IReadable<T>, IWritable<T> {}

interface ICacheable {
  invalidateCache(key: string): Promise<void>;
  getFromCache<T>(key: string): Promise<T | null>;
  setInCache<T>(key: string, value: T, ttl?: number): Promise<void>;
}

interface IAuditable {
  logAction(action: AuditAction, details: any): Promise<void>;
}

// Implementar solo lo necesario
@Injectable()
export class StudentsService implements ICrudRepository<Student>, IAuditable {
  // Implementa solo CRUD y auditoria, no email ni pagos
}
```

### 13.5 D - Dependency Inversion Principle (Inversion de Dependencias)

Los modulos de alto nivel no deben depender de modulos de bajo nivel. Ambos deben depender de abstracciones.

```typescript
// Definir abstracciones
interface IStorageService {
  upload(file: Express.Multer.File): Promise<string>;
  delete(url: string): Promise<void>;
  getSignedUrl(url: string, expiresIn?: number): Promise<string>;
}

interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

interface INotificationService {
  send(userId: string, notification: NotificationDto): Promise<void>;
  broadcast(role: UserRole, notification: NotificationDto): Promise<void>;
}

// Implementaciones concretas
@Injectable()
export class S3StorageService implements IStorageService {
  async upload(file: Express.Multer.File): Promise<string> { /* AWS S3 */ }
  async delete(url: string): Promise<void> { /* ... */ }
  async getSignedUrl(url: string): Promise<string> { /* ... */ }
}

@Injectable()
export class LocalStorageService implements IStorageService {
  async upload(file: Express.Multer.File): Promise<string> { /* Local disk */ }
  async delete(url: string): Promise<void> { /* ... */ }
  async getSignedUrl(url: string): Promise<string> { /* ... */ }
}

// Inyeccion en modulo
@Module({
  providers: [
    {
      provide: 'IStorageService',
      useClass: process.env.STORAGE_PROVIDER === 's3'
        ? S3StorageService
        : LocalStorageService,
    },
    {
      provide: 'ICacheService',
      useClass: RedisService,
    },
    UploadsService,
  ],
})
export class UploadsModule {}

// Uso en servicio
@Injectable()
export class UploadsService {
  constructor(
    @Inject('IStorageService') private storage: IStorageService,
    @Inject('ICacheService') private cache: ICacheService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const url = await this.storage.upload(file);
    await this.cache.del('files:list'); // Invalidar cache
    return url;
  }
}
```

---

## 14. PATRONES DE DISENO

### 14.1 Repository Pattern

Abstrae el acceso a datos detrás de una interfaz.

```typescript
// src/common/interfaces/repository.interface.ts
export interface IRepository<T, CreateDto, UpdateDto> {
  findAll(options?: FindOptions): Promise<PaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  findOne(where: Partial<T>): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  createMany(data: CreateDto[]): Promise<T[]>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  count(where?: Partial<T>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

// src/common/repositories/base.repository.ts
export abstract class BaseRepository<T, CreateDto, UpdateDto>
  implements IRepository<T, CreateDto, UpdateDto> {

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  async findAll(options?: FindOptions): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 20, sortBy, sortOrder, where, include } = options || {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma[this.modelName].findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma[this.modelName].count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({ where: { id } });
  }

  async findOne(where: Partial<T>): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({ where });
  }

  async create(data: CreateDto): Promise<T> {
    return this.prisma[this.modelName].create({ data });
  }

  async createMany(data: CreateDto[]): Promise<T[]> {
    return this.prisma[this.modelName].createMany({ data, skipDuplicates: true });
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    return this.prisma[this.modelName].update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma[this.modelName].delete({ where: { id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma[this.modelName].update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }

  async count(where?: Partial<T>): Promise<number> {
    return this.prisma[this.modelName].count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma[this.modelName].count({ where: { id } });
    return count > 0;
  }
}

// Implementacion especifica
@Injectable()
export class StudentsRepository extends BaseRepository<
  Student,
  CreateStudentDto,
  UpdateStudentDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'student');
  }

  // Metodos especificos del repositorio
  async findByGradeSection(gradeSectionId: string): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { gradeSectionId },
      include: { user: true },
    });
  }

  async findByParent(parentId: string): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { parentId },
      include: { user: true, gradeSection: true },
    });
  }
}
```

### 14.2 Service Layer Pattern

Encapsula la logica de negocio.

```typescript
// src/common/services/base.service.ts
export abstract class BaseService<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly repository: IRepository<T, CreateDto, UpdateDto>,
    protected readonly cacheService?: ICacheService,
    protected readonly auditService?: IAuditService,
  ) {}

  async findAll(options?: FindOptions): Promise<PaginatedResult<T>> {
    const cacheKey = `${this.getCachePrefix()}:list:${JSON.stringify(options)}`;

    if (this.cacheService) {
      const cached = await this.cacheService.get<PaginatedResult<T>>(cacheKey);
      if (cached) return cached;
    }

    const result = await this.repository.findAll(options);

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, result, this.getCacheTtl());
    }

    return result;
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} con ID ${id} no encontrado`);
    }
    return entity;
  }

  async create(data: CreateDto, userId?: string): Promise<T> {
    const entity = await this.repository.create(data);

    await this.invalidateListCache();

    if (this.auditService && userId) {
      await this.auditService.log({
        userId,
        action: AuditAction.CREATE,
        module: this.getEntityName(),
        description: `Creado ${this.getEntityName()}`,
        details: data,
      });
    }

    return entity;
  }

  async update(id: string, data: UpdateDto, userId?: string): Promise<T> {
    await this.findById(id); // Verificar existencia

    const entity = await this.repository.update(id, data);

    await this.invalidateCache(id);

    if (this.auditService && userId) {
      await this.auditService.log({
        userId,
        action: AuditAction.UPDATE,
        module: this.getEntityName(),
        description: `Actualizado ${this.getEntityName()} ${id}`,
        details: data,
      });
    }

    return entity;
  }

  async delete(id: string, userId?: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
    await this.invalidateCache(id);

    if (this.auditService && userId) {
      await this.auditService.log({
        userId,
        action: AuditAction.DELETE,
        module: this.getEntityName(),
        description: `Eliminado ${this.getEntityName()} ${id}`,
      });
    }
  }

  protected abstract getEntityName(): string;
  protected abstract getCachePrefix(): string;
  protected getCacheTtl(): number { return 300; } // 5 minutos por defecto

  protected async invalidateCache(id: string): Promise<void> {
    if (this.cacheService) {
      await this.cacheService.del(`${this.getCachePrefix()}:${id}`);
      await this.invalidateListCache();
    }
  }

  protected async invalidateListCache(): Promise<void> {
    if (this.cacheService) {
      await this.cacheService.invalidatePattern(`${this.getCachePrefix()}:list:*`);
    }
  }
}
```

### 14.3 Factory Pattern

Crear objetos sin exponer la logica de creacion.

```typescript
// src/common/factories/notification.factory.ts
export class NotificationFactory {
  static createWelcome(user: User): CreateNotificationDto {
    return {
      title: 'Bienvenido al Sistema',
      message: `Hola ${user.firstName}, tu cuenta ha sido creada exitosamente.`,
      type: NotificationType.SUCCESS,
      targetUserId: user.id,
    };
  }

  static createTaskAssigned(task: Task, studentIds: string[]): CreateNotificationDto[] {
    return studentIds.map(studentId => ({
      title: 'Nueva Tarea Asignada',
      message: `Se ha asignado la tarea "${task.title}" con fecha de entrega ${task.dueDate}`,
      type: NotificationType.INFO,
      targetUserId: studentId,
    }));
  }

  static createPaymentReminder(payment: Payment): CreateNotificationDto {
    return {
      title: 'Recordatorio de Pago',
      message: `El pago de "${payment.concept}" por $${payment.amount} vence el ${payment.dueDate}`,
      type: NotificationType.WARNING,
      targetUserId: payment.parentId,
    };
  }

  static createPaymentOverdue(payment: Payment): CreateNotificationDto {
    return {
      title: 'Pago Vencido',
      message: `El pago de "${payment.concept}" esta vencido. Por favor regularice su situacion.`,
      type: NotificationType.ERROR,
      targetUserId: payment.parentId,
    };
  }

  static createExamScheduled(exam: Exam, studentIds: string[]): CreateNotificationDto[] {
    return studentIds.map(studentId => ({
      title: 'Examen Programado',
      message: `El examen "${exam.title}" esta programado para el ${exam.examDate} a las ${exam.startTime}`,
      type: NotificationType.INFO,
      targetUserId: studentId,
    }));
  }

  static createGradePublished(
    entityType: 'task' | 'exam',
    entityTitle: string,
    score: number,
    maxScore: number,
    studentId: string,
  ): CreateNotificationDto {
    return {
      title: `Calificacion Publicada`,
      message: `Tu ${entityType === 'task' ? 'tarea' : 'examen'} "${entityTitle}" ha sido calificado: ${score}/${maxScore}`,
      type: NotificationType.SUCCESS,
      targetUserId: studentId,
    };
  }
}
```

### 14.4 Strategy Pattern

Definir familia de algoritmos intercambiables.

```typescript
// src/common/strategies/grading.strategy.ts
interface IGradingStrategy {
  calculate(scores: number[], maxScore: number): number;
  getDescription(): string;
}

// Promedio simple
@Injectable()
export class AverageGradingStrategy implements IGradingStrategy {
  calculate(scores: number[], maxScore: number): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  getDescription(): string {
    return 'Promedio simple de todas las calificaciones';
  }
}

// Promedio ponderado (descarta la mas baja)
@Injectable()
export class WeightedGradingStrategy implements IGradingStrategy {
  calculate(scores: number[], maxScore: number): number {
    if (scores.length <= 1) return scores[0] || 0;

    const sorted = [...scores].sort((a, b) => a - b);
    sorted.shift(); // Eliminar la mas baja

    const sum = sorted.reduce((a, b) => a + b, 0);
    return Math.round((sum / sorted.length) * 100) / 100;
  }

  getDescription(): string {
    return 'Promedio descartando la calificacion mas baja';
  }
}

// Promedio con pesos por tipo
@Injectable()
export class TypeWeightedGradingStrategy implements IGradingStrategy {
  private weights = {
    quiz: 0.2,      // 20%
    partial: 0.3,   // 30%
    final: 0.5,     // 50%
  };

  calculate(scores: { score: number; type: string }[], maxScore: number): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const { score, type } of scores) {
      const weight = this.weights[type] || 0.33;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
  }

  getDescription(): string {
    return 'Promedio ponderado: Quiz 20%, Parcial 30%, Final 50%';
  }
}

// Uso en servicio
@Injectable()
export class GradesService {
  constructor(
    @Inject('GRADING_STRATEGY') private strategy: IGradingStrategy,
  ) {}

  calculateFinalGrade(studentId: string, courseId: string): number {
    const scores = this.getStudentScores(studentId, courseId);
    return this.strategy.calculate(scores, 100);
  }
}
```

### 14.5 Observer Pattern (Event-Driven)

NestJS tiene soporte nativo para eventos.

```typescript
// src/common/events/events.ts
export class StudentCreatedEvent {
  constructor(public readonly student: Student) {}
}

export class PaymentCompletedEvent {
  constructor(
    public readonly payment: Payment,
    public readonly method: PaymentMethod,
  ) {}
}

export class TaskGradedEvent {
  constructor(
    public readonly task: Task,
    public readonly studentId: string,
    public readonly score: number,
  ) {}
}

export class AttendanceMarkedEvent {
  constructor(
    public readonly courseId: string,
    public readonly date: string,
    public readonly records: Attendance[],
  ) {}
}

// src/modules/students/students.service.ts
@Injectable()
export class StudentsService {
  constructor(
    private eventEmitter: EventEmitter2,
    private repository: StudentsRepository,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = await this.repository.create(dto);

    // Emitir evento
    this.eventEmitter.emit('student.created', new StudentCreatedEvent(student));

    return student;
  }
}

// src/modules/notifications/notification.listener.ts
@Injectable()
export class NotificationListener {
  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  @OnEvent('student.created')
  async handleStudentCreated(event: StudentCreatedEvent) {
    // Crear notificacion de bienvenida
    const notification = NotificationFactory.createWelcome(event.student);
    await this.notificationsService.create(notification);

    // Enviar email de bienvenida
    await this.emailService.sendWelcomeEmail(event.student.email);
  }

  @OnEvent('payment.completed')
  async handlePaymentCompleted(event: PaymentCompletedEvent) {
    // Notificar al padre
    await this.notificationsService.create({
      title: 'Pago Confirmado',
      message: `Su pago de $${event.payment.amount} ha sido procesado exitosamente.`,
      type: NotificationType.SUCCESS,
      targetUserId: event.payment.parentId,
    });

    // Enviar recibo por email
    await this.emailService.sendPaymentReceipt(event.payment);
  }

  @OnEvent('task.graded')
  async handleTaskGraded(event: TaskGradedEvent) {
    const notification = NotificationFactory.createGradePublished(
      'task',
      event.task.title,
      event.score,
      event.task.maxScore,
      event.studentId,
    );
    await this.notificationsService.create(notification);
  }
}
```

---

## 15. CODIGO REUTILIZABLE

### 15.1 DTOs Base

```typescript
// src/common/dto/base.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  search?: string;
}

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class IdParamDto {
  @IsUUID()
  id: string;
}

export class BatchIdsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  ids: string[];
}

// Respuestas estandarizadas
export class ApiResponseDto<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto({ success: true, data, message });
  }

  static error(message: string, errors?: string[]): ApiResponseDto<null> {
    return new ApiResponseDto({ success: false, message, errors });
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

### 15.2 Decoradores Personalizados

```typescript
// src/common/decorators/api-paginated-response.decorator.ts
export const ApiPaginatedResponse = <T extends Type<any>>(model: T) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  totalPages: { type: 'number' },
                  hasNextPage: { type: 'boolean' },
                  hasPreviousPage: { type: 'boolean' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

// src/common/decorators/transform.decorator.ts
export function Trim() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}

export function ToLowerCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  });
}

export function ToUpperCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  });
}

export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') {
      return true;
    }
    if (value === 'false' || value === false || value === 0 || value === '0') {
      return false;
    }
    return value;
  });
}

export function ToDate() {
  return Transform(({ value }) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return value;
  });
}

// src/common/decorators/is-valid-date-range.decorator.ts
export function IsValidDateRange(
  startField: string,
  endField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const startDate = new Date(obj[startField]);
          const endDate = new Date(obj[endField]);
          return startDate <= endDate;
        },
        defaultMessage(args: ValidationArguments) {
          return `${startField} debe ser anterior o igual a ${endField}`;
        },
      },
    });
  };
}

// Uso:
export class ScheduleDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsValidDateRange('startDate', 'endDate')
  endDate: string;
}
```

### 15.3 Utilidades Comunes

```typescript
// src/common/utils/string.util.ts
export class StringUtil {
  static generateCode(prefix: string, length: number = 6): string {
    const random = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    return `${prefix}${random}`;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static capitalizeWords(text: string): string {
    return text.split(' ').map(word => this.capitalize(word)).join(' ');
  }

  static maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    const maskedUser = user.substring(0, 2) + '***';
    return `${maskedUser}@${domain}`;
  }

  static maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return `***${digits.slice(-4)}`;
  }

  static truncate(text: string, length: number, suffix: string = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
  }
}

// src/common/utils/date.util.ts
export class DateUtil {
  static formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  static getSchoolYear(): { start: Date; end: Date } {
    const now = new Date();
    const year = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
    return {
      start: new Date(year, 2, 1), // 1 de Marzo
      end: new Date(year, 11, 31), // 31 de Diciembre
    };
  }

  static getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  static getMonthName(month: number, locale: string = 'es'): string {
    const date = new Date(2024, month, 1);
    return date.toLocaleString(locale, { month: 'long' });
  }

  static getDayName(day: number, locale: string = 'es'): string {
    const days = {
      es: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    };
    return days[locale]?.[day] || days.es[day];
  }
}

// src/common/utils/hash.util.ts
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export class HashUtil {
  private static SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateToken(): string {
    return crypto.randomUUID();
  }

  static hashSHA256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
}

// src/common/utils/file.util.ts
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileUtil {
  private static ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  static generateFileName(originalName: string): string {
    const ext = extname(originalName);
    return `${uuidv4()}${ext}`;
  }

  static isImage(mimeType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(mimeType);
  }

  static isDocument(mimeType: string): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(mimeType);
  }

  static isAllowedType(mimeType: string): boolean {
    return this.isImage(mimeType) || this.isDocument(mimeType);
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileExtension(filename: string): string {
    return extname(filename).toLowerCase().slice(1);
  }
}
```

---

## 16. MANEJO DE ERRORES

### 16.1 Excepciones Personalizadas

```typescript
// src/common/exceptions/business.exception.ts
export class BusinessException extends HttpException {
  constructor(
    message: string,
    errorCode: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, any>,
  ) {
    super(
      {
        success: false,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

// Excepciones especificas
export class EntityNotFoundException extends BusinessException {
  constructor(entity: string, id: string) {
    super(
      `${entity} con ID ${id} no encontrado`,
      'ENTITY_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { entity, id },
    );
  }
}

export class DuplicateEntityException extends BusinessException {
  constructor(entity: string, field: string, value: string) {
    super(
      `Ya existe un ${entity} con ${field}: ${value}`,
      'DUPLICATE_ENTITY',
      HttpStatus.CONFLICT,
      { entity, field, value },
    );
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super(
      'Credenciales invalidas',
      'INVALID_CREDENTIALS',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InsufficientPermissionsException extends BusinessException {
  constructor(action: string, resource: string) {
    super(
      `No tiene permisos para ${action} en ${resource}`,
      'INSUFFICIENT_PERMISSIONS',
      HttpStatus.FORBIDDEN,
      { action, resource },
    );
  }
}

export class InvalidOperationException extends BusinessException {
  constructor(operation: string, reason: string) {
    super(
      `Operacion invalida: ${operation}. Razon: ${reason}`,
      'INVALID_OPERATION',
      HttpStatus.BAD_REQUEST,
      { operation, reason },
    );
  }
}

export class ResourceLockedException extends BusinessException {
  constructor(resource: string) {
    super(
      `El recurso ${resource} esta bloqueado`,
      'RESOURCE_LOCKED',
      HttpStatus.LOCKED,
      { resource },
    );
  }
}

export class RateLimitExceededException extends BusinessException {
  constructor(limit: number, windowMs: number) {
    super(
      `Limite de solicitudes excedido. Maximo ${limit} solicitudes por ${windowMs / 1000} segundos`,
      'RATE_LIMIT_EXCEEDED',
      HttpStatus.TOO_MANY_REQUESTS,
      { limit, windowMs },
    );
  }
}

export class PaymentFailedException extends BusinessException {
  constructor(reason: string, transactionId?: string) {
    super(
      `Error en el pago: ${reason}`,
      'PAYMENT_FAILED',
      HttpStatus.PAYMENT_REQUIRED,
      { reason, transactionId },
    );
  }
}

export class FileUploadException extends BusinessException {
  constructor(reason: string, fileName?: string) {
    super(
      `Error al subir archivo: ${reason}`,
      'FILE_UPLOAD_FAILED',
      HttpStatus.BAD_REQUEST,
      { reason, fileName },
    );
  }
}
```

### 16.2 Filtro Global de Excepciones

```typescript
// src/common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errorCode = 'INTERNAL_ERROR';
    let details: any = null;
    let stack: string | undefined;

    // Manejar diferentes tipos de excepciones
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errorCode = (exceptionResponse as any).errorCode || 'HTTP_ERROR';
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Errores de Prisma
      const { code, meta } = exception;
      switch (code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Valor duplicado en campo: ${(meta?.target as string[])?.join(', ')}`;
          errorCode = 'DUPLICATE_VALUE';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Registro no encontrado';
          errorCode = 'RECORD_NOT_FOUND';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Violacion de restriccion de clave foranea';
          errorCode = 'FOREIGN_KEY_VIOLATION';
          break;
        default:
          message = 'Error de base de datos';
          errorCode = `PRISMA_${code}`;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Log del error
    this.logger.error(
      JSON.stringify({
        message,
        errorCode,
        status,
        path: request.url,
        method: request.method,
        userId: (request as any).user?.sub,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        body: this.sanitizeBody(request.body),
        stack: this.configService.get('NODE_ENV') === 'development' ? stack : undefined,
      }),
    );

    // Respuesta
    const errorResponse = {
      success: false,
      message,
      errorCode,
      details: this.configService.get('NODE_ENV') === 'development' ? details : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] || crypto.randomUUID(),
    };

    response.status(status).json(errorResponse);
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
```

### 16.3 Filtro para WebSocket

```typescript
// src/common/filters/ws-exception.filter.ts
@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const data = host.switchToWs().getData();

    let message = 'Error en WebSocket';
    let errorCode = 'WS_ERROR';

    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'object') {
        message = (error as any).message || message;
        errorCode = (error as any).errorCode || errorCode;
      } else {
        message = error as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(`WS Error: ${message}`, {
      socketId: client.id,
      userId: client.data?.user?.id,
      data,
    });

    client.emit('error', {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 17. TESTING

### 17.1 Configuracion de Jest

```typescript
// jest.config.ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 17.2 Tests Unitarios

```typescript
// src/modules/students/students.service.spec.ts
describe('StudentsService', () => {
  let service: StudentsService;
  let repository: MockType<StudentsRepository>;
  let cacheService: MockType<RedisService>;

  const mockStudent: Student = {
    id: 'student-1',
    userId: 'user-1',
    code: 'EST001',
    birthDate: new Date('2010-01-15'),
    gradeSectionId: 'gs-1',
    enrollmentDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: StudentsRepository,
          useFactory: () => ({
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          }),
        },
        {
          provide: RedisService,
          useFactory: () => ({
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            invalidatePattern: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    repository = module.get(StudentsRepository);
    cacheService = module.get(RedisService);
  });

  describe('findById', () => {
    it('debe retornar un estudiante cuando existe', async () => {
      repository.findById.mockResolvedValue(mockStudent);

      const result = await service.findById('student-1');

      expect(result).toEqual(mockStudent);
      expect(repository.findById).toHaveBeenCalledWith('student-1');
    });

    it('debe lanzar NotFoundException cuando no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateStudentDto = {
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'juan@test.com',
      birthDate: '2010-01-15',
      gradeSectionId: 'gs-1',
    };

    it('debe crear un estudiante exitosamente', async () => {
      repository.create.mockResolvedValue(mockStudent);

      const result = await service.create(createDto);

      expect(result).toEqual(mockStudent);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Juan',
        lastName: 'Perez',
      }));
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith('students:list:*');
    });

    it('debe generar codigo unico para el estudiante', async () => {
      repository.create.mockResolvedValue(mockStudent);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.stringMatching(/^EST[A-Z0-9]{6}$/),
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateStudentDto = {
      firstName: 'Juan Carlos',
    };

    it('debe actualizar estudiante cuando existe', async () => {
      repository.findById.mockResolvedValue(mockStudent);
      repository.update.mockResolvedValue({ ...mockStudent, ...updateDto });

      const result = await service.update('student-1', updateDto);

      expect(result.firstName).toBe('Juan Carlos');
      expect(cacheService.del).toHaveBeenCalledWith('students:student-1');
    });

    it('debe lanzar error cuando estudiante no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('debe eliminar estudiante exitosamente', async () => {
      repository.findById.mockResolvedValue(mockStudent);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('student-1');

      expect(repository.delete).toHaveBeenCalledWith('student-1');
      expect(cacheService.del).toHaveBeenCalled();
    });
  });
});
```

### 17.3 Tests de Integracion (E2E)

```typescript
// test/students.e2e-spec.ts
describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Obtener token de autenticacion
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar datos de prueba
    await prisma.student.deleteMany({ where: { email: { contains: '@test.com' } } });
  });

  describe('GET /students', () => {
    it('debe retornar lista paginada de estudiantes', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page', 1);
    });

    it('debe filtrar por grado-seccion', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ gradeSectionId: 'gs-1' })
        .expect(200);

      expect(response.body.data.every(s => s.gradeSectionId === 'gs-1')).toBe(true);
    });
  });

  describe('POST /students', () => {
    const createDto = {
      firstName: 'Test',
      lastName: 'Student',
      email: 'test.student@test.com',
      birthDate: '2010-01-15',
      gradeSectionId: 'gs-1',
    };

    it('debe crear estudiante con datos validos', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('Test');
      expect(response.body.code).toMatch(/^EST/);
    });

    it('debe fallar con email invalido', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...createDto, email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('debe fallar sin autenticacion', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .send(createDto)
        .expect(401);
    });
  });

  describe('PUT /students/:id', () => {
    it('debe actualizar estudiante existente', async () => {
      // Crear estudiante primero
      const created = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Original',
          lastName: 'Name',
          email: 'original@test.com',
          birthDate: '2010-01-15',
          gradeSectionId: 'gs-1',
        });

      const response = await request(app.getHttpServer())
        .put(`/students/${created.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(response.body.firstName).toBe('Updated');
    });

    it('debe retornar 404 para estudiante inexistente', async () => {
      await request(app.getHttpServer())
        .put('/students/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /students/:id', () => {
    it('debe eliminar estudiante existente', async () => {
      // Crear estudiante
      const created = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'ToDelete',
          lastName: 'Student',
          email: 'delete@test.com',
          birthDate: '2010-01-15',
          gradeSectionId: 'gs-1',
        });

      await request(app.getHttpServer())
        .delete(`/students/${created.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verificar que fue eliminado
      await request(app.getHttpServer())
        .get(`/students/${created.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

---

## 18. LOGGING Y MONITOREO

### 18.1 Logger Personalizado

```typescript
// src/common/logger/custom-logger.service.ts
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private context: string;

  constructor(private readonly configService: ConfigService) {}

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: LogContext) {
    this.writeLog('INFO', message, context);
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.writeLog('ERROR', message, { ...context, trace });
  }

  warn(message: string, context?: LogContext) {
    this.writeLog('WARN', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.writeLog('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: LogContext) {
    if (this.configService.get('LOG_LEVEL') === 'verbose') {
      this.writeLog('VERBOSE', message, context);
    }
  }

  private writeLog(level: string, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const format = this.configService.get('LOG_FORMAT') || 'json';

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...context,
    };

    if (format === 'json') {
      console.log(JSON.stringify(logEntry));
    } else {
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      console.log(`[${timestamp}] [${level}] [${this.context}] ${message}${contextStr}`);
    }
  }
}
```

### 18.2 Interceptor de Logging

```typescript
// src/common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;
    const requestId = headers['x-request-id'] || crypto.randomUUID();
    const startTime = Date.now();

    // Log de entrada
    this.logger.log(
      JSON.stringify({
        type: 'REQUEST',
        requestId,
        method,
        url,
        userId: user?.sub,
        ip,
        userAgent: headers['user-agent'],
        body: this.sanitizeBody(body),
      }),
    );

    return next.handle().pipe(
      tap((responseBody) => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();

        // Log de salida
        this.logger.log(
          JSON.stringify({
            type: 'RESPONSE',
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            userId: user?.sub,
          }),
        );

        // Alerta si la respuesta es muy lenta
        if (duration > 3000) {
          this.logger.warn(
            JSON.stringify({
              type: 'SLOW_REQUEST',
              requestId,
              method,
              url,
              duration: `${duration}ms`,
            }),
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.logger.error(
          JSON.stringify({
            type: 'ERROR',
            requestId,
            method,
            url,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
          }),
        );

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
```

### 18.3 Middleware de Correlation ID

```typescript
// src/common/middleware/correlation-id.middleware.ts
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-request-id'] as string || crypto.randomUUID();

    req.headers['x-request-id'] = correlationId;
    res.setHeader('X-Request-ID', correlationId);

    // Agregar a async local storage para acceso global
    next();
  }
}
```

### 18.4 Health Check

```typescript
// src/modules/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private redis: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database
      () => this.db.pingCheck('database'),

      // Redis
      () => this.redis.pingCheck('redis'),

      // Memory
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),   // 300MB

      // Disk
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.9,
      }),
    ]);
  }

  @Get('liveness')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  async readiness() {
    try {
      // Verificar conexiones criticas
      await this.db.pingCheck('database');
      await this.redis.pingCheck('redis');

      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new ServiceUnavailableException('Service not ready');
    }
  }
}
```

---

## 19. BUENAS PRACTICAS

### 19.1 Principios Generales

1. **Fail Fast**: Validar inputs lo antes posible
2. **Defense in Depth**: Multiples capas de seguridad
3. **Least Privilege**: Minimos permisos necesarios
4. **DRY**: No repetir codigo
5. **KISS**: Mantener simple
6. **YAGNI**: No implementar lo que no se necesita aun

### 19.2 Codigo Limpio

```typescript
// MAL - Nombres poco descriptivos
const d = new Date();
const u = await this.repo.find();
const x = u.filter(i => i.s === 'active');

// BIEN - Nombres descriptivos
const currentDate = new Date();
const allUsers = await this.usersRepository.findAll();
const activeUsers = allUsers.filter(user => user.status === 'active');

// MAL - Funciones muy largas
async createStudent(dto) {
  // 200 lineas de codigo...
}

// BIEN - Funciones pequenas y enfocadas
async createStudent(dto: CreateStudentDto): Promise<Student> {
  await this.validateStudentData(dto);
  const user = await this.createUserAccount(dto);
  const student = await this.createStudentRecord(dto, user.id);
  await this.assignToGradeSection(student.id, dto.gradeSectionId);
  await this.sendWelcomeNotification(student);
  return student;
}

private async validateStudentData(dto: CreateStudentDto): Promise<void> {
  // Validaciones especificas
}

private async createUserAccount(dto: CreateStudentDto): Promise<User> {
  // Crear cuenta de usuario
}
```

### 19.3 Validaciones Robustas

```typescript
// src/modules/students/dto/create-student.dto.ts
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  @Trim()
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  @Trim()
  lastName: string;

  @IsEmail({}, { message: 'Email invalido' })
  @ToLowerCase()
  @Trim()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s-]{7,15}$/, {
    message: 'Numero de telefono invalido',
  })
  phone?: string;

  @IsDateString({}, { message: 'Fecha de nacimiento invalida' })
  @Validate(IsValidBirthDate, {
    message: 'La fecha de nacimiento debe ser entre 3 y 20 años atras',
  })
  birthDate: string;

  @IsUUID('4', { message: 'ID de grado-seccion invalido' })
  gradeSectionId: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID de padre invalido' })
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Trim()
  address?: string;
}

// Validador personalizado
@ValidatorConstraint({ name: 'isValidBirthDate', async: false })
export class IsValidBirthDate implements ValidatorConstraintInterface {
  validate(birthDate: string): boolean {
    const date = new Date(birthDate);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
    const maxAge = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());

    return date >= minAge && date <= maxAge;
  }
}
```

### 19.4 Transacciones de Base de Datos

```typescript
// Usar transacciones para operaciones relacionadas
async createStudentWithUser(dto: CreateStudentDto): Promise<Student> {
  return this.prisma.$transaction(async (tx) => {
    // Crear usuario
    const user = await tx.user.create({
      data: {
        email: dto.email,
        password: await HashUtil.hashPassword(generateTempPassword()),
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.STUDENT,
        code: StringUtil.generateCode('USR'),
      },
    });

    // Crear estudiante
    const student = await tx.student.create({
      data: {
        userId: user.id,
        code: StringUtil.generateCode('EST'),
        birthDate: new Date(dto.birthDate),
        gradeSectionId: dto.gradeSectionId,
        parentId: dto.parentId,
        address: dto.address,
      },
    });

    // Actualizar contador de estudiantes
    await tx.gradeSection.update({
      where: { id: dto.gradeSectionId },
      data: { currentStudents: { increment: 1 } },
    });

    return student;
  });
}
```

### 19.5 Manejo de Concurrencia

```typescript
// Usar bloqueo optimista con version
model Student {
  id        String   @id @default(uuid())
  version   Int      @default(1)
  // ... otros campos
}

async update(id: string, dto: UpdateStudentDto, version: number): Promise<Student> {
  try {
    return await this.prisma.student.update({
      where: {
        id,
        version, // Solo actualizar si la version coincide
      },
      data: {
        ...dto,
        version: { increment: 1 },
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new ConflictException(
        'El registro fue modificado por otro usuario. Por favor recargue e intente de nuevo.',
      );
    }
    throw error;
  }
}
```

---

## 20. CHECKLIST DE IMPLEMENTACION

### 20.1 Configuracion Inicial
- [ ] Crear proyecto NestJS: `nest new backend`
- [ ] Instalar dependencias principales
- [ ] Configurar Prisma ORM
- [ ] Configurar Redis
- [ ] Configurar variables de entorno
- [ ] Configurar Docker Compose para desarrollo

### 20.2 Seguridad
- [ ] Implementar autenticacion JWT con HTTP-Only cookies
- [ ] Configurar Helmet
- [ ] Implementar Rate Limiting
- [ ] Configurar CORS
- [ ] Implementar Guards de roles
- [ ] Configurar validacion global de DTOs
- [ ] Implementar sanitizacion de inputs
- [ ] Configurar auditoria de acciones

### 20.3 Modulos Core
- [ ] Auth Module (login, refresh, logout)
- [ ] Users Module
- [ ] Students Module
- [ ] Teachers Module
- [ ] Parents Module
- [ ] Prisma Module
- [ ] Redis Module

### 20.4 Modulos Academicos
- [ ] GradeSections Module
- [ ] Groups Module
- [ ] Subjects Module
- [ ] Courses Module
- [ ] Schedules Module

### 20.5 Modulos de Evaluacion
- [ ] Tasks Module (con entregas)
- [ ] Exams Module (con intentos)
- [ ] Grades Module (promedios)

### 20.6 Modulos Operativos
- [ ] Attendance Module
- [ ] Payments Module (con MercadoPago)
- [ ] Notifications Module
- [ ] Messages Module (WebSocket)
- [ ] Uploads Module
- [ ] Audit Module

### 20.7 Modulos Curriculares
- [ ] Curriculum Module
- [ ] MonthlyTopics Module

### 20.8 WebSocket
- [ ] Configurar Socket.IO con Redis adapter
- [ ] Implementar Messages Gateway
- [ ] Implementar Notifications Gateway
- [ ] Implementar autenticacion WS

### 20.9 Testing
- [ ] Configurar Jest
- [ ] Tests unitarios para servicios
- [ ] Tests E2E para controllers
- [ ] Coverage minimo 70%

### 20.10 Documentacion
- [ ] Configurar Swagger/OpenAPI
- [ ] Documentar todos los endpoints
- [ ] Documentar modelos de datos
- [ ] Crear README con instrucciones

### 20.11 DevOps
- [ ] Dockerfile optimizado
- [ ] Docker Compose para desarrollo
- [ ] CI/CD pipeline
- [ ] Health checks
- [ ] Logging estructurado

### 20.12 Optimizacion
- [ ] Implementar cache con Redis
- [ ] Optimizar queries con indices
- [ ] Configurar connection pooling
- [ ] Implementar paginacion eficiente
- [ ] Comprimir respuestas

---

**Documento generado para:** Sistema de Gestion Escolar
**Version del documento:** 2.0 (Expandida)
**Fecha:** Diciembre 2024
**Actualizacion:** Se agregaron secciones de SOLID, Patrones de Diseno, Codigo Reutilizable, Manejo de Errores, Testing, Logging/Monitoreo, Buenas Practicas y Checklist de Implementacion
