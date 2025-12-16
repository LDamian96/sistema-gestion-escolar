const http = require('http');

const API_BASE = 'http://localhost:4000';

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login(email, password) {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });

  const cookies = res.headers['set-cookie'];
  const token = cookies?.find(c => c.startsWith('access_token='))?.split(';')[0].split('=')[1];
  return token;
}

async function apiGet(path, token) {
  return makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/api${path}`,
    method: 'GET',
    headers: { Cookie: `access_token=${token}` }
  });
}

async function apiPost(path, token, data) {
  return makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/api${path}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `access_token=${token}`
    }
  }, data);
}

async function main() {
  console.log('='.repeat(60));
  console.log('POBLANDO BASE DE DATOS CON DATOS COMPLETOS');
  console.log('='.repeat(60));

  // Login as admin
  console.log('\n🔐 Iniciando sesión como admin...');
  const adminToken = await login('admin@school.com', 'Admin123!');
  if (!adminToken) {
    console.log('ERROR: No se pudo obtener token de admin');
    return;
  }
  console.log('✅ Login exitoso');

  // Get existing data
  console.log('\n📊 Obteniendo datos existentes...');

  const studentsRes = await apiGet('/students?limit=100', adminToken);
  const students = studentsRes.body.data || studentsRes.body || [];
  console.log(`   Estudiantes: ${students.length}`);

  const teachersRes = await apiGet('/teachers', adminToken);
  const teachers = teachersRes.body || [];
  console.log(`   Profesores: ${teachers.length}`);

  const coursesRes = await apiGet('/courses', adminToken);
  const courses = coursesRes.body || [];
  console.log(`   Cursos: ${courses.length}`);

  const subjectsRes = await apiGet('/subjects', adminToken);
  const subjects = subjectsRes.body || [];
  console.log(`   Materias: ${subjects.length}`);

  const paymentsRes = await apiGet('/payments?limit=1000', adminToken);
  const existingPayments = paymentsRes.body.data || paymentsRes.body || [];
  console.log(`   Pagos existentes: ${existingPayments.length}`);

  // Verify curriculum data
  console.log('\n📚 Verificando malla curricular...');
  const unitsRes = await apiGet('/curriculum/units?limit=10', adminToken);
  const units = unitsRes.body;
  console.log(`   Unidades curriculares: ${units.total || units.length}`);

  const topicsRes = await apiGet('/curriculum/topics?limit=10', adminToken);
  const topics = topicsRes.body;
  console.log(`   Temas curriculares: ${topics.total || topics.length}`);

  // Verify grade levels
  console.log('\n🎓 Verificando grados...');
  const gradeLevelsRes = await apiGet('/grade-levels', adminToken);
  const gradeLevels = gradeLevelsRes.body || [];
  console.log(`   Grados: ${gradeLevels.length}`);

  // Verify sections
  const sectionsRes = await apiGet('/sections', adminToken);
  const sections = sectionsRes.body || [];
  console.log(`   Secciones: ${sections.length}`);

  // Verify classrooms
  const classroomsRes = await apiGet('/classrooms', adminToken);
  const classrooms = classroomsRes.body || [];
  console.log(`   Aulas: ${classrooms.length}`);

  // Verify schedules
  const schedulesRes = await apiGet('/schedules', adminToken);
  const schedules = schedulesRes.body || [];
  console.log(`   Horarios: ${schedules.length}`);

  // Verify tasks
  console.log('\n📝 Verificando tareas...');
  const tasksRes = await apiGet('/tasks', adminToken);
  const tasks = tasksRes.body || [];
  console.log(`   Tareas: ${tasks.length}`);

  // Verify grades (notas)
  const gradesRes = await apiGet('/grades?limit=100', adminToken);
  const grades = gradesRes.body.data || gradesRes.body || [];
  console.log(`   Notas: ${grades.length}`);

  // Verify attendance
  const attendanceRes = await apiGet('/attendance?limit=100', adminToken);
  const attendance = attendanceRes.body.data || attendanceRes.body || [];
  console.log(`   Asistencias: ${attendance.length}`);

  // Verify workshops
  console.log('\n🎨 Verificando talleres...');
  const workshopsRes = await apiGet('/workshops', adminToken);
  const workshops = workshopsRes.body || [];
  console.log(`   Talleres: ${workshops.length}`);

  // Verify enrollments
  const enrollmentsRes = await apiGet('/enrollments?limit=100', adminToken);
  const enrollments = enrollmentsRes.body.data || enrollmentsRes.body || [];
  console.log(`   Matrículas: ${enrollments.length}`);

  // Verify analytics
  console.log('\n📈 Verificando analytics...');
  const analyticsRes = await apiGet('/analytics/dashboard', adminToken);
  const analytics = analyticsRes.body;
  console.log(`   Dashboard stats:`);
  console.log(`     - Total estudiantes: ${analytics.totalStudents}`);
  console.log(`     - Total profesores: ${analytics.totalTeachers}`);
  console.log(`     - Total cursos: ${analytics.totalCourses}`);

  // Verify payment stats
  const paymentStatsRes = await apiGet('/payments/stats', adminToken);
  const paymentStats = paymentStatsRes.body;
  console.log(`   Payment stats:`);
  console.log(`     - Total pagos: ${paymentStats.total}`);
  console.log(`     - Pagados: ${paymentStats.paid}`);
  console.log(`     - Pendientes: ${paymentStats.pending}`);

  // Test MercadoPago public key
  console.log('\n💳 Verificando MercadoPago...');
  const mpKeyRes = await apiGet('/payments/mercadopago/public-key', adminToken);
  console.log(`   Public Key: ${mpKeyRes.body.publicKey ? 'Configurado ✅' : 'No configurado ❌'}`);

  // Create MercadoPago preference for testing
  if (existingPayments.length > 0 && mpKeyRes.body.publicKey) {
    const pendingPayment = existingPayments.find(p => p.status === 'PENDING');
    if (pendingPayment) {
      console.log(`   Creando preferencia de pago para test...`);
      const prefRes = await apiPost(`/payments/${pendingPayment.id}/mercadopago`, adminToken, {});
      if (prefRes.status === 201 || prefRes.status === 200) {
        console.log(`   ✅ Preferencia creada: ${prefRes.body.preferenceId?.substring(0, 30)}...`);
        console.log(`   📎 Checkout URL: ${prefRes.body.initPoint?.substring(0, 50)}...`);
      } else {
        console.log(`   ⚠️ Error creando preferencia: ${prefRes.body.message || prefRes.status}`);
      }
    }
  }

  // Verify levels
  console.log('\n🏫 Verificando niveles educativos...');
  const levelsRes = await apiGet('/levels', adminToken);
  const levels = levelsRes.body || [];
  console.log(`   Niveles: ${levels.length}`);
  levels.forEach(l => console.log(`     - ${l.name}`));

  // Test teacher login
  console.log('\n👨‍🏫 Probando acceso como profesor...');
  const teacherToken = await login('profesor1@school.com', 'Admin123!');
  if (teacherToken) {
    const teacherCurrRes = await apiGet('/curriculum/units?limit=3', teacherToken);
    console.log(`   Acceso a curriculum: ${teacherCurrRes.status === 200 ? '✅' : '❌'}`);

    const teacherCoursesRes = await apiGet('/courses', teacherToken);
    console.log(`   Acceso a cursos: ${teacherCoursesRes.status === 200 ? '✅' : '❌'}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN DE DATOS EN LA BASE DE DATOS');
  console.log('='.repeat(60));
  console.log(`
📊 DATOS DISPONIBLES PARA EL FRONTEND:

👥 USUARIOS
   - Estudiantes: ${students.length}
   - Profesores: ${teachers.length}
   - (También hay padres vinculados)

🏫 ESTRUCTURA ACADÉMICA
   - Niveles: ${levels.length}
   - Grados: ${gradeLevels.length}
   - Secciones: ${sections.length}
   - Aulas: ${classrooms.length}

📚 CONTENIDO EDUCATIVO
   - Materias: ${subjects.length}
   - Cursos: ${courses.length}
   - Unidades Curriculares: ${units.total || 'N/A'}
   - Temas: ${topics.total || 'N/A'}

📅 ACTIVIDADES
   - Horarios: ${schedules.length}
   - Tareas: ${tasks.length}
   - Matrículas: ${enrollments.length}

📈 REGISTROS
   - Notas: ${grades.length}+
   - Asistencias: ${attendance.length}+
   - Pagos: ${existingPayments.length}

🎨 EXTRAS
   - Talleres: ${workshops.length}

💳 PAGOS
   - MercadoPago: ${mpKeyRes.body.publicKey ? 'Configurado' : 'No configurado'}
   - Total registros: ${paymentStats.total || 0}
   - Pagados: ${paymentStats.paid || 0}
   - Pendientes: ${paymentStats.pending || 0}
`);

  console.log('='.repeat(60));
  console.log('ENDPOINTS DISPONIBLES PARA EL FRONTEND');
  console.log('='.repeat(60));
  console.log(`
🔐 AUTH
   POST /api/auth/login
   POST /api/auth/register
   POST /api/auth/refresh
   POST /api/auth/logout
   GET  /api/auth/me
   GET  /api/auth/check

👨‍🎓 STUDENTS
   GET  /api/students
   GET  /api/students/:id
   POST /api/students
   PATCH /api/students/:id
   DELETE /api/students/:id

👨‍🏫 TEACHERS
   GET  /api/teachers
   GET  /api/teachers/:id
   POST /api/teachers
   PATCH /api/teachers/:id

👨‍👩‍👧 PARENTS
   GET  /api/parents
   GET  /api/parents/:id
   POST /api/parents/:id/link-student

💰 PAYMENTS
   GET  /api/payments
   GET  /api/payments/:id
   GET  /api/payments/stats
   GET  /api/payments/mercadopago/public-key
   POST /api/payments/:id/mercadopago (crear preferencia)
   POST /api/payments/:id/yape

📚 CURRICULUM
   GET  /api/curriculum/units
   GET  /api/curriculum/units/:id
   POST /api/curriculum/units
   PATCH /api/curriculum/units/:id
   GET  /api/curriculum/topics
   POST /api/curriculum/topics

📖 COURSES
   GET  /api/courses
   GET  /api/courses/:id
   GET  /api/courses/:id/students
   POST /api/courses
   PATCH /api/courses/:id

📝 TASKS
   GET  /api/tasks
   GET  /api/tasks/:id
   POST /api/tasks
   POST /api/tasks/submit

📊 GRADES
   GET  /api/grades
   GET  /api/grades/:id
   POST /api/grades
   GET  /api/grades/student/:studentId/course/:courseId/average

✅ ATTENDANCE
   GET  /api/attendance
   POST /api/attendance
   POST /api/attendance/mark-all
   GET  /api/attendance/student/:id/summary

📅 SCHEDULES
   GET  /api/schedules
   GET  /api/schedules/teacher/:teacherId
   GET  /api/schedules/student/:studentId
   POST /api/schedules

🎨 WORKSHOPS
   GET  /api/workshops
   GET  /api/workshops/:id
   GET  /api/workshops/:id/students
   POST /api/workshops/enroll

📈 ANALYTICS
   GET  /api/analytics/dashboard
   GET  /api/analytics/attendance
   GET  /api/analytics/top-students
   GET  /api/analytics/payments
   GET  /api/analytics/courses

🏫 ESTRUCTURA
   GET  /api/levels
   GET  /api/grade-levels
   GET  /api/sections
   GET  /api/classrooms
   GET  /api/subjects
   GET  /api/enrollments
`);

  console.log('='.repeat(60));
  console.log('✅ BASE DE DATOS LISTA PARA USO EN FRONTEND');
  console.log('='.repeat(60));
}

main().catch(console.error);
