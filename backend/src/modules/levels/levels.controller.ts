import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LevelsService } from './levels.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../../generated/prisma';

@ApiTags('Levels')
@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener todos los niveles educativos' })
  @ApiResponse({ status: 200, description: 'Lista de niveles (Inicial, Primaria, Secundaria)' })
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.levelsService.findAll(schoolId);
  }
}
