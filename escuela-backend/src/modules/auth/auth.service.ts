import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { LoginDto, ChangePasswordDto } from './dto';
import { JwtPayload, TokenPair } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  /**
   * Login de usuario
   */
  async login(dto: LoginDto): Promise<{ user: JwtPayload; tokens: TokenPair }> {
    const { email, password } = dto;

    // Verificar si la cuenta está bloqueada
    const isLocked = await this.redisService.isAccountLocked(email);
    if (isLocked) {
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente. Intente nuevamente en 15 minutos.',
      );
    }

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        schoolId: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user) {
      await this.handleFailedLogin(email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Limpiar intentos fallidos
    await this.redisService.clearLoginAttempts(email);

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generar tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const tokens = await this.generateTokens(payload);

    this.logger.log(`Usuario ${email} inició sesión exitosamente`);

    return { user: payload, tokens };
  }

  /**
   * Cerrar sesión
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    // Invalidar refresh token si existe
    if (refreshToken) {
      const ttl = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
      const ttlSeconds = this.parseTtlToSeconds(ttl);
      await this.redisService.blacklistToken(refreshToken, ttlSeconds);
    }

    // Eliminar sesión
    await this.redisService.deleteSession(userId);

    this.logger.log(`Usuario ${userId} cerró sesión`);
  }

  /**
   * Refrescar tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verificar si el token está en blacklist
      const isBlacklisted = await this.redisService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verificar usuario
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          schoolId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no autorizado');
      }

      // Invalidar refresh token actual (rotation)
      const ttl = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
      const ttlSeconds = this.parseTtlToSeconds(ttl);
      await this.redisService.blacklistToken(refreshToken, ttlSeconds);

      // Generar nuevos tokens
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      return this.generateTokens(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Hash nueva contraseña
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') || 12;
    const hashedPassword = await bcrypt.hash(newPassword, rounds);

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    this.logger.log(`Usuario ${userId} cambió su contraseña`);
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        schoolId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  // ============================================
  // Métodos privados
  // ============================================

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(email: string): Promise<void> {
    const attempts = await this.redisService.incrementLoginAttempts(email);
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;

    if (attempts >= maxAttempts) {
      const lockoutMinutes = this.configService.get<number>('LOCKOUT_DURATION_MINUTES') || 15;
      await this.redisService.lockAccount(email, lockoutMinutes);
      this.logger.warn(`Cuenta ${email} bloqueada por exceder intentos de login`);
    }
  }

  private parseTtlToSeconds(ttl: string): number {
    const unit = ttl.slice(-1);
    const value = parseInt(ttl.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 86400; // Default 1 día
    }
  }
}
