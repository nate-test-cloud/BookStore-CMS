import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
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

    // TODO: Add more modules
    // CustomerModule,
    // AnalyticsModule,
    // SupplierModule,
    // NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
