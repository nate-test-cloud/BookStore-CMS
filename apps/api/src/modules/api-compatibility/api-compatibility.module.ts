import { Module } from '@nestjs/common';
import { ApiCompatibilityController } from './api-compatibility.controller';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [AuthModule, InventoryModule, OrdersModule, NotificationsModule, DatabaseModule],
    controllers: [ApiCompatibilityController],
})
export class ApiCompatibilityModule { }
