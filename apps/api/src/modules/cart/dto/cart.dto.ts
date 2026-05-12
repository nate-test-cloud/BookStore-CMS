export class CreateCartItemDto {
    bookId: string;
    quantity: number;
}

export class UpdateCartItemDto {
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

export class CheckoutDto {
    items: Array<{
        bookId: string;
        quantity: number;
    }>;
    paymentMethod: string;
    shippingAddress?: string;
}
