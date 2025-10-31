// ============================================================
// src/modules/exchanges/controllers/exchanges.controller.ts
// ============================================================
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExchangesService } from '../services/exchanges.service';
import {
  CreateExchangeRequestDto,
  RespondToRequestDto,
  QueryExchangeRequestsDto,
  QueryExchangesDto,
  ExchangeRequestResponseDto,
  ExchangeResponseDto,
  ExchangeStatsResponseDto,
  PaginatedExchangesDto,
  PaginatedExchangeRequestsDto,
} from '../dto/exchange.dto';

@ApiTags('Exchanges')
@Controller('exchanges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  // ==================== EXCHANGE REQUESTS ====================

  @Post('requests')
  @ApiOperation({ summary: 'Create a new exchange request' })
  @ApiResponse({
    status: 201,
    description: 'Exchange request created successfully',
    type: ExchangeRequestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid books or duplicate request' })
  @ApiResponse({ status: 404, description: 'Receiver not found' })
  async createRequest(
    @Request() req,
    @Body() dto: CreateExchangeRequestDto,
  ): Promise<ExchangeRequestResponseDto> {
    return this.exchangesService.createExchangeRequest(req.user.userId, dto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get my exchange requests (sent or received)' })
  @ApiResponse({
    status: 200,
    description: 'List of exchange requests',
    type: PaginatedExchangeRequestsDto,
  })
  async getMyRequests(
    @Request() req,
    @Query() query: QueryExchangeRequestsDto,
  ): Promise<PaginatedExchangeRequestsDto> {
    return this.exchangesService.getMyRequests(req.user.userId, query);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get exchange request details' })
  @ApiParam({ name: 'id', description: 'Exchange request ID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange request details',
    type: ExchangeRequestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getRequestById(
    @Param('id') id: string,
  ): Promise<ExchangeRequestResponseDto> {
    return this.exchangesService.getRequestById(id);
  }

  @Patch('requests/:id/respond')
  @ApiOperation({ summary: 'Accept or reject an exchange request' })
  @ApiParam({ name: 'id', description: 'Exchange request ID' })
  @ApiResponse({
    status: 200,
    description: 'Request responded to successfully',
    type: ExchangeRequestResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Not authorized to respond' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async respondToRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RespondToRequestDto,
  ): Promise<ExchangeRequestResponseDto> {
    return this.exchangesService.respondToRequest(req.user.userId, id, dto);
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending exchange request (requester only)' })
  @ApiParam({ name: 'id', description: 'Exchange request ID' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async cancelRequest(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.exchangesService.cancelRequest(req.user.userId, id);
  }

  // ==================== ACTIVE EXCHANGES ====================

  @Get()
  @ApiOperation({ summary: 'Get my active and completed exchanges' })
  @ApiResponse({
    status: 200,
    description: 'List of exchanges',
    type: PaginatedExchangesDto,
  })
  async getMyExchanges(
    @Request() req,
    @Query() query: QueryExchangesDto,
  ): Promise<PaginatedExchangesDto> {
    return this.exchangesService.getMyExchanges(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exchange details' })
  @ApiParam({ name: 'id', description: 'Exchange ID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange details',
    type: ExchangeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async getExchangeById(
    @Param('id') id: string,
  ): Promise<ExchangeResponseDto> {
    return this.exchangesService.getExchangeById(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm exchange completion' })
  @ApiParam({ name: 'id', description: 'Exchange ID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange confirmed successfully',
    type: ExchangeResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async confirmExchange(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ExchangeResponseDto> {
    return this.exchangesService.confirmExchange(req.user.userId, id);
  }

  // ==================== STATISTICS ====================

  @Get('stats/me')
  @ApiOperation({ summary: 'Get my exchange statistics' })
  @ApiResponse({
    status: 200,
    description: 'Exchange statistics',
    type: ExchangeStatsResponseDto,
  })
  async getMyStats(
    @Request() req,
  ): Promise<ExchangeStatsResponseDto> {
    return this.exchangesService.getExchangeStats(req.user.userId);
  }
}