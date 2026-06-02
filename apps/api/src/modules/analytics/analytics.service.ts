import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    // =============================================
    // DASHBOARD STATISTICS
    // =============================================

    async getDashboardStats(startDate?: Date, endDate?: Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

        // Today's orders
        const [ordersToday, ordersYesterday, totalBooks, lowStockCount, totalCustomers] = await Promise.all([
            this.prisma.order.aggregate({
                where: {
                    createdAt: { gte: today, lt: tomorrow },
                    status: { not: OrderStatus.CANCELLED },
                },
                _sum: { totalAmount: true },
                _count: true,
            }),
            this.prisma.order.aggregate({
                where: {
                    createdAt: { gte: yesterday, lt: yesterdayEnd },
                    status: { not: OrderStatus.CANCELLED },
                },
                _sum: { totalAmount: true },
                _count: true,
            }),
            this.prisma.book.count({ where: { isActive: true } }),
            this.prisma.book.count({ where: { stock: { lt: 15 }, isActive: true } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        ]);

        // Revenue
        const monthRevenue = await this.prisma.order.aggregate({
            where: {
                createdAt: { gte: startDate || lastMonth },
                status: { not: OrderStatus.CANCELLED },
            },
            _sum: { totalAmount: true },
        });

        // Recent orders
        const recentOrders = await this.prisma.order.findMany({
            where: { status: { not: OrderStatus.CANCELLED } },
            include: {
                user: { select: { fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const totalRevenue = monthRevenue._sum.totalAmount || 0;
        const previousMonthRevenue = await this.prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1),
                    lt: lastMonth,
                },
                status: { not: OrderStatus.CANCELLED },
            },
            _sum: { totalAmount: true },
        });

        const revenueChange = previousMonthRevenue._sum.totalAmount
            ? ((totalRevenue - (previousMonthRevenue._sum.totalAmount || 0)) /
                (previousMonthRevenue._sum.totalAmount || 1)) *
            100
            : 0;

        const ordersChange =
            ordersYesterday._count > 0
                ? ((ordersToday._count - ordersYesterday._count) / ordersYesterday._count) * 100
                : 0;

        return {
            totalRevenue: Math.round(totalRevenue),
            ordersToday: ordersToday._count,
            totalBooks,
            lowStockCount,
            totalCustomers,
            revenueChange: Math.round(revenueChange * 100) / 100,
            ordersChange: Math.round(ordersChange * 100) / 100,
            customersChange: 0,
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                customerName: order.user?.fullName || 'Walk-in Customer',
                status: order.status,
                total: order.totalAmount,
            })),
        };
    }

    // =============================================
    // SALES ANALYTICS
    // =============================================

    async getSalesOverTime(
        period: 'daily' | 'weekly' | 'monthly' = 'daily',
        startDate?: Date,
        endDate?: Date,
    ) {
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
                status: { not: OrderStatus.CANCELLED },
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
        });

        // Group by period
        const grouped: any = {};
        orders.forEach((order) => {
            let key: string;
            const date = new Date(order.createdAt);

            if (period === 'daily') {
                key = date.toISOString().split('T')[0];
            } else if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else {
                key = date.toISOString().slice(0, 7);
            }

            if (!grouped[key]) {
                grouped[key] = { sales: 0, revenue: 0, count: 0 };
            }
            grouped[key].sales += order.totalAmount;
            grouped[key].revenue += order.totalAmount;
            grouped[key].count += 1;
        });

        return Object.entries(grouped).map(([date, data]: [string, any]) => ({
            date,
            sales: Math.round(data.sales),
            revenue: Math.round(data.revenue),
        }));
    }

    // =============================================
    // CATEGORY ANALYTICS
    // =============================================

    async getRevenueByCategory(
        period: 'daily' | 'weekly' | 'monthly' = 'daily',
        startDate?: Date,
        endDate?: Date,
    ) {
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const revenue = await this.prisma.orderItem.groupBy({
            by: ['bookId'],
            where: {
                order: {
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                    status: { not: OrderStatus.CANCELLED },
                },
            },
            _sum: {
                total: true,
                quantity: true,
            },
        });

        const bookIds = revenue.map((r) => r.bookId);
        const books = await this.prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: { id: true, categoryId: true },
        });

        const categoryMap = Object.fromEntries(
            books.map((b) => [b.id, b.categoryId]),
        );

        const categoryRevenue: any = {};
        revenue.forEach((item) => {
            const categoryId = categoryMap[item.bookId];
            if (!categoryRevenue[categoryId]) {
                categoryRevenue[categoryId] = { revenue: 0, count: 0 };
            }
            categoryRevenue[categoryId].revenue += item._sum.total || 0;
            categoryRevenue[categoryId].count += item._sum.quantity || 0;
        });

        const categories = await this.prisma.category.findMany({
            where: { id: { in: Object.keys(categoryRevenue) } },
        });

        return categories.map((cat) => ({
            category: cat.name,
            revenue: Math.round(categoryRevenue[cat.id]?.revenue || 0),
            count: categoryRevenue[cat.id]?.count || 0,
        }));
    }

    // =============================================
    // TOP PERFORMING BOOKS
    // =============================================

    async getTopBooks(limit: number = 10, startDate?: Date, endDate?: Date) {
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const topBooks = await this.prisma.orderItem.groupBy({
            by: ['bookId'],
            where: {
                order: {
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                    status: { not: OrderStatus.CANCELLED },
                },
            },
            _sum: {
                quantity: true,
                total: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        const bookIds = topBooks.map((b) => b.bookId);
        const books = await this.prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: {
                id: true,
                title: true,
                authors: { select: { name: true } },
                category: { select: { name: true } },
                coverImage: true,
                currentPrice: true,
            },
        });

        const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));

        return topBooks.map((item) => {
            const book = bookMap[item.bookId];
            return {
                bookId: item.bookId,
                title: book?.title || '',
                author: book?.authors?.[0]?.name || 'Unknown',
                category: book?.category?.name,
                coverImage: book?.coverImage,
                unitsSold: item._sum.quantity || 0,
                revenue: Math.round(item._sum.total || 0),
            };
        });
    }

    // =============================================
    // CUSTOMER ANALYTICS
    // =============================================

    async getCustomerGrowth(
        period: 'daily' | 'weekly' | 'monthly' = 'daily',
        startDate?: Date,
        endDate?: Date,
    ) {
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const customers = await this.prisma.user.findMany({
            where: {
                role: 'CUSTOMER',
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                createdAt: true,
            },
        });

        const grouped: any = {};
        customers.forEach((customer) => {
            let key: string;
            const date = new Date(customer.createdAt);

            if (period === 'daily') {
                key = date.toISOString().split('T')[0];
            } else if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else {
                key = date.toISOString().slice(0, 7);
            }

            if (!grouped[key]) {
                grouped[key] = 0;
            }
            grouped[key] += 1;
        });

        return Object.entries(grouped).map(([date, count]: [string, any]) => ({
            date,
            count,
        }));
    }

    // =============================================
    // LOW STOCK ITEMS
    // =============================================

    async getLowStockBooks() {
        return this.prisma.book.findMany({
            where: {
                stock: {
                    lt: 15,
                },
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                isbn: true,
                stock: true,
                minimumStock: true,
                coverImage: true,
            },
            orderBy: { stock: 'asc' },
            take: 20,
        });
    }

    // =============================================
    // INVENTORY VALUATION
    // =============================================

    async getInventoryValuation() {
        const books = await this.prisma.book.findMany({
            where: { isActive: true },
            select: {
                id: true,
                title: true,
                stock: true,
                currentPrice: true,
                category: {
                    select: { name: true },
                },
            },
        });

        let totalValue = 0;
        const byCategory: any = {};

        books.forEach((book) => {
            const value = book.stock * book.currentPrice;
            totalValue += value;

            const categoryName = book.category?.name || 'Uncategorized';
            if (!byCategory[categoryName]) {
                byCategory[categoryName] = 0;
            }
            byCategory[categoryName] += value;
        });

        return {
            totalBooks: books.length,
            totalValue: Math.round(totalValue),
            byCategory,
        };
    }
}
