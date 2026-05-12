import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCartItemDto, CartResponseDto, CheckoutDto } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async getCart(userId: string): Promise<CartResponseDto> {
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        currentPrice: true,
                        coverImage: true,
                    },
                },
            },
        });

        let totalPrice = 0;
        const items = cartItems.map((item) => {
            const itemTotal = item.quantity * item.book.currentPrice;
            totalPrice += itemTotal;
            return {
                id: item.id,
                bookId: item.bookId,
                book: item.book,
                quantity: item.quantity,
                totalPrice: itemTotal,
            };
        });

        return {
            items,
            totalItems: cartItems.length,
            totalPrice,
        };
    }

    async addItem(userId: string, dto: CreateCartItemDto) {
        // Check if book exists
        const book = await this.prisma.book.findUnique({
            where: { id: dto.bookId },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        // Check if book is in stock
        const inventory = await this.prisma.inventory.findFirst({
            where: { bookId: dto.bookId },
        });

        if (!inventory || inventory.quantity < dto.quantity) {
            throw new BadRequestException('Insufficient stock available');
        }

        // Check if item already in cart
        const existingItem = await this.prisma.cartItem.findFirst({
            where: { userId, bookId: dto.bookId },
        });

        let cartItem;
        if (existingItem) {
            // Update quantity
            cartItem = await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: { increment: dto.quantity } },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            currentPrice: true,
                            coverImage: true,
                        },
                    },
                },
            });
        } else {
            // Create new item
            cartItem = await this.prisma.cartItem.create({
                data: {
                    userId,
                    bookId: dto.bookId,
                    quantity: dto.quantity,
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            currentPrice: true,
                            coverImage: true,
                        },
                    },
                },
            });
        }

        return {
            id: cartItem.id,
            bookId: cartItem.bookId,
            book: cartItem.book,
            quantity: cartItem.quantity,
            totalPrice: cartItem.quantity * cartItem.book.currentPrice,
        };
    }

    async removeItem(userId: string, cartItemId: string) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });

        if (!cartItem || cartItem.userId !== userId) {
            throw new NotFoundException('Cart item not found');
        }

        await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        return { message: 'Item removed from cart' };
    }

    async updateItem(userId: string, cartItemId: string, quantity: number) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });

        if (!cartItem || cartItem.userId !== userId) {
            throw new NotFoundException('Cart item not found');
        }

        if (quantity <= 0) {
            throw new BadRequestException('Quantity must be greater than 0');
        }

        // Check stock
        const inventory = await this.prisma.inventory.findFirst({
            where: { bookId: cartItem.bookId },
        });

        if (!inventory || inventory.quantity < quantity) {
            throw new BadRequestException('Insufficient stock available');
        }

        const updated = await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        currentPrice: true,
                        coverImage: true,
                    },
                },
            },
        });

        return {
            id: updated.id,
            bookId: updated.bookId,
            book: updated.book,
            quantity: updated.quantity,
            totalPrice: updated.quantity * updated.book.currentPrice,
        };
    }

    async clearCart(userId: string) {
        await this.prisma.cartItem.deleteMany({
            where: { userId },
        });

        return { message: 'Cart cleared' };
    }

    async checkout(userId: string, dto: CheckoutDto) {
        // Get cart items
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { book: true },
        });

        if (cartItems.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // Calculate total
        let total = 0;
        const orderItems: { bookId: string; quantity: number; unitPrice: number; total: number }[] = [];

        for (const item of cartItems) {
            // Check stock again
            const inventory = await this.prisma.inventory.findFirst({
                where: { bookId: item.bookId },
            });

            if (!inventory || inventory.quantity < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for book: ${item.book.title}`,
                );
            }

            const itemTotal = item.quantity * item.book.currentPrice;
            total += itemTotal;

            orderItems.push({
                bookId: item.bookId,
                quantity: item.quantity,
                unitPrice: item.book.currentPrice,
                total: itemTotal,
            });

            // Reduce inventory
            await this.prisma.inventory.update({
                where: { id: inventory.id },
                data: { quantity: { decrement: item.quantity } },
            });
        }

        // Create order
        const order = await this.prisma.order.create({
            data: {
                userId,
                orderNumber: `ORD-${Date.now()}`,
                subtotal: total,
                totalAmount: total,
                status: 'PENDING',
                paymentMethod: dto.paymentMethod as any,
                shippingAddress: dto.shippingAddress,
                items: {
                    createMany: {
                        data: orderItems,
                    },
                },
            },
            include: { items: true },
        });

        // Clear cart
        await this.prisma.cartItem.deleteMany({
            where: { userId },
        });

        return {
            message: 'Order created successfully',
            orderId: order.id,
            total,
            items: orderItems.length,
        };
    }
}
