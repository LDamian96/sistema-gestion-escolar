import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import {
  CreateConversationDto,
  CreateMessageDto,
  QueryConversationsDto,
  QueryMessagesDto,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, ParticipantRole } from '@prisma/client';

@ApiTags('Messages')
@ApiCookieAuth()
@Controller('messages')
@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Crear nueva conversacion' })
  @ApiResponse({ status: 201, description: 'Conversacion creada' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('firstName') firstName: string,
    @CurrentUser('lastName') lastName: string,
    @CurrentUser('role') role: Role,
  ) {
    const creatorName = `${firstName} ${lastName}`;
    const creatorRole = role === Role.TEACHER ? ParticipantRole.TEACHER : ParticipantRole.PARENT;
    return this.messagesService.createConversation(dto, userId, creatorName, creatorRole);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones' })
  async getConversations(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Query() query: QueryConversationsDto,
  ) {
    return this.messagesService.getConversations(userId, role, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener conversacion por ID' })
  @ApiParam({ name: 'id', description: 'ID de la conversacion' })
  @ApiResponse({ status: 200, description: 'Conversacion encontrada' })
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.messagesService.getConversation(id, userId, role);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obtener mensajes de una conversacion' })
  @ApiParam({ name: 'id', description: 'ID de la conversacion' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes' })
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Query() query: QueryMessagesDto,
  ) {
    return this.messagesService.getMessages(id, userId, role, query);
  }

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado' })
  async sendMessage(
    @Body() dto: CreateMessageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.messagesService.sendMessage(dto, userId);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Marcar conversacion como leida' })
  @ApiParam({ name: 'id', description: 'ID de la conversacion' })
  @ApiResponse({ status: 200, description: 'Mensajes marcados como leidos' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.messagesService.markAsRead(id, userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener cantidad de mensajes no leidos' })
  @ApiResponse({ status: 200, description: 'Cantidad de no leidos' })
  async getUnreadCount(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.messagesService.getUnreadCount(userId, role);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Eliminar conversacion' })
  @ApiParam({ name: 'id', description: 'ID de la conversacion' })
  @ApiResponse({ status: 200, description: 'Conversacion eliminada' })
  async deleteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.messagesService.deleteConversation(id, userId, role);
  }
}
