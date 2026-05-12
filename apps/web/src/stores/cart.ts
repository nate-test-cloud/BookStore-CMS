import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Book } from '@/types';

interface CartState {
    items: CartItem[];
    total: number;
    tax: number;
    discount: number;
    couponCode?: string;

    // Actions
    addItem: (book: Book, quantity: number) => void;
    removeItem: (bookId: string) => void;
    updateQuantity: (bookId: string, quantity: number) => void;
    setCoupon: (code: string, discountAmount: number) => void;
    setDiscount: (discountAmount: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            tax: 0,
            discount: 0,
            couponCode: undefined,

            addItem: (book: Book, quantity: number) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.bookId === book.id);

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.bookId === book.id
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                bookId: book.id,
                                book,
                                quantity,
                                unitPrice: book.currentPrice,
                            },
                        ],
                    };
                });
            },

            removeItem: (bookId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.bookId !== bookId),
                }));
            },

            updateQuantity: (bookId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(bookId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.bookId === bookId ? { ...item, quantity } : item
                    ),
                }));
            },

            setCoupon: (code: string, discountAmount: number) => {
                set({
                    couponCode: code,
                    discount: discountAmount,
                });
            },

            setDiscount: (discountAmount: number) => {
                set({ discount: discountAmount });
            },

            clearCart: () => {
                set({
                    items: [],
                    total: 0,
                    tax: 0,
                    discount: 0,
                    couponCode: undefined,
                });
            },

            getSubtotal: () => {
                const { items } = get();
                return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            },

            getTotal: () => {
                const { items, tax, discount } = get();
                const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
                return subtotal + tax - discount;
            },
        }),
        {
            name: 'cart-store',
        }
    )
);
