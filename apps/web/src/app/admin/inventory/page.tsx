'use client';

import React, { useState } from 'react';
import { useBooks, useCreateBook } from '@/hooks';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function InventoryPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data: booksData, isLoading } = useBooks(page, 20, search);
    const books = booksData?.data || [];

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                        <p className="text-gray-600 mt-2">Manage your books and stock</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Book
                    </Button>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <div className="flex-1">
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
                    <Button variant="outline">
                        <Search className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Books Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Books ({books.length})</CardTitle>
                    <CardDescription>All books in inventory</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No books found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">ISBN</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map((book: any) => (
                                        <tr
                                            key={book.id}
                                            className="border-b border-gray-200 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 font-medium text-gray-900">{book.title}</td>
                                            <td className="py-3 px-4 text-gray-600">{book.isbn}</td>
                                            <td className="py-3 px-4 text-gray-600">₹{book.currentPrice}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${book.stock > book.minimumStock
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {book.stock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{book.category?.name}</td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
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
        </div>
    );
}
