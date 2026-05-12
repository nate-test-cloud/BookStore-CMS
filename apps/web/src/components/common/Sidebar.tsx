'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Settings,
    Warehouse,
    X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { UserRole } from '@/types';
import { clsx } from 'clsx';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
    {
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
        href: '/pos',
        label: 'POS',
        icon: <ShoppingCart className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
    },
    {
        href: '/admin/inventory',
        label: 'Inventory',
        icon: <Package className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF],
    },
    {
        href: '/admin/orders',
        label: 'Orders',
        icon: <ShoppingCart className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
        href: '/admin/customers',
        label: 'Customers',
        icon: <Users className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
        href: '/admin/analytics',
        label: 'Analytics',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
        href: '/admin/suppliers',
        label: 'Suppliers',
        icon: <Warehouse className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
        href: '/admin/settings',
        label: 'Settings',
        icon: <Settings className="w-5 h-5" />,
        roles: [UserRole.ADMIN],
    },
];

export function Sidebar() {
    const user = useAuthStore((state) => state.user);
    const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
    const closeSidebar = useUIStore((state) => state.closeSidebar);
    const pathname = usePathname();

    const visibleItems = NAV_ITEMS.filter(
        (item) => user && item.roles.includes(user.role)
    );

    return (
        <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto',
                    'transition-transform duration-300 ease-in-out',
                    'md:relative md:top-0 md:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                <nav className="p-4 space-y-2">
                    {visibleItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                )}
                                onClick={() => closeSidebar()}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
