'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { UserRole } from '@/types';

interface ProtectedLayoutProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export function ProtectedLayout({
    children,
    requiredRoles = [],
}: ProtectedLayoutProps) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const canAccess = useAuthStore((state) => state.canAccess);

    React.useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
                router.push('/');
            }
        }
    }, [user, isLoading, requiredRoles, canAccess, router]);

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
