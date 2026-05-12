import { ProtectedLayout } from '@/components/common/ProtectedLayout';
import { UserRole } from '@/types';

export default function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}>
            {children}
        </ProtectedLayout>
    );
}
