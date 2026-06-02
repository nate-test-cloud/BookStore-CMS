import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CustomersController {
    constructor(private customersService: CustomersService) { }

    @Get()
    async getCustomers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
    ) {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
        return this.customersService.getCustomers(pageNum, limitNum, search);
    }

    @Get(':id')
    async getCustomer(@Param('id') id: string) {
        const customer = await this.customersService.getCustomer(id);
        if (!customer) {
            return { error: 'Customer not found' };
        }
        return customer;
    }
}
