import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaModule } from '../../database/prisma.module';
import { RedisModule } from '../../database/redis.module';
import { WsJwtGuard } from '../../common/guards/ws-auth.guard';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, WsJwtGuard],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
