import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ApiCompatibilityModule } from './modules/api-compatibility/api-compatibility.module';
import { CartModule } from './modules/cart/cart.module';
import { BooksReadingModule } from './modules/books-reading/books-reading.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Global Config
    ConfigModule,
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    InventoryModule,
    OrdersModule,
    CartModule,
    BooksReadingModule,
    NotificationsModule,
    SuppliersModule,
    AnalyticsModule,
    CustomersModule,
    ApiCompatibilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
