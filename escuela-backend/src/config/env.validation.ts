import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync, IsEnum, Min, Max } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsNumber()
  @Min(10)
  @Max(15)
  BCRYPT_ROUNDS: number = 12;

  @IsNumber()
  @Min(1)
  MAX_LOGIN_ATTEMPTS: number = 5;

  @IsNumber()
  @Min(1)
  LOCKOUT_DURATION_MINUTES: number = 15;

  @IsString()
  @IsOptional()
  COOKIE_SECRET?: string;

  @IsNumber()
  THROTTLE_TTL: number = 60000;

  @IsNumber()
  THROTTLE_LIMIT: number = 60;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsString()
  @IsOptional()
  MERCADOPAGO_ACCESS_TOKEN?: string;

  @IsString()
  @IsOptional()
  MERCADOPAGO_PUBLIC_KEY?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;
}

export function envValidation(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = error.constraints ? Object.values(error.constraints).join(', ') : '';
      return `${error.property}: ${constraints}`;
    });
    throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
  }

  return validatedConfig;
}
