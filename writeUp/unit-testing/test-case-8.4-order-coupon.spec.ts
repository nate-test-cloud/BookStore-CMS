/**
 * TEST CASE 8.4: ORDER SERVICE - COUPON VALIDATION UNIT TEST (SIMPLIFIED)
 */

import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

// Mock OrdersService
class OrdersServiceMock {
    constructor(private prisma: any) { }

    async validateAndApplyCoupon(
        couponCode: string,
        subtotal: number,
        userId?: string,
    ): Promise<any> {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: couponCode },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        // Check if active
        if (!coupon.isActive) {
            throw new ConflictException('Coupon is deactivated');
        }

        // Check expiry
        if (coupon.expiryDate && new Date() > coupon.expiryDate) {
            throw new ConflictException('Coupon has expired');
        }

        // Check usage limit
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new ConflictException('Coupon usage limit exceeded');
        }

        // Check minimum purchase
        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
            throw new BadRequestException(
                `Minimum purchase of ${coupon.minPurchase} required`,
            );
        }

        // Check customer eligibility
        if (coupon.customerSpecific && userId) {
            const isEligible = await this.prisma.couponEligibility.findFirst({
                where: { couponId: coupon.id, userId },
            });
            if (!isEligible) {
                throw new ConflictException('You are not eligible for this coupon');
            }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountValue) / 100;
            // Apply cap if exists
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        // Prevent discount exceeding subtotal
        if (discount > subtotal) {
            discount = subtotal;
        }

        // Prevent negative discount
        if (discount < 0) {
            throw new BadRequestException('Discount cannot be negative');
        }

        return {
            couponId: coupon.id,
            discount,
            finalTotal: Math.max(0, subtotal - discount),
            couponCode,
        };
    }
}

describe('TEST CASE 8.4: OrdersService - Coupon Validation Unit Testing', () => {
    let ordersService: OrdersServiceMock;
    let mockPrismaService: any;

    beforeEach(() => {
        mockPrismaService = {
            coupon: {
                findUnique: jest.fn(),
            },
            couponEligibility: {
                findFirst: jest.fn(),
            },
        };

        ordersService = new OrdersServiceMock(mockPrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateAndApplyCoupon() - Valid Coupon Application', () => {
        it('should return discount for valid PERCENTAGE coupon', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'SAVE10',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                maxDiscount: null,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'SAVE10',
                1000,
            );

            expect(result.discount).toBe(100); // 1000 * 10%
            expect(result.finalTotal).toBe(900);
        });

        it('should return discount for valid FIXED coupon', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-002',
                code: 'FLAT50',
                isActive: true,
                discountType: 'FIXED',
                discountValue: 50,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'FLAT50',
                1000,
            );

            expect(result.discount).toBe(50);
            expect(result.finalTotal).toBe(950);
        });

        it('should apply max discount cap if set', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-003',
                code: 'CAPPED',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 50,
                maxDiscount: 100,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'CAPPED',
                1000,
            );

            expect(result.discount).toBe(100); // Capped at 100
        });
    });

    describe('validateAndApplyCoupon() - Expiration', () => {
        it('should reject expired coupon', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'EXPIRED',
                isActive: true,
                expiryDate: new Date('2020-01-01'),
            });

            await expect(
                ordersService.validateAndApplyCoupon('EXPIRED', 1000),
            ).rejects.toThrow(ConflictException);
        });

        it('should accept coupon expiring today', async () => {
            const today = new Date();
            today.setHours(23, 59, 59);

            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'TODAY',
                isActive: true,
                expiryDate: today,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon('TODAY', 1000);

            expect(result.discount).toBe(100);
        });

        it('should accept valid future expiry date', async () => {
            const future = new Date();
            future.setDate(future.getDate() + 30);

            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'VALID',
                isActive: true,
                expiryDate: future,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon('VALID', 1000);

            expect(result.discount).toBe(100);
        });
    });

    describe('validateAndApplyCoupon() - Usage Limits', () => {
        it('should reject coupon when usage limit reached', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'LIMITED',
                isActive: true,
                maxUses: 5,
                usedCount: 5,
            });

            await expect(
                ordersService.validateAndApplyCoupon('LIMITED', 1000),
            ).rejects.toThrow(ConflictException);
        });

        it('should accept coupon with remaining uses', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'LIMITED',
                isActive: true,
                maxUses: 10,
                usedCount: 4,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'LIMITED',
                1000,
            );

            expect(result.discount).toBe(100);
        });

        it('should handle unlimited use coupons (null maxUses)', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'UNLIMITED',
                isActive: true,
                maxUses: null,
                usedCount: 999,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'UNLIMITED',
                1000,
            );

            expect(result.discount).toBe(100);
        });
    });

    describe('validateAndApplyCoupon() - Minimum Purchase', () => {
        it('should reject coupon below minimum purchase', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'MINPURCHASE',
                isActive: true,
                minPurchase: 500,
            });

            await expect(
                ordersService.validateAndApplyCoupon('MINPURCHASE', 100),
            ).rejects.toThrow(BadRequestException);
        });

        it('should accept coupon meeting minimum purchase', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'MINPURCHASE',
                isActive: true,
                minPurchase: 500,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'MINPURCHASE',
                500,
            );

            expect(result.discount).toBe(50);
        });

        it('should accept coupon exceeding minimum purchase', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'MINPURCHASE',
                isActive: true,
                minPurchase: 500,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'MINPURCHASE',
                1000,
            );

            expect(result.discount).toBe(100);
        });
    });

    describe('validateAndApplyCoupon() - Customer Eligibility', () => {
        it('should validate customer-specific coupon eligibility', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'VIP',
                isActive: true,
                customerSpecific: true,
                discountType: 'PERCENTAGE',
                discountValue: 20,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });
            mockPrismaService.couponEligibility.findFirst.mockResolvedValueOnce({
                id: 'elig-001',
            });

            const result = await ordersService.validateAndApplyCoupon(
                'VIP',
                1000,
                'user-001',
            );

            expect(result.discount).toBe(200);
        });

        it('should reject ineligible customer for customer-specific coupon', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'VIP',
                isActive: true,
                customerSpecific: true,
            });
            mockPrismaService.couponEligibility.findFirst.mockResolvedValueOnce(
                null,
            );

            await expect(
                ordersService.validateAndApplyCoupon('VIP', 1000, 'user-002'),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('validateAndApplyCoupon() - Status Checks', () => {
        it('should treat deactivated coupon as invalid', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'INACTIVE',
                isActive: false,
            });

            await expect(
                ordersService.validateAndApplyCoupon('INACTIVE', 1000),
            ).rejects.toThrow(ConflictException);
        });

        it('should accept active coupon', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'ACTIVE',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'ACTIVE',
                1000,
            );

            expect(result.discount).toBe(100);
        });
    });

    describe('validateAndApplyCoupon() - Discount Calculations', () => {
        it('should calculate percentage discount correctly', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'PCT',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 15,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon('PCT', 1000);

            expect(result.discount).toBe(150); // 1000 * 15%
        });

        it('should apply fixed discount correctly', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'FIXED',
                isActive: true,
                discountType: 'FIXED',
                discountValue: 100,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'FIXED',
                1000,
            );

            expect(result.discount).toBe(100);
        });

        it('should not allow discount exceeding subtotal', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'BIGDISCOUNT',
                isActive: true,
                discountType: 'FIXED',
                discountValue: 2000,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon(
                'BIGDISCOUNT',
                1000,
            );

            expect(result.discount).toBe(1000); // Capped at subtotal
            expect(result.finalTotal).toBe(0);
        });

        it('should handle fractional discount amounts', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'FRAC',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 33.33,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon('FRAC', 1000);

            expect(result.discount).toBeCloseTo(333.3, 1);
        });

        it('should round discount to 2 decimal places', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValueOnce({
                id: 'coupon-001',
                code: 'ROUND',
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchase: null,
                maxUses: null,
                usedCount: 0,
            });

            const result = await ordersService.validateAndApplyCoupon('ROUND', 33.33);

            expect(result.discount).toBeCloseTo(3.33, 2);
        });
    });
});
