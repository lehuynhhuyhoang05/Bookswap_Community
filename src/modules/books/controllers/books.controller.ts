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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { BooksService } from '../services/books.service';
import { CreateBookDto, UpdateBookDto } from '../dto/create-book.dto';
import {
  SearchGoogleBooksQueryDto,
  GoogleBookIdParamDto,
  GoogleIsbnParamDto,
} from '../dto/google-books.dto';

import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /** ---------------------------------------------------------
   *  Create book (requires JWT)
   *  --------------------------------------------------------- */
  @Post()
  @UseGuards(JwtAuthGuard) // nếu bạn đã set Global Guard thì có thể bỏ dòng này
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a new book to your library' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 404, description: 'Member profile not found' })
  async create(@Request() req, @Body() dto: CreateBookDto) {
    console.log('[CTRL /books][POST] >>>', {
      authSample:
        req.headers?.authorization?.slice(0, 30) +
          (req.headers?.authorization?.length > 30 ? '...' : '') || '(none)',
      reqUser: req.user || null,
      bodyKeys: Object.keys(dto || {}),
      dtoTitle: dto?.title,
    });

    const userId = req.user?.sub;
    console.log('[CTRL /books][POST] userId =', userId);

    const result = await this.booksService.createBook(userId, dto);

    console.log('[CTRL /books][POST] <<<', {
      createdId: (result as any)?.book_id || (result as any)?.id || null,
      title: (result as any)?.title || dto?.title,
    });

    return result;
  }

  /** ---------------------------------------------------------
   *  Get my library (requires JWT)
   *  --------------------------------------------------------- */
  @Get('my-library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get your personal book collection' })
  @ApiResponse({ status: 200, description: 'Your books retrieved successfully' })
  async findMyBooks(@Request() req) {
    console.log('[CTRL /books/my-library][GET] req.user =', req.user);
    return this.booksService.findMyBooks(req.user.sub);
  }

  /** ---------------------------------------------------------
   *  Public listing
   *  --------------------------------------------------------- */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available books (public)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title, author, ISBN, or category',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.booksService.findAll(page, limit, search);
  }

  /** ---------------------------------------------------------
   *  Public: get by internal book id
   *  --------------------------------------------------------- */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get book details by ID' })
  @ApiResponse({ status: 200, description: 'Book details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  /** ---------------------------------------------------------
   *  Public: list by category
   *  --------------------------------------------------------- */
  @Public()
  @Get('category/:category')
  @ApiOperation({ summary: 'Get books by category' })
  @ApiParam({ name: 'category', example: 'Programming' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findByCategory(
    @Param('category') category: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.booksService.findBooksByCategory(category, page, limit);
  }

  /** ---------------------------------------------------------
   *  Update (requires JWT; must be owner)
   *  --------------------------------------------------------- */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update your book information' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own books' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateBookDto) {
    console.log('[CTRL /books/:id][PATCH]', { id, reqUser: req.user });
    return this.booksService.update(id, req.user.sub, dto);
  }

  /** ---------------------------------------------------------
   *  Delete (requires JWT; must be owner)
   *  --------------------------------------------------------- */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete your book (soft delete)' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own books' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id') id: string, @Request() req) {
    console.log('[CTRL /books/:id][DELETE]', { id, reqUser: req.user });
    return this.booksService.remove(id, req.user.sub);
  }

  /** =========================================================
   *  GOOGLE BOOKS (Public)
   *  ========================================================= */

  @Public()
  @Get('search/google')
  @ApiOperation({ summary: 'Search books in Google Books API' })
  @ApiQuery({ name: 'query', required: true, example: 'Clean Code' })
  @ApiQuery({ name: 'maxResults', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Google Books search results' })
  searchGoogleBooks(@Query() q: SearchGoogleBooksQueryDto) {
    return this.booksService.searchGoogleBooks(q.query, q.maxResults ?? 20);
  }

  @Public()
  @Get('google/:googleBookId')
  @ApiOperation({ summary: 'Get a Google Book by ID' })
  @ApiResponse({ status: 200, description: 'Google Book detail mapped to internal shape' })
  getGoogleBookById(@Param() p: GoogleBookIdParamDto) {
    return this.booksService.getGoogleBookById(p.googleBookId);
  }

  @Public()
  @Get('google/isbn/:isbn')
  @ApiOperation({ summary: 'Find a Google Book by ISBN (10/13)' })
  @ApiResponse({ status: 200, description: 'First matched Google Book for given ISBN' })
  searchByIsbn(@Param() p: GoogleIsbnParamDto) {
    return this.booksService.searchGoogleBookByISBN(p.isbn);
  }
}
