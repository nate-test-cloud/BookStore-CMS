import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
    CreateOrderDto,
    UpdateOrderStatusDto,
    ApplyCouponDto,
    CreateReturnDto,
    ApproveReturnDto,
    CreateCouponDto,
    UpdateCouponDto,
} from './dto/order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    // =============================================
    // ORDER ENDPOINTS
    // =============================================

    @Post()
    @Roles(UserRole.CUSTOMER, UserRole.CASHIER)
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.ordersService.createOrder(createOrderDto, userId);
    }

    @Get()
    async getOrders(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @CurrentUser('userId') userId?: string,
        @CurrentUser('role') role?: string,
    ) {
        if (role === UserRole.CUSTOMER && userId) {
            return this.ordersService.getOrders(
                userId as string,
                page ? parseInt(page) : 1,
                limit ? parseInt(limit) : 20,
            );
        }

        // Admin/SUPPLIER can view all orders
        return this.ordersService.getAllOrders(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get(':id')
    async getOrder(
        @Param('id') id: string,
        @CurrentUser('userId') userId?: string,
        @CurrentUser('role') role?: string,
    ) {
        return this.ordersService.getOrder(
            id,
            role === UserRole.CUSTOMER ? userId : undefined,
        );
    }

    @Put(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER, UserRole.CASHIER)
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateOrderStatus(id, updateDto);
    }

    // =============================================
    // RETURNS & REFUNDS
    // =============================================

    @Post(':id/returns')
    @Roles(UserRole.CUSTOMER, UserRole.CASHIER)
    async createReturn(
        @Param('id') id: string,
        @Body() createReturnDto: CreateReturnDto,
    ) {
        return this.ordersService.createReturn(id, createReturnDto);
    }

    @Get('returns/list')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async getReturns(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.ordersService.getReturns(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Put('returns/:id/approve')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async approveReturn(
        @Param('id') id: string,
        @Body() approveDto: ApproveReturnDto,
    ) {
        return this.ordersService.approveReturn(id, approveDto);
    }

    // =============================================
    // COUPONS
    // =============================================

    @Post('coupons')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async createCoupon(@Body() createCouponDto: CreateCouponDto) {
        return this.ordersService.createCoupon(createCouponDto);
    }

    @Get('coupons/list')
    async getCoupons(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.ordersService.getCoupons(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get('coupons/:id')
    async getCoupon(@Param('id') id: string) {
        return this.ordersService.getCoupon(id);
    }

    @Put('coupons/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async updateCoupon(
        @Param('id') id: string,
        @Body() updateCouponDto: UpdateCouponDto,
    ) {
        return this.ordersService.updateCoupon(id, updateCouponDto);
    }

    @Post('coupons/:id/deactivate')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async deactivateCoupon(@Param('id') id: string) {
        return this.ordersService.deactivateCoupon(id);
    }

    @Post('coupons/validate')
    async validateCoupon(@Body('code') code: string, @Body('amount') amount: number) {
        return this.ordersService.validateCoupon(code, amount);
    }
}
