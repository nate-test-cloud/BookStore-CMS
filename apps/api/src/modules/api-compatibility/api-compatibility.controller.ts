import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
    ) { }

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

    @Delete('books/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBook(@Param('id') id: string) {
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
        return { notifications: [] }; // Placeholder for notifications
    }

    @Put('notifications/:id/read')
    @UseGuards(JwtAuthGuard)
    async markNotificationRead(@Param('id') id: string) {
        return { message: 'Notification marked as read' }; // Placeholder
    }
}
