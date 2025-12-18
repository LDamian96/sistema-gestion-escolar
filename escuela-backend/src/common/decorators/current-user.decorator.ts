import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

/**
 * Decorador para obtener el usuario actual del request
 * @example
 * @Get('me')
 * async getMe(@CurrentUser() user: JwtPayload) {}
 *
 * @Get('my-id')
 * async getMyId(@CurrentUser('sub') userId: string) {}
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
