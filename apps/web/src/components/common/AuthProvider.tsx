'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const loadUser = useAuthStore((state) => state.loadUser);

    React.useEffect(() => {
        loadUser();
    }, [loadUser]);

    return <>{children}</>;
}
