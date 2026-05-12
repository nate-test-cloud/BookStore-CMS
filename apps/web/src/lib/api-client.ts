import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            withCredentials: true, // Send cookies with requests
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add token
        this.client.interceptors.request.use(
            (config) => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired, try refresh
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            const response = await axios.post(
                                `${API_BASE_URL}/auth/refresh`,
                                { refreshToken }
                            );
                            localStorage.setItem('accessToken', response.data.accessToken);
                            localStorage.setItem('refreshToken', response.data.refreshToken);

                            // Retry original request
                            return this.client(error.config!);
                        }
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.client.post('/auth/login', { email, password });
    }

    async signup(email: string, username: string, fullName: string, password: string) {
        return this.client.post('/auth/signup', {
            email,
            username,
            fullName,
            password,
        });
    }

    async getMe() {
        return this.client.get('/auth/me');
    }

    async logout() {
        return this.client.post('/auth/logout');
    }

    async requestPasswordReset(email: string) {
        return this.client.post('/auth/password-reset-request', { email });
    }

    async resetPassword(email: string, token: string, newPassword: string) {
        return this.client.post('/auth/password-reset', {
            email,
            token,
            newPassword,
        });
    }

    // Inventory endpoints
    async getBooks(page = 1, limit = 20, search?: string, categoryId?: string) {
        const params = { page, limit, ...(search && { search }), ...(categoryId && { categoryId }) };
        return this.client.get('/inventory/books', { params });
    }

    async getBook(id: string) {
        return this.client.get(`/inventory/books/${id}`);
    }

    async createBook(data: any) {
        return this.client.post('/inventory/books', data);
    }

    async updateBook(id: string, data: any) {
        return this.client.put(`/inventory/books/${id}`, data);
    }

    async deleteBook(id: string) {
        return this.client.delete(`/inventory/books/${id}`);
    }

    async getCategories() {
        return this.client.get('/inventory/categories');
    }

    async createCategory(data: any) {
        return this.client.post('/inventory/categories', data);
    }

    async getAuthors() {
        return this.client.get('/inventory/authors');
    }

    async createAuthor(data: any) {
        return this.client.post('/inventory/authors', data);
    }

    async getLowStockBooks() {
        return this.client.get('/inventory/low-stock-books');
    }

    // Order endpoints
    async createOrder(data: any) {
        return this.client.post('/orders', data);
    }

    async getOrders(page = 1, limit = 20) {
        return this.client.get('/orders', { params: { page, limit } });
    }

    async getOrder(id: string) {
        return this.client.get(`/orders/${id}`);
    }

    async updateOrderStatus(id: string, status: string) {
        return this.client.put(`/orders/${id}/status`, { status });
    }

    // Coupon endpoints
    async getCoupons() {
        return this.client.get('/orders/coupons');
    }

    async validateCoupon(code: string) {
        return this.client.post('/orders/coupons/validate', { code });
    }

    // Return endpoints
    async createReturn(orderId: string, data: any) {
        return this.client.post(`/orders/${orderId}/returns`, data);
    }

    async getReturns() {
        return this.client.get('/orders/returns/list');
    }
}

export const apiClient = new ApiClient();
