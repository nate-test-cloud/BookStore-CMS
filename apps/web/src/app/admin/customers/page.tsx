'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';

export default function CustomersPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600 mt-2">Manage customer profiles and loyalty programs</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Customer management features will be available shortly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        This module will include customer profiles, loyalty points, membership tiers, and purchase history.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
