import { IsString, IsNumber, IsPositive, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemDto {
    @IsString()
    bookId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class UpdateCartItemDto {
    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class CartItemResponseDto {
    id: string;
    bookId: string;
    book: {
        id: string;
        title: string;
        currentPrice: number;
        coverImage: string | null;
    };
    quantity: number;
    totalPrice: number;
}

export class CartResponseDto {
    items: CartItemResponseDto[];
    totalItems: number;
    totalPrice: number;
}

class CheckoutItemDto {
    @IsString()
    bookId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class CheckoutDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items: CheckoutItemDto[];

    @IsString()
    paymentMethod: string;

    @IsOptional()
    @IsString()
    shippingAddress?: string;
}
