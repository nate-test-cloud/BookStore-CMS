export interface User {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
}

export const useAuth = () => {
    const getUser = (): User | null => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    };

    const getToken = (): string | null => {
        return localStorage.getItem('accessToken');
    };

    const isAuthenticated = (): boolean => {
        return !!getToken();
    };

    const isAdmin = (): boolean => {
        const user = getUser();
        return user?.role === 'ADMIN';
    };

    const logout = (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };

    return {
        user: getUser(),
        token: getToken(),
        isAuthenticated: isAuthenticated(),
        isAdmin: isAdmin(),
        logout,
    };
};
