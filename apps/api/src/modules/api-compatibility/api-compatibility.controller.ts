import {
    Controller,
    Post,
    Get,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { IdMapper } from '../../common/id-mapper.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
    LoginDto,
    SignupDto,
    RefreshTokenDto,
    PasswordResetRequestDto,
    PasswordResetDto,
} from '../auth/dto/auth.dto';
import {
    CreateBookDto,
    UpdateBookDto,
} from '../inventory/dto/inventory.dto';

/**
 * API Compatibility Controller
 * Provides route aliases for frontend endpoints that don't match backend module paths
 * This ensures backward compatibility without changing frontend code
 */
@Controller()
export class ApiCompatibilityController {
    constructor(
        private authService: AuthService,
        private inventoryService: InventoryService,
        private ordersService: OrdersService,
        private notificationsService: NotificationsService,
        private prisma: PrismaService,
    ) { }

    /**
     * Helper method to find book by numeric ID hash
     */
    private async findBookBynumericId(numericId: number) {
        const allBooks = await this.prisma.book.findMany();
        const book = allBooks.find(b => IdMapper.cuidToNumericId(b.id) === numericId);
        if (!book) {
            throw new NotFoundException(`Book with ID ${numericId} not found`);
        }
        return book;
    }

    // =============================================
    // AUTH ROUTES - ALIASES
    // =============================================

    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        const result = await this.authService.refreshToken(refreshTokenDto);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
        await this.authService.requestPasswordReset(dto);
        return { message: 'Password reset email sent' };
    }

    @Post('password-reset')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: PasswordResetDto) {
        await this.authService.resetPassword(dto);
        return { message: 'Password reset successfully' };
    }

    @Get('verify')
    @UseGuards(JwtAuthGuard)
    async verify(@CurrentUser() user: any) {
        return this.authService.validateUser(user.userId);
    }

    // =============================================
    // INVENTORY ROUTES - ALIASES
    // =============================================

    @Get('books')
    @UseGuards(JwtAuthGuard)
    async getBooks(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
    ) {
        return this.inventoryService.getBooks(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            categoryId,
            search,
        );
    }

    @Get('books/:id')
    @UseGuards(JwtAuthGuard)
    async getBook(@Param('id') id: string) {
        return this.inventoryService.getBook(id);
    }

    @Post('books')
    @UseGuards(JwtAuthGuard)
    async createBook(@Body() createBookDto: CreateBookDto) {
        return this.inventoryService.createBook(createBookDto);
    }

    @Put('books/:id')
    @UseGuards(JwtAuthGuard)
    async updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.inventoryService.updateBook(id, updateBookDto);
    }

    @Patch('books/:id')
    @UseGuards(JwtAuthGuard)
    async patchBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        // Handle numeric IDs from generated API client
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
            const book = await this.findBookBynumericId(numericId);
            return this.inventoryService.updateBook(book.id, updateBookDto);
        }
        // Fallback to string ID (CUID)
        return this.inventoryService.updateBook(id, updateBookDto);
    }

    @Delete('books/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBook(@Param('id') id: string) {
        // Handle numeric IDs from generated API client
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
            const book = await this.findBookBynumericId(numericId);
            return this.inventoryService.deleteBook(book.id);
        }
        // Fallback to string ID (CUID)
        return this.inventoryService.deleteBook(id);
    }

    @Get('books/search/:query')
    @UseGuards(JwtAuthGuard)
    async searchBooks(@Param('query') query: string) {
        return this.inventoryService.searchBooks(query);
    }

    // =============================================
    // PROFILE ROUTES - ALIASES
    // =============================================

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.userId);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
        return this.authService.updateProfile(user.userId, updateData);
    }

    // =============================================
    // ORDERS/PURCHASES ROUTES - ALIASES
    // =============================================

    @Get('purchases')
    @UseGuards(JwtAuthGuard)
    async getPurchases(
        @CurrentUser() user: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.ordersService.getUserPurchases(
            user.userId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get('issued')
    @UseGuards(JwtAuthGuard)
    async getIssued(@CurrentUser() user: any) {
        return this.ordersService.getUserIssuedBooks(user.userId);
    }

    // =============================================
    // NOTIFICATIONS ROUTES - ALIASES
    // =============================================

    @Get('notifications')
    @UseGuards(JwtAuthGuard)
    async getNotifications(@CurrentUser() user: any) {
        return this.notificationsService.getUserNotifications(user.userId);
    }

    @Put('notifications/:id/read')
    @UseGuards(JwtAuthGuard)
    async markNotificationRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    // =============================================
    // ADMIN ROUTES - ALIASES
    // =============================================

    @Get('admin/notifications')
    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAdminNotifications() {
        return this.notificationsService.getAdminNotifications();
    }

    @Put('admin/notifications/:id/read')
    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async markAdminNotificationRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    // =============================================
    // WISHLIST/FAVOURITE ROUTES - ALIASES
    // =============================================

    @Post('books/favourite/:id')
    @UseGuards(JwtAuthGuard)
    async addFavourite(@CurrentUser() user: any, @Param('id') bookId: string) {
        return this.inventoryService.addFavourite(user.userId, bookId);
    }

    @Get('books/favourites')
    @UseGuards(JwtAuthGuard)
    async getFavourites(@CurrentUser() user: any) {
        return this.inventoryService.getFavourites(user.userId);
    }

    @Delete('books/favourite/:id')
    @UseGuards(JwtAuthGuard)
    async removeFavourite(@CurrentUser() user: any, @Param('id') bookId: string) {
        return this.inventoryService.removeFavourite(user.userId, bookId);
    }

    // =============================================
    // RECOMMENDATIONS ROUTES - ALIASES
    // =============================================

    @Get('recommendations/for-you')
    @UseGuards(JwtAuthGuard)
    async getForYouRecommendations(
        @CurrentUser() user: any,
        @Query('limit') limit?: string,
    ) {
        return this.inventoryService.getForYouRecommendations(
            user.userId,
            limit ? parseInt(limit) : 10,
        );
    }
}
