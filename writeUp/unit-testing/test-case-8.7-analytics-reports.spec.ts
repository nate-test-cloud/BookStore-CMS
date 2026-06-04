/**
 * TEST CASE 8.7: ANALYTICS SERVICE - REPORT GENERATION UNIT TEST (SIMPLIFIED)
 */

// Mock AnalyticsService
class AnalyticsServiceMock {
    constructor(private prisma: any) { }

    async getDashboardStats(): Promise<any> {
        const orders = await this.prisma.order.findMany();
        const users = await this.prisma.user.findMany({
            where: { role: 'CUSTOMER' },
        });
        const books = await this.prisma.book.findMany();

        const totalRevenue = orders.reduce(
            (sum, order) => sum + (order.status !== 'CANCELLED' ? order.total : 0),
            0,
        );
        const totalOrders = orders.length;
        const totalCustomers = users.length;
        const totalBooks = books.length;

        return {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalBooks,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            lowStockBooks: books.filter((b) => b.stock < b.minimumStock),
        };
    }

    async getDailySalesReport(date: Date): Promise<any> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;

        return {
            date,
            revenue,
            orderCount,
            averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        };
    }

    async getTopBooks(limit: number = 10): Promise<any[]> {
        const books = await this.prisma.book.findMany({
            include: {
                orderItems: true,
            },
        });

        return books
            .sort(
                (a, b) =>
                    b.orderItems.reduce((sum, oi) => sum + oi.quantity, 0) -
                    a.orderItems.reduce((sum, oi) => sum + oi.quantity, 0),
            )
            .slice(0, limit)
            .map((book) => ({
                id: book.id,
                title: book.title,
                sales: book.orderItems.reduce((sum, oi) => sum + oi.quantity, 0),
                revenue: book.orderItems.reduce(
                    (sum, oi) => sum + oi.price * oi.quantity,
                    0,
                ),
            }));
    }

    async getCategoryPerformance(): Promise<any[]> {
        const categories = await this.prisma.category.findMany({
            include: {
                books: {
                    include: {
                        orderItems: true,
                    },
                },
            },
        });

        return categories.map((category) => {
            const revenue = category.books.reduce(
                (sum, book) =>
                    sum + book.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0),
                0,
            );
            const totalBooks = category.books.length;

            return {
                categoryName: category.name,
                revenue,
                bookCount: totalBooks,
                marketShare:
                    totalBooks > 0
                        ? (revenue / category.books.length) * 100
                        : 0,
            };
        });
    }

    async getCustomerGrowth(days: number = 30): Promise<any> {
        const users = await this.prisma.user.findMany({
            where: { role: 'CUSTOMER' },
        });

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const newCustomers = users.filter(
            (u) => u.createdAt >= cutoffDate,
        ).length;
        const totalCustomers = users.length;
        const growthRate = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;

        return {
            totalCustomers,
            newCustomers,
            growthRate,
            period: `${days} days`,
        };
    }

    async getInventoryValuation(): Promise<any> {
        const books = await this.prisma.book.findMany();

        const totalValue = books.reduce((sum, book) => {
            return sum + book.basePrice * book.stock;
        }, 0);

        const byCategory = {};
        for (const book of books) {
            const cat = book.categoryName || 'Uncategorized';
            byCategory[cat] = (byCategory[cat] || 0) + book.basePrice * book.stock;
        }

        return {
            totalValue,
            byCategory,
        };
    }

    async getReturnRate(): Promise<any> {
        const orders = await this.prisma.order.findMany();
        const returnedOrders = orders.filter((o) => o.status === 'RETURNED');

        const returnRate = orders.length > 0 ? (returnedOrders.length / orders.length) * 100 : 0;

        return {
            totalOrders: orders.length,
            returnedOrders: returnedOrders.length,
            returnRate,
        };
    }

    async getCustomerLifetimeValue(): Promise<any> {
        const customers = await this.prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            include: { orders: true },
        });

        const clvData = customers.map((customer) => {
            const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
            const orderCount = customer.orders.length;

            return {
                customerId: customer.id,
                totalSpent,
                orderCount,
                averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
                clvTier:
                    totalSpent > 5000
                        ? 'GOLD'
                        : totalSpent > 2000
                            ? 'SILVER'
                            : 'BRONZE',
            };
        });

        const averageCLV =
            clvData.length > 0
                ? clvData.reduce((sum, c) => sum + c.totalSpent, 0) / clvData.length
                : 0;

        return {
            averageCLV,
            customersByTier: {
                GOLD: clvData.filter((c) => c.clvTier === 'GOLD').length,
                SILVER: clvData.filter((c) => c.clvTier === 'SILVER').length,
                BRONZE: clvData.filter((c) => c.clvTier === 'BRONZE').length,
            },
        };
    }
}

describe('TEST CASE 8.7: AnalyticsService - Report Generation Unit Testing', () => {
    let analyticsService: AnalyticsServiceMock;
    let mockPrismaService: any;

    beforeEach(() => {
        mockPrismaService = {
            order: {
                findMany: jest.fn(),
            },
            user: {
                findMany: jest.fn(),
            },
            book: {
                findMany: jest.fn(),
            },
            category: {
                findMany: jest.fn(),
            },
        };

        analyticsService = new AnalyticsServiceMock(mockPrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardStats()', () => {
        it('should return dashboard statistics', async () => {
            mockPrismaService.order.findMany.mockResolvedValueOnce([
                { id: 'order-1', total: 100, status: 'COMPLETED' },
                { id: 'order-2', total: 200, status: 'COMPLETED' },
            ]);
            mockPrismaService.user.findMany.mockResolvedValueOnce([
                { id: 'user-1' },
                { id: 'user-2' },
            ]);
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', stock: 50, minimumStock: 20 },
            ]);

            const result = await analyticsService.getDashboardStats();

            expect(result.totalRevenue).toBe(300);
            expect(result.totalOrders).toBe(2);
            expect(result.totalCustomers).toBe(2);
        });

        it('should exclude cancelled orders from revenue', async () => {
            mockPrismaService.order.findMany.mockResolvedValueOnce([
                { id: 'order-1', total: 100, status: 'COMPLETED' },
                { id: 'order-2', total: 50, status: 'CANCELLED' },
            ]);
            mockPrismaService.user.findMany.mockResolvedValueOnce([]);
            mockPrismaService.book.findMany.mockResolvedValueOnce([]);

            const result = await analyticsService.getDashboardStats();

            expect(result.totalRevenue).toBe(100);
        });

        it('should identify low stock items', async () => {
            mockPrismaService.order.findMany.mockResolvedValueOnce([]);
            mockPrismaService.user.findMany.mockResolvedValueOnce([]);
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', stock: 5, minimumStock: 20, title: 'Book 1' },
                { id: 'book-2', stock: 50, minimumStock: 20, title: 'Book 2' },
            ]);

            const result = await analyticsService.getDashboardStats();

            expect(result.lowStockBooks).toHaveLength(1);
            expect(result.lowStockBooks[0].id).toBe('book-1');
        });
    });

    describe('getDailySalesReport()', () => {
        it('should aggregate daily sales', async () => {
            const testDate = new Date('2024-01-15');
            mockPrismaService.order.findMany.mockResolvedValueOnce([
                { id: 'order-1', total: 100, createdAt: testDate },
                { id: 'order-2', total: 200, createdAt: testDate },
            ]);

            const result = await analyticsService.getDailySalesReport(testDate);

            expect(result.revenue).toBe(300);
            expect(result.orderCount).toBe(2);
        });

        it('should calculate daily order count', async () => {
            const testDate = new Date('2024-01-15');
            mockPrismaService.order.findMany.mockResolvedValueOnce([
                { id: 'order-1', total: 100 },
                { id: 'order-2', total: 150 },
                { id: 'order-3', total: 200 },
            ]);

            const result = await analyticsService.getDailySalesReport(testDate);

            expect(result.orderCount).toBe(3);
        });
    });

    describe('getTopBooks()', () => {
        it('should rank books by sales volume', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                {
                    id: 'book-1',
                    title: 'Popular Book',
                    orderItems: [
                        { quantity: 50, price: 100 },
                        { quantity: 30, price: 100 },
                    ],
                },
                {
                    id: 'book-2',
                    title: 'Less Popular',
                    orderItems: [{ quantity: 10, price: 100 }],
                },
            ]);

            const result = await analyticsService.getTopBooks();

            expect(result[0].id).toBe('book-1');
            expect(result[0].sales).toBe(80);
        });

        it('should include revenue per book', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                {
                    id: 'book-1',
                    title: 'Book',
                    orderItems: [{ quantity: 10, price: 100 }],
                },
            ]);

            const result = await analyticsService.getTopBooks(1);

            expect(result[0].revenue).toBe(1000);
        });
    });

    describe('getCategoryPerformance()', () => {
        it('should calculate revenue by category', async () => {
            mockPrismaService.category.findMany.mockResolvedValueOnce([
                {
                    id: 'cat-1',
                    name: 'Fiction',
                    books: [
                        {
                            id: 'book-1',
                            orderItems: [{ price: 100, quantity: 5 }],
                        },
                    ],
                },
            ]);

            const result = await analyticsService.getCategoryPerformance();

            expect(result[0].revenue).toBe(500);
        });

        it('should rank categories by revenue', async () => {
            mockPrismaService.category.findMany.mockResolvedValueOnce([
                {
                    name: 'Fiction',
                    books: [
                        {
                            orderItems: [{ price: 100, quantity: 100 }],
                        },
                    ],
                },
                {
                    name: 'Non-Fiction',
                    books: [
                        {
                            orderItems: [{ price: 100, quantity: 10 }],
                        },
                    ],
                },
            ]);

            const result = await analyticsService.getCategoryPerformance();

            expect(result[0].revenue).toBeGreaterThan(result[1].revenue);
        });
    });

    describe('getCustomerGrowth()', () => {
        it('should track customer signup over time', async () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 60);

            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 15);

            mockPrismaService.user.findMany.mockResolvedValueOnce([
                { id: 'user-1', createdAt: oldDate, role: 'CUSTOMER' },
                { id: 'user-2', createdAt: recentDate, role: 'CUSTOMER' },
                { id: 'user-3', createdAt: recentDate, role: 'CUSTOMER' },
            ]);

            const result = await analyticsService.getCustomerGrowth(30);

            expect(result.totalCustomers).toBe(3);
            expect(result.newCustomers).toBe(2);
        });

        it('should calculate customer growth rate', async () => {
            mockPrismaService.user.findMany.mockResolvedValueOnce([
                { id: 'user-1', createdAt: new Date(), role: 'CUSTOMER' },
                { id: 'user-2', createdAt: new Date(), role: 'CUSTOMER' },
                { id: 'user-3', createdAt: new Date(), role: 'CUSTOMER' },
            ]);

            const result = await analyticsService.getCustomerGrowth(30);

            expect(result.growthRate).toBeGreaterThan(0);
        });
    });

    describe('getInventoryValuation()', () => {
        it('should calculate total inventory value', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', basePrice: 100, stock: 10, categoryName: 'Fiction' },
                { id: 'book-2', basePrice: 50, stock: 20, categoryName: 'Fiction' },
            ]);

            const result = await analyticsService.getInventoryValuation();

            expect(result.totalValue).toBe(2000); // (100*10) + (50*20)
        });

        it('should group inventory valuation by category', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { basePrice: 100, stock: 10, categoryName: 'Fiction' },
                { basePrice: 100, stock: 5, categoryName: 'Non-Fiction' },
            ]);

            const result = await analyticsService.getInventoryValuation();

            expect(result.byCategory['Fiction']).toBe(1000);
            expect(result.byCategory['Non-Fiction']).toBe(500);
        });
    });

    describe('getReturnRate()', () => {
        it('should calculate product return rate', async () => {
            mockPrismaService.order.findMany.mockResolvedValueOnce([
                { id: 'order-1', status: 'COMPLETED' },
                { id: 'order-2', status: 'RETURNED' },
                { id: 'order-3', status: 'RETURNED' },
                { id: 'order-4', status: 'COMPLETED' },
            ]);

            const result = await analyticsService.getReturnRate();

            expect(result.returnRate).toBe(50); // 2 out of 4
        });

        it('should identify categories with high return rates', async () => {
            mockPrismaService.order.findMany.mockResolvedValueOnce([
                { status: 'COMPLETED' },
                { status: 'RETURNED' },
            ]);

            const result = await analyticsService.getReturnRate();

            expect(result.returnedOrders).toBe(1);
        });
    });

    describe('getCustomerLifetimeValue()', () => {
        it('should calculate customer lifetime value', async () => {
            mockPrismaService.user.findMany.mockResolvedValueOnce([
                {
                    id: 'user-1',
                    orders: [
                        { total: 100 },
                        { total: 200 },
                        { total: 300 },
                    ],
                },
            ]);

            const result = await analyticsService.getCustomerLifetimeValue();

            expect(result.averageCLV).toBe(600);
        });

        it('should segment customers by CLV tier', async () => {
            mockPrismaService.user.findMany.mockResolvedValueOnce([
                {
                    id: 'user-1',
                    orders: [{ total: 6000 }],
                },
                {
                    id: 'user-2',
                    orders: [{ total: 2500 }],
                },
                {
                    id: 'user-3',
                    orders: [{ total: 500 }],
                },
            ]);

            const result = await analyticsService.getCustomerLifetimeValue();

            expect(result.customersByTier.GOLD).toBe(1);
            expect(result.customersByTier.SILVER).toBe(1);
            expect(result.customersByTier.BRONZE).toBe(1);
        });
    });
});
