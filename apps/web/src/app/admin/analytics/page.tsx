'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';

export default function AnalyticsPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-2">Sales, inventory, and customer analytics</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Comprehensive analytics dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        This module will include sales trends, inventory analytics, customer insights, and exportable reports.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
