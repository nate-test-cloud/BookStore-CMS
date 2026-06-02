import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    userId?: string; // Optional for global notifications
    title: string;
    message: string;
    type: NotificationType = NotificationType.INFO;
    orderId?: string;
    bookId?: string;
    supplierId?: string;
    isGlobal?: boolean;
}

export class UpdateNotificationDto {
    title?: string;
    message?: string;
    type?: NotificationType;
    isRead?: boolean;
}

export class MarkAsReadDto {
    notificationIds?: string[];
}

export class NotificationFilterDto {
    type?: NotificationType;
    isRead?: boolean;
    isGlobal?: boolean;
    page?: number;
    limit?: number;
}
