import { ProtectedLayout } from '@/components/common/ProtectedLayout';
import { UserRole } from '@/types';

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout requiredRoles={[UserRole.CUSTOMER]}>
            {children}
        </ProtectedLayout>
    );
}
