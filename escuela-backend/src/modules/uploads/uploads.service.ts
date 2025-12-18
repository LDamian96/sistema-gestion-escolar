import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUploadDto, QueryUploadsDto } from './dto';
import { Prisma } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  private readonly uploadDir = 'uploads';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(dto: CreateUploadDto, uploadedById: string) {
    return this.prisma.upload.create({
      data: {
        fileName: dto.fileName,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        size: dto.size,
        url: dto.url,
        path: dto.path,
        uploadedById,
        schoolId: dto.schoolId,
      },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async findAll(query: QueryUploadsDto) {
    const { schoolId, uploadedById, mimeType, page = 1, limit = 20 } = query;

    const where: Prisma.UploadWhereInput = {
      ...(schoolId && { schoolId }),
      ...(uploadedById && { uploadedById }),
      ...(mimeType && { mimeType: { contains: mimeType } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        include: {
          uploadedBy: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        school: {
          select: { name: true },
        },
      },
    });

    if (!upload) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return upload;
  }

  async remove(id: string) {
    const upload = await this.findOne(id);

    const filePath = path.join(process.cwd(), upload.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.upload.delete({ where: { id } });

    return { message: 'Archivo eliminado' };
  }

  async getStorageStats(schoolId: string) {
    const uploads = await this.prisma.upload.findMany({
      where: { schoolId },
      select: { size: true, mimeType: true },
    });

    const totalSize = uploads.reduce((sum, u) => sum + u.size, 0);
    const byType = uploads.reduce(
      (acc, u) => {
        const type = u.mimeType.split('/')[0];
        acc[type] = (acc[type] || 0) + u.size;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalFiles: uploads.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      byType: Object.entries(byType).map(([type, size]) => ({
        type,
        size,
        sizeMB: (size / (1024 * 1024)).toFixed(2),
      })),
    };
  }

  async handleFileUpload(
    file: any,
    uploadedById: string,
    schoolId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningun archivo');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo excede el tamano maximo de ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return this.create(
      {
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${fileName}`,
        path: filePath,
        schoolId,
      },
      uploadedById,
    );
  }
}
