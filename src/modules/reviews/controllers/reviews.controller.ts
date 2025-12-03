import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Patch,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a completed exchange' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: 'Review created' })
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    // enforce reviewer from authenticated user to make testing and security easier
    // prefer memberId (mapped by JwtStrategy). If absent, fall back to userId.
    dto.reviewer_id = req.user.memberId ?? req.user.userId;
    return this.reviewsService.create(dto as any);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: "Get reviews for a member (paginated)" })
  @ApiParam({ name: 'memberId', description: 'Member ID', required: true })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  async byMember(
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.reviewsService.findByMember(memberId, page, pageSize);
  }

  @Get('member/:memberId/stats')
  @ApiOperation({ summary: "Get review stats for a member" })
  @ApiParam({ name: 'memberId', description: 'Member ID', required: true })
  async stats(@Param('memberId', new ParseUUIDPipe()) memberId: string) {
    return this.reviewsService.statsForMember(memberId);
  }

  @Get('exchange/:exchangeId')
  @ApiOperation({ summary: 'Get reviews for an exchange' })
  @ApiParam({ name: 'exchangeId', description: 'Exchange ID', required: true })
  async byExchange(@Param('exchangeId', new ParseUUIDPipe()) exchangeId: string) {
    return this.reviewsService.findByExchange(exchangeId);
  }

  @Patch(':reviewId')
  @ApiOperation({ summary: 'Update a review' })
  @ApiBody({ type: UpdateReviewDto })
  async update(@Param('reviewId', new ParseUUIDPipe()) reviewId: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(reviewId, dto);
  }

  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  async remove(@Param('reviewId', new ParseUUIDPipe()) reviewId: string) {
    return this.reviewsService.remove(reviewId);
  }
}
