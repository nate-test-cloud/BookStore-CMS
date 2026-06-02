import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async getCustomers(page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;

        const where = {
            role: UserRole.CUSTOMER,
            isActive: true,
            ...(search && {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { phoneNumber: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        // Fetch customers with their loyalty account and order data
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    phoneNumber: true,
                    profileImage: true,
                    createdAt: true,
                    orders: {
                        select: {
                            id: true,
                            totalAmount: true,
                        },
                    },
                    loyaltyAccount: {
                        select: {
                            tier: true,
                            points: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        // Transform to customer response format
        const data = users.map((user) => ({
            id: user.id,
            name: user.fullName,
            email: user.email,
            phone: user.phoneNumber || null,
            avatarUrl: user.profileImage || null,
            tier: user.loyaltyAccount?.tier?.toLowerCase() || 'bronze',
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            joinedDate: user.createdAt.toISOString(),
        }));

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async getCustomer(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                phoneNumber: true,
                profileImage: true,
                createdAt: true,
                isEmailVerified: true,
                lastLoginAt: true,
                orders: {
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                        createdAt: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                    },
                },
                addresses: {
                    select: {
                        id: true,
                        street: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        isDefault: true,
                    },
                },
                loyaltyAccount: {
                    select: {
                        tier: true,
                        points: true,
                    },
                },
            },
        });

        if (!user) return null;

        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            phone: user.phoneNumber || null,
            avatarUrl: user.profileImage || null,
            tier: user.loyaltyAccount?.tier?.toLowerCase() || 'bronze',
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            totalReviews: user.reviews.length,
            averageRating: user.reviews.length > 0
                ? (user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length).toFixed(1)
                : 0,
            joinedDate: user.createdAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString() || null,
            emailVerified: user.isEmailVerified,
            loyaltyPoints: user.loyaltyAccount?.points || 0,
            addresses: user.addresses,
            orders: user.orders,
        };
    }
}
