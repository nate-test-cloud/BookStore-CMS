'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/Card';

export default function SettingsPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Configure system settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Store Settings</CardTitle>
                        <CardDescription>Coming Soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Store configuration and preferences</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Coming Soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Manage users, roles, and permissions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Coming Soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Security policies and access control</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>Coming Soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Third-party integrations and APIs</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
