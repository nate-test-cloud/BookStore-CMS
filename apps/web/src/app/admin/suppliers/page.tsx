'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';

export default function SuppliersPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                <p className="text-gray-600 mt-2">Manage suppliers and procurement</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Supplier management features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        This module will include supplier management, purchase orders, restock requests, and supplier payments.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
