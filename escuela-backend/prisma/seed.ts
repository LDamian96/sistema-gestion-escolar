import { PrismaClient, Role, Gender, Level, AttendanceStatus, TaskType, SubmissionStatus, PaymentStatus, PaymentMethod, NotificationType, CurriculumStatus, ParticipantRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.$executeRaw`TRUNCATE TABLE "Upload" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "MessageAttachment" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "MessageRead" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Message" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ConversationParticipant" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Conversation" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "MonthlyTopic" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "CurriculumTopic" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "AuditLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Notification" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Payment" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "PaymentConcept" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Attendance" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Grade" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ExamAnswer" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ExamAttempt" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ExamQuestion" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Exam" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "TaskSubmission" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Task" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Schedule" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Enrollment" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Course" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Subject" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ParentStudent" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Parent" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Student" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Teacher" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "GradeSection" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "AcademicYear" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "School" CASCADE`;

  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. Crear escuela
  const school = await prisma.school.create({
    data: {
      name: 'Colegio San Martín',
      code: 'CSM-001',
      address: 'Av. Principal 123, Lima',
      phone: '+51 999 888 777',
      email: 'info@colegiosanmartin.edu.pe',
    },
  });
  console.log('✅ Escuela creada');

  // 2. Crear año académico
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-20'),
      isCurrent: true,
      schoolId: school.id,
    },
  });
  console.log('✅ Año académico creado');

  // 3. Crear usuario Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@escuela.com',
      password: hashedPassword,
      role: Role.ADMIN,
      firstName: 'Administrador',
      lastName: 'Sistema',
      schoolId: school.id,
    },
  });
  console.log('✅ Usuario admin creado');

  // 4. Crear secciones de grado
  const gradeSections = await Promise.all([
    prisma.gradeSection.create({
      data: {
        grade: 1,
        section: 'A',
        level: Level.PRIMARIA,
        capacity: 30,
        schoolId: school.id,
        academicYearId: academicYear.id,
      },
    }),
    prisma.gradeSection.create({
      data: {
        grade: 1,
        section: 'B',
        level: Level.PRIMARIA,
        capacity: 30,
        schoolId: school.id,
        academicYearId: academicYear.id,
      },
    }),
    prisma.gradeSection.create({
      data: {
        grade: 2,
        section: 'A',
        level: Level.PRIMARIA,
        capacity: 30,
        schoolId: school.id,
        academicYearId: academicYear.id,
      },
    }),
  ]);
  console.log('✅ Secciones de grado creadas');

  // 5. Crear materias
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Matemáticas',
        code: 'MAT',
        color: '#3B82F6',
        schoolId: school.id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Comunicación',
        code: 'COM',
        color: '#10B981',
        schoolId: school.id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Ciencias',
        code: 'CIE',
        color: '#8B5CF6',
        schoolId: school.id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Historia',
        code: 'HIS',
        color: '#F59E0B',
        schoolId: school.id,
      },
    }),
  ]);
  console.log('✅ Materias creadas');

  // 6. Crear profesores
  const teacherUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'profesor@escuela.com',
        password: hashedPassword,
        role: Role.TEACHER,
        firstName: 'María',
        lastName: 'García López',
        schoolId: school.id,
        teacher: {
          create: {
            teacherCode: 'TCH-001',
            gender: Gender.FEMALE,
            specialties: ['Matemáticas', 'Física'],
            schoolId: school.id,
          },
        },
      },
      include: { teacher: true },
    }),
    prisma.user.create({
      data: {
        email: 'profesor2@escuela.com',
        password: hashedPassword,
        role: Role.TEACHER,
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        schoolId: school.id,
        teacher: {
          create: {
            teacherCode: 'TCH-002',
            gender: Gender.MALE,
            specialties: ['Comunicación', 'Literatura'],
            schoolId: school.id,
          },
        },
      },
      include: { teacher: true },
    }),
  ]);
  console.log('✅ Profesores creados');

  // 7. Crear estudiantes
  const studentUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'estudiante@escuela.com',
        password: hashedPassword,
        role: Role.STUDENT,
        firstName: 'Juan',
        lastName: 'Pérez Soto',
        schoolId: school.id,
        student: {
          create: {
            studentCode: 'STU-001',
            gender: Gender.MALE,
            birthDate: new Date('2012-05-15'),
            gradeSectionId: gradeSections[0].id,
            schoolId: school.id,
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: 'estudiante2@escuela.com',
        password: hashedPassword,
        role: Role.STUDENT,
        firstName: 'Ana',
        lastName: 'Martínez',
        schoolId: school.id,
        student: {
          create: {
            studentCode: 'STU-002',
            gender: Gender.FEMALE,
            birthDate: new Date('2012-08-20'),
            gradeSectionId: gradeSections[0].id,
            schoolId: school.id,
          },
        },
      },
      include: { student: true },
    }),
  ]);
  console.log('✅ Estudiantes creados');

  // 8. Crear padre
  const parentUser = await prisma.user.create({
    data: {
      email: 'padre@escuela.com',
      password: hashedPassword,
      role: Role.PARENT,
      firstName: 'Roberto',
      lastName: 'Pérez',
      schoolId: school.id,
      parent: {
        create: {
          relationship: 'Padre',
          schoolId: school.id,
          children: {
            create: {
              studentId: studentUsers[0].student!.id,
              isPrimary: true,
            },
          },
        },
      },
    },
    include: { parent: true },
  });
  console.log('✅ Padre creado');

  // 9. Crear cursos
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Matemáticas 1A',
        hoursPerWeek: 6,
        teacherId: teacherUsers[0].teacher!.id,
        gradeSectionId: gradeSections[0].id,
        subjectId: subjects[0].id,
        academicYearId: academicYear.id,
      },
    }),
    prisma.course.create({
      data: {
        name: 'Comunicación 1A',
        hoursPerWeek: 6,
        teacherId: teacherUsers[1].teacher!.id,
        gradeSectionId: gradeSections[0].id,
        subjectId: subjects[1].id,
        academicYearId: academicYear.id,
      },
    }),
  ]);
  console.log('✅ Cursos creados');

  // 10. Matricular estudiantes
  await Promise.all(
    studentUsers.flatMap((student) =>
      courses.map((course) =>
        prisma.enrollment.create({
          data: {
            studentId: student.student!.id,
            courseId: course.id,
          },
        }),
      ),
    ),
  );
  console.log('✅ Matrículas creadas');

  // 11. Crear conceptos de pago
  const paymentConcepts = await Promise.all([
    prisma.paymentConcept.create({
      data: {
        name: 'Mensualidad',
        description: 'Pago mensual de pensión escolar',
        amount: 350.0,
        isRecurrent: true,
        dueDay: 5,
      },
    }),
    prisma.paymentConcept.create({
      data: {
        name: 'Matrícula 2024',
        description: 'Pago de matrícula anual',
        amount: 500.0,
        isRecurrent: false,
      },
    }),
  ]);
  console.log('✅ Conceptos de pago creados');

  // 12. Crear pagos
  await Promise.all([
    prisma.payment.create({
      data: {
        amount: 500,
        status: PaymentStatus.PAID,
        method: PaymentMethod.CASH,
        receiptNumber: 'REC-001',
        dueDate: new Date('2024-03-01'),
        paidAt: new Date('2024-03-01'),
        notes: 'Matrícula pagada',
        studentId: studentUsers[0].student!.id,
        conceptId: paymentConcepts[1].id,
        schoolId: school.id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 350,
        status: PaymentStatus.PAID,
        method: PaymentMethod.TRANSFER,
        receiptNumber: 'REC-002',
        dueDate: new Date('2024-03-05'),
        paidAt: new Date('2024-03-04'),
        notes: 'Mensualidad Marzo',
        studentId: studentUsers[0].student!.id,
        conceptId: paymentConcepts[0].id,
        schoolId: school.id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 350,
        status: PaymentStatus.PAID,
        method: PaymentMethod.MERCADOPAGO,
        receiptNumber: 'MP-001',
        dueDate: new Date('2024-04-05'),
        paidAt: new Date('2024-04-03'),
        notes: 'Mensualidad Abril',
        studentId: studentUsers[0].student!.id,
        conceptId: paymentConcepts[0].id,
        schoolId: school.id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 350,
        status: PaymentStatus.PENDING,
        dueDate: new Date('2025-01-05'),
        notes: 'Mensualidad Enero 2025',
        studentId: studentUsers[0].student!.id,
        conceptId: paymentConcepts[0].id,
        schoolId: school.id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 350,
        status: PaymentStatus.PENDING,
        dueDate: new Date('2025-02-05'),
        notes: 'Mensualidad Febrero 2025',
        studentId: studentUsers[0].student!.id,
        conceptId: paymentConcepts[0].id,
        schoolId: school.id,
      },
    }),
  ]);
  console.log('✅ Pagos creados');

  // 13. Crear horarios
  await Promise.all([
    prisma.schedule.create({
      data: {
        dayOfWeek: 1, // Lunes
        startTime: '08:00',
        endTime: '09:30',
        room: 'Aula 101',
        courseId: courses[0].id,
        gradeSectionId: gradeSections[0].id,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 1,
        startTime: '09:45',
        endTime: '11:15',
        room: 'Aula 101',
        courseId: courses[1].id,
        gradeSectionId: gradeSections[0].id,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 3, // Miércoles
        startTime: '08:00',
        endTime: '09:30',
        room: 'Aula 101',
        courseId: courses[0].id,
        gradeSectionId: gradeSections[0].id,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 5, // Viernes
        startTime: '08:00',
        endTime: '09:30',
        room: 'Aula 101',
        courseId: courses[0].id,
        gradeSectionId: gradeSections[0].id,
      },
    }),
  ]);
  console.log('✅ Horarios creados');

  // 14. Crear tareas
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Ejercicios de suma y resta',
        description: 'Resolver los ejercicios del libro página 45-48',
        type: TaskType.HOMEWORK,
        dueDate: new Date('2024-12-20'),
        maxScore: 20,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Lectura comprensiva',
        description: 'Leer el cuento "El principito" capítulos 1-5',
        type: TaskType.HOMEWORK,
        dueDate: new Date('2024-12-22'),
        maxScore: 20,
        courseId: courses[1].id,
        teacherId: teacherUsers[1].teacher!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Proyecto de multiplicación',
        description: 'Crear tablas de multiplicar ilustradas',
        type: TaskType.PROJECT,
        dueDate: new Date('2025-01-15'),
        maxScore: 100,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
  ]);
  console.log('✅ Tareas creadas');

  // 15. Crear entregas de tareas
  await Promise.all([
    prisma.taskSubmission.create({
      data: {
        taskId: tasks[0].id,
        studentId: studentUsers[0].student!.id,
        status: SubmissionStatus.GRADED,
        content: 'Ejercicios completados',
        submittedAt: new Date('2024-12-19'),
        score: 18,
        feedback: 'Muy bien! Solo 2 errores menores.',
        gradedAt: new Date('2024-12-20'),
      },
    }),
    prisma.taskSubmission.create({
      data: {
        taskId: tasks[0].id,
        studentId: studentUsers[1].student!.id,
        status: SubmissionStatus.GRADED,
        content: 'Ejercicios resueltos',
        submittedAt: new Date('2024-12-20'),
        score: 20,
        feedback: 'Excelente trabajo!',
        gradedAt: new Date('2024-12-20'),
      },
    }),
    prisma.taskSubmission.create({
      data: {
        taskId: tasks[1].id,
        studentId: studentUsers[0].student!.id,
        status: SubmissionStatus.SUBMITTED,
        content: 'Resumen de lectura adjunto',
        submittedAt: new Date('2024-12-21'),
      },
    }),
  ]);
  console.log('✅ Entregas de tareas creadas');

  // 16. Crear exámenes
  const exams = await Promise.all([
    prisma.exam.create({
      data: {
        title: 'Examen Parcial de Matemáticas',
        description: 'Evaluación de sumas, restas y multiplicación',
        instructions: 'Responde todas las preguntas. Tienes 60 minutos.',
        startDate: new Date('2024-12-18'),
        endDate: new Date('2024-12-18'),
        duration: 60,
        maxScore: 20,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
        questions: {
          create: [
            { question: '¿Cuánto es 15 + 27?', type: 'short_answer', points: 2, order: 1, correctAnswer: '42' },
            { question: '¿Cuánto es 45 - 18?', type: 'short_answer', points: 2, order: 2, correctAnswer: '27' },
            { question: '¿Cuánto es 6 x 7?', type: 'short_answer', points: 2, order: 3, correctAnswer: '42' },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Exámenes creados');

  // 17. Crear asistencia
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      await Promise.all(
        studentUsers.map((student) =>
          prisma.attendance.create({
            data: {
              date,
              status: i === 2 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
              notes: i === 2 ? 'Justificado por enfermedad' : undefined,
              studentId: student.student!.id,
              gradeSectionId: gradeSections[0].id,
              teacherId: teacherUsers[0].teacher!.id,
            },
          }),
        ),
      );
    }
  }
  console.log('✅ Asistencias creadas');

  // 18. Crear calificaciones
  await Promise.all([
    prisma.grade.create({
      data: {
        period: 1,
        value: 17,
        type: 'exam',
        letter: 'A',
        comment: 'Buen rendimiento',
        studentId: studentUsers[0].student!.id,
        courseId: courses[0].id,
      },
    }),
    prisma.grade.create({
      data: {
        period: 1,
        value: 19,
        type: 'task',
        letter: 'AD',
        comment: 'Excelente estudiante',
        studentId: studentUsers[1].student!.id,
        courseId: courses[0].id,
      },
    }),
    prisma.grade.create({
      data: {
        period: 1,
        value: 16,
        type: 'participation',
        letter: 'A',
        comment: 'Puede mejorar en comprensión lectora',
        studentId: studentUsers[0].student!.id,
        courseId: courses[1].id,
      },
    }),
    prisma.grade.create({
      data: {
        period: 2,
        value: 18,
        type: 'final',
        letter: 'A',
        comment: 'Muy buen promedio del bimestre',
        studentId: studentUsers[0].student!.id,
        courseId: courses[0].id,
      },
    }),
    prisma.grade.create({
      data: {
        period: 1,
        value: 14,
        type: 'exam',
        letter: 'B',
        comment: 'Necesita reforzar algunos temas',
        studentId: studentUsers[1].student!.id,
        courseId: courses[1].id,
      },
    }),
  ]);
  console.log('✅ Calificaciones creadas');

  // 19. Crear notificaciones
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Bienvenido al sistema',
        message: 'Tu cuenta ha sido creada exitosamente',
        type: NotificationType.SUCCESS,
        userId: studentUsers[0].id,
        schoolId: school.id,
        isRead: true,
        readAt: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        title: 'Nueva tarea asignada',
        message: 'Se ha asignado la tarea "Ejercicios de suma y resta"',
        type: NotificationType.INFO,
        userId: studentUsers[0].id,
        schoolId: school.id,
      },
    }),
    prisma.notification.create({
      data: {
        title: 'Pago pendiente',
        message: 'Tienes un pago pendiente para Enero 2025',
        type: NotificationType.WARNING,
        userId: parentUser.id,
        schoolId: school.id,
      },
    }),
  ]);
  console.log('✅ Notificaciones creadas');

  // 20. Crear temas curriculares
  const curriculumTopics = await Promise.all([
    prisma.curriculumTopic.create({
      data: {
        unit: 1,
        title: 'Números naturales y operaciones básicas',
        description: 'Introducción a sumas y restas con números del 1 al 100',
        objectives: ['Identificar números naturales', 'Realizar sumas simples', 'Realizar restas simples'],
        estimatedHours: 12,
        month: 3,
        status: CurriculumStatus.TAUGHT,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
    prisma.curriculumTopic.create({
      data: {
        unit: 2,
        title: 'Multiplicación',
        description: 'Tablas de multiplicar del 1 al 10',
        objectives: ['Memorizar tablas', 'Resolver problemas de multiplicación'],
        estimatedHours: 16,
        month: 4,
        status: CurriculumStatus.TAUGHT,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
    prisma.curriculumTopic.create({
      data: {
        unit: 3,
        title: 'División',
        description: 'Introducción a la división',
        objectives: ['Entender concepto de división', 'Resolver divisiones simples'],
        estimatedHours: 14,
        month: 5,
        status: CurriculumStatus.PLANNED,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
  ]);
  console.log('✅ Temas curriculares creados');

  // 21. Crear tópicos mensuales
  await Promise.all([
    prisma.monthlyTopic.create({
      data: {
        date: new Date('2024-03-15'),
        month: 3,
        year: 2024,
        title: 'Clase: Sumas con llevada',
        description: 'Práctica de sumas con números de dos dígitos',
        curriculumTopicId: curriculumTopics[0].id,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
    prisma.monthlyTopic.create({
      data: {
        date: new Date('2024-04-10'),
        month: 4,
        year: 2024,
        title: 'Clase: Tabla del 5',
        description: 'Aprendizaje de la tabla del 5',
        curriculumTopicId: curriculumTopics[1].id,
        courseId: courses[0].id,
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
  ]);
  console.log('✅ Tópicos mensuales creados');

  // 22. Crear conversación entre profesor y padre
  const conversation = await prisma.conversation.create({
    data: {
      studentId: studentUsers[0].student!.id,
      studentName: 'Juan Pérez Soto',
      gradeSection: '1°A Primaria',
      createdBy: teacherUsers[0].id,
      lastMessage: 'Gracias por la información profesora',
      participants: {
        create: [
          {
            role: ParticipantRole.TEACHER,
            teacherId: teacherUsers[0].teacher!.id,
          },
          {
            role: ParticipantRole.PARENT,
            parentId: parentUser.parent!.id,
          },
        ],
      },
      messages: {
        create: [
          {
            content: 'Buenas tardes Sr. Pérez, le escribo para informarle sobre el progreso de Juan',
            senderId: teacherUsers[0].id,
            senderName: 'María García López',
            senderRole: ParticipantRole.TEACHER,
          },
          {
            content: 'Juan ha mejorado mucho en matemáticas este mes',
            senderId: teacherUsers[0].id,
            senderName: 'María García López',
            senderRole: ParticipantRole.TEACHER,
          },
          {
            content: 'Gracias por la información profesora',
            senderId: parentUser.id,
            senderName: 'Roberto Pérez',
            senderRole: ParticipantRole.PARENT,
          },
        ],
      },
    },
  });
  console.log('✅ Conversaciones creadas');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('   Admin: admin@escuela.com / password123');
  console.log('   Profesor: profesor@escuela.com / password123');
  console.log('   Profesor2: profesor2@escuela.com / password123');
  console.log('   Estudiante: estudiante@escuela.com / password123');
  console.log('   Estudiante2: estudiante2@escuela.com / password123');
  console.log('   Padre: padre@escuela.com / password123');
  console.log('\n📊 Datos creados:');
  console.log('   - 1 Escuela');
  console.log('   - 3 Secciones de grado');
  console.log('   - 4 Materias');
  console.log('   - 2 Profesores');
  console.log('   - 2 Estudiantes');
  console.log('   - 1 Padre');
  console.log('   - 2 Cursos');
  console.log('   - 5 Pagos (3 pagados, 2 pendientes)');
  console.log('   - 4 Horarios');
  console.log('   - 3 Tareas');
  console.log('   - 1 Examen');
  console.log('   - Asistencias de 5 días');
  console.log('   - 3 Calificaciones');
  console.log('   - 3 Notificaciones');
  console.log('   - 3 Temas curriculares');
  console.log('   - 2 Tópicos mensuales');
  console.log('   - 1 Conversación con 3 mensajes');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
