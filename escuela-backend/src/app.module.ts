import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Config
import { envValidation } from './config/env.validation';

// Database
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './database/redis.module';

// Common
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Módulos de la aplicación
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { GradeSectionsModule } from './modules/grade-sections/grade-sections.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ParentsModule } from './modules/parents/parents.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ExamsModule } from './modules/exams/exams.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GradesModule } from './modules/grades/grades.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { MessagesModule } from './modules/messages/messages.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    // Configuración global con validación
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: envValidation,
      cache: true,
    }),

    // Rate Limiting global
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') || 60000,
          limit: config.get<number>('THROTTLE_LIMIT') || 60,
        },
      ],
    }),

    // Base de datos
    PrismaModule,
    RedisModule,

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    SchoolsModule,
    AcademicYearsModule,
    GradeSectionsModule,
    SubjectsModule,
    StudentsModule,
    TeachersModule,
    ParentsModule,
    CoursesModule,
    EnrollmentsModule,
    TasksModule,
    ExamsModule,
    AttendanceModule,
    GradesModule,
    SchedulesModule,
    PaymentsModule,
    NotificationsModule,
    AuditLogsModule,
    CurriculumModule,
    MessagesModule,
    UploadsModule,
    GroupsModule,
  ],
  controllers: [],
  providers: [
    // Guard global de rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Guard global de autenticación JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard global de roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Interceptor de logging
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Interceptor de transformación de respuestas
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Filtro global de excepciones
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
