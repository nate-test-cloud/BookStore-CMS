'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';
import {
    BarChart3,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';

export default function AdminDashboard() {
    const user = useAuthStore((state) => state.user);

    const stats = [
        {
            label: 'Total Orders',
            value: '$12,456',
            change: '+12.5%',
            icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
        },
        {
            label: 'Total Books',
            value: '1,234',
            change: '+8.2%',
            icon: <Package className="w-6 h-6 text-green-600" />,
        },
        {
            label: 'Total Customers',
            value: '456',
            change: '+4.3%',
            icon: <Users className="w-6 h-6 text-purple-600" />,
        },
        {
            label: 'Revenue',
            value: '$45,231',
            change: '+15.1%',
            icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
        },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, {user?.fullName}! 👋
                </h1>
                <p className="text-gray-600 mt-2">Here's what's happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-green-600 mt-2">{stat.change} from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Low Stock Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>You have 12 new orders today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                    <div>
                                        <p className="font-medium">Order #ORD-00{i}23</p>
                                        <p className="text-sm text-gray-500">Customer Name</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">$249.99</p>
                                        <p className="text-sm text-green-600">Paid</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            Low Stock Alert
                        </CardTitle>
                        <CardDescription>5 books need restocking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['1984', 'Harry Potter', 'Clean Code'].map((book, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <p className="text-sm">{book}</p>
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                        5 left
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
