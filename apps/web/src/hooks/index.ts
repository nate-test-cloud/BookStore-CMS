import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

// Books
export function useBooks(page = 1, limit = 20, search?: string, categoryId?: string) {
    return useQuery({
        queryKey: ['books', page, limit, search, categoryId],
        queryFn: async () => {
            const response = await apiClient.getBooks(page, limit, search, categoryId);
            return response.data;
        },
    });
}

export function useBook(id: string) {
    return useQuery({
        queryKey: ['book', id],
        queryFn: async () => {
            const response = await apiClient.getBook(id);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useCreateBook() {
    const queryClient = useQueryClient();
    const addNotification = useUIStore((state) => state.addNotification);

    return useMutation({
        mutationFn: (data: any) => apiClient.createBook(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            addNotification({
                type: 'success',
                message: 'Book created successfully',
            });
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to create book',
            });
        },
    });
}

export function useUpdateBook(id: string) {
    const queryClient = useQueryClient();
    const addNotification = useUIStore((state) => state.addNotification);

    return useMutation({
        mutationFn: (data: any) => apiClient.updateBook(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['book', id] });
            addNotification({
                type: 'success',
                message: 'Book updated successfully',
            });
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update book',
            });
        },
    });
}

export function useDeleteBook(id: string) {
    const queryClient = useQueryClient();
    const addNotification = useUIStore((state) => state.addNotification);

    return useMutation({
        mutationFn: () => apiClient.deleteBook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            addNotification({
                type: 'success',
                message: 'Book deleted successfully',
            });
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to delete book',
            });
        },
    });
}

// Categories
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await apiClient.getCategories();
            return response.data;
        },
    });
}

// Orders
export function useOrders(page = 1, limit = 20) {
    return useQuery({
        queryKey: ['orders', page, limit],
        queryFn: async () => {
            const response = await apiClient.getOrders(page, limit);
            return response.data;
        },
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await apiClient.getOrder(id);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    const addNotification = useUIStore((state) => state.addNotification);

    return useMutation({
        mutationFn: (data: any) => apiClient.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            addNotification({
                type: 'success',
                message: 'Order created successfully',
            });
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to create order',
            });
        },
    });
}

// Coupons
export function useCoupons() {
    return useQuery({
        queryKey: ['coupons'],
        queryFn: async () => {
            const response = await apiClient.getCoupons();
            return response.data;
        },
    });
}

export function useValidateCoupon(code: string) {
    return useQuery({
        queryKey: ['coupon', code],
        queryFn: async () => {
            const response = await apiClient.validateCoupon(code);
            return response.data;
        },
        enabled: !!code,
    });
}

// Low Stock Books
export function useLowStockBooks() {
    return useQuery({
        queryKey: ['low-stock-books'],
        queryFn: async () => {
            const response = await apiClient.getLowStockBooks();
            return response.data;
        },
    });
}

// Auth
export function useLogin() {
    const login = useAuthStore((state) => state.login);
    const addNotification = useUIStore((state) => state.addNotification);

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            login(email, password),
        onSuccess: () => {
            addNotification({
                type: 'success',
                message: 'Logged in successfully',
            });
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Login failed',
            });
        },
    });
}

export function useLogout() {
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient.logout(),
        onSuccess: () => {
            logout();
            queryClient.clear();
        },
    });
}
