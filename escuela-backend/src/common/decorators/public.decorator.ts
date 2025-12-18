import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 * @example
 * @Public()
 * @Post('login')
 * async login() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
