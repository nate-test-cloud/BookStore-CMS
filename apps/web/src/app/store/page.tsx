'use client';

import React, { useState } from 'react';
import { useBooks, useCategories } from '@/hooks';
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
import { ShoppingCart, Search, Star, Filter } from 'lucide-react';

export default function StorePage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const { data: booksData, isLoading } = useBooks(page, 12, search, selectedCategory);
    const { data: categoriesData } = useCategories();
    const books = booksData?.data || [];
    const categories = categoriesData?.data || [];

    const addItem = useCartStore((state) => state.addItem);
    const addNotification = useUIStore((state) => state.addNotification);

    const handleAddToCart = (book: any) => {
        addItem(book, 1);
        addNotification({
            type: 'success',
            message: `${book.title} added to cart!`,
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">BookStore</h1>
                <p className="text-gray-600">Discover your next favorite book</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Filters */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search */}
                            <div>
                                <p className="text-sm font-semibold mb-2">Search</p>
                                <Input
                                    type="text"
                                    placeholder="Search books..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            {/* Categories */}
                            <div>
                                <p className="text-sm font-semibold mb-2">Categories</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setPage(1);
                                    }}
                                    className={`block w-full text-left px-3 py-2 rounded mb-1 ${selectedCategory === ''
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((category: any) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.id);
                                            setPage(1);
                                        }}
                                        className={`block w-full text-left px-3 py-2 rounded ${selectedCategory === category.id
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Books Grid */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No books found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map((book: any) => (
                                <Card key={book.id} className="hover:shadow-lg transition overflow-hidden flex flex-col">
                                    {/* Book Cover */}
                                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-gray-400">
                                        {book.coverImage ? (
                                            <img
                                                src={book.coverImage}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-sm font-medium mb-2">📚</p>
                                                <p className="text-xs text-gray-500">No Cover</p>
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-4 flex flex-col flex-1">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>

                                        <p className="text-sm text-gray-600 mb-2">{book.category?.name}</p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-3">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(book.rating)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-600">({book.rating})</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{book.currentPrice}
                                            </p>
                                            {book.discountPercent > 0 && (
                                                <>
                                                    <p className="text-sm text-gray-500 line-through">
                                                        ₹{book.basePrice}
                                                    </p>
                                                    <span className="text-sm font-semibold text-red-600">
                                                        {book.discountPercent}% off
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Stock Status */}
                                        <div className="mb-4 flex-1">
                                            {book.stock > 0 ? (
                                                <p className="text-xs text-green-600 font-medium">
                                                    ✓ {book.stock} in stock
                                                </p>
                                            ) : (
                                                <p className="text-xs text-red-600 font-medium">Out of stock</p>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <Button
                                            className="w-full"
                                            onClick={() => handleAddToCart(book)}
                                            disabled={book.stock === 0}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {books.length > 0 && (
                        <div className="flex justify-between items-center mt-8">
                            <p className="text-sm text-gray-600">
                                Showing page <strong>{page}</strong>
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
