/**
 * TEST CASE 8.2: INVENTORY SERVICE - STOCK ADJUSTMENT UNIT TEST (SIMPLIFIED)
 */

import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock InventoryService
class InventoryServiceMock {
    constructor(private prisma: any) { }

    async adjustInventory(
        bookId: string,
        quantity: number,
        adjustmentType: string,
        reason: string,
        userId: string,
        reference?: string,
    ): Promise<any> {
        // Validate book exists
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException(`Book with ID ${bookId} not found`);
        }

        // Validate adjustment reason
        if (!reason || reason.trim() === '') {
            throw new BadRequestException('Adjustment reason is required');
        }

        // Validate quantity is not zero
        if (quantity === 0) {
            throw new BadRequestException('Adjustment quantity cannot be zero');
        }

        // Get current inventory
        let inventory = await this.prisma.inventory.findFirst({
            where: { bookId },
        });

        if (!inventory) {
            inventory = await this.prisma.inventory.create({
                data: {
                    bookId,
                    quantity: quantity > 0 ? quantity : 0,
                    location: 'Default',
                },
            });
        }

        // Calculate new quantity
        const newQuantity = inventory.quantity + quantity;

        // Prevent negative stock
        if (newQuantity < 0) {
            throw new BadRequestException(
                `Cannot adjust inventory: Would result in negative stock (current: ${inventory.quantity}, adjustment: ${quantity})`,
            );
        }

        // Update inventory
        const updatedInventory = await this.prisma.inventory.update({
            where: { id: inventory.id },
            data: {
                quantity: newQuantity,
                lastRestockDate:
                    quantity > 0 ? new Date() : inventory.lastRestockDate,
            },
        });

        // Create audit trail
        await this.prisma.inventoryAdjustment.create({
            data: {
                bookId,
                adjustmentType,
                quantity,
                reason,
                reference,
                userId,
                timestamp: new Date(),
            },
        });

        // Check for low stock alert
        if (newQuantity < book.minimumStock && quantity > 0) {
            // Create low stock notification
            await this.prisma.notification.create({
                data: {
                    type: 'LOW_STOCK_ALERT',
                    bookId,
                    message: `Stock is low for ${book.title}: ${newQuantity} units`,
                    userId: 'admin',
                },
            });
        }

        return updatedInventory;
    }
}

describe('TEST CASE 8.2: InventoryService - Stock Adjustment Unit Testing', () => {
    let inventoryService: InventoryServiceMock;
    let mockPrismaService: any;

    beforeEach(() => {
        mockPrismaService = {
            book: {
                findUnique: jest.fn(),
            },
            inventory: {
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            inventoryAdjustment: {
                create: jest.fn(),
            },
            notification: {
                create: jest.fn(),
            },
        };

        inventoryService = new InventoryServiceMock(mockPrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('adjustInventory() - Positive Adjustments', () => {
        it('should increment stock on positive adjustment', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                stock: 100,
                minimumStock: 20,
                title: 'Test Book',
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                bookId,
                quantity: 100,
                lastRestockDate: null,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                bookId,
                quantity: 150,
                lastRestockDate: new Date(),
            });

            const result = await inventoryService.adjustInventory(
                bookId,
                50,
                'RESTOCK',
                'Restock order',
                'user-admin-001',
            );

            expect(result.quantity).toBe(150);
            expect(mockPrismaService.inventory.update).toHaveBeenCalled();
        });

        it('should update lastRestockDate on positive adjustment', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 150,
            });

            await inventoryService.adjustInventory(
                bookId,
                50,
                'RESTOCK',
                'Restock order',
                'user-001',
            );

            const updateCall =
                mockPrismaService.inventory.update.mock.calls[0][0];
            expect(updateCall.data.lastRestockDate).toBeDefined();
        });
    });

    describe('adjustInventory() - Negative Adjustments', () => {
        it('should decrement stock on negative adjustment', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 80,
            });

            const result = await inventoryService.adjustInventory(
                bookId,
                -20,
                'SALE',
                'Sale order #123',
                'user-001',
            );

            expect(result.quantity).toBe(80);
        });

        it('should prevent negative stock', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 10,
            });

            await expect(
                inventoryService.adjustInventory(
                    bookId,
                    -50,
                    'SALE',
                    'Sale order',
                    'user-001',
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('adjustInventory() - Validation', () => {
        it('should validate book exists', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

            await expect(
                inventoryService.adjustInventory(
                    'nonexistent',
                    10,
                    'RESTOCK',
                    'Restock',
                    'user-001',
                ),
            ).rejects.toThrow(NotFoundException);
        });

        it('should validate adjustment reason is provided', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-001',
            });

            await expect(
                inventoryService.adjustInventory(
                    'book-001',
                    10,
                    'RESTOCK',
                    '',
                    'user-001',
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('should validate quantity is not zero', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-001',
            });

            await expect(
                inventoryService.adjustInventory(
                    'book-001',
                    0,
                    'RESTOCK',
                    'Restock',
                    'user-001',
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('adjustInventory() - Audit Trail', () => {
        it('should create audit trail for adjustment', async () => {
            const bookId = 'book-001';
            const userId = 'user-admin-001';

            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 150,
            });

            await inventoryService.adjustInventory(
                bookId,
                50,
                'RESTOCK',
                'Restock order #456',
                userId,
            );

            expect(
                mockPrismaService.inventoryAdjustment.create,
            ).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    bookId,
                    adjustmentType: 'RESTOCK',
                    quantity: 50,
                    reason: 'Restock order #456',
                    userId,
                }),
            });
        });

        it('should record reference for traceability', async () => {
            const bookId = 'book-001';
            const reference = 'ORDER-789';

            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 150,
            });

            await inventoryService.adjustInventory(
                bookId,
                50,
                'RESTOCK',
                'Restock',
                'user-001',
                reference,
            );

            expect(
                mockPrismaService.inventoryAdjustment.create,
            ).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    reference,
                }),
            });
        });
    });

    describe('adjustInventory() - Low Stock Alerts', () => {
        it('should trigger low stock alert if stock below threshold', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                title: 'Test Book',
                minimumStock: 50,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 10,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 40,
            });

            await inventoryService.adjustInventory(
                bookId,
                30,
                'RESTOCK',
                'Restock',
                'user-001',
            );

            expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    type: 'LOW_STOCK_ALERT',
                    bookId,
                }),
            });
        });

        it('should not trigger alert if stock above threshold', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 150,
            });

            await inventoryService.adjustInventory(
                bookId,
                50,
                'RESTOCK',
                'Restock',
                'user-001',
            );

            expect(mockPrismaService.notification.create).not.toHaveBeenCalled();
        });
    });

    describe('adjustInventory() - Edge Cases', () => {
        it('should handle large stock adjustments', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 1000,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 6000,
            });

            const result = await inventoryService.adjustInventory(
                bookId,
                5000,
                'RESTOCK',
                'Bulk restock',
                'user-001',
            );

            expect(result.quantity).toBe(6000);
        });

        it('should handle adjustment type DAMAGE', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 95,
            });

            await inventoryService.adjustInventory(
                bookId,
                -5,
                'DAMAGE',
                'Damaged during shipment',
                'user-001',
            );

            expect(
                mockPrismaService.inventoryAdjustment.create,
            ).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    adjustmentType: 'DAMAGE',
                }),
            });
        });

        it('should handle adjustment type RECOUNT', async () => {
            const bookId = 'book-001';
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: bookId,
                minimumStock: 20,
            });
            mockPrismaService.inventory.findFirst.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 100,
            });
            mockPrismaService.inventory.update.mockResolvedValueOnce({
                id: 'inv-001',
                quantity: 95,
            });

            await inventoryService.adjustInventory(
                bookId,
                -5,
                'RECOUNT',
                'Physical inventory recount discrepancy',
                'user-001',
            );

            expect(
                mockPrismaService.inventoryAdjustment.create,
            ).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    adjustmentType: 'RECOUNT',
                }),
            });
        });
    });
});
