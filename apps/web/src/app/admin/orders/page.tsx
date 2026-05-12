'use client';

import React, { useState } from 'react';
import { useOrders } from '@/hooks';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Eye, Printer } from 'lucide-react';
import { OrderStatus } from '@/types';

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const { data: ordersData, isLoading } = useOrders(page, 20);
    const orders = ordersData?.data || [];

    const getStatusColor = (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
            [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [OrderStatus.PAID]: 'bg-blue-100 text-blue-800',
            [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
            [OrderStatus.SHIPPED]: 'bg-cyan-100 text-cyan-800',
            [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
            [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
            [OrderStatus.RETURNED]: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-2">Manage and track all orders</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Total: {orders.length} orders</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No orders found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-200 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 font-medium text-gray-900">{order.orderNumber}</td>
                                            <td className="py-3 px-4 text-gray-600">Customer</td>
                                            <td className="py-3 px-4 font-medium text-gray-900">₹{order.totalAmount}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Printer className="w-4 h-4" />
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
