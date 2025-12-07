// src/modules/books/controllers/books.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

import { BooksService } from '../services/books.service';
import { CreateBookDto, UpdateBookDto } from '../dto/create-book.dto';
import {
  SearchGoogleBooksQueryDto,
  GoogleBookIdParamDto,
  GoogleIsbnParamDto,
} from '../dto/google-books.dto';
import { SearchBooksDto, AdvancedSearchDto } from '../dto/books.dto';

import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common';

// Multer config for book photos
const bookPhotosStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'books');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const imageFileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new BadRequestException('Only image files are allowed!'), false);
  }
  cb(null, true);
};

@ApiTags('Books')
@Controller('books')
export class BooksController {
  private readonly logger = new Logger(BooksController.name);
  
  constructor(private readonly booksService: BooksService) {}

  /** =========================================================
   *  SECTION 1: CREATE BOOK (POST)
   *  ========================================================= */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Add a new book to your library' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 404, description: 'Member profile not found' })
  @ApiResponse({ status: 408, description: 'Request timeout' })
  async create(@Request() req, @Body() dto: CreateBookDto) {
    const startTime = Date.now(); // ← THÊM DEBUG TIMING
    try {
      const userId = req.user?.sub || req.user?.userId;
      this.logger.log(`[create] START userId=${userId}`);
      this.logger.debug(`[create] dto=${JSON.stringify(dto)}`);
      this.logger.debug(`[create] User from token: ${JSON.stringify(req.user)}`);

      if (!userId) {
        throw new UnauthorizedException('User ID not found in request');
      }

      const result = await this.booksService.createBook(userId, dto);
      
      const duration = Date.now() - startTime; // ← THÊM DEBUG TIMING
      this.logger.log(`[create] SUCCESS bookId=${result.book_id} duration=${duration}ms`);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime; // ← THÊM DEBUG TIMING
      this.logger.error(
        `[create] FAILED after ${duration}ms: ${error.message}`, 
        error.stack
      );
      throw error;
    }
  }

  /** =========================================================
   *  SECTION 1.5: UPLOAD BOOK PHOTOS
   *  ========================================================= */
  @Post('upload-photos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: bookPhotosStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    }),
  )
  @ApiOperation({ summary: 'Upload photos of your actual book' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Book photos (max 5 files, 5MB each)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or too many files' })
  async uploadBookPhotos(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng upload ít nhất 1 ảnh');
    }

    const urls = files.map(
      (file) => `/uploads/books/${file.filename}`,
    );

    this.logger.log(`[uploadBookPhotos] userId=${req.user?.sub} uploaded ${files.length} photos`);

    return {
      message: 'Upload thành công',
      urls,
    };
  }

  /** =========================================================
   *  SECTION 2: SPECIFIC ROUTES (must be before dynamic params)
   *  ========================================================= */

  @Get('my-library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get your personal book collection' })
  @ApiResponse({ status: 200, description: 'Your books retrieved successfully' })
  async findMyBooks(@Request() req) {
    return this.booksService.findMyBooks(req.user.sub || req.user.userId);
  }

  @Public()
  @Get('search')
  @ApiOperation({ 
    summary: 'Basic search books',
    description: 'Search books by title, author, or ISBN. Public endpoint.',
  })
  @ApiQuery({ name: 'q', required: true, example: 'Clean Code', description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, example: 'Programming' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            query: { type: 'string' },
          },
        },
      },
    },
  })
  async searchBooks(@Query() query: SearchBooksDto) {
    return this.booksService.searchBooks(query);
  }

  @Get('search/advanced')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ 
    summary: 'Advanced search with filters',
    description: 'Search books with multiple filters (category, region, condition, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Advanced search results' })
  async advancedSearch(@Query() query: AdvancedSearchDto) {
    return this.booksService.advancedSearch(query);
  }

  @Public()
  @Get('search/google')
  @ApiOperation({ summary: 'Search books in Google Books API' })
  @ApiQuery({ name: 'query', required: true, example: 'Clean Code' })
  @ApiQuery({ 
    name: 'maxResults', 
    required: false, 
    example: 20,
    description: '1–40 (Google API limit)',
  })
  @ApiResponse({ status: 200, description: 'Google Books search results' })
  searchGoogleBooks(@Query() q: SearchGoogleBooksQueryDto) {
    return this.booksService.searchGoogleBooks(q.query, q.maxResults ?? 20);
  }

  @Get('wanted/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ 
    summary: 'Search wanted books',
    description: 'Search books that other members want. Useful to see what you can offer.',
  })
  @ApiResponse({ status: 200, description: 'Wanted books search results' })
  async searchWantedBooks(@Query() query: SearchBooksDto) {
    return this.booksService.searchWantedBooks(query);
  }

  @Public()
  @Get('regions/available')
  @ApiOperation({ 
    summary: 'Get list of available regions',
    description: 'Returns all regions/cities that have available books for exchange',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Available regions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        regions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
        },
        total: { type: 'number', example: 3 },
      },
    },
  })
  getAvailableRegions() {
    return this.booksService.getAvailableRegions();
  }

  /** =========================================================
   *  SECTION 3: DYNAMIC ROUTES WITH PREFIXES
   *  ========================================================= */

  @Public()
  @Get('category/:category')
  @ApiOperation({ summary: 'Get books by category' })
  @ApiParam({ name: 'category', example: 'Programming' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Books by category' })
  findByCategory(
    @Param('category') category: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.booksService.findBooksByCategory(category, page, limit);
  }

  @Public()
  @Get('region/:region')
  @ApiOperation({ 
    summary: 'Get books by owner region',
    description: 'Search for available books from owners in a specific region/city.',
  })
  @ApiParam({ 
    name: 'region', 
    example: 'Ho Chi Minh City',
    description: 'Region/City name (case-sensitive)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Books from specified region' })
  findByRegion(
    @Param('region') region: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.booksService.findBooksByRegion(region, page, limit);
  }

  @Public()
  @Get('google/:googleBookId')
  @ApiOperation({ summary: 'Get a Google Book by ID' })
  @ApiParam({ name: 'googleBookId', example: 'zyTCAlFPjgYC' })
  @ApiResponse({ status: 200, description: 'Google Book detail' })
  getGoogleBookById(@Param() p: GoogleBookIdParamDto) {
    return this.booksService.getGoogleBookById(p.googleBookId);
  }

  @Public()
  @Get('google/isbn/:isbn')
  @ApiOperation({ summary: 'Find a Google Book by ISBN (10/13)' })
  @ApiParam({ name: 'isbn', example: '9780132350884' })
  @ApiResponse({ status: 200, description: 'First matched Google Book' })
  searchByIsbn(@Param() p: GoogleIsbnParamDto) {
    return this.booksService.searchGoogleBookByISBN(p.isbn);
  }

  /** =========================================================
   *  SECTION 4: BASE ROUTES (GET, PATCH, DELETE with :id)
   *  MUST BE LAST to avoid catching other routes
   *  ========================================================= */

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get all available books (public)',
    description: 'Browse all available books with optional search. Public endpoint.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title, author, ISBN',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Books retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.booksService.findAll(page, limit, search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get book details by ID',
    description: 'Get detailed information about a specific book. Public endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Book UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Book details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        book_id: { type: 'string' },
        title: { type: 'string' },
        author: { type: 'string' },
        isbn: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        book_condition: { type: 'string' },
        status: { type: 'string' },
        views: { type: 'number' },
        owner: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            region: { type: 'string' },
            trust_score: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                full_name: { type: 'string' },
                avatar_url: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update your book information' })
  @ApiParam({ name: 'id', description: 'Book UUID' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own books' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, req.user.sub || req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete your book (soft delete)' })
  @ApiParam({ name: 'id', description: 'Book UUID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own books' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.booksService.remove(id, req.user.sub || req.user.userId);
  }

  @Get(':id/exchanges')
  @Public()
  @ApiOperation({ 
    summary: 'Get exchange history for a book',
    description: 'Returns all completed exchanges involving this book, showing the journey through different owners'
  })
  @ApiParam({ name: 'id', description: 'Book UUID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (default: 20)' })
  @ApiResponse({ status: 200, description: 'Book exchange history retrieved' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  getBookExchangeHistory(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.booksService.getBookExchangeHistory(id, limit);
  }
  // ============= DEBUG ENDPOINTS (XÓA SAU KHI DONE) =============
@Post('test/auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
@ApiOperation({ summary: '[DEBUG] Test authentication' })
@ApiResponse({ status: 200, description: 'Auth working' })
async testAuth(@Request() req) {
  return {
    message: 'Authentication working!',
    user: req.user,
    timestamp: new Date().toISOString(),
  };
}

@Public()
@Post('test/no-auth')
@ApiOperation({ summary: '[DEBUG] Test without auth' })
@ApiResponse({ status: 200, description: 'No auth endpoint working' })
async testNoAuth(@Body() dto: CreateBookDto) {
  return {
    message: 'No auth endpoint working!',
    receivedDto: dto,
    timestamp: new Date().toISOString(),
  };
}
}