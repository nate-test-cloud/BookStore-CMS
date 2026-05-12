import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, fullName: string, password: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    hasRole: (roles: UserRole[]) => boolean;
    canAccess: (requiredRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.login(email, password);
                    const { accessToken, refreshToken, user } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isLoading: false,
                    });
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            signup: async (email: string, username: string, fullName: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    await apiClient.signup(email, username, fullName, password);
                    // Auto-login after signup
                    await get().login(email, password);
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Signup failed';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    error: null,
                });
            },

            loadUser: async () => {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                set({ isLoading: true });
                try {
                    const response = await apiClient.getMe();
                    const { user } = response.data;
                    set({ user, isLoading: false });
                } catch (error) {
                    set({ isLoading: false, user: null });
                    localStorage.removeItem('accessToken');
                }
            },

            hasRole: (roles: UserRole[]) => {
                const { user } = get();
                return user ? roles.includes(user.role) : false;
            },

            canAccess: (requiredRoles: UserRole[]) => {
                return get().hasRole(requiredRoles);
            },
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);
