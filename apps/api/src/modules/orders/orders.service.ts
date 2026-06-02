import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, PaymentStatus, DiscountType } from '@prisma/client';
import {
    CreateOrderDto,
    UpdateOrderStatusDto,
    ApplyCouponDto,
    CreateReturnDto,
    ApproveReturnDto,
    CreateCouponDto,
    UpdateCouponDto,
} from './dto/order.dto';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    // =============================================
    // ORDER MANAGEMENT
    // =============================================

    async createOrder(createOrderDto: CreateOrderDto, userId: string) {
        const { items, couponId, membershipDiscount, shippingCost, ...orderData } = createOrderDto;

        // Validate items exist and check stock
        const bookIds = items.map((item) => item.bookId);
        const books = await this.prisma.book.findMany({
            where: { id: { in: bookIds } },
        });

        if (books.length !== bookIds.length) {
            throw new NotFoundException('One or more books not found');
        }

        // Check stock availability
        for (const item of items) {
            const book = books.find((b) => b.id === item.bookId);
            if (!book || book.stock < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for book: ${book?.title}`,
                );
            }
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems: any[] = [];

        for (const item of items) {
            const book = books.find((b) => b.id === item.bookId);
            if (!book) {
                throw new NotFoundException(`Book with ID ${item.bookId} not found`);
            }
            const itemTotal = book.currentPrice * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                bookId: item.bookId,
                quantity: item.quantity,
                unitPrice: book.currentPrice,
                discount: item.discount || 0,
                total: itemTotal - (item.discount || 0),
            });
        }

        // Apply coupon discount if provided
        let couponDiscount = 0;
        let appliedCoupon: any = null;

        if (couponId) {
            appliedCoupon = await this.prisma.coupon.findUnique({
                where: { id: couponId },
            });

            if (!appliedCoupon) {
                throw new NotFoundException('Coupon not found');
            }

            if (!appliedCoupon.isActive || appliedCoupon.expiryDate < new Date()) {
                throw new BadRequestException('Coupon is not valid');
            }

            if (appliedCoupon.usageCount >= (appliedCoupon.maxUses || Infinity)) {
                throw new BadRequestException('Coupon usage limit exceeded');
            }

            if (appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) {
                throw new BadRequestException(
                    `Minimum purchase amount ${appliedCoupon.minPurchase} not met`,
                );
            }

            if (appliedCoupon.discountType === DiscountType.PERCENTAGE) {
                couponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
                if (appliedCoupon.maxDiscount) {
                    couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscount);
                }
            } else {
                couponDiscount = appliedCoupon.discountValue;
            }
        }

        // Get tax settings
        const storeSettings = await this.prisma.storeSettings.findFirst();
        const taxRate = storeSettings?.gstRate || 18;
        const discountAmount = couponDiscount + (membershipDiscount || 0);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * taxRate) / 100;
        const totalAmount = taxableAmount + taxAmount + (shippingCost || 0);

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order with items
        const order = await this.prisma.order.create({
            data: {
                ...orderData,
                orderNumber,
                userId,
                subtotal,
                taxAmount,
                discountAmount,
                shippingCost: shippingCost || 0,
                totalAmount,
                couponId: couponId || null,
                membershipDiscount: membershipDiscount || 0,
                items: {
                    create: orderItems as any,
                },
            },
            include: {
                items: { include: { book: true } },
                coupon: true,
                user: true,
            },
        });

        // Update coupon usage if applied
        if (appliedCoupon) {
            await this.prisma.coupon.update({
                where: { id: couponId },
                data: { usageCount: { increment: 1 } },
            });
        }

        // Decrease book stock
        for (const item of items) {
            await this.prisma.book.update({
                where: { id: item.bookId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        return order;
    }

    async getOrders(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                skip,
                take: limit,
                include: {
                    items: { include: { book: true } },
                    coupon: true,
                    transactions: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where: { userId } }),
        ]);

        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getOrder(id: string, userId?: string) {
        const where: any = { id };
        if (userId) {
            where.userId = userId;
        }

        const order = await this.prisma.order.findUnique({
            where,
            include: {
                items: { include: { book: true } },
                coupon: true,
                user: true,
                transactions: true,
                invoices: true,
                returns: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: updateDto.status,
                ...(updateDto.status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
                ...(updateDto.status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
                ...(updateDto.status === OrderStatus.CANCELLED && { cancelledAt: new Date() }),
            },
            include: {
                items: { include: { book: true } },
                transactions: true,
            },
        });

        return updatedOrder;
    }

    async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: true,
                    items: { include: { book: true } },
                    transactions: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        // Transform orders to match API schema
        // Helper function to generate numeric ID from cuid with better hashing
        const generateNumericId = (cuid: string): number => {
            let hash = 0;
            for (let i = 0; i < cuid.length; i++) {
                const char = cuid.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash) % 10000000; // Ensure positive number
        };

        const transformedOrders = orders.map((order) => ({
            id: generateNumericId(order.id), // Convert cuid to numeric ID
            customerId: generateNumericId(order.userId),
            customerName: order.user?.fullName || 'Unknown',
            status: order.status,
            total: order.totalAmount,
            subtotal: order.subtotal,
            discount: order.discountAmount,
            tax: order.taxAmount,
            paymentMethod: order.paymentStatus,
            notes: order.notes,
            items: order.items.map((item) => ({
                id: generateNumericId(item.id),
                orderId: generateNumericId(order.id),
                bookId: generateNumericId(item.bookId),
                bookTitle: item.book?.title || 'Unknown',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
            })),
            createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: order.updatedAt?.toISOString() || null,
        }));

        return {
            data: transformedOrders,
            total,
            page,
            limit,
        };
    }

    // =============================================
    // RETURNS & REFUNDS
    // =============================================

    async createReturn(orderId: string, createReturnDto: CreateReturnDto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status === OrderStatus.RETURNED || order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cannot return this order');
        }

        const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        return this.prisma.return.create({
            data: {
                returnNumber,
                orderId,
                reason: createReturnDto.reason as any,
                description: createReturnDto.description,
                status: 'PENDING' as any,
                refundAmount: order.totalAmount,
            },
        });
    }

    async getReturns(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [returns, total] = await Promise.all([
            this.prisma.return.findMany({
                skip,
                take: limit,
                include: { order: { include: { user: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.return.count(),
        ]);

        return {
            returns,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async approveReturn(returnId: string, approveDto: ApproveReturnDto) {
        const return_ = await this.prisma.return.findUnique({
            where: { id: returnId },
            include: { order: { include: { items: true } } },
        });

        if (!return_) {
            throw new NotFoundException('Return not found');
        }

        // Update order status
        await this.prisma.order.update({
            where: { id: return_.orderId },
            data: { status: OrderStatus.RETURNED },
        });

        // Restore stock
        for (const item of return_.order.items) {
            await this.prisma.book.update({
                where: { id: item.bookId },
                data: { stock: { increment: item.quantity } },
            });
        }

        // Create refund transaction
        const transactionId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        await this.prisma.transaction.create({
            data: {
                transactionId,
                orderId: return_.orderId,
                userId: return_.order.userId,
                amount: approveDto.refundAmount,
                method: return_.order.paymentMethod,
                status: 'SUCCESS' as any,
                notes: approveDto.notes,
            },
        });

        return this.prisma.return.update({
            where: { id: returnId },
            data: {
                status: 'REFUNDED' as any,
                refundedAt: new Date(),
            },
        });
    }

    // =============================================
    // COUPONS
    // =============================================

    async createCoupon(createCouponDto: CreateCouponDto) {
        const {
            code,
            startDate,
            expiryDate,
            discountType,
            description,
            discountValue,
            maxDiscount,
            minPurchase,
            maxUses,
            maxUsesPerUser,
        } = createCouponDto;

        const existingCoupon = await this.prisma.coupon.findUnique({
            where: { code },
        });

        if (existingCoupon) {
            throw new ConflictException('Coupon code already exists');
        }

        return this.prisma.coupon.create({
            data: {
                code,
                description: description || undefined,
                discountValue,
                discountType: discountType as DiscountType,
                maxDiscount: maxDiscount || undefined,
                minPurchase: minPurchase || undefined,
                maxUses: maxUses || undefined,
                maxUsesPerUser: maxUsesPerUser || undefined,
                startDate: new Date(startDate),
                expiryDate: new Date(expiryDate),
                applicableBooks: [],
                applicableCategories: [],
            },
        });
    }

    async getCoupons(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [coupons, total] = await Promise.all([
            this.prisma.coupon.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.coupon.count(),
        ]);

        return {
            coupons,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getCoupon(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async updateCoupon(id: string, updateCouponDto: UpdateCouponDto) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return this.prisma.coupon.update({
            where: { id },
            data: updateCouponDto,
        });
    }

    async deactivateCoupon(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return this.prisma.coupon.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async validateCoupon(code: string, orderAmount: number) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (!coupon.isActive) {
            throw new BadRequestException('Coupon is not active');
        }

        if (coupon.expiryDate < new Date()) {
            throw new BadRequestException('Coupon has expired');
        }

        if (coupon.usageCount >= (coupon.maxUses || Infinity)) {
            throw new BadRequestException('Coupon usage limit exceeded');
        }

        if (coupon.minPurchase && orderAmount < coupon.minPurchase) {
            throw new BadRequestException(
                `Minimum purchase amount ${coupon.minPurchase} not met`,
            );
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === DiscountType.PERCENTAGE) {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        return {
            coupon,
            discountAmount,
        };
    }

    async getUserPurchases(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                skip,
                take: limit,
                include: {
                    items: {
                        include: {
                            book: {
                                select: {
                                    id: true,
                                    title: true,
                                    isbn: true,
                                    currentPrice: true,
                                    coverImage: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where: { userId } }),
        ]);

        return {
            purchases: orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserIssuedBooks(userId: string) {
        // Get all orders for the user to see their purchased/issued books
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                isbn: true,
                                currentPrice: true,
                                coverImage: true,
                                authors: { select: { name: true } },
                                category: { select: { name: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Flatten to list of issued books
        const issuedBooks = orders.flatMap((order) =>
            order.items.map((item) => ({
                orderId: order.id,
                orderDate: order.createdAt,
                returnDeadline: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                ...item.book,
                quantity: item.quantity,
            })),
        );

        return {
            issuedBooks,
            totalIssued: issuedBooks.length,
        };
    }
}
