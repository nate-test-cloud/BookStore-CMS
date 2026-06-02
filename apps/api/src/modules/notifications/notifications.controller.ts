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
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
    CreateNotificationDto,
    UpdateNotificationDto,
    MarkAsReadDto,
    NotificationFilterDto,
} from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    // =============================================
    // USER NOTIFICATIONS
    // =============================================

    @Get('my')
    async getMyNotifications(
        @CurrentUser() user: any,
        @Query('type') type?: string,
        @Query('isRead') isRead?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const filters: NotificationFilterDto = {
            type: type as any,
            isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        };

        return this.notificationsService.getUserNotifications(user.userId, filters);
    }

    @Get('my/unread-count')
    async getUnreadCount(@CurrentUser() user: any) {
        const count = await this.notificationsService.getUnreadCount(user.userId);
        return { unreadCount: count };
    }

    @Get('my/:id')
    async getNotification(@Param('id') id: string) {
        return this.notificationsService.getNotificationById(id);
    }

    @Put('my/:id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Post('my/mark-all-read')
    async markAllAsRead(@CurrentUser() user: any) {
        return this.notificationsService.markMultipleAsRead([user.userId]);
    }

    @Delete('my/:id')
    async deleteNotification(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        const notification = await this.notificationsService.getNotificationById(id);
        if (notification.userId !== user.userId) {
            throw new Error('Unauthorized');
        }
        return this.notificationsService.deleteNotification(id);
    }

    // =============================================
    // ADMIN NOTIFICATIONS
    // =============================================

    @Get('admin')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAdminNotifications(
        @Query('type') type?: string,
        @Query('isRead') isRead?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const filters: NotificationFilterDto = {
            type: type as any,
            isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        };

        return this.notificationsService.getAdminNotifications(filters);
    }

    @Post('admin')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async createAdminNotification(@Body() createDto: CreateNotificationDto) {
        return this.notificationsService.createNotification(createDto);
    }

    @Put('admin/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateNotification(
        @Param('id') id: string,
        @Body() updateDto: UpdateNotificationDto,
    ) {
        return this.notificationsService.updateNotification(id, updateDto);
    }

    @Put('admin/:id/read')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async markAdminNotificationAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete('admin/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteAdminNotification(@Param('id') id: string) {
        return this.notificationsService.deleteNotification(id);
    }

    @Post('admin/mark-all-read')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async markAllAdminNotificationsAsRead() {
        return this.notificationsService.markMultipleAsRead();
    }
}
