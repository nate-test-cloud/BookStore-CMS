import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { BooksReadingService } from './books-reading.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class BooksReadingController {
    constructor(private booksReadingService: BooksReadingService) { }

    @Get('issued')
    async getIssuedBooks(@CurrentUser() user: any) {
        return this.booksReadingService.getIssuedBooks(user.userId);
    }

    @Get('purchases')
    async getPurchases(@CurrentUser() user: any) {
        return this.booksReadingService.getPurchases(user.userId);
    }

    @Get('book-reader/:bookId')
    async getBookContent(
        @Param('bookId') bookId: string,
        @CurrentUser() user: any,
    ) {
        return this.booksReadingService.getBookContent(user.userId, bookId);
    }

    @Get('book-content/:bookId/page/:pageNumber')
    async getPageContent(
        @Param('bookId') bookId: string,
        @Param('pageNumber') pageNumber: string,
        @CurrentUser() user: any,
    ) {
        return this.booksReadingService.getPageContent(
            user.userId,
            bookId,
            parseInt(pageNumber),
        );
    }

    @Post('book-content/seed')
    async seedBookContent(@Body() data: { bookId: string; pages: number }) {
        return this.booksReadingService.seedBookContent(data.bookId, data.pages);
    }
}
