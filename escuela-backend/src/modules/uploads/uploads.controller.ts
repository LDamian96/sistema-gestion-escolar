import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CreateUploadDto, QueryUploadsDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Uploads')
@ApiCookieAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Registrar archivo subido' })
  @ApiResponse({ status: 201, description: 'Archivo registrado' })
  async create(
    @Body() dto: CreateUploadDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.uploadsService.create(dto, userId);
  }

  @Post('file')
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        schoolId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('schoolId') schoolId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.uploadsService.handleFileUpload(file, userId, schoolId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar archivos' })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  async findAll(@Query() query: QueryUploadsDto) {
    return this.uploadsService.findAll(query);
  }

  @Get('stats/:schoolId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de almacenamiento' })
  @ApiParam({ name: 'schoolId', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  async getStorageStats(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.uploadsService.getStorageStats(schoolId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener archivo por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo' })
  @ApiResponse({ status: 200, description: 'Archivo encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadsService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar archivo' })
  @ApiParam({ name: 'id', description: 'ID del archivo' })
  @ApiResponse({ status: 200, description: 'Archivo eliminado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadsService.remove(id);
  }
}
