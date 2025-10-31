// src/modules/library/controllers/library.controller.ts
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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { LibraryService } from '../services/library.service';
import {
  CreateWantedBookDto,
  UpdateWantedBookDto,
  QueryWantedBooksDto,
  WantedBookResponseDto,
  LibraryStatsResponseDto,
  PaginatedWantedBooksDto,
} from '../dto/library.dto';
import { CurrentUser } from '../../../modules/auth/decorators/current-user.decorator';
import * as authUserType from '../../../modules/auth/types/auth-user.type';
// Nếu muốn mở public cho 1 số route: import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Personal Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  /** Helper: đảm bảo có memberId trong token (JwtStrategy đã gắn) */
  private requireMemberId(user: authUserType.AuthUser): string {
    const memberId = user?.memberId;
    if (!memberId) {
      throw new BadRequestException(
        'Member profile not found. Please complete member profile first.',
      );
    }
    return memberId;
  }

  // ==================== GET LIBRARY STATS ====================
  @Get('stats')
  @ApiOperation({
    summary: 'Get personal library statistics',
    description:
      'Returns owned books count, wanted books count, and top wanted books',
  })
  @ApiResponse({
    status: 200,
    description: 'Library statistics retrieved successfully',
    type: LibraryStatsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getLibraryStats(@CurrentUser() user: authUserType.AuthUser) {
    const memberId = this.requireMemberId(user);
    return this.libraryService.getLibraryStats(memberId);
  }

  // ==================== LIST WANTED BOOKS ====================
  @Get('wanted')
  @ApiOperation({
    summary: 'Get list of wanted books',
    description:
      'Returns paginated list of books the user wants to exchange for',
  })
  @ApiResponse({
    status: 200,
    description: 'Wanted books retrieved successfully',
    type: PaginatedWantedBooksDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWantedBooks(
    @CurrentUser() user: authUserType.AuthUser,
    @Query() query: QueryWantedBooksDto,
  ) {
    const memberId = this.requireMemberId(user);
    return this.libraryService.getWantedBooks(memberId, query);
  }

  // ==================== GET SINGLE WANTED BOOK ====================
  @Get('wanted/:id')
  @ApiOperation({
    summary: 'Get wanted book details',
    description: 'Returns details of a specific wanted book',
  })
  @ApiResponse({
    status: 200,
    description: 'Wanted book found',
    type: WantedBookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Wanted book not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWantedBookById(
    @CurrentUser() user: authUserType.AuthUser,
    @Param('id') wantedId: string,
  ) {
    const memberId = this.requireMemberId(user);
    return this.libraryService.getWantedBookById(memberId, wantedId);
  }

  // ==================== ADD WANTED BOOK ====================
  @Post('wanted')
  @ApiOperation({
    summary: 'Add book to wanted list',
    description:
      'Add a book that you want to exchange for. Must provide at least title or ISBN',
  })
  @ApiResponse({
    status: 201,
    description: 'Book added to wanted list successfully',
    type: WantedBookResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Either title or ISBN is required' })
  @ApiConflictResponse({ description: 'Book already in wanted list' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async addWantedBook(
    @CurrentUser() user: authUserType.AuthUser,
    @Body() dto: CreateWantedBookDto,
  ) {
    const memberId = this.requireMemberId(user);
    return this.libraryService.addWantedBook(memberId, dto);
  }

  // ==================== UPDATE WANTED BOOK ====================
  @Patch('wanted/:id')
  @ApiOperation({
    summary: 'Update wanted book',
    description:
      'Update priority, notes, or other details of a wanted book',
  })
  @ApiResponse({
    status: 200,
    description: 'Wanted book updated successfully',
    type: WantedBookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Wanted book not found' })
  @ApiConflictResponse({ description: 'ISBN conflict with another wanted book' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateWantedBook(
    @CurrentUser() user: authUserType.AuthUser,
    @Param('id') wantedId: string,
    @Body() dto: UpdateWantedBookDto,
  ) {
    const memberId = this.requireMemberId(user);
    return this.libraryService.updateWantedBook(memberId, wantedId, dto);
  }

  // ==================== DELETE WANTED BOOK ====================
  @Delete('wanted/:id')
  @ApiOperation({
    summary: 'Remove book from wanted list',
    description: 'Delete a book from your wanted list',
  })
  @ApiResponse({
    status: 200,
    description: 'Book removed from wanted list successfully',
  })
  @ApiNotFoundResponse({ description: 'Wanted book not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteWantedBook(
    @CurrentUser() user: authUserType.AuthUser,
    @Param('id') wantedId: string,
  ) {
    const memberId = this.requireMemberId(user);
    return this.libraryService.deleteWantedBook(memberId, wantedId);
  }
}
