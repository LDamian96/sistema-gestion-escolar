// Datos mock centralizados para todos los módulos
// Este archivo simula un backend con datos estáticos

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
export type Status = 'active' | 'inactive'

// ==================== USUARIOS ====================
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  status: Status
  createdAt: string
  // Campos específicos según rol
  gradeSection?: string
  subjects?: string[]
  children?: string[]
  specialization?: string
}

let mockUsers: User[] = [
  { id: 'u1', firstName: 'Admin', lastName: 'Sistema', email: 'admin@escuela.com', phone: '999-000-000', role: 'ADMIN', status: 'active', createdAt: '2024-01-01' },
  { id: 'u2', firstName: 'Carlos', lastName: 'López', email: 'carlos@escuela.com', phone: '999-111-222', role: 'TEACHER', status: 'active', createdAt: '2024-01-15', specialization: 'Matemáticas', subjects: ['Matemáticas', 'Álgebra'] },
  { id: 'u3', firstName: 'Ana', lastName: 'Rodríguez', email: 'ana@escuela.com', phone: '999-222-333', role: 'TEACHER', status: 'active', createdAt: '2024-01-15', specialization: 'Comunicación', subjects: ['Comunicación', 'Literatura'] },
  { id: 'u4', firstName: 'Diego', lastName: 'Flores', email: 'diego@escuela.com', phone: '999-333-444', role: 'TEACHER', status: 'active', createdAt: '2024-02-01', specialization: 'Ciencias', subjects: ['Ciencias Naturales'] },
  { id: 'u5', firstName: 'Rosa', lastName: 'Torres', email: 'rosa@escuela.com', phone: '999-444-555', role: 'TEACHER', status: 'inactive', createdAt: '2024-02-01', specialization: 'Historia', subjects: ['Historia', 'Geografía'] },
  { id: 'u6', firstName: 'Miguel', lastName: 'Ángel', email: 'miguel@escuela.com', phone: '999-555-666', role: 'TEACHER', status: 'active', createdAt: '2024-02-15', specialization: 'Inglés', subjects: ['Inglés'] },
  { id: 'u7', firstName: 'Juan', lastName: 'Pérez', email: 'juan.est@escuela.com', phone: '999-666-777', role: 'STUDENT', status: 'active', createdAt: '2024-03-01', gradeSection: '5to A' },
  { id: 'u8', firstName: 'María', lastName: 'García', email: 'maria.est@escuela.com', phone: '999-777-888', role: 'STUDENT', status: 'active', createdAt: '2024-03-01', gradeSection: '5to B' },
  { id: 'u9', firstName: 'Luis', lastName: 'Martínez', email: 'luis.est@escuela.com', phone: '999-888-999', role: 'STUDENT', status: 'active', createdAt: '2024-03-01', gradeSection: '6to A' },
  { id: 'u10', firstName: 'Sofía', lastName: 'Hernández', email: 'sofia.est@escuela.com', phone: '999-999-000', role: 'STUDENT', status: 'inactive', createdAt: '2024-03-01', gradeSection: '6to B' },
  { id: 'u11', firstName: 'Pedro', lastName: 'Sánchez', email: 'pedro.padre@escuela.com', phone: '998-111-222', role: 'PARENT', status: 'active', createdAt: '2024-03-15', children: ['u7'] },
  { id: 'u12', firstName: 'Carmen', lastName: 'Díaz', email: 'carmen.padre@escuela.com', phone: '998-222-333', role: 'PARENT', status: 'active', createdAt: '2024-03-15', children: ['u8', 'u9'] },
]

// ==================== ESTUDIANTES ====================
export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  code: string
  gradeSection: string
  birthDate: string
  address: string
  parentId?: string
  parentName?: string
  status: Status
  enrollmentDate: string
}

let mockStudents: Student[] = [
  // 5to A - 8 estudiantes
  { id: 's1', firstName: 'Juan', lastName: 'Pérez', email: 'juan@escuela.com', phone: '999-111-111', code: 'EST-2024-0001', gradeSection: '5to A', birthDate: '2012-05-15', address: 'Av. Principal 123', parentId: 'p1', parentName: 'Pedro Pérez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's2', firstName: 'María', lastName: 'García', email: 'maria@escuela.com', phone: '999-222-222', code: 'EST-2024-0002', gradeSection: '5to A', birthDate: '2012-08-20', address: 'Jr. Las Flores 456', parentId: 'p2', parentName: 'Ana García', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's9', firstName: 'Valentina', lastName: 'Flores', email: 'valentina@escuela.com', phone: '999-999-999', code: 'EST-2024-0009', gradeSection: '5to A', birthDate: '2012-06-22', address: 'Calle Jardín 369', parentId: 'p9', parentName: 'Roberto Flores', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's11', firstName: 'Lucía', lastName: 'Ramírez', email: 'lucia@escuela.com', phone: '999-111-222', code: 'EST-2024-0011', gradeSection: '5to A', birthDate: '2012-02-14', address: 'Jr. Primavera 100', parentId: 'p11', parentName: 'Carlos Ramírez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's12', firstName: 'Sebastián', lastName: 'Vargas', email: 'sebastian@escuela.com', phone: '999-111-333', code: 'EST-2024-0012', gradeSection: '5to A', birthDate: '2012-09-08', address: 'Av. Los Pinos 200', parentId: 'p12', parentName: 'María Vargas', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's13', firstName: 'Isabella', lastName: 'Castro', email: 'isabella@escuela.com', phone: '999-111-444', code: 'EST-2024-0013', gradeSection: '5to A', birthDate: '2012-04-25', address: 'Calle Aurora 300', parentId: 'p13', parentName: 'Luis Castro', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's14', firstName: 'Emilio', lastName: 'Mendoza', email: 'emilio@escuela.com', phone: '999-111-555', code: 'EST-2024-0014', gradeSection: '5to A', birthDate: '2012-07-19', address: 'Jr. Sol 400', parentId: 'p14', parentName: 'Ana Mendoza', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's15', firstName: 'Camila', lastName: 'Ortiz', email: 'camila@escuela.com', phone: '999-111-666', code: 'EST-2024-0015', gradeSection: '5to A', birthDate: '2012-11-03', address: 'Av. Luna 500', parentId: 'p15', parentName: 'Pedro Ortiz', status: 'active', enrollmentDate: '2024-03-01' },
  // 5to B - 8 estudiantes
  { id: 's3', firstName: 'Carlos', lastName: 'López', email: 'carlos.est@escuela.com', phone: '999-333-333', code: 'EST-2024-0003', gradeSection: '5to B', birthDate: '2012-03-10', address: 'Calle Sol 789', parentId: 'p3', parentName: 'Luis López', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's4', firstName: 'Ana', lastName: 'Rodríguez', email: 'ana.est@escuela.com', phone: '999-444-444', code: 'EST-2024-0004', gradeSection: '5to B', birthDate: '2012-11-25', address: 'Av. Luna 321', parentId: 'p4', parentName: 'Rosa Rodríguez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's10', firstName: 'Mateo', lastName: 'Díaz', email: 'mateo@escuela.com', phone: '999-000-111', code: 'EST-2024-0010', gradeSection: '5to B', birthDate: '2012-01-30', address: 'Av. Parque 741', parentId: 'p10', parentName: 'Patricia Díaz', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's16', firstName: 'Nicolás', lastName: 'Jiménez', email: 'nicolas@escuela.com', phone: '999-222-111', code: 'EST-2024-0016', gradeSection: '5to B', birthDate: '2012-05-12', address: 'Jr. Estrellas 100', parentId: 'p16', parentName: 'Miguel Jiménez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's17', firstName: 'Antonella', lastName: 'Ríos', email: 'antonella@escuela.com', phone: '999-222-222', code: 'EST-2024-0017', gradeSection: '5to B', birthDate: '2012-08-28', address: 'Av. Central 200', parentId: 'p17', parentName: 'Rosa Ríos', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's18', firstName: 'Tomás', lastName: 'Navarro', email: 'tomas@escuela.com', phone: '999-222-333', code: 'EST-2024-0018', gradeSection: '5to B', birthDate: '2012-12-05', address: 'Calle Verde 300', parentId: 'p18', parentName: 'Carlos Navarro', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's19', firstName: 'Martina', lastName: 'Silva', email: 'martina@escuela.com', phone: '999-222-444', code: 'EST-2024-0019', gradeSection: '5to B', birthDate: '2012-03-17', address: 'Jr. Azul 400', parentId: 'p19', parentName: 'José Silva', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's20', firstName: 'Joaquín', lastName: 'Morales', email: 'joaquin@escuela.com', phone: '999-222-555', code: 'EST-2024-0020', gradeSection: '5to B', birthDate: '2012-06-30', address: 'Av. Norte 500', parentId: 'p20', parentName: 'Ana Morales', status: 'active', enrollmentDate: '2024-03-01' },
  // 6to A - 6 estudiantes
  { id: 's5', firstName: 'Pedro', lastName: 'Sánchez', email: 'pedro.est@escuela.com', phone: '999-555-555', code: 'EST-2024-0005', gradeSection: '6to A', birthDate: '2011-07-08', address: 'Jr. Estrella 654', parentId: 'p5', parentName: 'Miguel Sánchez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's6', firstName: 'Luis', lastName: 'Martínez', email: 'luis.est@escuela.com', phone: '999-666-666', code: 'EST-2024-0006', gradeSection: '6to A', birthDate: '2011-09-12', address: 'Calle Mar 987', parentId: 'p6', parentName: 'Carmen Martínez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's21', firstName: 'Renata', lastName: 'Guzmán', email: 'renata@escuela.com', phone: '999-333-111', code: 'EST-2024-0021', gradeSection: '6to A', birthDate: '2011-02-20', address: 'Calle Roja 100', parentId: 'p21', parentName: 'Luis Guzmán', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's22', firstName: 'Santiago', lastName: 'Herrera', email: 'santiago@escuela.com', phone: '999-333-222', code: 'EST-2024-0022', gradeSection: '6to A', birthDate: '2011-05-15', address: 'Jr. Blanco 200', parentId: 'p22', parentName: 'María Herrera', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's23', firstName: 'Emma', lastName: 'Vega', email: 'emma@escuela.com', phone: '999-333-333', code: 'EST-2024-0023', gradeSection: '6to A', birthDate: '2011-08-08', address: 'Av. Dorada 300', parentId: 'p23', parentName: 'Pedro Vega', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's24', firstName: 'Benjamín', lastName: 'Paredes', email: 'benjamin@escuela.com', phone: '999-333-444', code: 'EST-2024-0024', gradeSection: '6to A', birthDate: '2011-11-25', address: 'Calle Plata 400', parentId: 'p24', parentName: 'Ana Paredes', status: 'active', enrollmentDate: '2024-03-01' },
  // 6to B - 6 estudiantes
  { id: 's7', firstName: 'Sofía', lastName: 'Hernández', email: 'sofia@escuela.com', phone: '999-777-777', code: 'EST-2024-0007', gradeSection: '6to B', birthDate: '2011-12-03', address: 'Av. Río 147', parentId: 'p7', parentName: 'José Hernández', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's8', firstName: 'Diego', lastName: 'Torres', email: 'diego.est@escuela.com', phone: '999-888-888', code: 'EST-2024-0008', gradeSection: '6to B', birthDate: '2011-04-18', address: 'Jr. Bosque 258', parentId: 'p8', parentName: 'Laura Torres', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's25', firstName: 'Valeria', lastName: 'Campos', email: 'valeria@escuela.com', phone: '999-444-111', code: 'EST-2024-0025', gradeSection: '6to B', birthDate: '2011-01-10', address: 'Av. Sur 100', parentId: 'p25', parentName: 'Roberto Campos', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's26', firstName: 'Gabriel', lastName: 'Rojas', email: 'gabriel@escuela.com', phone: '999-444-222', code: 'EST-2024-0026', gradeSection: '6to B', birthDate: '2011-04-05', address: 'Jr. Este 200', parentId: 'p26', parentName: 'María Rojas', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's27', firstName: 'Amanda', lastName: 'Delgado', email: 'amanda@escuela.com', phone: '999-444-333', code: 'EST-2024-0027', gradeSection: '6to B', birthDate: '2011-07-22', address: 'Calle Oeste 300', parentId: 'p27', parentName: 'Carlos Delgado', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's28', firstName: 'Maximiliano', lastName: 'Ramos', email: 'maximiliano@escuela.com', phone: '999-444-444', code: 'EST-2024-0028', gradeSection: '6to B', birthDate: '2011-10-30', address: 'Av. Norte 400', parentId: 'p28', parentName: 'Patricia Ramos', status: 'active', enrollmentDate: '2024-03-01' },
  // 1ro A Secundaria - 6 estudiantes
  { id: 's29', firstName: 'Alejandro', lastName: 'Medina', email: 'alejandro@escuela.com', phone: '999-555-111', code: 'EST-2024-0029', gradeSection: '1ro A', birthDate: '2010-03-15', address: 'Jr. Central 100', parentId: 'p29', parentName: 'Luis Medina', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's30', firstName: 'Daniela', lastName: 'Guerrero', email: 'daniela@escuela.com', phone: '999-555-222', code: 'EST-2024-0030', gradeSection: '1ro A', birthDate: '2010-06-20', address: 'Av. Principal 200', parentId: 'p30', parentName: 'Rosa Guerrero', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's31', firstName: 'Fernando', lastName: 'Pacheco', email: 'fernando@escuela.com', phone: '999-555-333', code: 'EST-2024-0031', gradeSection: '1ro A', birthDate: '2010-09-10', address: 'Calle Lima 300', parentId: 'p31', parentName: 'Miguel Pacheco', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's32', firstName: 'Adriana', lastName: 'Salazar', email: 'adriana@escuela.com', phone: '999-555-444', code: 'EST-2024-0032', gradeSection: '1ro A', birthDate: '2010-12-05', address: 'Jr. Tacna 400', parentId: 'p32', parentName: 'Ana Salazar', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's33', firstName: 'Ricardo', lastName: 'Espinoza', email: 'ricardo@escuela.com', phone: '999-555-555', code: 'EST-2024-0033', gradeSection: '1ro A', birthDate: '2010-02-28', address: 'Av. Arequipa 500', parentId: 'p33', parentName: 'Carmen Espinoza', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's34', firstName: 'Carolina', lastName: 'Núñez', email: 'carolina@escuela.com', phone: '999-555-666', code: 'EST-2024-0034', gradeSection: '1ro A', birthDate: '2010-05-18', address: 'Calle Cusco 600', parentId: 'p34', parentName: 'Pedro Núñez', status: 'active', enrollmentDate: '2024-03-01' },
  // 1ro B Secundaria - 6 estudiantes
  { id: 's35', firstName: 'Rodrigo', lastName: 'Aguilar', email: 'rodrigo@escuela.com', phone: '999-666-111', code: 'EST-2024-0035', gradeSection: '1ro B', birthDate: '2010-01-25', address: 'Jr. Piura 100', parentId: 'p35', parentName: 'José Aguilar', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's36', firstName: 'Paula', lastName: 'Miranda', email: 'paula@escuela.com', phone: '999-666-222', code: 'EST-2024-0036', gradeSection: '1ro B', birthDate: '2010-04-12', address: 'Av. Trujillo 200', parentId: 'p36', parentName: 'María Miranda', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's37', firstName: 'Andrés', lastName: 'Cortez', email: 'andres@escuela.com', phone: '999-666-333', code: 'EST-2024-0037', gradeSection: '1ro B', birthDate: '2010-07-08', address: 'Calle Chiclayo 300', parentId: 'p37', parentName: 'Carlos Cortez', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's38', firstName: 'Fernanda', lastName: 'Lara', email: 'fernanda@escuela.com', phone: '999-666-444', code: 'EST-2024-0038', gradeSection: '1ro B', birthDate: '2010-10-15', address: 'Jr. Ica 400', parentId: 'p38', parentName: 'Ana Lara', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's39', firstName: 'Ignacio', lastName: 'Vera', email: 'ignacio@escuela.com', phone: '999-666-555', code: 'EST-2024-0039', gradeSection: '1ro B', birthDate: '2010-11-22', address: 'Av. Puno 500', parentId: 'p39', parentName: 'Luis Vera', status: 'active', enrollmentDate: '2024-03-01' },
  { id: 's40', firstName: 'Mariana', lastName: 'Soto', email: 'mariana@escuela.com', phone: '999-666-666', code: 'EST-2024-0040', gradeSection: '1ro B', birthDate: '2010-08-30', address: 'Calle Junín 600', parentId: 'p40', parentName: 'Rosa Soto', status: 'active', enrollmentDate: '2024-03-01' },
]

// ==================== PROFESORES ====================
export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  code: string
  specialization: string
  subjects: string[]
  hireDate: string
  status: Status
}

let mockTeachers: Teacher[] = [
  { id: 't1', firstName: 'Carlos', lastName: 'López', email: 'carlos@escuela.com', phone: '999-111-222', code: 'DOC-001', specialization: 'Matemáticas', subjects: ['Matemáticas', 'Álgebra'], hireDate: '2020-03-01', status: 'active' },
  { id: 't2', firstName: 'Ana', lastName: 'Rodríguez', email: 'ana@escuela.com', phone: '999-222-333', code: 'DOC-002', specialization: 'Comunicación', subjects: ['Comunicación', 'Literatura'], hireDate: '2019-08-15', status: 'active' },
  { id: 't3', firstName: 'Diego', lastName: 'Flores', email: 'diego@escuela.com', phone: '999-333-444', code: 'DOC-003', specialization: 'Ciencias', subjects: ['Ciencias Naturales', 'Biología'], hireDate: '2021-02-01', status: 'active' },
  { id: 't4', firstName: 'Rosa', lastName: 'Torres', email: 'rosa@escuela.com', phone: '999-444-555', code: 'DOC-004', specialization: 'Historia', subjects: ['Historia', 'Geografía'], hireDate: '2018-03-20', status: 'inactive' },
  { id: 't5', firstName: 'Miguel', lastName: 'Ángel', email: 'miguel@escuela.com', phone: '999-555-666', code: 'DOC-005', specialization: 'Inglés', subjects: ['Inglés'], hireDate: '2022-01-10', status: 'active' },
  { id: 't6', firstName: 'Patricia', lastName: 'Vargas', email: 'patricia@escuela.com', phone: '999-666-777', code: 'DOC-006', specialization: 'Arte', subjects: ['Arte', 'Música'], hireDate: '2021-08-01', status: 'active' },
  { id: 't7', firstName: 'Roberto', lastName: 'Mendoza', email: 'roberto@escuela.com', phone: '999-777-888', code: 'DOC-007', specialization: 'Educación Física', subjects: ['Educación Física'], hireDate: '2020-06-15', status: 'active' },
]

// ==================== TUTORES/PADRES ====================
export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  occupation: string
  childrenIds: string[]
  childrenNames: string[]
  status: Status
}

let mockParents: Parent[] = [
  { id: 'p1', firstName: 'Pedro', lastName: 'Pérez', email: 'pedro.padre@escuela.com', phone: '998-111-111', address: 'Av. Principal 123', occupation: 'Ingeniero', childrenIds: ['s1'], childrenNames: ['Juan Pérez'], status: 'active' },
  { id: 'p2', firstName: 'Ana', lastName: 'García', email: 'ana.padre@escuela.com', phone: '998-222-222', address: 'Jr. Las Flores 456', occupation: 'Doctora', childrenIds: ['s2'], childrenNames: ['María García'], status: 'active' },
  { id: 'p3', firstName: 'Luis', lastName: 'López', email: 'luis.padre@escuela.com', phone: '998-333-333', address: 'Calle Sol 789', occupation: 'Abogado', childrenIds: ['s3'], childrenNames: ['Carlos López'], status: 'active' },
  { id: 'p4', firstName: 'Rosa', lastName: 'Rodríguez', email: 'rosa.padre@escuela.com', phone: '998-444-444', address: 'Av. Luna 321', occupation: 'Contadora', childrenIds: ['s4'], childrenNames: ['Ana Rodríguez'], status: 'active' },
  { id: 'p5', firstName: 'Miguel', lastName: 'Sánchez', email: 'miguel.padre@escuela.com', phone: '998-555-555', address: 'Jr. Estrella 654', occupation: 'Arquitecto', childrenIds: ['s5'], childrenNames: ['Pedro Sánchez'], status: 'active' },
  { id: 'p6', firstName: 'Carmen', lastName: 'Martínez', email: 'carmen.padre@escuela.com', phone: '998-666-666', address: 'Calle Mar 987', occupation: 'Profesora', childrenIds: ['s6', 's10'], childrenNames: ['Luis Martínez', 'Mateo Díaz'], status: 'active' },
  { id: 'p7', firstName: 'José', lastName: 'Hernández', email: 'jose.padre@escuela.com', phone: '998-777-777', address: 'Av. Río 147', occupation: 'Empresario', childrenIds: ['s7'], childrenNames: ['Sofía Hernández'], status: 'inactive' },
  { id: 'p8', firstName: 'Laura', lastName: 'Torres', email: 'laura.padre@escuela.com', phone: '998-888-888', address: 'Jr. Bosque 258', occupation: 'Diseñadora', childrenIds: ['s8'], childrenNames: ['Diego Torres'], status: 'active' },
]

// ==================== MATERIAS ====================
// Una Materia al crearse genera automáticamente un Curso en el grupo correspondiente
export interface Subject {
  id: string
  name: string
  code: string
  description: string
  hoursPerWeek: number
  color: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  gradeSectionId: string
  gradeSection: string // Ej: "5to A"
  teacherId?: string // Opcional - se asigna desde Profesores
  teacherName?: string // Opcional - se asigna desde Profesores
  status: Status
}

let mockSubjects: Subject[] = [
  // 5to A - Primaria
  { id: 'sub1', name: 'Matemáticas', code: 'MAT-5A', description: 'Aritmética, álgebra y geometría básica', hoursPerWeek: 6, color: 'bg-blue-500', level: 'Primaria', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't1', teacherName: 'Carlos López', status: 'active' },
  { id: 'sub2', name: 'Comunicación', code: 'COM-5A', description: 'Lectura, escritura y expresión oral', hoursPerWeek: 6, color: 'bg-green-500', level: 'Primaria', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't2', teacherName: 'Ana Rodríguez', status: 'active' },
  { id: 'sub3', name: 'Ciencias Naturales', code: 'CIE-5A', description: 'Biología, física y química básica', hoursPerWeek: 4, color: 'bg-purple-500', level: 'Primaria', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't3', teacherName: 'Diego Flores', status: 'active' },
  { id: 'sub4', name: 'Inglés', code: 'ING-5A', description: 'Inglés básico e intermedio', hoursPerWeek: 4, color: 'bg-pink-500', level: 'Primaria', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't5', teacherName: 'Miguel Ángel', status: 'active' },
  { id: 'sub5', name: 'Educación Física', code: 'EFI-5A', description: 'Deportes y actividad física', hoursPerWeek: 2, color: 'bg-red-500', level: 'Primaria', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't7', teacherName: 'Roberto Mendoza', status: 'active' },
  // 5to B - Primaria
  { id: 'sub6', name: 'Matemáticas', code: 'MAT-5B', description: 'Aritmética, álgebra y geometría básica', hoursPerWeek: 6, color: 'bg-blue-500', level: 'Primaria', gradeSectionId: 'gs2', gradeSection: '5to B', teacherId: 't1', teacherName: 'Carlos López', status: 'active' },
  { id: 'sub7', name: 'Comunicación', code: 'COM-5B', description: 'Lectura, escritura y expresión oral', hoursPerWeek: 6, color: 'bg-green-500', level: 'Primaria', gradeSectionId: 'gs2', gradeSection: '5to B', teacherId: 't2', teacherName: 'Ana Rodríguez', status: 'active' },
  { id: 'sub8', name: 'Música', code: 'MUS-5B', description: 'Teoría musical e instrumentos', hoursPerWeek: 2, color: 'bg-indigo-500', level: 'Primaria', gradeSectionId: 'gs2', gradeSection: '5to B', teacherId: 't6', teacherName: 'Patricia Vargas', status: 'active' },
  // 6to A - Primaria
  { id: 'sub9', name: 'Matemáticas', code: 'MAT-6A', description: 'Aritmética, álgebra y geometría básica', hoursPerWeek: 6, color: 'bg-blue-500', level: 'Primaria', gradeSectionId: 'gs3', gradeSection: '6to A', teacherId: 't1', teacherName: 'Carlos López', status: 'active' },
  { id: 'sub10', name: 'Ciencias Naturales', code: 'CIE-6A', description: 'Biología, física y química básica', hoursPerWeek: 4, color: 'bg-purple-500', level: 'Primaria', gradeSectionId: 'gs3', gradeSection: '6to A', teacherId: 't3', teacherName: 'Diego Flores', status: 'active' },
  { id: 'sub11', name: 'Historia', code: 'HIS-6A', description: 'Historia del Perú y universal', hoursPerWeek: 3, color: 'bg-orange-500', level: 'Primaria', gradeSectionId: 'gs3', gradeSection: '6to A', teacherId: 't4', teacherName: 'Rosa Torres', status: 'active' },
  // 6to B - Primaria
  { id: 'sub12', name: 'Matemáticas', code: 'MAT-6B', description: 'Aritmética, álgebra y geometría básica', hoursPerWeek: 6, color: 'bg-blue-500', level: 'Primaria', gradeSectionId: 'gs4', gradeSection: '6to B', teacherId: 't1', teacherName: 'Carlos López', status: 'active' },
  { id: 'sub13', name: 'Comunicación', code: 'COM-6B', description: 'Lectura, escritura y expresión oral', hoursPerWeek: 6, color: 'bg-green-500', level: 'Primaria', gradeSectionId: 'gs4', gradeSection: '6to B', teacherId: 't2', teacherName: 'Ana Rodríguez', status: 'active' },
  { id: 'sub14', name: 'Inglés', code: 'ING-6B', description: 'Inglés básico e intermedio', hoursPerWeek: 4, color: 'bg-pink-500', level: 'Primaria', gradeSectionId: 'gs4', gradeSection: '6to B', teacherId: 't5', teacherName: 'Miguel Ángel', status: 'active' },
  // 1ro A - Secundaria
  { id: 'sub15', name: 'Matemáticas', code: 'MAT-1A', description: 'Álgebra y geometría', hoursPerWeek: 6, color: 'bg-blue-500', level: 'Secundaria', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't1', teacherName: 'Carlos López', status: 'active' },
  { id: 'sub16', name: 'Comunicación', code: 'COM-1A', description: 'Lectura, escritura y expresión oral', hoursPerWeek: 6, color: 'bg-green-500', level: 'Secundaria', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't2', teacherName: 'Ana Rodríguez', status: 'active' },
  { id: 'sub17', name: 'Historia', code: 'HIS-1A', description: 'Historia del Perú y universal', hoursPerWeek: 3, color: 'bg-orange-500', level: 'Secundaria', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't4', teacherName: 'Rosa Torres', status: 'active' },
  { id: 'sub18', name: 'Inglés', code: 'ING-1A', description: 'Inglés intermedio', hoursPerWeek: 4, color: 'bg-pink-500', level: 'Secundaria', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't5', teacherName: 'Miguel Ángel', status: 'active' },
  // 1ro B - Secundaria
  { id: 'sub19', name: 'Matemáticas', code: 'MAT-1B', description: 'Álgebra y geometría', hoursPerWeek: 6, color: 'bg-blue-500', level: 'Secundaria', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't1', teacherName: 'Carlos López', status: 'active' },
  { id: 'sub20', name: 'Comunicación', code: 'COM-1B', description: 'Lectura, escritura y expresión oral', hoursPerWeek: 6, color: 'bg-green-500', level: 'Secundaria', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't2', teacherName: 'Ana Rodríguez', status: 'active' },
  { id: 'sub21', name: 'Ciencias Naturales', code: 'CIE-1B', description: 'Biología, física y química', hoursPerWeek: 4, color: 'bg-purple-500', level: 'Secundaria', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't3', teacherName: 'Diego Flores', status: 'active' },
  { id: 'sub22', name: 'Educación Física', code: 'EFI-1B', description: 'Deportes y actividad física', hoursPerWeek: 2, color: 'bg-red-500', level: 'Secundaria', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't7', teacherName: 'Roberto Mendoza', status: 'active' },
]

// ==================== CONFIGURACIÓN DE TURNOS ====================
export interface TurnoConfig {
  id: string
  nombre: string
  horaInicio: string
  horaFin: string
  status: Status
}

let mockTurnos: TurnoConfig[] = [
  { id: 'turno1', nombre: 'Mañana', horaInicio: '07:00', horaFin: '12:30', status: 'active' },
  { id: 'turno2', nombre: 'Tarde', horaInicio: '13:00', horaFin: '18:00', status: 'active' },
]

export const turnosService = {
  async getAll(): Promise<TurnoConfig[]> {
    await delay(200)
    return [...mockTurnos]
  },
  async getById(id: string): Promise<TurnoConfig | undefined> {
    await delay(100)
    return mockTurnos.find(t => t.id === id)
  },
  async getByNombre(nombre: string): Promise<TurnoConfig | undefined> {
    await delay(100)
    return mockTurnos.find(t => t.nombre === nombre)
  },
  async create(data: Omit<TurnoConfig, 'id'>): Promise<TurnoConfig> {
    await delay(300)
    const newTurno: TurnoConfig = { ...data, id: generateId() }
    mockTurnos.push(newTurno)
    return newTurno
  },
  async update(id: string, data: Partial<TurnoConfig>): Promise<TurnoConfig> {
    await delay(300)
    const index = mockTurnos.findIndex(t => t.id === id)
    if (index >= 0) {
      mockTurnos[index] = { ...mockTurnos[index], ...data }
      return mockTurnos[index]
    }
    throw new Error('Turno no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockTurnos = mockTurnos.filter(t => t.id !== id)
  }
}

// ==================== ESTRUCTURA (GRADOS/SECCIONES) ====================
export type Turno = string // Ahora es dinámico, referencia al nombre del TurnoConfig

export interface GradeSection {
  id: string
  grade: string
  section: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  turno: Turno
  turnoStartTime: string // Ej: "07:00"
  turnoEndTime: string   // Ej: "12:30"
  capacity: number
  currentStudents: number
  tutorId?: string
  tutorName?: string
  status: Status
}

let mockGradeSections: GradeSection[] = [
  // Inicial
  { id: 'gs0', grade: '3 años', section: 'A', level: 'Inicial', turno: 'Mañana', turnoStartTime: '08:00', turnoEndTime: '12:00', capacity: 20, currentStudents: 15, tutorId: 't6', tutorName: 'Patricia Vargas', status: 'active' },
  // Primaria - Mañana
  { id: 'gs1', grade: '5to', section: 'A', level: 'Primaria', turno: 'Mañana', turnoStartTime: '07:00', turnoEndTime: '12:30', capacity: 30, currentStudents: 25, tutorId: 't1', tutorName: 'Carlos López', status: 'active' },
  { id: 'gs2', grade: '5to', section: 'B', level: 'Primaria', turno: 'Mañana', turnoStartTime: '07:00', turnoEndTime: '12:30', capacity: 30, currentStudents: 28, tutorId: 't2', tutorName: 'Ana Rodríguez', status: 'active' },
  { id: 'gs3', grade: '6to', section: 'A', level: 'Primaria', turno: 'Mañana', turnoStartTime: '07:00', turnoEndTime: '12:30', capacity: 30, currentStudents: 22, tutorId: 't3', tutorName: 'Diego Flores', status: 'active' },
  // Primaria - Tarde
  { id: 'gs4', grade: '6to', section: 'B', level: 'Primaria', turno: 'Tarde', turnoStartTime: '13:00', turnoEndTime: '18:00', capacity: 30, currentStudents: 20, tutorId: 't5', tutorName: 'Miguel Ángel', status: 'active' },
  // Secundaria - Tarde
  { id: 'gs5', grade: '1ro', section: 'A', level: 'Secundaria', turno: 'Tarde', turnoStartTime: '13:00', turnoEndTime: '18:30', capacity: 35, currentStudents: 30, tutorId: 't6', tutorName: 'Patricia Vargas', status: 'active' },
  { id: 'gs6', grade: '1ro', section: 'B', level: 'Secundaria', turno: 'Tarde', turnoStartTime: '13:00', turnoEndTime: '18:30', capacity: 35, currentStudents: 32, tutorId: 't7', tutorName: 'Roberto Mendoza', status: 'active' },
]

// ==================== GRUPOS ====================
// Un Grupo se crea automáticamente cuando se crea un GradeSection
// Agrupa a todos los estudiantes y cursos de ese grado/sección
export interface Group {
  id: string
  gradeSectionId: string
  name: string // Ej: "5to A - Primaria (Mañana)"
  grade: string
  section: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  turno: Turno
  turnoStartTime: string // Heredado del GradeSection
  turnoEndTime: string   // Heredado del GradeSection
  tutorId?: string
  tutorName?: string
  studentCount: number
  courseCount: number
  status: Status
  createdAt: string
}

let mockGroups: Group[] = [
  // Inicial
  { id: 'grp0', gradeSectionId: 'gs0', name: '3 años A - Inicial (Mañana)', grade: '3 años', section: 'A', level: 'Inicial', turno: 'Mañana', turnoStartTime: '08:00', turnoEndTime: '12:00', tutorId: 't6', tutorName: 'Patricia Vargas', studentCount: 15, courseCount: 3, status: 'active', createdAt: '2024-01-01' },
  // Primaria - Mañana
  { id: 'grp1', gradeSectionId: 'gs1', name: '5to A - Primaria (Mañana)', grade: '5to', section: 'A', level: 'Primaria', turno: 'Mañana', turnoStartTime: '07:00', turnoEndTime: '12:30', tutorId: 't1', tutorName: 'Carlos López', studentCount: 8, courseCount: 5, status: 'active', createdAt: '2024-01-01' },
  { id: 'grp2', gradeSectionId: 'gs2', name: '5to B - Primaria (Mañana)', grade: '5to', section: 'B', level: 'Primaria', turno: 'Mañana', turnoStartTime: '07:00', turnoEndTime: '12:30', tutorId: 't2', tutorName: 'Ana Rodríguez', studentCount: 8, courseCount: 3, status: 'active', createdAt: '2024-01-01' },
  { id: 'grp3', gradeSectionId: 'gs3', name: '6to A - Primaria (Mañana)', grade: '6to', section: 'A', level: 'Primaria', turno: 'Mañana', turnoStartTime: '07:00', turnoEndTime: '12:30', tutorId: 't3', tutorName: 'Diego Flores', studentCount: 6, courseCount: 3, status: 'active', createdAt: '2024-01-01' },
  // Primaria - Tarde
  { id: 'grp4', gradeSectionId: 'gs4', name: '6to B - Primaria (Tarde)', grade: '6to', section: 'B', level: 'Primaria', turno: 'Tarde', turnoStartTime: '13:00', turnoEndTime: '18:00', tutorId: 't5', tutorName: 'Miguel Ángel', studentCount: 6, courseCount: 3, status: 'active', createdAt: '2024-01-01' },
  // Secundaria - Tarde
  { id: 'grp5', gradeSectionId: 'gs5', name: '1ro A - Secundaria (Tarde)', grade: '1ro', section: 'A', level: 'Secundaria', turno: 'Tarde', turnoStartTime: '13:00', turnoEndTime: '18:30', tutorId: 't6', tutorName: 'Patricia Vargas', studentCount: 6, courseCount: 4, status: 'active', createdAt: '2024-01-01' },
  { id: 'grp6', gradeSectionId: 'gs6', name: '1ro B - Secundaria (Tarde)', grade: '1ro', section: 'B', level: 'Secundaria', turno: 'Tarde', turnoStartTime: '13:00', turnoEndTime: '18:30', tutorId: 't7', tutorName: 'Roberto Mendoza', studentCount: 6, courseCount: 4, status: 'active', createdAt: '2024-01-01' },
]

// ==================== CURSOS ====================
export interface Course {
  id: string
  subjectId: string
  subjectName: string
  gradeSectionId: string
  gradeSection: string
  teacherId: string
  teacherName: string
  schedule: string
  room: string
  status: Status
}

let mockCourses: Course[] = [
  // 5to A - Primaria
  { id: 'c1', subjectId: 'sub1', subjectName: 'Matemáticas', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't1', teacherName: 'Carlos López', schedule: 'Lun-Mié-Vie 8:00-9:30', room: 'Aula 101', status: 'active' },
  { id: 'c2', subjectId: 'sub2', subjectName: 'Comunicación', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't2', teacherName: 'Ana Rodríguez', schedule: 'Mar-Jue 8:00-9:30', room: 'Aula 101', status: 'active' },
  { id: 'c4', subjectId: 'sub3', subjectName: 'Ciencias Naturales', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't3', teacherName: 'Diego Flores', schedule: 'Mar-Jue 10:00-11:30', room: 'Lab. Ciencias', status: 'active' },
  { id: 'c5', subjectId: 'sub6', subjectName: 'Inglés', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't5', teacherName: 'Miguel Ángel', schedule: 'Lun-Mié 14:00-15:30', room: 'Aula 101', status: 'active' },
  { id: 'c7', subjectId: 'sub7', subjectName: 'Educación Física', gradeSectionId: 'gs1', gradeSection: '5to A', teacherId: 't7', teacherName: 'Roberto Mendoza', schedule: 'Mar 14:00-16:00', room: 'Cancha', status: 'active' },
  // 5to B - Primaria
  { id: 'c3', subjectId: 'sub1', subjectName: 'Matemáticas', gradeSectionId: 'gs2', gradeSection: '5to B', teacherId: 't1', teacherName: 'Carlos López', schedule: 'Lun-Mié-Vie 10:00-11:30', room: 'Aula 102', status: 'active' },
  { id: 'c8', subjectId: 'sub9', subjectName: 'Música', gradeSectionId: 'gs2', gradeSection: '5to B', teacherId: 't6', teacherName: 'Patricia Vargas', schedule: 'Jue 14:00-16:00', room: 'Sala Música', status: 'active' },
  { id: 'c9', subjectId: 'sub2', subjectName: 'Comunicación', gradeSectionId: 'gs2', gradeSection: '5to B', teacherId: 't2', teacherName: 'Ana Rodríguez', schedule: 'Mar-Jue 9:00-10:30', room: 'Aula 102', status: 'active' },
  // 6to A - Primaria
  { id: 'c6', subjectId: 'sub4', subjectName: 'Historia', gradeSectionId: 'gs3', gradeSection: '6to A', teacherId: 't4', teacherName: 'Rosa Torres', schedule: 'Vie 8:00-11:00', room: 'Aula 201', status: 'active' },
  { id: 'c10', subjectId: 'sub1', subjectName: 'Matemáticas', gradeSectionId: 'gs3', gradeSection: '6to A', teacherId: 't1', teacherName: 'Carlos López', schedule: 'Lun-Mié-Vie 8:00-9:30', room: 'Aula 201', status: 'active' },
  { id: 'c11', subjectId: 'sub3', subjectName: 'Ciencias Naturales', gradeSectionId: 'gs3', gradeSection: '6to A', teacherId: 't3', teacherName: 'Diego Flores', schedule: 'Mar-Jue 8:00-9:30', room: 'Lab. Ciencias', status: 'active' },
  // 6to B - Primaria
  { id: 'c12', subjectId: 'sub1', subjectName: 'Matemáticas', gradeSectionId: 'gs4', gradeSection: '6to B', teacherId: 't1', teacherName: 'Carlos López', schedule: 'Lun-Mié-Vie 10:00-11:30', room: 'Aula 202', status: 'active' },
  { id: 'c13', subjectId: 'sub2', subjectName: 'Comunicación', gradeSectionId: 'gs4', gradeSection: '6to B', teacherId: 't2', teacherName: 'Ana Rodríguez', schedule: 'Mar-Jue 10:00-11:30', room: 'Aula 202', status: 'active' },
  { id: 'c14', subjectId: 'sub6', subjectName: 'Inglés', gradeSectionId: 'gs4', gradeSection: '6to B', teacherId: 't5', teacherName: 'Miguel Ángel', schedule: 'Lun-Mié 14:00-15:30', room: 'Aula 202', status: 'active' },
  // 1ro A - Secundaria
  { id: 'c15', subjectId: 'sub1', subjectName: 'Matemáticas', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't1', teacherName: 'Carlos López', schedule: 'Lun-Mié-Vie 7:00-8:30', room: 'Aula 301', status: 'active' },
  { id: 'c16', subjectId: 'sub2', subjectName: 'Comunicación', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't2', teacherName: 'Ana Rodríguez', schedule: 'Mar-Jue 7:00-8:30', room: 'Aula 301', status: 'active' },
  { id: 'c17', subjectId: 'sub4', subjectName: 'Historia', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't4', teacherName: 'Rosa Torres', schedule: 'Vie 9:00-11:00', room: 'Aula 301', status: 'active' },
  { id: 'c18', subjectId: 'sub6', subjectName: 'Inglés', gradeSectionId: 'gs5', gradeSection: '1ro A', teacherId: 't5', teacherName: 'Miguel Ángel', schedule: 'Lun-Mié 9:00-10:30', room: 'Aula 301', status: 'active' },
  // 1ro B - Secundaria
  { id: 'c19', subjectId: 'sub1', subjectName: 'Matemáticas', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't1', teacherName: 'Carlos López', schedule: 'Lun-Mié-Vie 9:00-10:30', room: 'Aula 302', status: 'active' },
  { id: 'c20', subjectId: 'sub2', subjectName: 'Comunicación', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't2', teacherName: 'Ana Rodríguez', schedule: 'Mar-Jue 9:00-10:30', room: 'Aula 302', status: 'active' },
  { id: 'c21', subjectId: 'sub3', subjectName: 'Ciencias Naturales', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't3', teacherName: 'Diego Flores', schedule: 'Mar-Jue 11:00-12:30', room: 'Lab. Ciencias', status: 'active' },
  { id: 'c22', subjectId: 'sub7', subjectName: 'Educación Física', gradeSectionId: 'gs6', gradeSection: '1ro B', teacherId: 't7', teacherName: 'Roberto Mendoza', schedule: 'Vie 14:00-16:00', room: 'Cancha', status: 'active' },
]

// ==================== HORARIOS ====================
export interface Schedule {
  id: string
  courseId: string
  courseName: string
  teacherName: string
  gradeSection: string
  dayOfWeek: number // 1=Lunes, 5=Viernes
  startTime: string
  endTime: string
  room: string
}

let mockSchedules: Schedule[] = [
  { id: 'sch1', courseId: 'c1', courseName: 'Matemáticas', teacherName: 'Carlos López', gradeSection: '5to A', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: 'Aula 101' },
  { id: 'sch2', courseId: 'c1', courseName: 'Matemáticas', teacherName: 'Carlos López', gradeSection: '5to A', dayOfWeek: 3, startTime: '08:00', endTime: '09:30', room: 'Aula 101' },
  { id: 'sch3', courseId: 'c1', courseName: 'Matemáticas', teacherName: 'Carlos López', gradeSection: '5to A', dayOfWeek: 5, startTime: '08:00', endTime: '09:30', room: 'Aula 101' },
  { id: 'sch4', courseId: 'c2', courseName: 'Comunicación', teacherName: 'Ana Rodríguez', gradeSection: '5to A', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'Aula 101' },
  { id: 'sch5', courseId: 'c2', courseName: 'Comunicación', teacherName: 'Ana Rodríguez', gradeSection: '5to A', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', room: 'Aula 101' },
  { id: 'sch6', courseId: 'c4', courseName: 'Ciencias Naturales', teacherName: 'Diego Flores', gradeSection: '5to A', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'Lab. Ciencias' },
  { id: 'sch7', courseId: 'c4', courseName: 'Ciencias Naturales', teacherName: 'Diego Flores', gradeSection: '5to A', dayOfWeek: 4, startTime: '10:00', endTime: '11:30', room: 'Lab. Ciencias' },
  { id: 'sch8', courseId: 'c5', courseName: 'Inglés', teacherName: 'Miguel Ángel', gradeSection: '5to A', dayOfWeek: 1, startTime: '14:00', endTime: '15:30', room: 'Aula 101' },
  { id: 'sch9', courseId: 'c5', courseName: 'Inglés', teacherName: 'Miguel Ángel', gradeSection: '5to A', dayOfWeek: 3, startTime: '14:00', endTime: '15:30', room: 'Aula 101' },
  { id: 'sch10', courseId: 'c7', courseName: 'Educación Física', teacherName: 'Roberto Mendoza', gradeSection: '5to A', dayOfWeek: 2, startTime: '14:00', endTime: '16:00', room: 'Cancha' },
]

// ==================== TAREAS ====================
export interface Task {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  gradeSection: string
  level: 'Primaria' | 'Secundaria'
  teacherId: string
  teacherName: string
  dueDate: string
  assignedDate: string
  maxScore: number
  status: 'pending' | 'closed'  // pending = activa para entregar, closed = fecha pasó
  totalStudents: number
}

let mockTasks: Task[] = [
  // Tareas de Primaria - 5to A
  { id: 'task1', title: 'Ejercicios de fracciones', description: 'Resolver los ejercicios del capítulo 5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', teacherId: 't1', teacherName: 'Carlos López', dueDate: '2024-12-20', assignedDate: '2024-12-10', maxScore: 20, status: 'pending', totalStudents: 25 },
  { id: 'task2', title: 'Ensayo literario', description: 'Escribir un ensayo sobre la novela asignada', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', teacherId: 't2', teacherName: 'Ana Rodríguez', dueDate: '2024-12-22', assignedDate: '2024-12-08', maxScore: 20, status: 'pending', totalStudents: 25 },
  { id: 'task3', title: 'Informe de laboratorio', description: 'Documentar el experimento de fotosíntesis', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', teacherId: 't3', teacherName: 'Diego Flores', dueDate: '2024-12-18', assignedDate: '2024-12-05', maxScore: 20, status: 'pending', totalStudents: 25 },
  { id: 'task4', title: 'Vocabulario Unit 5', description: 'Memorizar y practicar vocabulario', courseId: 'c5', courseName: 'Inglés', gradeSection: '5to A', level: 'Primaria', teacherId: 't5', teacherName: 'Miguel Ángel', dueDate: '2024-12-10', assignedDate: '2024-12-01', maxScore: 15, status: 'closed', totalStudents: 25 },
  // Tareas de Primaria - 5to B
  { id: 'task5', title: 'Proyecto de geometría', description: 'Construir figuras geométricas en 3D', courseId: 'c3', courseName: 'Matemáticas', gradeSection: '5to B', level: 'Primaria', teacherId: 't1', teacherName: 'Carlos López', dueDate: '2024-12-25', assignedDate: '2024-12-12', maxScore: 25, status: 'pending', totalStudents: 28 },
  { id: 'task6', title: 'Composición musical', description: 'Crear una melodía simple', courseId: 'c8', courseName: 'Música', gradeSection: '5to B', level: 'Primaria', teacherId: 't6', teacherName: 'Patricia Vargas', dueDate: '2024-12-28', assignedDate: '2024-12-14', maxScore: 20, status: 'pending', totalStudents: 28 },
  { id: 'task7', title: 'Lectura comprensiva', description: 'Leer el cuento y responder preguntas', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to B', level: 'Primaria', teacherId: 't2', teacherName: 'Ana Rodríguez', dueDate: '2024-12-19', assignedDate: '2024-12-09', maxScore: 15, status: 'pending', totalStudents: 28 },
  // Tareas de Primaria - 6to A
  { id: 'task8', title: 'Problemas de álgebra', description: 'Resolver ecuaciones lineales', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '6to A', level: 'Primaria', teacherId: 't1', teacherName: 'Carlos López', dueDate: '2024-12-21', assignedDate: '2024-12-11', maxScore: 20, status: 'pending', totalStudents: 22 },
  { id: 'task9', title: 'Mapa conceptual Historia', description: 'Crear mapa conceptual de la Independencia', courseId: 'c6', courseName: 'Historia', gradeSection: '6to A', level: 'Primaria', teacherId: 't4', teacherName: 'Rosa Torres', dueDate: '2024-12-08', assignedDate: '2024-12-01', maxScore: 15, status: 'closed', totalStudents: 22 },
  // Tareas de Secundaria - 1ro A
  { id: 'task10', title: 'Ensayo filosófico', description: 'Reflexión sobre ética y valores', courseId: 'c2', courseName: 'Comunicación', gradeSection: '1ro A', level: 'Secundaria', teacherId: 't2', teacherName: 'Ana Rodríguez', dueDate: '2024-12-23', assignedDate: '2024-12-13', maxScore: 20, status: 'pending', totalStudents: 30 },
  { id: 'task11', title: 'Práctica de laboratorio', description: 'Experimento de reacciones químicas', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '1ro A', level: 'Secundaria', teacherId: 't3', teacherName: 'Diego Flores', dueDate: '2024-12-20', assignedDate: '2024-12-10', maxScore: 25, status: 'pending', totalStudents: 30 },
  // Tareas de Secundaria - 1ro B
  { id: 'task12', title: 'Presentación en inglés', description: 'Exposición oral sobre tu familia', courseId: 'c5', courseName: 'Inglés', gradeSection: '1ro B', level: 'Secundaria', teacherId: 't5', teacherName: 'Miguel Ángel', dueDate: '2024-12-24', assignedDate: '2024-12-14', maxScore: 20, status: 'pending', totalStudents: 32 },
  { id: 'task13', title: 'Proyecto de arte', description: 'Pintura al óleo sobre paisajes', courseId: 'c8', courseName: 'Arte', gradeSection: '1ro B', level: 'Secundaria', teacherId: 't6', teacherName: 'Patricia Vargas', dueDate: '2024-12-27', assignedDate: '2024-12-12', maxScore: 20, status: 'pending', totalStudents: 32 },
]

// ==================== EXÁMENES ====================
export interface Exam {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  gradeSection: string
  level: 'Primaria' | 'Secundaria'
  teacherId: string
  teacherName: string
  examDate: string
  maxScore: number
  status: 'scheduled' | 'completed' | 'graded'
  averageScore?: number
}

let mockExams: Exam[] = [
  // Exámenes de Primaria - 5to A
  { id: 'exam1', title: 'Examen de Matemáticas', description: 'Evaluación de fracciones y decimales', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', teacherId: 't1', teacherName: 'Carlos López', examDate: '2024-12-16', maxScore: 20, status: 'scheduled' },
  { id: 'exam2', title: 'Examen de Comunicación', description: 'Comprensión lectora', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', teacherId: 't2', teacherName: 'Ana Rodríguez', examDate: '2024-12-14', maxScore: 20, status: 'completed', averageScore: 15.5 },
  { id: 'exam3', title: 'Examen de Ciencias', description: 'Evaluación integral del bimestre', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', teacherId: 't3', teacherName: 'Diego Flores', examDate: '2024-12-20', maxScore: 20, status: 'scheduled' },
  { id: 'exam4', title: 'Examen de Inglés', description: 'Vocabulary and grammar', courseId: 'c5', courseName: 'Inglés', gradeSection: '5to A', level: 'Primaria', teacherId: 't5', teacherName: 'Miguel Ángel', examDate: '2024-12-10', maxScore: 20, status: 'graded', averageScore: 14.8 },
  // Exámenes de Primaria - 5to B
  { id: 'exam5', title: 'Examen de Matemáticas', description: 'Geometría y medidas', courseId: 'c3', courseName: 'Matemáticas', gradeSection: '5to B', level: 'Primaria', teacherId: 't1', teacherName: 'Carlos López', examDate: '2024-12-17', maxScore: 20, status: 'scheduled' },
  { id: 'exam6', title: 'Examen de Música', description: 'Teoría musical básica', courseId: 'c8', courseName: 'Música', gradeSection: '5to B', level: 'Primaria', teacherId: 't6', teacherName: 'Patricia Vargas', examDate: '2024-12-19', maxScore: 20, status: 'scheduled' },
  // Exámenes de Primaria - 6to A
  { id: 'exam7', title: 'Examen de Matemáticas', description: 'Álgebra y funciones', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '6to A', level: 'Primaria', teacherId: 't1', teacherName: 'Carlos López', examDate: '2024-12-18', maxScore: 20, status: 'scheduled' },
  { id: 'exam8', title: 'Examen de Historia', description: 'Historia del Perú', courseId: 'c6', courseName: 'Historia', gradeSection: '6to A', level: 'Primaria', teacherId: 't4', teacherName: 'Rosa Torres', examDate: '2024-12-05', maxScore: 20, status: 'graded', averageScore: 16.2 },
  // Exámenes de Secundaria - 1ro A
  { id: 'exam9', title: 'Examen de Comunicación', description: 'Análisis literario', courseId: 'c2', courseName: 'Comunicación', gradeSection: '1ro A', level: 'Secundaria', teacherId: 't2', teacherName: 'Ana Rodríguez', examDate: '2024-12-21', maxScore: 20, status: 'scheduled' },
  { id: 'exam10', title: 'Examen de Ciencias', description: 'Química básica', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '1ro A', level: 'Secundaria', teacherId: 't3', teacherName: 'Diego Flores', examDate: '2024-12-22', maxScore: 20, status: 'scheduled' },
  // Exámenes de Secundaria - 1ro B
  { id: 'exam11', title: 'Examen de Inglés', description: 'Reading comprehension', courseId: 'c5', courseName: 'Inglés', gradeSection: '1ro B', level: 'Secundaria', teacherId: 't5', teacherName: 'Miguel Ángel', examDate: '2024-12-23', maxScore: 20, status: 'scheduled' },
  { id: 'exam12', title: 'Examen de Ed. Física', description: 'Prueba física integral', courseId: 'c7', courseName: 'Educación Física', gradeSection: '1ro B', level: 'Secundaria', teacherId: 't7', teacherName: 'Roberto Mendoza', examDate: '2024-12-12', maxScore: 20, status: 'graded', averageScore: 17.5 },
]

// ==================== PAGOS ====================
export interface Payment {
  id: string
  studentId: string
  studentName: string
  gradeSection: string
  parentId: string
  parentName: string
  concept: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue'
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'mercadopago'
  invoiceNumber?: string
}

let mockPayments: Payment[] = [
  { id: 'pay1', studentId: 's1', studentName: 'Juan Pérez', gradeSection: '5to A', parentId: 'p1', parentName: 'Pedro Pérez', concept: 'Matrícula 2024', amount: 500, dueDate: '2024-03-01', paidDate: '2024-02-28', status: 'paid', paymentMethod: 'transfer', invoiceNumber: 'F-001234' },
  { id: 'pay2', studentId: 's1', studentName: 'Juan Pérez', gradeSection: '5to A', parentId: 'p1', parentName: 'Pedro Pérez', concept: 'Pensión Diciembre', amount: 350, dueDate: '2024-12-10', status: 'pending' },
  { id: 'pay3', studentId: 's1', studentName: 'Juan Pérez', gradeSection: '5to A', parentId: 'p1', parentName: 'Pedro Pérez', concept: 'Pensión Noviembre', amount: 350, dueDate: '2024-11-10', paidDate: '2024-11-08', status: 'paid', paymentMethod: 'card', invoiceNumber: 'F-001890' },
  { id: 'pay4', studentId: 's2', studentName: 'María García', gradeSection: '5to A', parentId: 'p2', parentName: 'Ana García', concept: 'Matrícula 2024', amount: 500, dueDate: '2024-03-01', paidDate: '2024-03-01', status: 'paid', paymentMethod: 'mercadopago', invoiceNumber: 'F-001235' },
  { id: 'pay5', studentId: 's2', studentName: 'María García', gradeSection: '5to A', parentId: 'p2', parentName: 'Ana García', concept: 'Pensión Diciembre', amount: 350, dueDate: '2024-12-10', status: 'overdue' },
  { id: 'pay6', studentId: 's3', studentName: 'Carlos López', gradeSection: '5to B', parentId: 'p3', parentName: 'Luis López', concept: 'Pensión Diciembre', amount: 350, dueDate: '2024-12-10', status: 'pending' },
  { id: 'pay7', studentId: 's5', studentName: 'Pedro Sánchez', gradeSection: '6to A', parentId: 'p5', parentName: 'Miguel Sánchez', concept: 'Material Educativo', amount: 150, dueDate: '2024-08-15', paidDate: '2024-08-14', status: 'paid', paymentMethod: 'cash', invoiceNumber: 'F-001456' },
  { id: 'pay8', studentId: 's6', studentName: 'Luis Martínez', gradeSection: '6to A', parentId: 'p6', parentName: 'Carmen Martínez', concept: 'Pensión Diciembre', amount: 350, dueDate: '2024-12-10', paidDate: '2024-12-09', status: 'paid', paymentMethod: 'transfer', invoiceNumber: 'F-002001' },
]

// ==================== NOTIFICACIONES ====================
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  targetRole?: UserRole | 'ALL'
  targetUserId?: string
  createdAt: string
  read: boolean
  readAt?: string
}

let mockNotifications: Notification[] = [
  { id: 'not1', title: 'Inicio de inscripciones', message: 'Las inscripciones para el año 2025 están abiertas', type: 'info', targetRole: 'ALL', createdAt: '2024-12-01', read: false },
  { id: 'not2', title: 'Reunión de padres', message: 'Se convoca a reunión de padres el día viernes 20 de diciembre', type: 'info', targetRole: 'PARENT', createdAt: '2024-12-10', read: false },
  { id: 'not3', title: 'Entrega de notas', message: 'Las notas del bimestre ya están disponibles', type: 'success', targetRole: 'STUDENT', createdAt: '2024-12-12', read: true, readAt: '2024-12-12' },
  { id: 'not4', title: 'Mantenimiento del sistema', message: 'El sistema estará en mantenimiento el domingo', type: 'warning', targetRole: 'ALL', createdAt: '2024-12-13', read: false },
  { id: 'not5', title: 'Pago vencido', message: 'Tiene un pago pendiente vencido', type: 'error', targetRole: 'PARENT', targetUserId: 'p2', createdAt: '2024-12-11', read: false },
]

// ==================== AUDITORÍA ====================
export interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW'
  module: string
  description: string
  ipAddress: string
  timestamp: string
  details?: Record<string, unknown>
}

let mockAuditLogs: AuditLog[] = [
  { id: 'aud1', userId: 'u1', userName: 'Admin Sistema', userRole: 'ADMIN', action: 'LOGIN', module: 'Auth', description: 'Inicio de sesión exitoso', ipAddress: '192.168.1.100', timestamp: '2024-12-13T08:00:00' },
  { id: 'aud2', userId: 'u1', userName: 'Admin Sistema', userRole: 'ADMIN', action: 'CREATE', module: 'Estudiantes', description: 'Nuevo estudiante registrado: Juan Pérez', ipAddress: '192.168.1.100', timestamp: '2024-12-13T08:15:00' },
  { id: 'aud3', userId: 'u2', userName: 'Carlos López', userRole: 'TEACHER', action: 'UPDATE', module: 'Tareas', description: 'Tarea actualizada: Ejercicios de fracciones', ipAddress: '192.168.1.101', timestamp: '2024-12-13T09:30:00' },
  { id: 'aud4', userId: 'u1', userName: 'Admin Sistema', userRole: 'ADMIN', action: 'DELETE', module: 'Usuarios', description: 'Usuario eliminado: test@escuela.com', ipAddress: '192.168.1.100', timestamp: '2024-12-13T10:00:00' },
  { id: 'aud5', userId: 'u3', userName: 'Ana Rodríguez', userRole: 'TEACHER', action: 'CREATE', module: 'Exámenes', description: 'Nuevo examen programado: Quiz Comunicación', ipAddress: '192.168.1.102', timestamp: '2024-12-13T11:00:00' },
  { id: 'aud6', userId: 'u11', userName: 'Pedro Sánchez', userRole: 'PARENT', action: 'VIEW', module: 'Pagos', description: 'Consultó estado de pagos', ipAddress: '192.168.1.200', timestamp: '2024-12-13T12:00:00' },
]

// ==================== HELPER FUNCTIONS ====================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const generateId = () => Math.random().toString(36).substr(2, 9)

// ==================== SERVICIOS CRUD ====================

// --- Usuarios ---
export const usersService = {
  async getAll(): Promise<User[]> {
    await delay(300)
    return [...mockUsers]
  },
  async getById(id: string): Promise<User | undefined> {
    await delay(200)
    return mockUsers.find(u => u.id === id)
  },
  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await delay(300)
    const newUser: User = { ...data, id: generateId(), createdAt: new Date().toISOString().split('T')[0] }
    mockUsers.push(newUser)
    return newUser
  },
  async update(id: string, data: Partial<User>): Promise<User> {
    await delay(300)
    const index = mockUsers.findIndex(u => u.id === id)
    if (index >= 0) {
      mockUsers[index] = { ...mockUsers[index], ...data }
      return mockUsers[index]
    }
    throw new Error('Usuario no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockUsers = mockUsers.filter(u => u.id !== id)
  }
}

// --- Estudiantes ---
export const studentsService = {
  async getAll(): Promise<Student[]> {
    await delay(300)
    return [...mockStudents]
  },
  async getById(id: string): Promise<Student | undefined> {
    await delay(200)
    return mockStudents.find(s => s.id === id)
  },
  async create(data: Omit<Student, 'id' | 'code' | 'enrollmentDate'>): Promise<Student> {
    await delay(300)
    const code = `EST-2024-${String(mockStudents.length + 1).padStart(4, '0')}`
    const newStudent: Student = { ...data, id: generateId(), code, enrollmentDate: new Date().toISOString().split('T')[0] }
    mockStudents.push(newStudent)
    return newStudent
  },
  async update(id: string, data: Partial<Student>): Promise<Student> {
    await delay(300)
    const index = mockStudents.findIndex(s => s.id === id)
    if (index >= 0) {
      mockStudents[index] = { ...mockStudents[index], ...data }
      return mockStudents[index]
    }
    throw new Error('Estudiante no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockStudents = mockStudents.filter(s => s.id !== id)
  }
}

// --- Profesores ---
export const teachersService = {
  async getAll(): Promise<Teacher[]> {
    await delay(300)
    return [...mockTeachers]
  },
  async getById(id: string): Promise<Teacher | undefined> {
    await delay(200)
    return mockTeachers.find(t => t.id === id)
  },
  async create(data: Omit<Teacher, 'id' | 'code'>): Promise<Teacher> {
    await delay(300)
    const code = `DOC-${String(mockTeachers.length + 1).padStart(3, '0')}`
    const newTeacher: Teacher = { ...data, id: generateId(), code }
    mockTeachers.push(newTeacher)
    return newTeacher
  },
  async update(id: string, data: Partial<Teacher>): Promise<Teacher> {
    await delay(300)
    const index = mockTeachers.findIndex(t => t.id === id)
    if (index >= 0) {
      mockTeachers[index] = { ...mockTeachers[index], ...data }
      return mockTeachers[index]
    }
    throw new Error('Profesor no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockTeachers = mockTeachers.filter(t => t.id !== id)
  }
}

// --- Tutores/Padres ---
export const parentsService = {
  async getAll(): Promise<Parent[]> {
    await delay(300)
    return [...mockParents]
  },
  async getById(id: string): Promise<Parent | undefined> {
    await delay(200)
    return mockParents.find(p => p.id === id)
  },
  async create(data: Omit<Parent, 'id'>): Promise<Parent> {
    await delay(300)
    const newParent: Parent = { ...data, id: generateId() }
    mockParents.push(newParent)
    return newParent
  },
  async update(id: string, data: Partial<Parent>): Promise<Parent> {
    await delay(300)
    const index = mockParents.findIndex(p => p.id === id)
    if (index >= 0) {
      mockParents[index] = { ...mockParents[index], ...data }
      return mockParents[index]
    }
    throw new Error('Tutor no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockParents = mockParents.filter(p => p.id !== id)
  }
}

// --- Materias ---
export const subjectsService = {
  async getAll(): Promise<Subject[]> {
    await delay(300)
    return [...mockSubjects]
  },
  async getById(id: string): Promise<Subject | undefined> {
    await delay(200)
    return mockSubjects.find(s => s.id === id)
  },
  async getByGradeSection(gradeSectionId: string): Promise<Subject[]> {
    await delay(200)
    return mockSubjects.filter(s => s.gradeSectionId === gradeSectionId)
  },
  async create(data: Partial<Subject> & { name: string; code: string; description: string; color: string; level: 'Inicial' | 'Primaria' | 'Secundaria'; gradeSectionId: string; gradeSection: string }): Promise<Subject> {
    await delay(300)
    const newSubject: Subject = {
      id: generateId(),
      name: data.name,
      code: data.code,
      description: data.description,
      hoursPerWeek: data.hoursPerWeek || 4, // Default 4 horas
      color: data.color,
      level: data.level,
      gradeSectionId: data.gradeSectionId,
      gradeSection: data.gradeSection,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      status: data.status || 'active'
    }
    mockSubjects.push(newSubject)

    return newSubject
  },
  async update(id: string, data: Partial<Subject>): Promise<Subject> {
    await delay(300)
    const index = mockSubjects.findIndex(s => s.id === id)
    if (index >= 0) {
      mockSubjects[index] = { ...mockSubjects[index], ...data }

      // Actualizar el curso asociado
      const courseIndex = mockCourses.findIndex(c => c.subjectId === id)
      if (courseIndex >= 0) {
        mockCourses[courseIndex] = {
          ...mockCourses[courseIndex],
          subjectName: data.name || mockCourses[courseIndex].subjectName,
          teacherId: data.teacherId || mockCourses[courseIndex].teacherId,
          teacherName: data.teacherName || mockCourses[courseIndex].teacherName,
        }
      }

      return mockSubjects[index]
    }
    throw new Error('Materia no encontrada')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    const subject = mockSubjects.find(s => s.id === id)
    if (subject) {
      // Eliminar el curso asociado
      mockCourses = mockCourses.filter(c => c.subjectId !== id)

      // Actualizar el conteo de cursos en el grupo
      const groupIndex = mockGroups.findIndex(g => g.gradeSectionId === subject.gradeSectionId)
      if (groupIndex >= 0) {
        mockGroups[groupIndex].courseCount = Math.max(0, mockGroups[groupIndex].courseCount - 1)
      }
    }
    mockSubjects = mockSubjects.filter(s => s.id !== id)
  }
}

// --- Estructura (Grados/Secciones) ---
export const gradeSectionsService = {
  async getAll(): Promise<GradeSection[]> {
    await delay(300)
    return [...mockGradeSections]
  },
  async getById(id: string): Promise<GradeSection | undefined> {
    await delay(200)
    return mockGradeSections.find(gs => gs.id === id)
  },
  async create(data: Omit<GradeSection, 'id'>): Promise<GradeSection> {
    await delay(300)
    const newGradeSection: GradeSection = { ...data, id: generateId() }
    mockGradeSections.push(newGradeSection)

    // Crear automáticamente el grupo asociado
    const gradeSection = `${data.grade} ${data.section}`
    const studentCount = mockStudents.filter(s => s.gradeSection === gradeSection && s.status === 'active').length
    const newGroup: Group = {
      id: generateId(),
      gradeSectionId: newGradeSection.id,
      name: `${gradeSection} - ${data.level} (${data.turno})`,
      grade: data.grade,
      section: data.section,
      level: data.level,
      turno: data.turno,
      turnoStartTime: data.turnoStartTime,
      turnoEndTime: data.turnoEndTime,
      tutorId: data.tutorId,
      tutorName: data.tutorName,
      studentCount,
      courseCount: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    }
    mockGroups.push(newGroup)

    return newGradeSection
  },
  async update(id: string, data: Partial<GradeSection>): Promise<GradeSection> {
    await delay(300)
    const index = mockGradeSections.findIndex(gs => gs.id === id)
    if (index >= 0) {
      mockGradeSections[index] = { ...mockGradeSections[index], ...data }

      // Actualizar el grupo asociado
      const groupIndex = mockGroups.findIndex(g => g.gradeSectionId === id)
      if (groupIndex >= 0) {
        const gs = mockGradeSections[index]
        mockGroups[groupIndex] = {
          ...mockGroups[groupIndex],
          name: `${gs.grade} ${gs.section} - ${gs.level} (${gs.turno})`,
          grade: gs.grade,
          section: gs.section,
          level: gs.level,
          turno: gs.turno,
          turnoStartTime: gs.turnoStartTime,
          turnoEndTime: gs.turnoEndTime,
          tutorId: gs.tutorId,
          tutorName: gs.tutorName,
        }
      }

      return mockGradeSections[index]
    }
    throw new Error('Grado/Sección no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    // Eliminar el grupo asociado
    mockGroups = mockGroups.filter(g => g.gradeSectionId !== id)
    // Eliminar las materias asociadas
    mockSubjects = mockSubjects.filter(s => s.gradeSectionId !== id)
    // Eliminar los cursos asociados
    mockCourses = mockCourses.filter(c => c.gradeSectionId !== id)
    mockGradeSections = mockGradeSections.filter(gs => gs.id !== id)
  }
}

// --- Grupos ---
export const groupsService = {
  async getAll(): Promise<Group[]> {
    await delay(300)
    return [...mockGroups]
  },
  async getById(id: string): Promise<Group | undefined> {
    await delay(200)
    return mockGroups.find(g => g.id === id)
  },
  async getByGradeSectionId(gradeSectionId: string): Promise<Group | undefined> {
    await delay(200)
    return mockGroups.find(g => g.gradeSectionId === gradeSectionId)
  },
  async getByLevel(level: 'Inicial' | 'Primaria' | 'Secundaria'): Promise<Group[]> {
    await delay(200)
    return mockGroups.filter(g => g.level === level)
  },
  async getStudents(groupId: string): Promise<Student[]> {
    await delay(200)
    const group = mockGroups.find(g => g.id === groupId)
    if (!group) return []
    const gradeSection = `${group.grade} ${group.section}`
    return mockStudents.filter(s => s.gradeSection === gradeSection && s.status === 'active')
  },
  async getTeachers(groupId: string): Promise<Teacher[]> {
    await delay(200)
    const group = mockGroups.find(g => g.id === groupId)
    if (!group) return []
    // Obtener los cursos del grupo y los profesores únicos
    const courses = mockCourses.filter(c => c.gradeSectionId === group.gradeSectionId)
    const teacherIds = [...new Set(courses.map(c => c.teacherId))]
    return mockTeachers.filter(t => teacherIds.includes(t.id))
  },
  async getCourses(groupId: string): Promise<Course[]> {
    await delay(200)
    const group = mockGroups.find(g => g.id === groupId)
    if (!group) return []
    return mockCourses.filter(c => c.gradeSectionId === group.gradeSectionId)
  },
  async updateStudentCount(groupId: string): Promise<void> {
    await delay(100)
    const groupIndex = mockGroups.findIndex(g => g.id === groupId)
    if (groupIndex >= 0) {
      const group = mockGroups[groupIndex]
      const gradeSection = `${group.grade} ${group.section}`
      mockGroups[groupIndex].studentCount = mockStudents.filter(s => s.gradeSection === gradeSection && s.status === 'active').length
    }
  }
}

// --- Cursos ---
export const coursesService = {
  async getAll(): Promise<Course[]> {
    await delay(300)
    return [...mockCourses]
  },
  async getById(id: string): Promise<Course | undefined> {
    await delay(200)
    return mockCourses.find(c => c.id === id)
  },
  async create(data: Omit<Course, 'id'>): Promise<Course> {
    await delay(300)
    const newCourse: Course = { ...data, id: generateId() }
    mockCourses.push(newCourse)
    return newCourse
  },
  async update(id: string, data: Partial<Course>): Promise<Course> {
    await delay(300)
    const index = mockCourses.findIndex(c => c.id === id)
    if (index >= 0) {
      mockCourses[index] = { ...mockCourses[index], ...data }
      return mockCourses[index]
    }
    throw new Error('Curso no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockCourses = mockCourses.filter(c => c.id !== id)
  }
}

// --- Horarios ---
export const schedulesService = {
  async getAll(): Promise<Schedule[]> {
    await delay(300)
    return [...mockSchedules]
  },
  async getByGradeSection(gradeSection: string): Promise<Schedule[]> {
    await delay(200)
    return mockSchedules.filter(s => s.gradeSection === gradeSection)
  },
  async getByTeacher(teacherName: string): Promise<Schedule[]> {
    await delay(200)
    return mockSchedules.filter(s => s.teacherName === teacherName)
  },
  async create(data: Omit<Schedule, 'id'>): Promise<Schedule> {
    await delay(300)
    const newSchedule: Schedule = { ...data, id: generateId() }
    mockSchedules.push(newSchedule)
    return newSchedule
  },
  async update(id: string, data: Partial<Schedule>): Promise<Schedule> {
    await delay(300)
    const index = mockSchedules.findIndex(s => s.id === id)
    if (index >= 0) {
      mockSchedules[index] = { ...mockSchedules[index], ...data }
      return mockSchedules[index]
    }
    throw new Error('Horario no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockSchedules = mockSchedules.filter(s => s.id !== id)
  }
}

// --- Tareas ---
export const tasksService = {
  async getAll(): Promise<Task[]> {
    await delay(300)
    return [...mockTasks]
  },
  async getById(id: string): Promise<Task | undefined> {
    await delay(200)
    return mockTasks.find(t => t.id === id)
  },
  async getByTeacher(teacherId: string): Promise<Task[]> {
    await delay(200)
    return mockTasks.filter(t => t.teacherId === teacherId)
  },
  async getByCourse(courseId: string): Promise<Task[]> {
    await delay(200)
    return mockTasks.filter(t => t.courseId === courseId)
  },
  async getByLevel(level: 'Primaria' | 'Secundaria'): Promise<Task[]> {
    await delay(200)
    return mockTasks.filter(t => t.level === level)
  },
  async create(data: Omit<Task, 'id'>): Promise<Task> {
    await delay(300)
    const newTask: Task = { ...data, id: generateId() }
    mockTasks.push(newTask)
    return newTask
  },
  async update(id: string, data: Partial<Task>): Promise<Task> {
    await delay(300)
    const index = mockTasks.findIndex(t => t.id === id)
    if (index >= 0) {
      mockTasks[index] = { ...mockTasks[index], ...data }
      return mockTasks[index]
    }
    throw new Error('Tarea no encontrada')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockTasks = mockTasks.filter(t => t.id !== id)
  }
}

// --- Exámenes ---
export const examsService = {
  async getAll(): Promise<Exam[]> {
    await delay(300)
    return [...mockExams]
  },
  async getById(id: string): Promise<Exam | undefined> {
    await delay(200)
    return mockExams.find(e => e.id === id)
  },
  async getByTeacher(teacherId: string): Promise<Exam[]> {
    await delay(200)
    return mockExams.filter(e => e.teacherId === teacherId)
  },
  async getByCourse(courseId: string): Promise<Exam[]> {
    await delay(200)
    return mockExams.filter(e => e.courseId === courseId)
  },
  async getByLevel(level: 'Primaria' | 'Secundaria'): Promise<Exam[]> {
    await delay(200)
    return mockExams.filter(e => e.level === level)
  },
  async create(data: Omit<Exam, 'id'>): Promise<Exam> {
    await delay(300)
    const newExam: Exam = { ...data, id: generateId() }
    mockExams.push(newExam)
    return newExam
  },
  async update(id: string, data: Partial<Exam>): Promise<Exam> {
    await delay(300)
    const index = mockExams.findIndex(e => e.id === id)
    if (index >= 0) {
      mockExams[index] = { ...mockExams[index], ...data }
      return mockExams[index]
    }
    throw new Error('Examen no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockExams = mockExams.filter(e => e.id !== id)
  }
}

// --- Pagos ---
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    await delay(300)
    return [...mockPayments]
  },
  async getById(id: string): Promise<Payment | undefined> {
    await delay(200)
    return mockPayments.find(p => p.id === id)
  },
  async getByStudent(studentId: string): Promise<Payment[]> {
    await delay(200)
    return mockPayments.filter(p => p.studentId === studentId)
  },
  async getByParent(parentId: string): Promise<Payment[]> {
    await delay(200)
    return mockPayments.filter(p => p.parentId === parentId)
  },
  async create(data: Omit<Payment, 'id'>): Promise<Payment> {
    await delay(300)
    const newPayment: Payment = { ...data, id: generateId() }
    mockPayments.push(newPayment)
    return newPayment
  },
  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    await delay(300)
    const index = mockPayments.findIndex(p => p.id === id)
    if (index >= 0) {
      mockPayments[index] = { ...mockPayments[index], ...data }
      return mockPayments[index]
    }
    throw new Error('Pago no encontrado')
  },
  async markAsPaid(id: string, paymentMethod: Payment['paymentMethod']): Promise<Payment> {
    await delay(300)
    const index = mockPayments.findIndex(p => p.id === id)
    if (index >= 0) {
      const invoiceNumber = `F-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`
      mockPayments[index] = {
        ...mockPayments[index],
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod,
        invoiceNumber
      }
      return mockPayments[index]
    }
    throw new Error('Pago no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockPayments = mockPayments.filter(p => p.id !== id)
  }
}

// --- Notificaciones ---
export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    await delay(300)
    return [...mockNotifications]
  },
  async getById(id: string): Promise<Notification | undefined> {
    await delay(200)
    return mockNotifications.find(n => n.id === id)
  },
  async getByRole(role: UserRole): Promise<Notification[]> {
    await delay(200)
    return mockNotifications.filter(n => n.targetRole === 'ALL' || n.targetRole === role)
  },
  async create(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    await delay(300)
    const newNotification: Notification = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      read: false
    }
    mockNotifications.unshift(newNotification)
    return newNotification
  },
  async markAsRead(id: string): Promise<Notification> {
    await delay(200)
    const index = mockNotifications.findIndex(n => n.id === id)
    if (index >= 0) {
      mockNotifications[index] = {
        ...mockNotifications[index],
        read: true,
        readAt: new Date().toISOString()
      }
      return mockNotifications[index]
    }
    throw new Error('Notificación no encontrada')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockNotifications = mockNotifications.filter(n => n.id !== id)
  }
}

// --- Auditoría ---
export const auditService = {
  async getAll(): Promise<AuditLog[]> {
    await delay(300)
    return [...mockAuditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },
  async getByUser(userId: string): Promise<AuditLog[]> {
    await delay(200)
    return mockAuditLogs.filter(a => a.userId === userId)
  },
  async getByModule(module: string): Promise<AuditLog[]> {
    await delay(200)
    return mockAuditLogs.filter(a => a.module === module)
  },
  async getByDateRange(startDate: string, endDate: string): Promise<AuditLog[]> {
    await delay(200)
    return mockAuditLogs.filter(a => {
      const timestamp = new Date(a.timestamp)
      return timestamp >= new Date(startDate) && timestamp <= new Date(endDate)
    })
  },
  async log(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    await delay(100)
    const newLog: AuditLog = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString()
    }
    mockAuditLogs.unshift(newLog)
    return newLog
  }
}

// ==================== MALLA CURRICULAR ====================
export type CurriculumStatus = 'planned' | 'taught' | 'rescheduled'

export interface CurriculumTopic {
  id: string
  courseId: string
  courseName: string
  gradeSection: string
  level: 'Primaria' | 'Secundaria'
  unit: number // Unidad (1, 2, 3, etc.)
  title: string
  description: string
  objectives: string[]
  estimatedHours: number
  month: number // Mes planificado (1-12)
  status: CurriculumStatus
  attachmentUrl?: string
  attachmentName?: string
  teacherId: string
  teacherName: string
  createdAt: string
  updatedAt?: string
}

let mockCurriculumTopics: CurriculumTopic[] = [
  // Matemáticas 5to A - Primaria
  { id: 'ct1', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 1, title: 'Números Naturales', description: 'Operaciones con números naturales, propiedades y aplicaciones', objectives: ['Realizar operaciones básicas', 'Aplicar propiedades conmutativa y asociativa', 'Resolver problemas con números naturales'], estimatedHours: 12, month: 3, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct2', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 2, title: 'Fracciones', description: 'Fracciones equivalentes, operaciones y problemas', objectives: ['Identificar fracciones equivalentes', 'Sumar y restar fracciones', 'Multiplicar fracciones'], estimatedHours: 15, month: 4, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct3', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 3, title: 'Decimales', description: 'Números decimales, conversión y operaciones', objectives: ['Convertir fracciones a decimales', 'Operar con decimales', 'Resolver problemas con decimales'], estimatedHours: 12, month: 5, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct4', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 4, title: 'Geometría Básica', description: 'Figuras geométricas, perímetros y áreas', objectives: ['Identificar figuras geométricas', 'Calcular perímetros', 'Calcular áreas básicas'], estimatedHours: 14, month: 6, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 5, title: 'Estadística Básica', description: 'Tablas, gráficos y medidas de tendencia central', objectives: ['Crear tablas de frecuencia', 'Interpretar gráficos', 'Calcular promedio'], estimatedHours: 10, month: 9, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct6', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 6, title: 'Proporcionalidad', description: 'Razones, proporciones y regla de tres', objectives: ['Entender razones', 'Aplicar proporciones', 'Resolver regla de tres simple'], estimatedHours: 12, month: 10, status: 'planned', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct7', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 7, title: 'Introducción al Álgebra', description: 'Expresiones algebraicas y ecuaciones simples', objectives: ['Identificar variables', 'Simplificar expresiones', 'Resolver ecuaciones de primer grado'], estimatedHours: 14, month: 11, status: 'planned', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct8', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', unit: 8, title: 'Repaso General', description: 'Repaso y refuerzo de todos los temas del año', objectives: ['Consolidar aprendizajes', 'Preparar examen final'], estimatedHours: 8, month: 12, status: 'planned', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },

  // Comunicación 5to A - Primaria
  { id: 'ct9', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', unit: 1, title: 'Comprensión Lectora', description: 'Estrategias de lectura y análisis de textos', objectives: ['Identificar ideas principales', 'Inferir información', 'Resumir textos'], estimatedHours: 14, month: 3, status: 'taught', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-02-01' },
  { id: 'ct10', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', unit: 2, title: 'Producción de Textos', description: 'Redacción de cuentos, descripciones y cartas', objectives: ['Escribir con coherencia', 'Usar conectores', 'Revisar y corregir textos'], estimatedHours: 16, month: 4, status: 'taught', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-02-01' },
  { id: 'ct11', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', unit: 3, title: 'Gramática', description: 'Sustantivos, adjetivos, verbos y concordancia', objectives: ['Identificar categorías gramaticales', 'Aplicar concordancia', 'Analizar oraciones'], estimatedHours: 12, month: 5, status: 'taught', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-02-01' },
  { id: 'ct12', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', unit: 4, title: 'Expresión Oral', description: 'Exposiciones, debates y dramatizaciones', objectives: ['Expresarse con claridad', 'Argumentar ideas', 'Escuchar activamente'], estimatedHours: 10, month: 6, status: 'taught', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-02-01' },

  // Ciencias Naturales 5to A - Primaria
  { id: 'ct13', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', unit: 1, title: 'Seres Vivos', description: 'Clasificación, características y ciclos de vida', objectives: ['Clasificar seres vivos', 'Identificar ciclos de vida', 'Entender ecosistemas'], estimatedHours: 12, month: 3, status: 'taught', teacherId: 't3', teacherName: 'Diego Flores', createdAt: '2024-02-01' },
  { id: 'ct14', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', unit: 2, title: 'Cuerpo Humano', description: 'Sistemas del cuerpo humano y salud', objectives: ['Conocer sistemas principales', 'Entender funcionamiento', 'Cuidar la salud'], estimatedHours: 14, month: 4, status: 'taught', teacherId: 't3', teacherName: 'Diego Flores', createdAt: '2024-02-01' },
  { id: 'ct15', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', unit: 3, title: 'Materia y Energía', description: 'Estados de la materia, cambios y tipos de energía', objectives: ['Identificar estados de la materia', 'Explicar cambios físicos y químicos', 'Reconocer tipos de energía'], estimatedHours: 12, month: 5, status: 'taught', teacherId: 't3', teacherName: 'Diego Flores', createdAt: '2024-02-01' },

  // Matemáticas 5to B - Primaria
  { id: 'ct16', courseId: 'c3', courseName: 'Matemáticas', gradeSection: '5to B', level: 'Primaria', unit: 1, title: 'Números Naturales', description: 'Operaciones con números naturales', objectives: ['Realizar operaciones básicas', 'Resolver problemas'], estimatedHours: 12, month: 3, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct17', courseId: 'c3', courseName: 'Matemáticas', gradeSection: '5to B', level: 'Primaria', unit: 2, title: 'Fracciones', description: 'Operaciones con fracciones', objectives: ['Operar fracciones', 'Comparar fracciones'], estimatedHours: 15, month: 4, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },
  { id: 'ct18', courseId: 'c3', courseName: 'Matemáticas', gradeSection: '5to B', level: 'Primaria', unit: 3, title: 'Geometría', description: 'Figuras y medidas', objectives: ['Calcular áreas', 'Calcular perímetros'], estimatedHours: 14, month: 5, status: 'taught', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-02-01' },

  // Historia 6to A - Primaria
  { id: 'ct19', courseId: 'c6', courseName: 'Historia', gradeSection: '6to A', level: 'Primaria', unit: 1, title: 'Culturas Pre-Incas', description: 'Chavín, Paracas, Nazca, Mochica y Chimú', objectives: ['Identificar culturas preincas', 'Reconocer aportes culturales'], estimatedHours: 12, month: 3, status: 'taught', teacherId: 't4', teacherName: 'Rosa Torres', createdAt: '2024-02-01' },
  { id: 'ct20', courseId: 'c6', courseName: 'Historia', gradeSection: '6to A', level: 'Primaria', unit: 2, title: 'Imperio Incaico', description: 'Organización, expansión y legado inca', objectives: ['Conocer organización inca', 'Entender legado cultural'], estimatedHours: 14, month: 4, status: 'taught', teacherId: 't4', teacherName: 'Rosa Torres', createdAt: '2024-02-01' },
  { id: 'ct21', courseId: 'c6', courseName: 'Historia', gradeSection: '6to A', level: 'Primaria', unit: 3, title: 'La Conquista', description: 'Llegada de españoles y conquista del Perú', objectives: ['Comprender proceso de conquista', 'Analizar consecuencias'], estimatedHours: 12, month: 5, status: 'taught', teacherId: 't4', teacherName: 'Rosa Torres', createdAt: '2024-02-01' },
  { id: 'ct22', courseId: 'c6', courseName: 'Historia', gradeSection: '6to A', level: 'Primaria', unit: 4, title: 'Independencia', description: 'Proceso de independencia y próceres', objectives: ['Conocer próceres', 'Entender proceso independentista'], estimatedHours: 14, month: 10, status: 'planned', teacherId: 't4', teacherName: 'Rosa Torres', createdAt: '2024-02-01' },
]

// ==================== TEMAS POR MES (Registro de clase) ====================
export interface MonthlyTopic {
  id: string
  curriculumTopicId?: string // Opcional, vincula con malla curricular
  courseId: string
  courseName: string
  gradeSection: string
  level: 'Primaria' | 'Secundaria'
  date: string // Fecha de la clase
  month: number
  year: number
  title: string // Tema desarrollado
  description?: string
  attachmentUrl?: string // Archivo de clase (opcional)
  attachmentName?: string
  teacherId: string
  teacherName: string
  createdAt: string
}

let mockMonthlyTopics: MonthlyTopic[] = [
  // Diciembre 2024 - Matemáticas 5to A
  { id: 'mt1', curriculumTopicId: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-12-02', month: 12, year: 2024, title: 'Repaso de Estadística - Gráficos de barras', description: 'Repaso de interpretación de gráficos de barras y tablas de frecuencia', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-12-02' },
  { id: 'mt2', curriculumTopicId: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-12-04', month: 12, year: 2024, title: 'Medidas de tendencia central', description: 'Cálculo de promedio, moda y mediana', attachmentUrl: '/uploads/clase-estadistica.pdf', attachmentName: 'clase-estadistica.pdf', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-12-04' },
  { id: 'mt3', curriculumTopicId: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-12-06', month: 12, year: 2024, title: 'Problemas de aplicación estadística', description: 'Resolución de problemas utilizando datos estadísticos', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-12-06' },
  { id: 'mt4', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-12-09', month: 12, year: 2024, title: 'Introducción a proporcionalidad', description: 'Concepto de razón y proporción', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-12-09' },
  { id: 'mt5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-12-11', month: 12, year: 2024, title: 'Regla de tres simple', description: 'Aplicación de regla de tres directa', attachmentUrl: '/uploads/regla-tres.pptx', attachmentName: 'regla-tres.pptx', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-12-11' },

  // Diciembre 2024 - Comunicación 5to A
  { id: 'mt6', curriculumTopicId: 'ct12', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', date: '2024-12-03', month: 12, year: 2024, title: 'Exposición oral - Técnicas', description: 'Técnicas de expresión oral y manejo del público', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-12-03' },
  { id: 'mt7', curriculumTopicId: 'ct12', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', date: '2024-12-05', month: 12, year: 2024, title: 'Debate: Preparación', description: 'Preparación de argumentos para el debate final', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-12-05' },
  { id: 'mt8', curriculumTopicId: 'ct12', courseId: 'c2', courseName: 'Comunicación', gradeSection: '5to A', level: 'Primaria', date: '2024-12-10', month: 12, year: 2024, title: 'Debate: Ejecución', description: 'Realización del debate grupal', attachmentUrl: '/uploads/guia-debate.pdf', attachmentName: 'guia-debate.pdf', teacherId: 't2', teacherName: 'Ana Rodríguez', createdAt: '2024-12-10' },

  // Noviembre 2024 - Matemáticas 5to A
  { id: 'mt9', curriculumTopicId: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-11-04', month: 11, year: 2024, title: 'Tablas de frecuencia', description: 'Construcción e interpretación de tablas', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-11-04' },
  { id: 'mt10', curriculumTopicId: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-11-06', month: 11, year: 2024, title: 'Gráficos circulares', description: 'Construcción de gráficos de pastel', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-11-06' },
  { id: 'mt11', curriculumTopicId: 'ct5', courseId: 'c1', courseName: 'Matemáticas', gradeSection: '5to A', level: 'Primaria', date: '2024-11-11', month: 11, year: 2024, title: 'Histogramas', description: 'Interpretación de histogramas', teacherId: 't1', teacherName: 'Carlos López', createdAt: '2024-11-11' },

  // Ciencias 5to A
  { id: 'mt12', curriculumTopicId: 'ct15', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', date: '2024-12-02', month: 12, year: 2024, title: 'Energía renovable', description: 'Tipos de energía limpia y su importancia', teacherId: 't3', teacherName: 'Diego Flores', createdAt: '2024-12-02' },
  { id: 'mt13', curriculumTopicId: 'ct15', courseId: 'c4', courseName: 'Ciencias Naturales', gradeSection: '5to A', level: 'Primaria', date: '2024-12-09', month: 12, year: 2024, title: 'Experimento: Energía solar', description: 'Práctica de laboratorio con paneles solares', attachmentUrl: '/uploads/experimento-solar.pdf', attachmentName: 'experimento-solar.pdf', teacherId: 't3', teacherName: 'Diego Flores', createdAt: '2024-12-09' },
]

// --- Servicios de Malla Curricular ---
export const curriculumService = {
  async getAll(): Promise<CurriculumTopic[]> {
    await delay(300)
    return [...mockCurriculumTopics]
  },
  async getByCourse(courseId: string): Promise<CurriculumTopic[]> {
    await delay(200)
    return mockCurriculumTopics.filter(ct => ct.courseId === courseId)
  },
  async getByGradeSection(gradeSection: string): Promise<CurriculumTopic[]> {
    await delay(200)
    return mockCurriculumTopics.filter(ct => ct.gradeSection === gradeSection)
  },
  async getByLevel(level: 'Primaria' | 'Secundaria'): Promise<CurriculumTopic[]> {
    await delay(200)
    return mockCurriculumTopics.filter(ct => ct.level === level)
  },
  async getById(id: string): Promise<CurriculumTopic | undefined> {
    await delay(200)
    return mockCurriculumTopics.find(ct => ct.id === id)
  },
  async create(data: Omit<CurriculumTopic, 'id' | 'createdAt'>): Promise<CurriculumTopic> {
    await delay(300)
    const newTopic: CurriculumTopic = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    mockCurriculumTopics.push(newTopic)
    return newTopic
  },
  async update(id: string, data: Partial<CurriculumTopic>): Promise<CurriculumTopic> {
    await delay(300)
    const index = mockCurriculumTopics.findIndex(ct => ct.id === id)
    if (index >= 0) {
      mockCurriculumTopics[index] = {
        ...mockCurriculumTopics[index],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      return mockCurriculumTopics[index]
    }
    throw new Error('Tema no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockCurriculumTopics = mockCurriculumTopics.filter(ct => ct.id !== id)
  }
}

// --- Servicios de Temas por Mes ---
export const monthlyTopicsService = {
  async getAll(): Promise<MonthlyTopic[]> {
    await delay(300)
    return [...mockMonthlyTopics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  async getByCourse(courseId: string): Promise<MonthlyTopic[]> {
    await delay(200)
    return mockMonthlyTopics.filter(mt => mt.courseId === courseId)
  },
  async getByGradeSection(gradeSection: string): Promise<MonthlyTopic[]> {
    await delay(200)
    return mockMonthlyTopics.filter(mt => mt.gradeSection === gradeSection)
  },
  async getByMonth(month: number, year: number): Promise<MonthlyTopic[]> {
    await delay(200)
    return mockMonthlyTopics.filter(mt => mt.month === month && mt.year === year)
  },
  async getById(id: string): Promise<MonthlyTopic | undefined> {
    await delay(200)
    return mockMonthlyTopics.find(mt => mt.id === id)
  },
  async create(data: Omit<MonthlyTopic, 'id' | 'createdAt'>): Promise<MonthlyTopic> {
    await delay(300)
    const newTopic: MonthlyTopic = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    mockMonthlyTopics.push(newTopic)
    return newTopic
  },
  async update(id: string, data: Partial<MonthlyTopic>): Promise<MonthlyTopic> {
    await delay(300)
    const index = mockMonthlyTopics.findIndex(mt => mt.id === id)
    if (index >= 0) {
      mockMonthlyTopics[index] = { ...mockMonthlyTopics[index], ...data }
      return mockMonthlyTopics[index]
    }
    throw new Error('Tema no encontrado')
  },
  async delete(id: string): Promise<void> {
    await delay(300)
    mockMonthlyTopics = mockMonthlyTopics.filter(mt => mt.id !== id)
  }
}

// ==================== MENSAJERÍA ====================
export type MessageType = 'text' | 'image' | 'file'
export type ParticipantRole = 'TEACHER' | 'PARENT' | 'ADMIN'

export interface Attachment {
  id: string
  name: string
  type: 'image' | 'pdf' | 'document'
  url: string
  size: number // en bytes
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: ParticipantRole
  content: string
  attachments: Attachment[]
  createdAt: string
  readBy: string[] // IDs de usuarios que han leído el mensaje
}

export interface ConversationParticipant {
  id: string
  name: string
  role: ParticipantRole
  avatar?: string
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  studentId?: string // Estudiante relacionado (si aplica)
  studentName?: string
  gradeSection?: string
  lastMessage?: string
  lastMessageAt: string
  lastMessageSenderId?: string
  createdAt: string
  createdBy: string
  unreadCount: { [userId: string]: number }
}

// Mock data para mensajes
let mockMessages: Message[] = [
  // Conversación 1: Pedro Pérez (p1) con Carlos López (t1) sobre Juan
  { id: 'msg1', conversationId: 'conv1', senderId: 'p1', senderName: 'Pedro Pérez', senderRole: 'PARENT', content: 'Buenos días profesor Carlos, quisiera consultar sobre el rendimiento de mi hijo Juan en matemáticas.', attachments: [], createdAt: '2024-12-10T08:30:00', readBy: ['p1', 't1'] },
  { id: 'msg2', conversationId: 'conv1', senderId: 't1', senderName: 'Carlos López', senderRole: 'TEACHER', content: 'Buenos días Sr. Pérez. Juan ha mostrado un buen desempeño en las últimas evaluaciones. Su promedio actual es de 16.5.', attachments: [], createdAt: '2024-12-10T09:15:00', readBy: ['p1', 't1'] },
  { id: 'msg3', conversationId: 'conv1', senderId: 'p1', senderName: 'Pedro Pérez', senderRole: 'PARENT', content: 'Excelente, gracias por la información. ¿Hay algo en lo que podamos reforzar en casa?', attachments: [], createdAt: '2024-12-10T09:30:00', readBy: ['p1', 't1'] },
  { id: 'msg4', conversationId: 'conv1', senderId: 't1', senderName: 'Carlos López', senderRole: 'TEACHER', content: 'Le recomiendo practicar más ejercicios de fracciones. Le adjunto una guía de práctica.', attachments: [{ id: 'att1', name: 'Guia_Fracciones_5to.pdf', type: 'pdf', url: '/uploads/guia_fracciones.pdf', size: 245000 }], createdAt: '2024-12-10T10:00:00', readBy: ['p1', 't1'] },
  { id: 'msg5', conversationId: 'conv1', senderId: 'p1', senderName: 'Pedro Pérez', senderRole: 'PARENT', content: 'Muchas gracias profesor, lo revisaremos juntos este fin de semana.', attachments: [], createdAt: '2024-12-10T10:15:00', readBy: ['p1', 't1'] },
  { id: 'msg6', conversationId: 'conv1', senderId: 't1', senderName: 'Carlos López', senderRole: 'TEACHER', content: 'Perfecto. Cualquier duda, estoy a su disposición. Que tenga buen día.', attachments: [], createdAt: '2024-12-10T10:20:00', readBy: ['t1'] },

  // Conversación 2: Ana García (p2) con Ana Rodríguez (t2) sobre María
  { id: 'msg7', conversationId: 'conv2', senderId: 't2', senderName: 'Ana Rodríguez', senderRole: 'TEACHER', content: 'Estimada Sra. García, me comunico para informarle que María ha tenido un excelente desempeño en el proyecto de lectura.', attachments: [], createdAt: '2024-12-11T14:00:00', readBy: ['t2', 'p2'] },
  { id: 'msg8', conversationId: 'conv2', senderId: 'p2', senderName: 'Ana García', senderRole: 'PARENT', content: '¡Qué buena noticia! María disfruta mucho las clases de comunicación. ¿Podría enviarnos fotos de su presentación?', attachments: [], createdAt: '2024-12-11T15:30:00', readBy: ['t2', 'p2'] },
  { id: 'msg9', conversationId: 'conv2', senderId: 't2', senderName: 'Ana Rodríguez', senderRole: 'TEACHER', content: 'Por supuesto, aquí le envío algunas fotos de la exposición de María.', attachments: [{ id: 'att2', name: 'presentacion_maria_1.jpg', type: 'image', url: '/uploads/presentacion1.jpg', size: 1200000 }, { id: 'att3', name: 'presentacion_maria_2.jpg', type: 'image', url: '/uploads/presentacion2.jpg', size: 980000 }], createdAt: '2024-12-11T16:00:00', readBy: ['t2'] },

  // Conversación 3: Luis López (p3) con Carlos López (t1) sobre Carlos estudiante
  { id: 'msg10', conversationId: 'conv3', senderId: 'p3', senderName: 'Luis López', senderRole: 'PARENT', content: 'Profesor, Carlos me comentó que tiene dificultades con los problemas de álgebra. ¿Podríamos programar una tutoría adicional?', attachments: [], createdAt: '2024-12-12T11:00:00', readBy: ['p3', 't1'] },
  { id: 'msg11', conversationId: 'conv3', senderId: 't1', senderName: 'Carlos López', senderRole: 'TEACHER', content: 'Claro que sí Sr. López. Tengo disponibilidad los martes y jueves después de clases. ¿Cuál día le conviene?', attachments: [], createdAt: '2024-12-12T11:30:00', readBy: ['p3', 't1'] },
  { id: 'msg12', conversationId: 'conv3', senderId: 'p3', senderName: 'Luis López', senderRole: 'PARENT', content: 'El jueves sería perfecto. ¿A qué hora podría ser?', attachments: [], createdAt: '2024-12-12T12:00:00', readBy: ['t1'] },

  // Conversación 4: Rosa Rodríguez (p4) con Diego Flores (t3) sobre Ana estudiante - Ciencias
  { id: 'msg13', conversationId: 'conv4', senderId: 'p4', senderName: 'Rosa Rodríguez', senderRole: 'PARENT', content: 'Buenas tardes profesor Diego. Ana está muy emocionada con el proyecto de ciencias sobre ecosistemas.', attachments: [], createdAt: '2024-12-13T16:00:00', readBy: ['p4', 't3'] },
  { id: 'msg14', conversationId: 'conv4', senderId: 't3', senderName: 'Diego Flores', senderRole: 'TEACHER', content: 'Buenas tardes. Me alegra saber eso. Ana es muy participativa en clase. Su maqueta del ecosistema marino quedó excelente.', attachments: [], createdAt: '2024-12-13T16:30:00', readBy: ['p4', 't3'] },
  { id: 'msg15', conversationId: 'conv4', senderId: 'p4', senderName: 'Rosa Rodríguez', senderRole: 'PARENT', content: '¡Gracias! Trabajamos juntas todo el fin de semana. ¿Cuándo serán las exposiciones finales?', attachments: [], createdAt: '2024-12-13T17:00:00', readBy: ['t3'] },

  // Conversación 5: Miguel Sánchez (p5) con Carlos López (t1) sobre Pedro estudiante
  { id: 'msg16', conversationId: 'conv5', senderId: 't1', senderName: 'Carlos López', senderRole: 'TEACHER', content: 'Sr. Sánchez, quería informarle que Pedro no presentó la tarea de matemáticas del viernes pasado.', attachments: [], createdAt: '2024-12-14T08:00:00', readBy: ['t1', 'p5'] },
  { id: 'msg17', conversationId: 'conv5', senderId: 'p5', senderName: 'Miguel Sánchez', senderRole: 'PARENT', content: 'Gracias por informarme profesor. Pedro estuvo enfermo ese día, pero ya está mejor. ¿Puede entregar la tarea mañana?', attachments: [], createdAt: '2024-12-14T09:00:00', readBy: ['t1', 'p5'] },
  { id: 'msg18', conversationId: 'conv5', senderId: 't1', senderName: 'Carlos López', senderRole: 'TEACHER', content: 'Entendido. Sí, puede entregarla mañana sin penalización. Espero que Pedro se encuentre mejor.', attachments: [], createdAt: '2024-12-14T09:15:00', readBy: ['t1', 'p5'] },
  { id: 'msg19', conversationId: 'conv5', senderId: 'p5', senderName: 'Miguel Sánchez', senderRole: 'PARENT', content: 'Muchas gracias por su comprensión. Pedro entregará la tarea mañana a primera hora.', attachments: [], createdAt: '2024-12-14T09:30:00', readBy: ['p5'] },

  // Conversación 6: Carmen Martínez (p6) con Ana Rodríguez (t2) sobre Luis estudiante
  { id: 'msg20', conversationId: 'conv6', senderId: 'p6', senderName: 'Carmen Martínez', senderRole: 'PARENT', content: 'Profesora Ana, Luis me comentó sobre el concurso de poesía. ¿Cuáles son los requisitos para participar?', attachments: [], createdAt: '2024-12-14T10:00:00', readBy: ['p6', 't2'] },
  { id: 'msg21', conversationId: 'conv6', senderId: 't2', senderName: 'Ana Rodríguez', senderRole: 'TEACHER', content: 'Hola Sra. Martínez. El concurso es para alumnos de 6to grado. Deben presentar un poema original de tema libre, mínimo 12 versos.', attachments: [], createdAt: '2024-12-14T11:00:00', readBy: ['p6', 't2'] },
  { id: 'msg22', conversationId: 'conv6', senderId: 't2', senderName: 'Ana Rodríguez', senderRole: 'TEACHER', content: 'Le adjunto las bases completas del concurso.', attachments: [{ id: 'att4', name: 'Bases_Concurso_Poesia_2024.pdf', type: 'pdf', url: '/uploads/bases_concurso.pdf', size: 156000 }], createdAt: '2024-12-14T11:05:00', readBy: ['p6', 't2'] },
  { id: 'msg23', conversationId: 'conv6', senderId: 'p6', senderName: 'Carmen Martínez', senderRole: 'PARENT', content: 'Perfecto, lo revisaré con Luis. ¡Gracias!', attachments: [], createdAt: '2024-12-14T12:00:00', readBy: ['t2'] },
]

// Mock data para conversaciones
let mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [
      { id: 'p1', name: 'Pedro Pérez', role: 'PARENT' },
      { id: 't1', name: 'Carlos López', role: 'TEACHER' }
    ],
    studentId: 's1',
    studentName: 'Juan Pérez',
    gradeSection: '5to A',
    lastMessage: 'Perfecto. Cualquier duda, estoy a su disposición. Que tenga buen día.',
    lastMessageAt: '2024-12-10T10:20:00',
    lastMessageSenderId: 't1',
    createdAt: '2024-12-10T08:30:00',
    createdBy: 'p1',
    unreadCount: { 'p1': 1, 't1': 0 }
  },
  {
    id: 'conv2',
    participants: [
      { id: 'p2', name: 'Ana García', role: 'PARENT' },
      { id: 't2', name: 'Ana Rodríguez', role: 'TEACHER' }
    ],
    studentId: 's2',
    studentName: 'María García',
    gradeSection: '5to A',
    lastMessage: 'Por supuesto, aquí le envío algunas fotos de la exposición de María.',
    lastMessageAt: '2024-12-11T16:00:00',
    lastMessageSenderId: 't2',
    createdAt: '2024-12-11T14:00:00',
    createdBy: 't2',
    unreadCount: { 'p2': 1, 't2': 0 }
  },
  {
    id: 'conv3',
    participants: [
      { id: 'p3', name: 'Luis López', role: 'PARENT' },
      { id: 't1', name: 'Carlos López', role: 'TEACHER' }
    ],
    studentId: 's3',
    studentName: 'Carlos López (Estudiante)',
    gradeSection: '5to B',
    lastMessage: 'El jueves sería perfecto. ¿A qué hora podría ser?',
    lastMessageAt: '2024-12-12T12:00:00',
    lastMessageSenderId: 'p3',
    createdAt: '2024-12-12T11:00:00',
    createdBy: 'p3',
    unreadCount: { 'p3': 0, 't1': 1 }
  },
  {
    id: 'conv4',
    participants: [
      { id: 'p4', name: 'Rosa Rodríguez', role: 'PARENT' },
      { id: 't3', name: 'Diego Flores', role: 'TEACHER' }
    ],
    studentId: 's4',
    studentName: 'Ana Rodríguez (Estudiante)',
    gradeSection: '5to B',
    lastMessage: '¡Gracias! Trabajamos juntas todo el fin de semana. ¿Cuándo serán las exposiciones finales?',
    lastMessageAt: '2024-12-13T17:00:00',
    lastMessageSenderId: 'p4',
    createdAt: '2024-12-13T16:00:00',
    createdBy: 'p4',
    unreadCount: { 'p4': 0, 't3': 1 }
  },
  {
    id: 'conv5',
    participants: [
      { id: 'p5', name: 'Miguel Sánchez', role: 'PARENT' },
      { id: 't1', name: 'Carlos López', role: 'TEACHER' }
    ],
    studentId: 's5',
    studentName: 'Pedro Sánchez',
    gradeSection: '6to A',
    lastMessage: 'Muchas gracias por su comprensión. Pedro entregará la tarea mañana a primera hora.',
    lastMessageAt: '2024-12-14T09:30:00',
    lastMessageSenderId: 'p5',
    createdAt: '2024-12-14T08:00:00',
    createdBy: 't1',
    unreadCount: { 'p5': 0, 't1': 1 }
  },
  {
    id: 'conv6',
    participants: [
      { id: 'p6', name: 'Carmen Martínez', role: 'PARENT' },
      { id: 't2', name: 'Ana Rodríguez', role: 'TEACHER' }
    ],
    studentId: 's6',
    studentName: 'Luis Martínez',
    gradeSection: '6to A',
    lastMessage: 'Perfecto, lo revisaré con Luis. ¡Gracias!',
    lastMessageAt: '2024-12-14T12:00:00',
    lastMessageSenderId: 'p6',
    createdAt: '2024-12-14T10:00:00',
    createdBy: 'p6',
    unreadCount: { 'p6': 0, 't2': 1 }
  }
]

// --- Servicios de Conversaciones ---
export const conversationsService = {
  async getAll(): Promise<Conversation[]> {
    await delay(300)
    return [...mockConversations].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  async getById(id: string): Promise<Conversation | undefined> {
    await delay(200)
    return mockConversations.find(c => c.id === id)
  },

  async getByParticipant(userId: string): Promise<Conversation[]> {
    await delay(200)
    return mockConversations
      .filter(c => c.participants.some(p => p.id === userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  async getByTeacher(teacherId: string): Promise<Conversation[]> {
    await delay(200)
    return mockConversations
      .filter(c => c.participants.some(p => p.id === teacherId && p.role === 'TEACHER'))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  async getByParent(parentId: string): Promise<Conversation[]> {
    await delay(200)
    return mockConversations
      .filter(c => c.participants.some(p => p.id === parentId && p.role === 'PARENT'))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  async getByGradeSection(gradeSection: string): Promise<Conversation[]> {
    await delay(200)
    return mockConversations
      .filter(c => c.gradeSection === gradeSection)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  async create(data: {
    participants: ConversationParticipant[]
    studentId?: string
    studentName?: string
    gradeSection?: string
    createdBy: string
  }): Promise<Conversation> {
    await delay(300)
    const newConversation: Conversation = {
      id: generateId(),
      participants: data.participants,
      studentId: data.studentId,
      studentName: data.studentName,
      gradeSection: data.gradeSection,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
      unreadCount: data.participants.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
    }
    mockConversations.push(newConversation)
    return newConversation
  },

  async updateLastMessage(conversationId: string, message: string, senderId: string): Promise<void> {
    await delay(100)
    const index = mockConversations.findIndex(c => c.id === conversationId)
    if (index >= 0) {
      mockConversations[index].lastMessage = message
      mockConversations[index].lastMessageAt = new Date().toISOString()
      mockConversations[index].lastMessageSenderId = senderId
      // Incrementar unread para todos excepto el sender
      mockConversations[index].participants.forEach(p => {
        if (p.id !== senderId) {
          mockConversations[index].unreadCount[p.id] = (mockConversations[index].unreadCount[p.id] || 0) + 1
        }
      })
    }
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await delay(100)
    const index = mockConversations.findIndex(c => c.id === conversationId)
    if (index >= 0) {
      mockConversations[index].unreadCount[userId] = 0
    }
  },

  async getTotalUnreadCount(userId: string): Promise<number> {
    await delay(100)
    return mockConversations.reduce((total, c) => {
      if (c.participants.some(p => p.id === userId)) {
        return total + (c.unreadCount[userId] || 0)
      }
      return total
    }, 0)
  },

  async delete(id: string): Promise<void> {
    await delay(300)
    mockConversations = mockConversations.filter(c => c.id !== id)
    mockMessages = mockMessages.filter(m => m.conversationId !== id)
  }
}

// --- Servicios de Mensajes ---
export const messagesService = {
  async getByConversation(conversationId: string): Promise<Message[]> {
    await delay(200)
    return mockMessages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },

  async create(data: {
    conversationId: string
    senderId: string
    senderName: string
    senderRole: ParticipantRole
    content: string
    attachments?: Attachment[]
  }): Promise<Message> {
    await delay(200)
    const newMessage: Message = {
      id: generateId(),
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      content: data.content,
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      readBy: [data.senderId]
    }
    mockMessages.push(newMessage)

    // Actualizar la conversación con el último mensaje
    await conversationsService.updateLastMessage(data.conversationId, data.content, data.senderId)

    return newMessage
  },

  async markAsRead(messageIds: string[], userId: string): Promise<void> {
    await delay(100)
    messageIds.forEach(msgId => {
      const index = mockMessages.findIndex(m => m.id === msgId)
      if (index >= 0 && !mockMessages[index].readBy.includes(userId)) {
        mockMessages[index].readBy.push(userId)
      }
    })
  },

  async getUnreadMessages(conversationId: string, userId: string): Promise<Message[]> {
    await delay(100)
    return mockMessages.filter(m =>
      m.conversationId === conversationId &&
      !m.readBy.includes(userId)
    )
  },

  async delete(id: string): Promise<void> {
    await delay(200)
    mockMessages = mockMessages.filter(m => m.id !== id)
  }
}
