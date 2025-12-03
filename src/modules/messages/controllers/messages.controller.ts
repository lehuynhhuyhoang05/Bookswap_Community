// src/modules/messages/controllers/messages.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MessagesService } from '../services/messages.service';
import { MessagesGateway } from '../gateways/messages/messages.gateway';
import { SendMessageDto } from '../dto/send-message.dto';
import { SearchMessagesDto } from '../dto/search-messages.dto';
import { AddReactionDto } from '../dto/reaction.dto';
import { CreateDirectConversationDto } from '../dto/create-direct-conversation.dto';
import { UploadAttachmentDto } from '../dto/upload-attachment.dto';
import { StorageService } from '../../../common/services/storage.service';

@ApiTags('Messages')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly storageService: StorageService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getMyConversations(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.messagesService.getMyConversations(req.user.userId, page, limit);
  }

  @Post('conversations/direct')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create or get direct conversation with another user',
    description: 'Create a new conversation directly with another user (không cần exchange request). If conversation exists, return existing one.'
  })
  @ApiResponse({ status: 201, description: 'Conversation created or retrieved' })
  @ApiResponse({ status: 400, description: 'Cannot chat with yourself' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createDirectConversation(
    @Request() req,
    @Body() dto: CreateDirectConversationDto,
  ) {
    return this.messagesService.createDirectConversation(req.user.userId, dto.receiver_user_id);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.messagesService.getMessages(req.user.userId, conversationId, page, limit);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Conversation or request not found' })
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    const result = await this.messagesService.sendMessage(req.user.userId, dto);
    
    // Emit real-time message to receiver via WebSocket
    const receiverId = result.message.receiver.member_id;
    this.messagesGateway.emitNewMessage(receiverId, result);
    
    // If message was delivered (receiver online), emit status update to sender
    if (result.message.status === 'delivered') {
      this.messagesGateway.emitMessageDelivered(
        receiverId,
        result.message.message_id,
        result.message.sender.member_id
      );
    }
    
    return result;
  }

  @Patch('conversations/:conversationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all messages in conversation as read' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markConversationAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markConversationAsRead(req.user.userId, conversationId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.userId);
  }

  // ==================== MESSAGE SEARCH ====================

  @Get('search')
  @ApiOperation({
    summary: 'Search messages in a conversation',
    description: 'Full-text search for messages within a specific conversation',
  })
  @ApiQuery({ name: 'q', required: true, example: 'book' })
  @ApiQuery({ name: 'conversation_id', required: true })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Search results with pagination' })
  @ApiResponse({ status: 400, description: 'Invalid search query' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async searchMessages(@Request() req, @Query() query: SearchMessagesDto) {
    return this.messagesService.searchMessages(req.user.userId, query);
  }

  // ==================== MESSAGE DELETION ====================

  @Delete(':messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a message',
    description: 'Soft delete your own message (only within 1 hour of sending)',
  })
  @ApiParam({ name: 'messageId', description: 'Message ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete message' })
  @ApiResponse({ status: 403, description: 'Can only delete your own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Request() req,
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
  ) {
    return this.messagesService.deleteMessage(req.user.userId, messageId);
  }

  // ==================== MESSAGE REACTIONS ====================

  @Post(':messageId/reactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add emoji reaction to a message',
    description: 'Add emoji reaction. Can toggle by sending same emoji again',
  })
  @ApiParam({ name: 'messageId', description: 'Message ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Reaction added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid emoji or deleted message' })
  @ApiResponse({ status: 403, description: 'No access to conversation' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async addReaction(
    @Request() req,
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.messagesService.addReaction(req.user.userId, messageId, dto);
  }

  @Delete(':messageId/reactions/:reactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove emoji reaction from a message',
    description: 'Remove your own emoji reaction from a message',
  })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiParam({ name: 'reactionId', description: 'Reaction ID' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  @ApiResponse({ status: 403, description: 'Can only remove your own reactions' })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  async removeReaction(
    @Request() req,
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Param('reactionId', new ParseUUIDPipe()) reactionId: string,
  ) {
    return this.messagesService.removeReaction(req.user.userId, reactionId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload file/image attachment',
    description: 'Upload a file or image to be attached to a message. Max 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (image, PDF, Word, Excel, ZIP)',
        },
        conversation_id: {
          type: 'string',
          format: 'uuid',
          description: 'Optional conversation ID',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: '/uploads/messages/abc123.jpg' },
        file_url: { type: 'string', example: '/uploads/messages/abc123.jpg' },
        file_name: { type: 'string', example: 'my-photo.jpg' },
        file_size: { type: 'number', example: 1024000 },
        mime_type: { type: 'string', example: 'image/jpeg' },
        attachment_type: { type: 'string', enum: ['image', 'file'] },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 413, description: 'File size exceeds limit (10MB)' })
  async uploadAttachment(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file to storage
    const fileUrl = await this.storageService.uploadFile(file);
    const fileType = this.storageService.getFileType(file.mimetype);

    return {
      url: fileUrl,
      file_url: fileUrl,
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      attachment_type: fileType,
    };
  }
}