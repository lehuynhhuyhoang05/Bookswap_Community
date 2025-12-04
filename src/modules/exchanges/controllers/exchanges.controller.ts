// src/modules/exchanges/controllers/exchanges.controller.ts
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
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Logger, // ← THÊM
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExchangesService } from '../services/exchanges.service';
import { MatchingService } from '../services/matching.service';
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
  ExchangeSuggestionsResponseDto,
  ScheduleMeetingDto,
  UpdateMeetingInfoDto,
  CancelExchangeDto,
  ConfirmMeetingDto,
} from '../dto/exchange.dto';

@ApiTags('Exchanges')
@Controller('exchanges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class ExchangesController {
  private readonly logger = new Logger(ExchangesController.name); // ← THÊM LOGGER

  constructor(
    private readonly exchangesService: ExchangesService,
    private readonly matchingService: MatchingService,
  ) {}

  // ==================== EXCHANGE REQUESTS ====================

  @Post('requests')
  @ApiOperation({ summary: 'Create a new exchange request' })
  @ApiResponse({ status: 201, description: 'Exchange request created successfully', type: ExchangeRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid books or duplicate request' })
  @ApiResponse({ status: 404, description: 'Receiver not found' })
  async createRequest(
    @Request() req,
    @Body() dto: CreateExchangeRequestDto,
  ): Promise<ExchangeRequestResponseDto> {
    const startTime = Date.now(); // ← THÊM TIMING
    try {
      this.logger.log(`[createRequest] START userId=${req.user?.userId}`);
      this.logger.debug(`[createRequest] dto=${JSON.stringify(dto)}`);
      
      const result = await this.exchangesService.createExchangeRequest(req.user.userId, dto);
      
      const duration = Date.now() - startTime;
      this.logger.log(`[createRequest] SUCCESS duration=${duration}ms`);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error(`[createRequest] FAILED after ${duration}ms: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get my exchange requests (sent or received)' })
  @ApiResponse({ status: 200, description: 'List of exchange requests', type: PaginatedExchangeRequestsDto })
  async getMyRequests(
    @Request() req,
    @Query() query: QueryExchangeRequestsDto,
  ): Promise<PaginatedExchangeRequestsDto> {
    this.logger.log(`[getMyRequests] userId=${req.user?.userId} query=${JSON.stringify(query)}`);
    return this.exchangesService.getMyRequests(req.user.userId, query);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get exchange request details' })
  @ApiParam({ name: 'id', description: 'Exchange request ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Exchange request details', type: ExchangeRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getRequestById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ExchangeRequestResponseDto> {
    this.logger.log(`[getRequestById] id=${id}`);
    return this.exchangesService.getRequestById(id);
  }

  @Patch('requests/:id/respond')
  @ApiOperation({ summary: 'Accept or reject an exchange request' })
  @ApiParam({ name: 'id', description: 'Exchange request ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Request responded to successfully', type: ExchangeRequestResponseDto })
  @ApiResponse({ status: 403, description: 'Not authorized to respond' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async respondToRequest(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RespondToRequestDto,
  ): Promise<ExchangeRequestResponseDto> {
    this.logger.log(`[respondToRequest] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.respondToRequest(req.user.userId, id, dto);
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending exchange request (requester only)' })
  @ApiParam({ name: 'id', description: 'Exchange request ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async cancelRequest(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`[cancelRequest] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.cancelRequest(req.user.userId, id);
  }

  // ==================== STATISTICS ====================

  @Get('stats/me')
  @ApiOperation({ summary: 'Get my exchange statistics' })
  @ApiResponse({ status: 200, description: 'Exchange statistics', type: ExchangeStatsResponseDto })
  async getMyStats(@Request() req): Promise<ExchangeStatsResponseDto> {
    this.logger.log(`[getMyStats] userId=${req.user?.userId}`);
    return this.exchangesService.getExchangeStats(req.user.userId);
  }

  // ==================== PUBLIC MEMBER EXCHANGE HISTORY ====================
  
  @Get('member/:memberId/history')
  @ApiOperation({ 
    summary: 'Get public exchange history for a member',
    description: 'Returns completed exchanges for a member - useful for checking trustworthiness'
  })
  @ApiParam({ name: 'memberId', description: 'Member ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Member exchange history' })
  async getMemberPublicHistory(
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`[getMemberPublicHistory] memberId=${memberId} limit=${limit}`);
    return this.exchangesService.getMemberPublicExchangeHistory(memberId, limit);
  }

  // ==================== SUGGESTIONS (STATIC ROUTES FIRST) ====================

  @Post('suggestions/generate')
  @ApiOperation({
    summary: 'Generate new exchange suggestions',
    description: 'F-MEM-07: Auto-matching algorithm to find potential exchange partners based on wanted books',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Suggestions generated successfully',
    type: ExchangeSuggestionsResponseDto,
  })
  async generateSuggestions(@Request() req): Promise<ExchangeSuggestionsResponseDto> {
    const startTime = Date.now(); // ← THÊM TIMING
    try {
      this.logger.log(`[generateSuggestions] START userId=${req.user?.userId}`);
      
      const result = await this.matchingService.findMatchingSuggestions(req.user.userId);
      
      const duration = Date.now() - startTime;
      this.logger.log(`[generateSuggestions] SUCCESS found=${result.total} duration=${duration}ms`);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error(`[generateSuggestions] FAILED after ${duration}ms: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get my saved exchange suggestions',
    description: 'Get list of potential exchange partners based on matching algorithm',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of suggestions to return (default: 20)',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'List of suggestions' })
  async getMySuggestions(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`[getMySuggestions] userId=${req.user?.userId} limit=${limit}`);
    return this.matchingService.getMySuggestions(req.user.userId, limit);
  }

  @Patch('suggestions/:id/view')
  @ApiOperation({ summary: 'Mark suggestion as viewed' })
  @ApiParam({ name: 'id', description: 'Suggestion ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Suggestion marked as viewed' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  async markSuggestionViewed(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) suggestionId: string,
  ) {
    this.logger.log(`[markSuggestionViewed] suggestionId=${suggestionId} userId=${req.user?.userId}`);
    return this.matchingService.markSuggestionViewed(req.user.userId, suggestionId);
  }

  // ==================== ACTIVE EXCHANGES (DYNAMIC ROUTES) ====================

  @Get()
  @ApiOperation({ summary: 'Get my active and completed exchanges' })
  @ApiResponse({ status: 200, description: 'List of exchanges', type: PaginatedExchangesDto })
  async getMyExchanges(
    @Request() req,
    @Query() query: QueryExchangesDto,
  ): Promise<PaginatedExchangesDto> {
    this.logger.log(`[getMyExchanges] userId=${req.user?.userId} query=${JSON.stringify(query)}`);
    return this.exchangesService.getMyExchanges(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exchange details' })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Exchange details', type: ExchangeResponseDto })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async getExchangeById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[getExchangeById] id=${id}`);
    return this.exchangesService.getExchangeById(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm exchange completion' })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Exchange confirmed successfully', type: ExchangeResponseDto })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async confirmExchange(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[confirmExchange] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.confirmExchange(req.user.userId, id);
  }

  @Patch(':id/meeting')
  @ApiOperation({ summary: 'Update meeting information for exchange' })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Meeting info updated successfully', type: ExchangeResponseDto })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async updateMeetingInfo(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateMeetingInfoDto,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[updateMeetingInfo] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.updateMeetingInfo(req.user.userId, id, dto);
  }

  @Post(':id/meeting/schedule')
  @ApiOperation({ 
    summary: 'Schedule a meeting for exchange',
    description: 'Schedule meeting time and location. The person who schedules automatically confirms. Other person needs to confirm separately.'
  })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 201, description: 'Meeting scheduled successfully', type: ExchangeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid meeting time or exchange status' })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async scheduleMeeting(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ScheduleMeetingDto,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[scheduleMeeting] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.scheduleMeeting(req.user.userId, id, dto);
  }

  @Patch(':id/meeting/confirm')
  @ApiOperation({ 
    summary: 'Confirm scheduled meeting',
    description: 'Confirm that you agree with the scheduled meeting. When both parties confirm, exchange status changes to MEETING_SCHEDULED.'
  })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Meeting confirmed', type: ExchangeResponseDto })
  @ApiResponse({ status: 400, description: 'No meeting scheduled' })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async confirmMeeting(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[confirmMeeting] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.confirmMeeting(req.user.userId, id);
  }

  @Patch(':id/start')
  @ApiOperation({ 
    summary: 'Start the exchange process',
    description: 'Mark that the meeting has happened and exchange is in progress. Can only be called after meeting is confirmed by both parties.'
  })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Exchange started', type: ExchangeResponseDto })
  @ApiResponse({ status: 400, description: 'Meeting not confirmed yet' })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async startExchange(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[startExchange] id=${id} userId=${req.user?.userId}`);
    return this.exchangesService.startExchange(req.user.userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an exchange' })
  @ApiParam({ name: 'id', description: 'Exchange ID (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, description: 'Exchange cancelled successfully', type: ExchangeResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed exchange' })
  @ApiResponse({ status: 403, description: 'Not part of this exchange' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async cancelExchange(
    @Request() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CancelExchangeDto,
  ): Promise<ExchangeResponseDto> {
    this.logger.log(`[cancelExchange] id=${id} userId=${req.user?.userId} reason=${dto.cancellation_reason}`);
    return this.exchangesService.cancelExchange(req.user.userId, id, dto);
  }
}