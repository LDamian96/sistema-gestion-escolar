import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis conectado');
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Redis error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('🔌 Redis desconectado');
  }

  getClient(): Redis {
    return this.client;
  }

  // ============================================
  // Métodos de cache
  // ============================================

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // ============================================
  // Rate Limiting para login
  // ============================================

  async incrementLoginAttempts(email: string): Promise<number> {
    const key = `login_attempts:${email}`;
    const attempts = await this.client.incr(key);
    if (attempts === 1) {
      // Expira en 15 minutos
      await this.client.expire(key, 15 * 60);
    }
    return attempts;
  }

  async getLoginAttempts(email: string): Promise<number> {
    const key = `login_attempts:${email}`;
    const attempts = await this.client.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  async clearLoginAttempts(email: string): Promise<void> {
    await this.client.del(`login_attempts:${email}`);
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const key = `account_locked:${email}`;
    return (await this.client.exists(key)) === 1;
  }

  async lockAccount(email: string, minutes: number): Promise<void> {
    const key = `account_locked:${email}`;
    await this.client.setex(key, minutes * 60, '1');
  }

  // ============================================
  // Refresh Tokens (blacklist)
  // ============================================

  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(`blacklist:${token}`, ttlSeconds, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return (await this.client.exists(`blacklist:${token}`)) === 1;
  }

  // ============================================
  // Sessions
  // ============================================

  async setSession(userId: string, sessionData: unknown, ttlSeconds: number): Promise<void> {
    await this.set(`session:${userId}`, sessionData, ttlSeconds);
  }

  async getSession<T>(userId: string): Promise<T | null> {
    return this.get<T>(`session:${userId}`);
  }

  async deleteSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`);
  }

  // ============================================
  // Cache general
  // ============================================

  async cacheQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }
    const result = await queryFn();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  async invalidateCache(pattern: string): Promise<void> {
    await this.delByPattern(pattern);
  }

  // ============================================
  // Hash operations (para WebSocket tracking)
  // ============================================

  async hSet(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hExists(key: string, field: string): Promise<boolean> {
    return (await this.client.hexists(key, field)) === 1;
  }
}
