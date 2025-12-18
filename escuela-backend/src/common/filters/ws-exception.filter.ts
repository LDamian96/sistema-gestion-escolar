import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    const error = this.getError(exception);

    client.emit('error', {
      success: false,
      error: {
        message: error.message || 'Error interno del servidor',
        type: error.type || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      },
    });
  }

  private getError(exception: unknown): { message: string; type: string } {
    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        return { message: error, type: 'WS_EXCEPTION' };
      }
      if (typeof error === 'object' && error !== null) {
        return {
          message: (error as any).message || 'Error de WebSocket',
          type: (error as any).type || 'WS_EXCEPTION',
        };
      }
    }

    if (exception instanceof HttpException) {
      return {
        message: exception.message,
        type: 'HTTP_EXCEPTION',
      };
    }

    if (exception instanceof Error) {
      return {
        message: exception.message,
        type: 'ERROR',
      };
    }

    return {
      message: 'Error desconocido',
      type: 'UNKNOWN_ERROR',
    };
  }
}
