import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const user = await this.validateToken(client);

      if (!user) {
        throw new WsException('No autorizado');
      }

      // Adjuntar usuario al socket para uso posterior
      client.data.user = user;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token invalido';
      throw new WsException('No autorizado: ' + message);
    }
  }

  async validateToken(client: Socket): Promise<JwtPayload | null> {
    const token = this.extractToken(client);

    if (!token) {
      return null;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Verificar que el usuario existe y está activo
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          isActive: true,
          deletedAt: true,
        },
      });

      if (!user || !user.isActive || user.deletedAt) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private extractToken(client: Socket): string | null {
    // 1. Intentar extraer de cookies (handshake)
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const accessTokenCookie = cookies
        .split(';')
        .find((c) => c.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        return accessTokenCookie.split('=')[1];
      }
    }

    // 2. Intentar extraer de auth query param (para mobile/testing)
    const authQuery = client.handshake.query.token;
    if (authQuery && typeof authQuery === 'string') {
      return authQuery;
    }

    // 3. Intentar extraer de auth header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 4. Intentar extraer de auth en handshake
    const authHandshake = client.handshake.auth?.token;
    if (authHandshake) {
      return authHandshake;
    }

    return null;
  }
}
