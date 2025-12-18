import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { Server, ServerOptions } from 'socket.io';

// Custom Redis Adapter para Socket.IO
class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis(redisUrl: string): Promise<void> {
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
    });

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Configuración de seguridad
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Prefijo global de API (sin versión, se maneja con versionamiento)
  app.setGlobalPrefix('api');

  // Versionamiento de API
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Error si envían propiedades extra
      transform: true, // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Swagger/OpenAPI Documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sistema de Gestión Escolar API')
      .setDescription(
        `
        API REST para el Sistema de Gestión Escolar.

        ## Autenticación
        La API utiliza JWT almacenado en HTTP-Only cookies.

        ## Rate Limiting
        - 60 requests por minuto por IP
        - 5 intentos de login antes de bloqueo temporal

        ## Roles
        - ADMIN: Acceso completo
        - TEACHER: Gestión de cursos, tareas, exámenes
        - STUDENT: Ver tareas, entregar trabajos
        - PARENT: Ver calificaciones de hijos
      `,
      )
      .setVersion('1.0.0')
      .addTag('Auth', 'Autenticación y autorización')
      .addTag('Users', 'Gestión de usuarios')
      .addTag('Students', 'Gestión de estudiantes')
      .addTag('Teachers', 'Gestión de profesores')
      .addTag('Courses', 'Gestión de cursos')
      .addTag('Tasks', 'Gestión de tareas')
      .addTag('Exams', 'Gestión de exámenes')
      .addTag('Grades', 'Gestión de calificaciones')
      .addTag('Attendance', 'Control de asistencia')
      .addTag('Payments', 'Gestión de pagos')
      .addTag('Notifications', 'Sistema de notificaciones')
      .addCookieAuth('accessToken')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    logger.log(`📚 Swagger disponible en: http://localhost:${configService.get('PORT')}/docs`);
  }

  // Configurar WebSocket con Redis Adapter
  const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
  const redisIoAdapter = new RedisIoAdapter(app);

  try {
    await redisIoAdapter.connectToRedis(redisUrl);
    app.useWebSocketAdapter(redisIoAdapter);
    logger.log('🔌 WebSocket Redis Adapter conectado');
  } catch (error) {
    logger.warn('⚠️ Redis Adapter no disponible, usando adapter local para WebSocket');
  }

  // Iniciar servidor
  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);

  logger.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
  logger.log(`📡 API Prefix: /api/v1`);
  logger.log(`🔌 WebSocket: /chat y /notifications`);
  logger.log(`🌍 Entorno: ${configService.get('NODE_ENV')}`);
}

bootstrap();
