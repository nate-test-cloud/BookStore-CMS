'use client';

import React from 'react';
import { useUIStore } from '@/stores/ui';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function NotificationContainer() {
    const notifications = useUIStore((state) => state.notifications);
    const removeNotification = useUIStore((state) => state.removeNotification);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
}

interface NotificationProps {
    notification: {
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
    };
    onClose: () => void;
}

function Notification({ notification, onClose }: NotificationProps) {
    const bgColor = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    }[notification.type];

    const textColor = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800',
    }[notification.type];

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertCircle,
        info: Info,
    }[notification.type];

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${bgColor}`}>
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textColor}`} />
            <p className={`text-sm font-medium ${textColor}`}>{notification.message}</p>
            <button
                onClick={onClose}
                className={`ml-auto flex-shrink-0 ${textColor} hover:opacity-70`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
