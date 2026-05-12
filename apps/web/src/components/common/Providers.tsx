'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/components/common/AuthProvider';
import { NotificationContainer } from '@/components/common/NotificationContainer';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <NotificationContainer />
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
}
