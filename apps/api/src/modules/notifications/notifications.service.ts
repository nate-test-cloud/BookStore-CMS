import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';
import {
    CreateNotificationDto,
    UpdateNotificationDto,
    MarkAsReadDto,
    NotificationFilterDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async createNotification(createDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                userId: createDto.userId,
                title: createDto.title,
                message: createDto.message,
                type: createDto.type,
                orderId: createDto.orderId,
                bookId: createDto.bookId,
                supplierId: createDto.supplierId,
                isGlobal: createDto.isGlobal || false,
            },
        });
    }

    async getUserNotifications(
        userId: string,
        filters?: NotificationFilterDto,
    ) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            userId,
        };

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.isRead !== undefined) {
            where.isRead = filters.isRead;
        }

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
        ]);

        return {
            notifications,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }

    async getAdminNotifications(
        filters?: NotificationFilterDto,
    ) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            OR: [
                { isGlobal: true },
                { userId: { not: null } },
            ],
        };

        if (filters?.type) {
            where.AND = [{ type: filters.type }];
        }

        if (filters?.isRead !== undefined) {
            if (!where.AND) {
                where.AND = [];
            }
            where.AND.push({ isRead: filters.isRead });
        }

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true,
                        },
                    },
                },
            }),
            this.prisma.notification.count({ where }),
        ]);

        return {
            notifications,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }

    async getNotificationById(id: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    async updateNotification(
        id: string,
        updateDto: UpdateNotificationDto,
    ) {
        const notification = await this.getNotificationById(id);

        return this.prisma.notification.update({
            where: { id },
            data: {
                title: updateDto.title,
                message: updateDto.message,
                type: updateDto.type,
                isRead: updateDto.isRead,
                readAt: updateDto.isRead ? new Date() : null,
            },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async markMultipleAsRead(userIds?: string[], notificationIds?: string[]) {
        if (notificationIds && notificationIds.length > 0) {
            return this.prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
        }

        if (userIds && userIds.length > 0) {
            return this.prisma.notification.updateMany({
                where: {
                    userId: { in: userIds },
                    isRead: false,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
        }

        // Mark all as read
        return this.prisma.notification.updateMany({
            where: {
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async deleteNotification(id: string) {
        return this.prisma.notification.delete({
            where: { id },
        });
    }

    async deleteMultipleNotifications(ids: string[]) {
        return this.prisma.notification.deleteMany({
            where: {
                id: { in: ids },
            },
        });
    }

    async sendLowStockNotification(bookId: string, bookTitle: string) {
        return this.createNotification({
            title: 'Low Stock Alert',
            message: `Book "${bookTitle}" is running low on stock`,
            type: NotificationType.STOCK_ALERT,
            bookId,
            isGlobal: true,
        });
    }

    async sendOrderNotification(
        userId: string,
        orderId: string,
        title: string,
        message: string,
    ) {
        return this.createNotification({
            userId,
            title,
            message,
            type: NotificationType.ORDER_UPDATE,
            orderId,
        });
    }

    async sendReviewNotification(
        bookId: string,
        bookTitle: string,
        reviewerName: string,
    ) {
        return this.createNotification({
            title: 'New Review',
            message: `${reviewerName} left a review on "${bookTitle}"`,
            type: NotificationType.NEW_REVIEW,
            bookId,
            isGlobal: true,
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
}
