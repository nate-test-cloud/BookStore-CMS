import {
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    IsEnum,
    Min,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, PaymentMethod, OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
    @IsString()
    bookId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;
}

export class CreateOrderDto {
    @IsEnum(OrderType)
    orderType: OrderType;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @IsOptional()
    @IsString()
    couponId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    membershipDiscount?: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    shippingCost?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class ApplyCouponDto {
    @IsString()
    couponCode: string;
}

export class CreateReturnDto {
    @IsEnum(['DEFECTIVE', 'NOT_AS_DESCRIBED', 'NOT_NEEDED', 'CUSTOMER_CHANGED_MIND', 'DAMAGED_IN_TRANSIT'])
    reason: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class ApproveReturnDto {
    @IsNumber()
    @Min(0)
    refundAmount: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateCouponDto {
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    discountValue: number;

    @IsEnum(['PERCENTAGE', 'FIXED'])
    discountType: string;

    @IsOptional()
    @IsNumber()
    maxDiscount?: number;

    @IsOptional()
    @IsNumber()
    minPurchase?: number;

    @IsOptional()
    @IsNumber()
    maxUses?: number;

    @IsOptional()
    @IsNumber()
    maxUsesPerUser?: number;

    @IsString()
    startDate: string;

    @IsString()
    expiryDate: string;

    @IsOptional()
    @IsArray()
    applicableBooks?: string[];

    @IsOptional()
    @IsArray()
    applicableCategories?: string[];
}

export class UpdateCouponDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountValue?: number;

    @IsOptional()
    @IsNumber()
    maxDiscount?: number;

    @IsOptional()
    @IsNumber()
    minPurchase?: number;

    @IsOptional()
    @IsNumber()
    maxUses?: number;

    @IsOptional()
    @IsNumber()
    maxUsesPerUser?: number;
}
