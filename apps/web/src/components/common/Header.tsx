'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { Button } from './Button';

export function Header() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        BookStore CMS
                    </Link>
                </div>

                {user && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <LogOut className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
