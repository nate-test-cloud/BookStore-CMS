import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { POStatus, RestockStatus } from '@prisma/client';
import {
    CreateSupplierDto,
    UpdateSupplierDto,
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    CreateRestockRequestDto,
    UpdateRestockRequestDto,
} from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    // =============================================
    // SUPPLIERS CRUD
    // =============================================

    async createSupplier(createDto: CreateSupplierDto) {
        // Check if supplier name already exists
        const existingSupplier = await this.prisma.supplier.findUnique({
            where: { name: createDto.name },
        });

        if (existingSupplier) {
            throw new ConflictException('Supplier with this name already exists');
        }

        return this.prisma.supplier.create({
            data: createDto,
            include: {
                purchaseOrders: true,
                restockRequests: true,
            },
        });
    }

    async getSuppliers(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.supplier.count(),
        ]);

        // Convert string IDs to numbers for API schema with proper hashing
        const generateNumericId = (cuid: string): number => {
            let hash = 0;
            for (let i = 0; i < cuid.length; i++) {
                const char = cuid.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash) % 10000000; // Ensure positive number
        };

        const transformedSuppliers = suppliers.map((supplier) => ({
            id: generateNumericId(supplier.id),
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            notes: supplier.paymentTerms,
            createdAt: supplier.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: supplier.updatedAt?.toISOString() || null,
        }));

        return {
            data: transformedSuppliers,
            total,
            page,
            limit,
        };
    }

    async getSupplierById(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                publisher: true,
                purchaseOrders: {
                    include: {
                        items: true,
                    },
                },
                restockRequests: true,
                supplierPayments: true,
            },
        });

        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        return supplier;
    }

    async updateSupplier(id: string, updateDto: UpdateSupplierDto) {
        const supplier = await this.getSupplierById(id);

        if (updateDto.name && updateDto.name !== supplier.name) {
            const existingSupplier = await this.prisma.supplier.findUnique({
                where: { name: updateDto.name },
            });

            if (existingSupplier) {
                throw new ConflictException('Supplier with this name already exists');
            }
        }

        return this.prisma.supplier.update({
            where: { id },
            data: updateDto,
            include: {
                publisher: true,
                purchaseOrders: true,
            },
        });
    }

    async deleteSupplier(id: string) {
        const supplier = await this.getSupplierById(id);

        // Check if supplier has active purchase orders
        const activePOs = await this.prisma.purchaseOrder.findMany({
            where: {
                supplierId: id,
                status: {
                    in: [POStatus.DRAFT, POStatus.SENT, POStatus.CONFIRMED],
                },
            },
        });

        if (activePOs.length > 0) {
            throw new BadRequestException(
                'Cannot delete supplier with active purchase orders',
            );
        }

        return this.prisma.supplier.delete({
            where: { id },
        });
    }

    // =============================================
    // PURCHASE ORDERS
    // =============================================

    async createPurchaseOrder(createDto: CreatePurchaseOrderDto) {
        const supplier = await this.getSupplierById(createDto.supplierId);

        const poNumber = `PO-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;

        // Calculate total amount
        let totalAmount = 0;
        for (const item of createDto.items) {
            totalAmount += item.quantity * item.unitCost;
        }

        return this.prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplierId: createDto.supplierId,
                expectedDelivery: createDto.expectedDelivery,
                notes: createDto.notes,
                totalAmount,
                items: {
                    create: createDto.items.map((item) => ({
                        bookId: item.bookId,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        total: item.quantity * item.unitCost,
                    })),
                },
            },
            include: {
                supplier: true,
                items: true,
            },
        });
    }

    async getPurchaseOrders(supplierId: string) {
        const supplier = await this.getSupplierById(supplierId);

        return this.prisma.purchaseOrder.findMany({
            where: { supplierId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                supplier: true,
            },
        });
    }

    async getPurchaseOrderById(id: string) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        po: true,
                    },
                },
                supplier: true,
            },
        });

        if (!po) {
            throw new NotFoundException('Purchase order not found');
        }

        return po;
    }

    async updatePurchaseOrder(id: string, updateDto: UpdatePurchaseOrderDto) {
        const po = await this.getPurchaseOrderById(id);

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: updateDto,
            include: {
                supplier: true,
                items: true,
            },
        });
    }

    // =============================================
    // RESTOCK REQUESTS
    // =============================================

    async createRestockRequest(createDto: CreateRestockRequestDto) {
        const book = await this.prisma.book.findUnique({
            where: { id: createDto.bookId },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        return this.prisma.restockRequest.create({
            data: createDto,
        });
    }

    async getRestockRequests(status?: string) {
        const where = status ? { status: status as RestockStatus } : {};

        return this.prisma.restockRequest.findMany({
            where,
            orderBy: { requestedAt: 'desc' },
            include: {
                supplier: true,
            },
        });
    }

    async updateRestockRequest(id: string, updateDto: UpdateRestockRequestDto) {
        const request = await this.prisma.restockRequest.findUnique({
            where: { id },
        });

        if (!request) {
            throw new NotFoundException('Restock request not found');
        }

        return this.prisma.restockRequest.update({
            where: { id },
            data: updateDto,
        });
    }

    async getRestockAlert() {
        // Get all books below minimum stock
        const lowStockBooks = await this.prisma.book.findMany({
            where: {
                stock: {
                    lt: 15, // Threshold: less than 15 units
                },
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                stock: true,
                minimumStock: true,
            },
            orderBy: { stock: 'asc' },
        });

        return lowStockBooks;
    }
}
