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
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
    CreateSupplierDto,
    UpdateSupplierDto,
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    CreateRestockRequestDto,
    UpdateRestockRequestDto,
} from './dto/supplier.dto';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
    constructor(private suppliersService: SuppliersService) { }

    // =============================================
    // SUPPLIERS CRUD
    // =============================================

    @Get()
    async getSuppliers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.suppliersService.getSuppliers(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get(':id')
    async getSupplier(@Param('id') id: string) {
        return this.suppliersService.getSupplierById(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async createSupplier(@Body() createDto: CreateSupplierDto) {
        return this.suppliersService.createSupplier(createDto);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
    async updateSupplier(
        @Param('id') id: string,
        @Body() updateDto: UpdateSupplierDto,
    ) {
        return this.suppliersService.updateSupplier(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteSupplier(@Param('id') id: string) {
        return this.suppliersService.deleteSupplier(id);
    }

    // =============================================
    // PURCHASE ORDERS
    // =============================================

    @Get(':id/purchase-orders')
    async getPurchaseOrders(@Param('id') id: string) {
        return this.suppliersService.getPurchaseOrders(id);
    }

    @Post('purchase-orders')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INVENTORY_STAFF)
    async createPurchaseOrder(@Body() createDto: CreatePurchaseOrderDto) {
        return this.suppliersService.createPurchaseOrder(createDto);
    }

    @Get('purchase-orders/:id')
    async getPurchaseOrder(@Param('id') id: string) {
        return this.suppliersService.getPurchaseOrderById(id);
    }

    @Put('purchase-orders/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INVENTORY_STAFF)
    async updatePurchaseOrder(
        @Param('id') id: string,
        @Body() updateDto: UpdatePurchaseOrderDto,
    ) {
        return this.suppliersService.updatePurchaseOrder(id, updateDto);
    }

    // =============================================
    // RESTOCK REQUESTS
    // =============================================

    @Get('restock-requests')
    async getRestockRequests(@Query('status') status?: string) {
        return this.suppliersService.getRestockRequests(status);
    }

    @Post('restock-requests')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INVENTORY_STAFF)
    async createRestockRequest(@Body() createDto: CreateRestockRequestDto) {
        return this.suppliersService.createRestockRequest(createDto);
    }

    @Put('restock-requests/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.INVENTORY_STAFF)
    async updateRestockRequest(
        @Param('id') id: string,
        @Body() updateDto: UpdateRestockRequestDto,
    ) {
        return this.suppliersService.updateRestockRequest(id, updateDto);
    }

    // =============================================
    // ALERTS
    // =============================================

    @Get('alerts/restock')
    async getRestockAlert() {
        return this.suppliersService.getRestockAlert();
    }
}
