const { PrismaClient } = require('./generated/prisma');
const http = require('http');
const prisma = new PrismaClient();

async function testApi() {
  // Login
  const loginData = JSON.stringify({ email: 'admin@school.com', password: 'Admin123!' });

  const loginRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      const cookies = res.headers['set-cookie'];
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data: JSON.parse(data), cookies }));
    });
    req.write(loginData);
    req.end();
  });

  const accessToken = loginRes.cookies?.find(c => c.startsWith('access_token='))?.split(';')[0]?.split('=')[1];

  // Get tasks
  const tasksRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/api/tasks',
      method: 'GET',
      headers: { Cookie: 'access_token=' + accessToken }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.end();
  });

  console.log('=== API TEST ===');
  if (Array.isArray(tasksRes) && tasksRes.length > 0) {
    console.log('Total tasks from API:', tasksRes.length);
    const hasClassroom = tasksRes[0].course && tasksRes[0].course.classroom;
    console.log('First task has classroom:', hasClassroom);
    if (hasClassroom) {
      console.log('Classroom:', tasksRes[0].course.classroom.name);
      const level = tasksRes[0].course.classroom.section?.gradeLevel?.level?.name;
      console.log('Level:', level);
    }

    // Count by level
    const byLevel = {};
    tasksRes.forEach(t => {
      const level = t.course?.classroom?.section?.gradeLevel?.level?.name || 'Sin nivel';
      byLevel[level] = (byLevel[level] || 0) + 1;
    });
    console.log('\nAPI Tasks by level:');
    Object.keys(byLevel).sort().forEach(l => console.log('  ' + l + ':', byLevel[l]));
  } else {
    console.log('Error or empty response:', JSON.stringify(tasksRes).substring(0, 200));
  }
}

async function check() {
  await testApi().catch(e => console.log('API Error:', e.message));

  // First get the actual school ID
  const schools = await prisma.school.findMany();
  console.log('=== SCHOOLS ===');
  schools.forEach(s => console.log(`  ${s.name}: ${s.id}`));

  const levelsWithSchool = await prisma.level.findMany({ include: { school: true } });
  console.log('\n=== LEVELS WITH SCHOOL ===');
  levelsWithSchool.forEach(l => console.log(`  ${l.name} -> School: ${l.school.name} (${l.schoolId})`));

  // Get the correct schoolId
  const schoolId = schools.length > 0 ? schools[0].id : '337c4a93-c6e2-44e2-aea7-db5e1b7413ce';

  const coursesAsService = await prisma.course.findMany({
    where: {
      classroom: {
        section: {
          gradeLevel: {
            level: { schoolId },
          },
        },
      },
    },
    take: 3,
    include: {
      subject: true,
      teacher: { select: { firstName: true, lastName: true } },
      classroom: {
        include: {
          section: {
            include: {
              gradeLevel: { include: { level: true } },
            },
          },
        },
      },
      schedules: true,
      _count: {
        select: {
          attendances: true,
          tasks: true,
          grades: true,
        },
      },
    },
  });

  console.log('=== COURSES AS SERVICE (schoolId filtered) ===');
  console.log('Courses found:', coursesAsService.length);
  if (coursesAsService.length > 0) {
    console.log('\nFirst course structure:');
    console.log(JSON.stringify(coursesAsService[0], null, 2));
  }

  // Extract levels
  const levels = coursesAsService.map(c => c.classroom?.section?.gradeLevel?.level?.name).filter(Boolean);
  console.log('\nLevels extracted:', [...new Set(levels)]);

  // Check tasks with courses
  const tasks = await prisma.task.findMany({
    take: 5,
    include: {
      course: {
        include: {
          subject: true,
          teacher: true,
          classroom: {
            include: {
              section: {
                include: {
                  gradeLevel: {
                    include: { level: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('=== TASKS ===');
  console.log('Tasks found:', tasks.length);
  tasks.forEach((t, i) => {
    console.log(`\nTask ${i+1}: ${t.title} (${t.type})`);
    console.log('  Course ID:', t.course?.id || 'NO COURSE');
    console.log('  Subject:', t.course?.subject?.name || 'NO SUBJECT');
    console.log('  Classroom:', t.course?.classroom?.name || 'NO CLASSROOM');
    console.log('  Section:', t.course?.classroom?.section?.name || 'NO SECTION');
    console.log('  GradeLevel:', t.course?.classroom?.section?.gradeLevel?.name || 'NO GRADELEVEL');
    console.log('  Level:', t.course?.classroom?.section?.gradeLevel?.level?.name || 'NO LEVEL');
  });

  // Check courses
  const courses = await prisma.course.findMany({
    take: 5,
    include: {
      subject: true,
      teacher: true,
      classroom: {
        include: {
          section: {
            include: {
              gradeLevel: {
                include: { level: true }
              }
            }
          }
        }
      }
    }
  });

  console.log('\n=== COURSES ===');
  console.log('Courses found:', courses.length);
  courses.forEach((c, i) => {
    console.log(`\nCourse ${i+1}:`);
    console.log('  Subject:', c.subject?.name || 'NO SUBJECT');
    console.log('  Teacher:', c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'NO TEACHER');
    console.log('  Classroom:', c.classroom?.name || 'NO CLASSROOM');
    console.log('  Section:', c.classroom?.section?.name || 'NO SECTION');
    console.log('  GradeLevel:', c.classroom?.section?.gradeLevel?.name || 'NO GRADELEVEL');
    console.log('  Level:', c.classroom?.section?.gradeLevel?.level?.name || 'NO LEVEL');
  });

  // Check all levels
  const allLevels = await prisma.level.findMany();
  console.log('\n=== ALL LEVELS ===');
  console.log('Levels:', allLevels.map(l => l.name).join(', '));

  // Count courses by level
  const allCourses = await prisma.course.findMany({
    include: {
      classroom: {
        include: {
          section: {
            include: {
              gradeLevel: { include: { level: true } }
            }
          }
        }
      }
    }
  });

  const byLevel = {};
  allCourses.forEach(c => {
    const level = c.classroom?.section?.gradeLevel?.level?.name || 'Sin nivel';
    byLevel[level] = (byLevel[level] || 0) + 1;
  });

  console.log('\n=== COURSES BY LEVEL ===');
  Object.keys(byLevel).forEach(l => console.log('  ' + l + ':', byLevel[l]));
  console.log('Total courses:', allCourses.length);

  await prisma.$disconnect();
}

check().catch(e => { console.error(e); process.exit(1); });
