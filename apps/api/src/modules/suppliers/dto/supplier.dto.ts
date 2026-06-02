import { POStatus, RestockStatus } from '@prisma/client';

export class CreateSupplierDto {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    gstNumber?: string;
    paymentTerms?: string;
    publisherId?: string;
}

export class UpdateSupplierDto {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    gstNumber?: string;
    paymentTerms?: string;
    isActive?: boolean;
    publisherId?: string;
}

export class CreatePurchaseOrderDto {
    supplierId: string;
    expectedDelivery?: Date;
    notes?: string;
    items: {
        bookId: string;
        quantity: number;
        unitCost: number;
    }[];
}

export class UpdatePurchaseOrderDto {
    status?: POStatus;
    expectedDelivery?: Date;
    actualDelivery?: Date;
    notes?: string;
}

export class CreateRestockRequestDto {
    bookId: string;
    quantityRequested: number;
    supplierId?: string;
}

export class UpdateRestockRequestDto {
    status?: RestockStatus;
    quantityReceived?: number;
}
