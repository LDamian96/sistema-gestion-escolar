import { PrismaClient, Role, Gender, AttendanceStatus, TaskType, SubmissionType, PaymentStatus, GradeScale } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Datos de nombres peruanos reales
const firstNamesMale = ['Carlos', 'Luis', 'Miguel', 'José', 'Juan', 'Pedro', 'Diego', 'Andrés', 'Fernando', 'Ricardo', 'Eduardo', 'Alejandro', 'César', 'Julio', 'Manuel', 'Marco', 'Sebastián', 'Rodrigo', 'Gabriel', 'Daniel'];
const firstNamesFemale = ['María', 'Ana', 'Carmen', 'Rosa', 'Patricia', 'Luz', 'Elena', 'Sofía', 'Isabella', 'Valentina', 'Camila', 'Lucía', 'Daniela', 'Valeria', 'Fernanda', 'Antonella', 'Jimena', 'Ariana', 'Gabriela', 'Mariana'];
const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'Gonzales', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Ramos', 'Vargas', 'Castillo', 'Jiménez', 'Moreno', 'Romero', 'Alvarado', 'Vásquez', 'Mendoza', 'Herrera', 'Medina', 'Aguilar'];

const occupations = ['Ingeniero', 'Médico', 'Abogado', 'Contador', 'Arquitecto', 'Profesor', 'Empresario', 'Comerciante', 'Enfermera', 'Psicóloga', 'Administrador', 'Economista', 'Diseñador'];
const specialties = ['Matemáticas', 'Comunicación', 'Ciencias Naturales', 'Historia', 'Geografía', 'Inglés', 'Arte', 'Educación Física', 'Música', 'Computación', 'Física', 'Química', 'Biología'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  return `+51 9${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

function generateDate(startYear: number, endYear: number): Date {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

async function main() {
  console.log('🌱 Iniciando seed de datos completo...\n');

  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.workshopEnrollment.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reportCard.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.taskSubmission.deleteMany();
  await prisma.task.deleteMany();
  await prisma.curriculumTopic.deleteMany();
  await prisma.curriculumUnit.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.section.deleteMany();
  await prisma.gradeLevel.deleteMany();
  await prisma.period.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.level.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  // ========================================
  // 1. CREAR ESCUELA
  // ========================================
  console.log('🏫 Creando escuela...');
  const school = await prisma.school.create({
    data: {
      name: 'Colegio San José de Lima',
      address: 'Av. Javier Prado Este 1234, San Isidro, Lima, Perú',
      phone: '+51 1 234 5678',
      email: 'info@colegiosanjose.edu.pe',
    },
  });

  const password = await bcrypt.hash('Admin123!', 10);

  // ========================================
  // 2. CREAR ADMIN
  // ========================================
  console.log('👤 Creando administrador...');
  await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password,
      role: Role.ADMIN,
      schoolId: school.id,
    },
  });

  // ========================================
  // 3. CREAR PROFESORES (12 profesores)
  // ========================================
  console.log('👨‍🏫 Creando profesores...');
  const teachers: any[] = [];
  const teacherData = [
    { firstName: 'Carlos', lastName: 'González Mendoza', specialty: 'Matemáticas', gender: Gender.MALE },
    { firstName: 'María', lastName: 'Rodríguez Pérez', specialty: 'Comunicación', gender: Gender.FEMALE },
    { firstName: 'José', lastName: 'Martínez Torres', specialty: 'Ciencias Naturales', gender: Gender.MALE },
    { firstName: 'Ana', lastName: 'López García', specialty: 'Historia y Geografía', gender: Gender.FEMALE },
    { firstName: 'Luis', lastName: 'Hernández Vargas', specialty: 'Inglés', gender: Gender.MALE },
    { firstName: 'Patricia', lastName: 'Sánchez Rivera', specialty: 'Arte', gender: Gender.FEMALE },
    { firstName: 'Miguel', lastName: 'Ramírez Castillo', specialty: 'Educación Física', gender: Gender.MALE },
    { firstName: 'Carmen', lastName: 'Flores Jiménez', specialty: 'Música', gender: Gender.FEMALE },
    { firstName: 'Pedro', lastName: 'Gómez Moreno', specialty: 'Computación', gender: Gender.MALE },
    { firstName: 'Rosa', lastName: 'Díaz Romero', specialty: 'Religión', gender: Gender.FEMALE },
    { firstName: 'Fernando', lastName: 'Reyes Alvarado', specialty: 'Física y Química', gender: Gender.MALE },
    { firstName: 'Elena', lastName: 'Morales Vásquez', specialty: 'Biología', gender: Gender.FEMALE },
  ];

  for (let i = 0; i < teacherData.length; i++) {
    const t = teacherData[i];
    const user = await prisma.user.create({
      data: {
        email: `profesor${i + 1}@school.com`,
        password,
        role: Role.TEACHER,
        schoolId: school.id,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        firstName: t.firstName,
        lastName: t.lastName,
        dateOfBirth: generateDate(1975, 1990),
        gender: t.gender,
        phone: generatePhone(),
        specialty: t.specialty,
      },
    });
    teachers.push(teacher);
  }

  // ========================================
  // 4. ESTRUCTURA ACADÉMICA
  // ========================================
  console.log('📚 Creando estructura académica...');

  // Año académico
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: '2024',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-20'),
      isCurrent: true,
    },
  });

  // Periodos (4 bimestres)
  const periods: any[] = [];
  const periodsData = [
    { name: '1er Bimestre', start: '2024-03-01', end: '2024-05-10' },
    { name: '2do Bimestre', start: '2024-05-13', end: '2024-07-26' },
    { name: '3er Bimestre', start: '2024-08-12', end: '2024-10-18' },
    { name: '4to Bimestre', start: '2024-10-21', end: '2024-12-20' },
  ];

  for (const p of periodsData) {
    const period = await prisma.period.create({
      data: {
        academicYearId: academicYear.id,
        name: p.name,
        startDate: new Date(p.start),
        endDate: new Date(p.end),
      },
    });
    periods.push(period);
  }

  // Niveles educativos
  const initialLevel = await prisma.level.create({
    data: { schoolId: school.id, name: 'Inicial', order: 1 },
  });

  const primaryLevel = await prisma.level.create({
    data: { schoolId: school.id, name: 'Primaria', order: 2 },
  });

  const secondaryLevel = await prisma.level.create({
    data: { schoolId: school.id, name: 'Secundaria', order: 3 },
  });

  // Grados de Inicial (3, 4, 5 años)
  const initialGrades: any[] = [];
  for (let i = 3; i <= 5; i++) {
    const grade = await prisma.gradeLevel.create({
      data: {
        levelId: initialLevel.id,
        name: `${i} años`,
        order: i - 2,
      },
    });
    initialGrades.push(grade);
  }

  // Grados de Primaria (1ro a 6to)
  const primaryGrades: any[] = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.gradeLevel.create({
      data: {
        levelId: primaryLevel.id,
        name: `${i}${i === 1 ? 'er' : i === 2 ? 'do' : i === 3 ? 'er' : 'to'} Grado`,
        order: i,
      },
    });
    primaryGrades.push(grade);
  }

  // Grados de Secundaria (1ro a 5to)
  const secondaryGrades: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const grade = await prisma.gradeLevel.create({
      data: {
        levelId: secondaryLevel.id,
        name: `${i}${i === 1 ? 'er' : i === 2 ? 'do' : i === 3 ? 'er' : i === 4 ? 'to' : 'to'} Año`,
        order: i,
      },
    });
    secondaryGrades.push(grade);
  }

  // Secciones y Aulas para cada grado
  const allClassrooms: any[] = [];
  const sections = ['A', 'B'];

  // Aulas de Inicial
  for (const grade of initialGrades) {
    for (const sectionName of sections) {
      const section = await prisma.section.create({
        data: {
          gradeLevelId: grade.id,
          name: sectionName,
          capacity: 25,
        },
      });

      const classroom = await prisma.classroom.create({
        data: {
          sectionId: section.id,
          name: `Aula ${grade.name} ${sectionName}`,
          capacity: 25,
          location: 'Pabellón Inicial',
        },
      });
      allClassrooms.push({ classroom, grade, section, level: 'Inicial' });
    }
  }

  // Aulas de Primaria y Secundaria
  for (const grade of [...primaryGrades, ...secondaryGrades]) {
    for (const sectionName of sections) {
      const section = await prisma.section.create({
        data: {
          gradeLevelId: grade.id,
          name: sectionName,
          capacity: 30,
        },
      });

      const isPrimary = primaryGrades.includes(grade);
      const classroom = await prisma.classroom.create({
        data: {
          sectionId: section.id,
          name: `Aula ${grade.name} ${sectionName}`,
          capacity: 30,
          location: isPrimary ? 'Pabellón Primaria' : 'Pabellón Secundaria',
        },
      });
      allClassrooms.push({ classroom, grade, section, level: isPrimary ? 'Primaria' : 'Secundaria' });
    }
  }

  // ========================================
  // 5. MATERIAS POR GRADO
  // ========================================
  console.log('📖 Creando materias...');
  const subjectsByGrade: Map<string, any[]> = new Map();

  // Materias de Inicial
  const initialSubjects = [
    { name: 'Comunicación', code: 'COM' },
    { name: 'Matemática', code: 'MAT' },
    { name: 'Personal Social', code: 'PS' },
    { name: 'Ciencia y Ambiente', code: 'CA' },
    { name: 'Psicomotricidad', code: 'PSI' },
  ];

  for (const grade of initialGrades) {
    const subjects: any[] = [];
    for (const sub of initialSubjects) {
      const subject = await prisma.subject.create({
        data: {
          gradeLevelId: grade.id,
          name: sub.name,
          code: `${sub.code}-${grade.name.replace(' ', '')}`,
          description: `${sub.name} para ${grade.name} de Inicial`,
        },
      });
      subjects.push(subject);
    }
    subjectsByGrade.set(grade.id, subjects);
  }

  const primarySubjects = [
    { name: 'Matemática', code: 'MAT' },
    { name: 'Comunicación', code: 'COM' },
    { name: 'Personal Social', code: 'PS' },
    { name: 'Ciencia y Tecnología', code: 'CYT' },
    { name: 'Inglés', code: 'ING' },
    { name: 'Arte y Cultura', code: 'ART' },
    { name: 'Educación Física', code: 'EF' },
    { name: 'Educación Religiosa', code: 'REL' },
  ];

  const secondarySubjects = [
    { name: 'Matemática', code: 'MAT' },
    { name: 'Comunicación', code: 'COM' },
    { name: 'Historia, Geografía y Economía', code: 'HGE' },
    { name: 'Ciencia, Tecnología y Ambiente', code: 'CTA' },
    { name: 'Inglés', code: 'ING' },
    { name: 'Arte', code: 'ART' },
    { name: 'Educación Física', code: 'EF' },
    { name: 'Educación Religiosa', code: 'REL' },
    { name: 'Formación Ciudadana', code: 'FCC' },
    { name: 'Persona, Familia y Relaciones Humanas', code: 'PFRH' },
  ];

  for (const grade of primaryGrades) {
    const subjects: any[] = [];
    for (const sub of primarySubjects) {
      const subject = await prisma.subject.create({
        data: {
          gradeLevelId: grade.id,
          name: sub.name,
          code: `${sub.code}-${grade.order}P`,
          description: `${sub.name} para ${grade.name} de Primaria`,
        },
      });
      subjects.push(subject);
    }
    subjectsByGrade.set(grade.id, subjects);
  }

  for (const grade of secondaryGrades) {
    const subjects: any[] = [];
    for (const sub of secondarySubjects) {
      const subject = await prisma.subject.create({
        data: {
          gradeLevelId: grade.id,
          name: sub.name,
          code: `${sub.code}-${grade.order}S`,
          description: `${sub.name} para ${grade.name} de Secundaria`,
        },
      });
      subjects.push(subject);
    }
    subjectsByGrade.set(grade.id, subjects);
  }

  // ========================================
  // 6. MALLA CURRICULAR (Curriculum)
  // ========================================
  console.log('📋 Creando malla curricular...');

  // Malla curricular para Matemática de 6to Primaria (como ejemplo completo)
  const math6Subject = subjectsByGrade.get(primaryGrades[5].id)?.find(s => s.name === 'Matemática');
  if (math6Subject) {
    const mathUnits = [
      {
        name: 'Unidad 1: Números Naturales y Operaciones',
        month: 3,
        topics: ['Lectura y escritura de números hasta millones', 'Comparación y ordenamiento', 'Adición y sustracción', 'Multiplicación y división', 'Potenciación y radicación'],
      },
      {
        name: 'Unidad 2: Fracciones',
        month: 4,
        topics: ['Concepto de fracción', 'Fracciones equivalentes', 'Comparación de fracciones', 'Suma y resta de fracciones', 'Multiplicación de fracciones'],
      },
      {
        name: 'Unidad 3: Números Decimales',
        month: 5,
        topics: ['Lectura y escritura de decimales', 'Comparación de decimales', 'Operaciones con decimales', 'Conversión fracciones-decimales'],
      },
      {
        name: 'Unidad 4: Proporcionalidad',
        month: 6,
        topics: ['Razones y proporciones', 'Regla de tres simple', 'Porcentajes', 'Aplicaciones prácticas'],
      },
      {
        name: 'Unidad 5: Geometría Plana',
        month: 7,
        topics: ['Figuras geométricas', 'Perímetro', 'Área de figuras planas', 'Ángulos'],
      },
      {
        name: 'Unidad 6: Geometría del Espacio',
        month: 8,
        topics: ['Cuerpos geométricos', 'Volumen del cubo y prisma', 'Superficies'],
      },
      {
        name: 'Unidad 7: Estadística y Probabilidad',
        month: 9,
        topics: ['Tablas de frecuencia', 'Gráficos estadísticos', 'Media, mediana y moda', 'Probabilidad simple'],
      },
      {
        name: 'Unidad 8: Álgebra Básica',
        month: 10,
        topics: ['Expresiones algebraicas', 'Ecuaciones simples', 'Inecuaciones', 'Patrones y secuencias'],
      },
    ];

    for (let i = 0; i < mathUnits.length; i++) {
      const unit = await prisma.curriculumUnit.create({
        data: {
          subjectId: math6Subject.id,
          name: mathUnits[i].name,
          description: `Contenidos de ${mathUnits[i].name}`,
          order: i + 1,
          month: mathUnits[i].month,
        },
      });

      for (let j = 0; j < mathUnits[i].topics.length; j++) {
        await prisma.curriculumTopic.create({
          data: {
            curriculumUnitId: unit.id,
            name: mathUnits[i].topics[j],
            description: `Tema: ${mathUnits[i].topics[j]}`,
            order: j + 1,
          },
        });
      }
    }
  }

  // Malla curricular para Comunicación de 6to Primaria
  const com6Subject = subjectsByGrade.get(primaryGrades[5].id)?.find(s => s.name === 'Comunicación');
  if (com6Subject) {
    const comUnits = [
      {
        name: 'Unidad 1: Comprensión de Textos Narrativos',
        month: 3,
        topics: ['El cuento y sus elementos', 'La leyenda peruana', 'El mito', 'Identificación de ideas principales'],
      },
      {
        name: 'Unidad 2: Producción de Textos Narrativos',
        month: 4,
        topics: ['Planificación de textos', 'Redacción de cuentos', 'Uso de conectores', 'Revisión y edición'],
      },
      {
        name: 'Unidad 3: Gramática y Ortografía',
        month: 5,
        topics: ['El sustantivo y adjetivo', 'El verbo y sus tiempos', 'Uso de tildes', 'Signos de puntuación'],
      },
      {
        name: 'Unidad 4: Textos Informativos',
        month: 6,
        topics: ['La noticia', 'El artículo informativo', 'Infografías', 'Resúmenes'],
      },
      {
        name: 'Unidad 5: Expresión Oral',
        month: 7,
        topics: ['La exposición oral', 'El debate', 'Recursos no verbales', 'Argumentación'],
      },
      {
        name: 'Unidad 6: Textos Instructivos y Descriptivos',
        month: 8,
        topics: ['Recetas e instrucciones', 'Descripción de lugares', 'Descripción de personas', 'Manual de uso'],
      },
      {
        name: 'Unidad 7: Literatura Peruana',
        month: 9,
        topics: ['Tradiciones peruanas', 'Poesía peruana', 'Autores peruanos', 'Análisis literario'],
      },
      {
        name: 'Unidad 8: Proyecto Final',
        month: 10,
        topics: ['Revista escolar', 'Antología de cuentos', 'Presentación final'],
      },
    ];

    for (let i = 0; i < comUnits.length; i++) {
      const unit = await prisma.curriculumUnit.create({
        data: {
          subjectId: com6Subject.id,
          name: comUnits[i].name,
          description: `Contenidos de ${comUnits[i].name}`,
          order: i + 1,
          month: comUnits[i].month,
        },
      });

      for (let j = 0; j < comUnits[i].topics.length; j++) {
        await prisma.curriculumTopic.create({
          data: {
            curriculumUnitId: unit.id,
            name: comUnits[i].topics[j],
            description: `Tema: ${comUnits[i].topics[j]}`,
            order: j + 1,
          },
        });
      }
    }
  }

  // Crear unidades básicas para todas las otras materias
  for (const [gradeId, subjects] of subjectsByGrade) {
    for (const subject of subjects) {
      // Solo si no tiene unidades ya creadas
      const existingUnits = await prisma.curriculumUnit.count({ where: { subjectId: subject.id } });
      if (existingUnits === 0) {
        for (let m = 3; m <= 10; m++) {
          const unit = await prisma.curriculumUnit.create({
            data: {
              subjectId: subject.id,
              name: `Unidad ${m - 2}: ${subject.name}`,
              description: `Unidad ${m - 2} de ${subject.name}`,
              order: m - 2,
              month: m,
            },
          });

          // Crear 3-4 temas por unidad
          for (let t = 1; t <= 4; t++) {
            await prisma.curriculumTopic.create({
              data: {
                curriculumUnitId: unit.id,
                name: `Tema ${t} - Unidad ${m - 2}`,
                order: t,
              },
            });
          }
        }
      }
    }
  }

  // ========================================
  // 7. CREAR ESTUDIANTES (60 estudiantes)
  // ========================================
  console.log('👨‍🎓 Creando estudiantes...');
  const students: any[] = [];
  let studentCounter = 1;

  // Crear estudiantes por aula (algunas aulas de cada nivel para demo)
  // Indices: 0-5 Inicial, 6-17 Primaria, 18-27 Secundaria
  const selectedClassrooms = [
    ...allClassrooms.slice(0, 4),   // Inicial: 3 años A/B, 4 años A/B
    ...allClassrooms.slice(14, 18), // Primaria: 5to y 6to grado A/B
    ...allClassrooms.slice(22, 26), // Secundaria: 3er y 4to año A/B
  ];

  for (const { classroom, grade, level } of selectedClassrooms) {
    const studentsPerClass = level === 'Inicial' ? 8 : 10;
    for (let i = 0; i < studentsPerClass; i++) {
      const isMale = Math.random() > 0.5;
      const firstName = isMale ? randomElement(firstNamesMale) : randomElement(firstNamesFemale);
      const lastName = `${randomElement(lastNames)} ${randomElement(lastNames)}`;

      const user = await prisma.user.create({
        data: {
          email: `estudiante${studentCounter}@school.com`,
          password,
          role: Role.STUDENT,
          schoolId: school.id,
        },
      });

      // Calcular año de nacimiento según nivel
      let birthYearStart: number, birthYearEnd: number;
      if (level === 'Inicial') {
        // Inicial: 3-5 años en 2024, nacidos entre 2019-2021
        birthYearStart = 2019;
        birthYearEnd = 2021;
      } else if (level === 'Primaria') {
        // Primaria: 6-12 años, nacidos entre 2012-2018
        birthYearStart = 2012 - grade.order;
        birthYearEnd = 2014 - grade.order;
      } else {
        // Secundaria: 12-17 años, nacidos entre 2007-2012
        birthYearStart = 2007 - grade.order;
        birthYearEnd = 2009 - grade.order;
      }

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          firstName,
          lastName,
          dateOfBirth: generateDate(birthYearStart, birthYearEnd),
          gender: isMale ? Gender.MALE : Gender.FEMALE,
          address: `Calle ${randomElement(lastNames)} ${Math.floor(Math.random() * 1000)}, Lima`,
          phone: generatePhone(),
          enrollmentCode: `EST-2024-${studentCounter.toString().padStart(3, '0')}`,
        },
      });

      students.push({ student, classroom, grade, level });

      // Crear matrícula
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classroomId: classroom.id,
          status: 'ACTIVE',
        },
      });

      studentCounter++;
    }
  }

  // ========================================
  // 8. CREAR PADRES Y VINCULAR
  // ========================================
  console.log('👨‍👩‍👧 Creando padres y relaciones familiares...');
  const parents: any[] = [];

  for (let i = 0; i < students.length; i++) {
    // Crear padre
    const fatherUser = await prisma.user.create({
      data: {
        email: `padre${i + 1}@school.com`,
        password,
        role: Role.PARENT,
        schoolId: school.id,
      },
    });

    const father = await prisma.parent.create({
      data: {
        userId: fatherUser.id,
        schoolId: school.id,
        firstName: randomElement(firstNamesMale),
        lastName: students[i].student.lastName.split(' ')[0],
        phone: generatePhone(),
        occupation: randomElement(occupations),
      },
    });

    // Crear madre
    const motherUser = await prisma.user.create({
      data: {
        email: `madre${i + 1}@school.com`,
        password,
        role: Role.PARENT,
        schoolId: school.id,
      },
    });

    const mother = await prisma.parent.create({
      data: {
        userId: motherUser.id,
        schoolId: school.id,
        firstName: randomElement(firstNamesFemale),
        lastName: students[i].student.lastName.split(' ')[1] || students[i].student.lastName.split(' ')[0],
        phone: generatePhone(),
        occupation: randomElement(occupations),
      },
    });

    // Vincular padres con estudiante
    await prisma.studentParent.create({
      data: {
        studentId: students[i].student.id,
        parentId: father.id,
        relationship: 'Padre',
        isPrimary: true,
      },
    });

    await prisma.studentParent.create({
      data: {
        studentId: students[i].student.id,
        parentId: mother.id,
        relationship: 'Madre',
        isPrimary: false,
      },
    });

    parents.push(father, mother);
  }

  // ========================================
  // 9. CREAR CURSOS Y HORARIOS
  // ========================================
  console.log('📅 Creando cursos y horarios...');
  const allCourses: any[] = [];

  for (const { classroom, grade } of selectedClassrooms) {
    const subjects = subjectsByGrade.get(grade.id) || [];
    let teacherIndex = 0;

    for (const subject of subjects) {
      const course = await prisma.course.create({
        data: {
          academicYearId: academicYear.id,
          subjectId: subject.id,
          teacherId: teachers[teacherIndex % teachers.length].id,
          classroomId: classroom.id,
        },
      });
      allCourses.push({ course, classroom, grade, subject });

      // Crear horario (2-3 sesiones por semana)
      const days = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
      const startHour = 8 + Math.floor(Math.random() * 4);

      for (const day of days) {
        await prisma.schedule.create({
          data: {
            courseId: course.id,
            dayOfWeek: day,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + 1).toString().padStart(2, '0')}:30`,
          },
        });
      }

      teacherIndex++;
    }
  }

  // ========================================
  // 10. CREAR TAREAS
  // ========================================
  console.log('📝 Creando tareas...');

  for (const { course, subject } of allCourses.slice(0, 20)) {
    // 2-3 tareas por curso
    const tasksCount = 2 + Math.floor(Math.random() * 2);
    for (let t = 0; t < tasksCount; t++) {
      const taskType = [TaskType.HOMEWORK, TaskType.EXAM, TaskType.PROJECT, TaskType.QUIZ][Math.floor(Math.random() * 4)];
      await prisma.task.create({
        data: {
          courseId: course.id,
          title: `${taskType === TaskType.HOMEWORK ? 'Tarea' : taskType === TaskType.EXAM ? 'Examen' : taskType === TaskType.PROJECT ? 'Proyecto' : 'Quiz'}: ${subject.name}`,
          description: `Descripción de la actividad de ${subject.name}`,
          type: taskType,
          dueDate: new Date(2024, 10 + t, 15 + Math.floor(Math.random() * 10)),
        },
      });
    }
  }

  // ========================================
  // 11. CREAR NOTAS
  // ========================================
  console.log('📊 Creando notas...');

  for (const { student, classroom } of students) {
    const coursesForClassroom = allCourses.filter(c => c.classroom.id === classroom.id);

    for (const { course } of coursesForClassroom) {
      // Nota para primer bimestre
      await prisma.grade.create({
        data: {
          courseId: course.id,
          studentId: student.id,
          periodId: periods[0].id,
          score: 12 + Math.floor(Math.random() * 9), // 12-20
          scaleType: GradeScale.NUMERIC,
          observation: Math.random() > 0.7 ? 'Buen desempeño' : null,
        },
      });

      // Nota para segundo bimestre (algunos)
      if (Math.random() > 0.3) {
        await prisma.grade.create({
          data: {
            courseId: course.id,
            studentId: student.id,
            periodId: periods[1].id,
            score: 12 + Math.floor(Math.random() * 9),
            scaleType: GradeScale.NUMERIC,
          },
        });
      }
    }
  }

  // ========================================
  // 12. CREAR ASISTENCIAS
  // ========================================
  console.log('✅ Creando asistencias...');

  // Asistencias de la última semana
  const today = new Date();
  for (let d = 0; d < 5; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);

    for (const { course, classroom } of allCourses.slice(0, 10)) {
      const studentsInClass = students.filter(s => s.classroom.id === classroom.id);

      for (const { student } of studentsInClass) {
        const random = Math.random();
        let status: AttendanceStatus;
        if (random > 0.15) status = AttendanceStatus.PRESENT;
        else if (random > 0.08) status = AttendanceStatus.LATE;
        else if (random > 0.03) status = AttendanceStatus.EXCUSED;
        else status = AttendanceStatus.ABSENT;

        await prisma.attendance.create({
          data: {
            courseId: course.id,
            studentId: student.id,
            date,
            status,
            notes: status === AttendanceStatus.EXCUSED ? 'Justificado por enfermedad' : null,
          },
        });
      }
    }
  }

  // ========================================
  // 13. CREAR PAGOS
  // ========================================
  console.log('💰 Creando pagos...');

  const months = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  for (const { student } of students) {
    for (let m = 0; m < months.length; m++) {
      const dueDate = new Date(2024, m + 2, 5);
      const isPaid = m < 9; // Pagados hasta noviembre
      const isOverdue = !isPaid && m < 10;

      await prisma.payment.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          amount: 450.00,
          description: `Pensión ${months[m]} 2024`,
          dueDate,
          paidDate: isPaid ? new Date(2024, m + 2, 3 + Math.floor(Math.random() * 3)) : null,
          status: isPaid ? PaymentStatus.PAID : isOverdue ? PaymentStatus.OVERDUE : PaymentStatus.PENDING,
          paymentMethod: isPaid ? ['Transferencia', 'Efectivo', 'Tarjeta'][Math.floor(Math.random() * 3)] : null,
        },
      });
    }

    // Matrícula
    await prisma.payment.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        amount: 800.00,
        description: 'Matrícula 2024',
        dueDate: new Date(2024, 1, 28),
        paidDate: new Date(2024, 1, 25),
        status: PaymentStatus.PAID,
        paymentMethod: 'Transferencia',
      },
    });
  }

  // ========================================
  // 14. CREAR TALLERES
  // ========================================
  console.log('🎨 Creando talleres...');

  const workshopsData = [
    { name: 'Taller de Robótica', instructor: 'Ing. Pedro Martínez', schedule: 'Lunes y Miércoles 3:30 PM - 5:00 PM', capacity: 20 },
    { name: 'Taller de Teatro', instructor: 'Prof. Carmen Ríos', schedule: 'Martes y Jueves 3:30 PM - 5:00 PM', capacity: 25 },
    { name: 'Taller de Música', instructor: 'Prof. José Vargas', schedule: 'Viernes 3:30 PM - 5:00 PM', capacity: 30 },
    { name: 'Taller de Arte', instructor: 'Prof. María Flores', schedule: 'Lunes 3:30 PM - 5:00 PM', capacity: 20 },
    { name: 'Taller de Danza Folclórica', instructor: 'Prof. Rosa Mendoza', schedule: 'Miércoles 3:30 PM - 5:00 PM', capacity: 25 },
    { name: 'Club de Ciencias', instructor: 'Prof. Fernando Reyes', schedule: 'Jueves 3:30 PM - 5:00 PM', capacity: 15 },
    { name: 'Taller de Ajedrez', instructor: 'Prof. Miguel Castillo', schedule: 'Viernes 3:30 PM - 5:00 PM', capacity: 20 },
    { name: 'Taller de Inglés Avanzado', instructor: 'Prof. Luis Hernández', schedule: 'Martes 3:30 PM - 5:00 PM', capacity: 20 },
  ];

  for (const w of workshopsData) {
    const workshop = await prisma.workshop.create({
      data: {
        schoolId: school.id,
        name: w.name,
        description: `Taller extracurricular de ${w.name.replace('Taller de ', '').replace('Club de ', '')}`,
        instructor: w.instructor,
        schedule: w.schedule,
        capacity: w.capacity,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-12-15'),
      },
    });

    // Inscribir algunos estudiantes
    const randomStudents = students.sort(() => Math.random() - 0.5).slice(0, Math.min(w.capacity, 5 + Math.floor(Math.random() * 10)));
    for (const { student } of randomStudents) {
      await prisma.workshopEnrollment.create({
        data: {
          workshopId: workshop.id,
          studentId: student.id,
        },
      });
    }
  }

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ SEED COMPLETADO CON ÉXITO');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📊 Estadísticas:`);
  console.log(`   - Escuelas: ${await prisma.school.count()}`);
  console.log(`   - Usuarios: ${await prisma.user.count()}`);
  console.log(`   - Estudiantes: ${await prisma.student.count()}`);
  console.log(`   - Profesores: ${await prisma.teacher.count()}`);
  console.log(`   - Padres: ${await prisma.parent.count()}`);
  console.log(`   - Niveles: ${await prisma.level.count()}`);
  console.log(`   - Grados: ${await prisma.gradeLevel.count()}`);
  console.log(`   - Secciones: ${await prisma.section.count()}`);
  console.log(`   - Aulas: ${await prisma.classroom.count()}`);
  console.log(`   - Materias: ${await prisma.subject.count()}`);
  console.log(`   - Cursos: ${await prisma.course.count()}`);
  console.log(`   - Horarios: ${await prisma.schedule.count()}`);
  console.log(`   - Matrículas: ${await prisma.enrollment.count()}`);
  console.log(`   - Unidades Curriculares: ${await prisma.curriculumUnit.count()}`);
  console.log(`   - Temas Curriculares: ${await prisma.curriculumTopic.count()}`);
  console.log(`   - Tareas: ${await prisma.task.count()}`);
  console.log(`   - Notas: ${await prisma.grade.count()}`);
  console.log(`   - Asistencias: ${await prisma.attendance.count()}`);
  console.log(`   - Pagos: ${await prisma.payment.count()}`);
  console.log(`   - Talleres: ${await prisma.workshop.count()}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n🔐 Credenciales de prueba (password: Admin123!):');
  console.log('   Admin: admin@school.com');
  console.log('   Profesor: profesor1@school.com hasta profesor12@school.com');
  console.log('   Estudiante: estudiante1@school.com hasta estudiante60@school.com');
  console.log('   Padre: padre1@school.com, madre1@school.com, etc.');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
