import { Module } from '@nestjs/common';
import { GradeSectionsController } from './grade-sections.controller';
import { GradeSectionsService } from './grade-sections.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [GradeSectionsController],
  providers: [GradeSectionsService, PrismaService],
  exports: [GradeSectionsService],
})
export class GradeSectionsModule {}
