import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    // =============================================
    // DASHBOARD STATISTICS
    // =============================================

    @Get('dashboard')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getDashboardStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.analyticsService.getDashboardStats(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    // =============================================
    // SALES ANALYTICS
    // =============================================

    @Get('sales')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getSalesOverTime(
        @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.analyticsService.getSalesOverTime(
            period,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    // =============================================
    // CATEGORY ANALYTICS
    // =============================================

    @Get('revenue-by-category')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getRevenueByCategory(
        @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.analyticsService.getRevenueByCategory(
            period,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    // =============================================
    // TOP PERFORMING BOOKS
    // =============================================

    @Get('top-books')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getTopBooks(
        @Query('limit') limit?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.analyticsService.getTopBooks(
            limit ? parseInt(limit) : 10,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    // =============================================
    // CUSTOMER ANALYTICS
    // =============================================

    @Get('customer-growth')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getCustomerGrowth(
        @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.analyticsService.getCustomerGrowth(
            period,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    // =============================================
    // INVENTORY ANALYTICS
    // =============================================

    @Get('low-stock')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INVENTORY_STAFF)
    async getLowStockBooks() {
        return this.analyticsService.getLowStockBooks();
    }

    @Get('inventory-valuation')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getInventoryValuation() {
        return this.analyticsService.getInventoryValuation();
    }
}
