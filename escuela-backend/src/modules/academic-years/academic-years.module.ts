import { Module } from '@nestjs/common';
import { AcademicYearsController } from './academic-years.controller';
import { AcademicYearsService } from './academic-years.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService, PrismaService],
  exports: [AcademicYearsService],
})
export class AcademicYearsModule {}
