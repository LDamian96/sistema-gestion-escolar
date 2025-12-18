import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorador para restringir acceso por roles
 * @example
 * @Roles(Role.ADMIN, Role.TEACHER)
 * @Get('admin-only')
 * async adminRoute() {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
