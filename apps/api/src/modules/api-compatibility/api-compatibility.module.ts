import { Module } from '@nestjs/common';
import { ApiCompatibilityController } from './api-compatibility.controller';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [AuthModule, InventoryModule, OrdersModule],
    controllers: [ApiCompatibilityController],
})
export class ApiCompatibilityModule { }
