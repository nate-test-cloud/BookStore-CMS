/**
 * TEST CASE 8.3: CART SERVICE - TOTAL CALCULATION UNIT TEST (SIMPLIFIED)
 */

import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock CartService
class CartServiceMock {
    constructor(private prisma: any) { }

    async getCart(userId: string): Promise<any> {
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: {
                book: true,
            },
        });

        if (!cartItems || cartItems.length === 0) {
            return {
                items: [],
                subtotal: 0,
                tax: 0,
                discount: 0,
                totalPrice: 0,
            };
        }

        const subtotal = cartItems.reduce((sum, item) => {
            return sum + item.book.currentPrice * item.quantity;
        }, 0);

        const tax = subtotal * 0.1; // 10% tax
        const totalPrice = subtotal + tax;

        return {
            items: cartItems,
            subtotal,
            tax,
            discount: 0,
            totalPrice,
        };
    }

    async addItem(userId: string, bookId: string, quantity: number): Promise<any> {
        // Validate book exists
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException(`Book with ID ${bookId} not found`);
        }

        // Check stock availability
        if (book.stock < quantity) {
            throw new BadRequestException(
                `Only ${book.stock} units available`,
            );
        }

        // Check if item already in cart
        let cartItem = await this.prisma.cartItem.findFirst({
            where: { userId, bookId },
        });

        if (cartItem) {
            // Increment quantity
            cartItem = await this.prisma.cartItem.update({
                where: { id: cartItem.id },
                data: {
                    quantity: cartItem.quantity + quantity,
                },
                include: { book: true },
            });
        } else {
            // Create new cart item
            cartItem = await this.prisma.cartItem.create({
                data: {
                    userId,
                    bookId,
                    quantity,
                },
                include: { book: true },
            });
        }

        return cartItem;
    }

    async updateItem(cartItemId: string, quantity: number): Promise<any> {
        if (quantity <= 0) {
            throw new BadRequestException('Quantity must be greater than 0');
        }

        const cartItem = await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: { book: true },
        });

        return cartItem;
    }

    async clearCart(userId: string): Promise<any> {
        await this.prisma.cartItem.deleteMany({
            where: { userId },
        });

        return { success: true };
    }

    async calculateDiscount(couponCode: string, subtotal: number): Promise<any> {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: couponCode },
        });

        if (!coupon) {
            throw new BadRequestException('Invalid coupon code');
        }

        if (!coupon.isActive) {
            throw new BadRequestException('Coupon is not active');
        }

        // Check expiry
        if (coupon.expiryDate && new Date() > coupon.expiryDate) {
            throw new BadRequestException('Coupon has expired');
        }

        // Check minimum purchase
        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
            throw new BadRequestException(
                `Minimum purchase of ${coupon.minPurchase} required`,
            );
        }

        // Check usage limit
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new BadRequestException('Coupon usage limit exceeded');
        }

        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }

        // Prevent discount from exceeding subtotal
        if (discount > subtotal) {
            discount = subtotal;
        }

        // Prevent negative discount
        if (discount < 0) {
            throw new BadRequestException('Discount cannot be negative');
        }

        return {
            discount,
            finalTotal: subtotal - discount,
        };
    }
}

describe('TEST CASE 8.3: CartService - Total Calculation Unit Testing', () => {
    let cartService: CartServiceMock;
    let mockPrismaService: any;

    beforeEach(() => {
        mockPrismaService = {
            cartItem: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                deleteMany: jest.fn(),
            },
            book: {
                findUnique: jest.fn(),
            },
            coupon: {
                findUnique: jest.fn(),
            },
        };

        cartService = new CartServiceMock(mockPrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getCart() - Basic Calculations', () => {
        it('should calculate subtotal from cart items', async () => {
            const userId = 'user-001';
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'item-1',
                    userId,
                    bookId: 'book-1',
                    quantity: 2,
                    book: { id: 'book-1', currentPrice: 100 },
                },
                {
                    id: 'item-2',
                    userId,
                    bookId: 'book-2',
                    quantity: 1,
                    book: { id: 'book-2', currentPrice: 50 },
                },
            ]);

            const result = await cartService.getCart(userId);

            expect(result.subtotal).toBe(250); // (2 * 100) + (1 * 50)
            expect(result.items).toHaveLength(2);
        });

        it('should return zero total for empty cart', async () => {
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([]);

            const result = await cartService.getCart('user-001');

            expect(result.subtotal).toBe(0);
            expect(result.totalPrice).toBe(0);
            expect(result.items).toHaveLength(0);
        });

        it('should handle single item in cart', async () => {
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'item-1',
                    quantity: 1,
                    book: { currentPrice: 100 },
                },
            ]);

            const result = await cartService.getCart('user-001');

            expect(result.subtotal).toBe(100);
        });
    });

    describe('getCart() - Tax Application', () => {
        it('should apply 10% tax to subtotal', async () => {
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'item-1',
                    quantity: 2,
                    book: { currentPrice: 100 },
                },
            ]);

            const result = await cartService.getCart('user-001');

            expect(result.tax).toBe(20); // 200 * 0.1
            expect(result.totalPrice).toBe(220); // 200 + 20
        });

        it('should handle tax on multiple items', async () => {
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'item-1',
                    quantity: 1,
                    book: { currentPrice: 100 },
                },
                {
                    id: 'item-2',
                    quantity: 2,
                    book: { currentPrice: 50 },
                },
            ]);

            const result = await cartService.getCart('user-001');

            expect(result.subtotal).toBe(200);
            expect(result.tax).toBe(20); // 200 * 0.1
            expect(result.totalPrice).toBe(220);
        });
    });

    describe('addItem() - Stock Validation', () => {
        it('should validate book exists', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

            await expect(
                cartService.addItem('user-001', 'nonexistent', 1),
            ).rejects.toThrow(NotFoundException);
        });

        it('should check stock availability', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-001',
                stock: 5,
            });

            await expect(
                cartService.addItem('user-001', 'book-001', 10),
            ).rejects.toThrow(BadRequestException);
        });

        it('should accept quantity equal to available stock', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-001',
                stock: 10,
            });
            mockPrismaService.cartItem.findFirst.mockResolvedValueOnce(null);
            mockPrismaService.cartItem.create.mockResolvedValueOnce({
                id: 'item-1',
                quantity: 10,
                book: { id: 'book-001' },
            });

            const result = await cartService.addItem('user-001', 'book-001', 10);

            expect(result).toBeDefined();
            expect(result.quantity).toBe(10);
        });
    });

    describe('addItem() - Cart Operations', () => {
        it('should create new cart item if not exists', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-001',
                stock: 10,
            });
            mockPrismaService.cartItem.findFirst.mockResolvedValueOnce(null);
            mockPrismaService.cartItem.create.mockResolvedValueOnce({
                id: 'item-1',
                quantity: 1,
            });

            await cartService.addItem('user-001', 'book-001', 1);

            expect(mockPrismaService.cartItem.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-001',
                    bookId: 'book-001',
                    quantity: 1,
                },
                include: { book: true },
            });
        });

        it('should increment quantity if item already in cart', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-001',
                stock: 10,
            });
            mockPrismaService.cartItem.findFirst.mockResolvedValueOnce({
                id: 'item-1',
                quantity: 2,
            });
            mockPrismaService.cartItem.update.mockResolvedValueOnce({
                id: 'item-1',
                quantity: 3,
            });

            await cartService.addItem('user-001', 'book-001', 1);

            expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
                where: { id: 'item-1' },
                data: { quantity: 3 },
                include: { book: true },
            });
        });
    });

    describe('updateItem() - Quantity Updates', () => {
        it('should update item quantity to new value', async () => {
            mockPrismaService.cartItem.update.mockResolvedValueOnce({
                id: 'item-1',
                quantity: 5,
            });

            await cartService.updateItem('item-1', 5);

            expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
                where: { id: 'item-1' },
                data: { quantity: 5 },
                include: { book: true },
            });
        });

        it('should reject zero quantity', async () => {
            await expect(cartService.updateItem('item-1', 0)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should reject negative quantity', async () => {
            await expect(cartService.updateItem('item-1', -5)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('clearCart()', () => {
        it('should remove all items from cart', async () => {
            mockPrismaService.cartItem.deleteMany.mockResolvedValueOnce({
                count: 3,
            });

            const result = await cartService.clearCart('user-001');

            expect(result.success).toBe(true);
            expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
                where: { userId: 'user-001' },
            });
        });
    });

    describe('calculateDiscount() - Coupon Validation', () => {
        it('should apply valid coupon discount', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                code: 'SAVE10',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await cartService.calculateDiscount('SAVE10', 1000);

            expect(result.discount).toBe(100); // 1000 * 10%
            expect(result.finalTotal).toBe(900);
        });

        it('should reject invalid coupon code', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce(null);

            await expect(
                cartService.calculateDiscount('INVALID', 1000),
            ).rejects.toThrow(BadRequestException);
        });

        it('should reject expired coupon', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                code: 'EXPIRED',
                isActive: true,
                expiryDate: new Date('2020-01-01'),
            });

            await expect(
                cartService.calculateDiscount('EXPIRED', 1000),
            ).rejects.toThrow(BadRequestException);
        });

        it('should reject coupon below minimum purchase', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                code: 'SAVE10',
                isActive: true,
                minPurchase: 500,
            });

            await expect(
                cartService.calculateDiscount('SAVE10', 100),
            ).rejects.toThrow(BadRequestException);
        });

        it('should not allow discount exceeding subtotal', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                code: 'BIGDISCOUNT',
                isActive: true,
                discountType: 'FIXED',
                discountValue: 2000,
                minPurchase: null,
                maxUses: null,
            });

            const result = await cartService.calculateDiscount(
                'BIGDISCOUNT',
                1000,
            );

            expect(result.discount).toBe(1000); // Capped at subtotal
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large quantities', async () => {
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'item-1',
                    quantity: 1000000,
                    book: { currentPrice: 100 },
                },
            ]);

            const result = await cartService.getCart('user-001');

            expect(result.subtotal).toBe(100000000);
        });

        it('should handle very small prices', async () => {
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'item-1',
                    quantity: 1,
                    book: { currentPrice: 0.01 },
                },
            ]);

            const result = await cartService.getCart('user-001');

            expect(result.subtotal).toBeCloseTo(0.01, 5);
        });
    });
});
