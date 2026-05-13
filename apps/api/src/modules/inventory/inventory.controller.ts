import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
    CreateBookDto,
    UpdateBookDto,
    CreateCategoryDto,
    UpdateCategoryDto,
    CreateAuthorDto,
    UpdateAuthorDto,
    CreatePublisherDto,
    UpdatePublisherDto,
    AdjustInventoryDto,
    LowStockAlertDto,
} from './dto/inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private inventoryService: InventoryService) { }

    // =============================================
    // BOOKS
    // =============================================

    @Post('books')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER, UserRole.INVENTORY_STAFF)
    async createBook(@Body() createBookDto: CreateBookDto) {
        return this.inventoryService.createBook(createBookDto);
    }

    @Get('books')
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
    async getBook(@Param('id') id: string) {
        return this.inventoryService.getBook(id);
    }

    @Put('books/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER, UserRole.INVENTORY_STAFF)
    async updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.inventoryService.updateBook(id, updateBookDto);
    }

    @Delete('books/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async deleteBook(@Param('id') id: string) {
        return this.inventoryService.deleteBook(id);
    }

    // =============================================
    // CATEGORIES
    // =============================================

    @Post('categories')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.inventoryService.createCategory(createCategoryDto);
    }

    @Get('categories')
    async getCategories() {
        return this.inventoryService.getCategories();
    }

    @Get('categories/:id')
    async getCategory(@Param('id') id: string) {
        return this.inventoryService.getCategory(id);
    }

    @Put('categories/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async updateCategory(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.inventoryService.updateCategory(id, updateCategoryDto);
    }

    @Delete('categories/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteCategory(@Param('id') id: string) {
        return this.inventoryService.deleteCategory(id);
    }

    // =============================================
    // AUTHORS
    // =============================================

    @Post('authors')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
        return this.inventoryService.createAuthor(createAuthorDto);
    }

    @Get('authors')
    async getAuthors(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.inventoryService.getAuthors(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get('authors/:id')
    async getAuthor(@Param('id') id: string) {
        return this.inventoryService.getAuthor(id);
    }

    @Put('authors/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async updateAuthor(
        @Param('id') id: string,
        @Body() updateAuthorDto: UpdateAuthorDto,
    ) {
        return this.inventoryService.updateAuthor(id, updateAuthorDto);
    }

    @Delete('authors/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteAuthor(@Param('id') id: string) {
        return this.inventoryService.deleteAuthor(id);
    }

    // =============================================
    // PUBLISHERS
    // =============================================

    @Post('publishers')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async createPublisher(@Body() createPublisherDto: CreatePublisherDto) {
        return this.inventoryService.createPublisher(createPublisherDto);
    }

    @Get('publishers')
    async getPublishers(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.inventoryService.getPublishers(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get('publishers/:id')
    async getPublisher(@Param('id') id: string) {
        return this.inventoryService.getPublisher(id);
    }

    @Put('publishers/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async updatePublisher(
        @Param('id') id: string,
        @Body() updatePublisherDto: UpdatePublisherDto,
    ) {
        return this.inventoryService.updatePublisher(id, updatePublisherDto);
    }

    // =============================================
    // INVENTORY ADJUSTMENTS
    // =============================================

    @Post('books/:id/adjust')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER, UserRole.INVENTORY_STAFF)
    async adjustInventory(
        @Param('id') id: string,
        @Body() adjustmentDto: AdjustInventoryDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.inventoryService.adjustInventory(id, adjustmentDto, userId);
    }

    @Get('books/:id/inventory')
    async getInventory(@Param('id') id: string) {
        return this.inventoryService.getInventory(id);
    }

    @Post('books/:id/low-stock-alert')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async setLowStockAlert(
        @Param('id') id: string,
        @Body() alertDto: LowStockAlertDto,
    ) {
        return this.inventoryService.setLowStockAlert(id, alertDto);
    }

    @Get('low-stock-books')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER, UserRole.INVENTORY_STAFF)
    async getLowStockBooks() {
        return this.inventoryService.getLowStockBooks();
    }

    // =============================================
    // ANALYTICS
    // =============================================

    @Get('valuation/summary')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async getInventoryValuation() {
        return this.inventoryService.getInventoryValuation();
    }
}
