'use client';

import React, { useState } from 'react';
import { useBooks, useCreateOrder } from '@/hooks';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';
import { Trash2, Plus, Minus, Search, CreditCard, DollarSign } from 'lucide-react';
import { PaymentMethod } from '@/types';

export default function POSPage() {
    const [search, setSearch] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
        PaymentMethod.CASH
    );
    const { data: booksData } = useBooks(1, 50, search);
    const books = booksData?.data || [];

    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);
    const getSubtotal = useCartStore((state) => state.getSubtotal);
    const getTotal = useCartStore((state) => state.getTotal);

    const createOrderMutation = useCreateOrder();
    const addNotification = useUIStore((state) => state.addNotification);

    const handleAddToCart = (book: any) => {
        addItem(book, 1);
        addNotification({
            type: 'success',
            message: `${book.title} added to cart`,
        });
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            addNotification({
                type: 'error',
                message: 'Cart is empty',
            });
            return;
        }

        try {
            await createOrderMutation.mutateAsync({
                orderType: 'POS',
                items: cartItems.map((item) => ({
                    bookId: item.bookId,
                    quantity: item.quantity,
                })),
                paymentMethod: selectedPaymentMethod,
            });

            clearCart();
            addNotification({
                type: 'success',
                message: 'Order created successfully',
            });
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <div className="h-full flex gap-6 p-6 bg-gray-100">
            {/* Products Area */}
            <div className="flex-1 flex flex-col">
                {/* Search */}
                <div className="mb-4 flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search books or scan barcode..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-lg"
                    />
                    <Button variant="outline" size="lg">
                        <Search className="w-5 h-5" />
                    </Button>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {books.map((book: any) => (
                            <Card key={book.id} className="cursor-pointer hover:shadow-lg transition">
                                <CardContent className="p-3">
                                    <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-sm">
                                        {book.coverImage ? 'Cover' : 'No Image'}
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{book.category?.name}</p>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-bold text-lg">₹{book.currentPrice}</p>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {book.stock} in stock
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleAddToCart(book)}
                                        disabled={book.stock === 0}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add to Cart
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Area */}
            <div className="w-96 flex flex-col gap-4">
                {/* Cart Items */}
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Shopping Cart</CardTitle>
                        <CardDescription>{cartItems.length} items</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-3">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Cart is empty</div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.bookId} className="flex items-center justify-between border-b pb-3">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.book?.title}</p>
                                        <p className="text-xs text-gray-600">₹{item.unitPrice}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeItem(item.bookId)}
                                        >
                                            <Trash2 className="w-3 h-3 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Checkout */}
                <Card>
                    <CardHeader>
                        <CardTitle>Checkout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Totals */}
                        <div className="space-y-2 border-b pb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{getSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (0%)</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₹{getTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Payment Method</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: PaymentMethod.CASH, label: 'Cash', icon: '💵' },
                                    { value: PaymentMethod.CARD, label: 'Card', icon: '💳' },
                                    { value: PaymentMethod.UPI, label: 'UPI', icon: '📱' },
                                ].map((method) => (
                                    <Button
                                        key={method.value}
                                        variant={selectedPaymentMethod === method.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedPaymentMethod(method.value)}
                                    >
                                        <span className="mr-1">{method.icon}</span>
                                        {method.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1"
                                onClick={clearCart}
                            >
                                Clear
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleCheckout}
                                isLoading={createOrderMutation.isPending}
                                disabled={cartItems.length === 0}
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Checkout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
