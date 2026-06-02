/**
 * API Client Configuration
 * Centralized API calls with consistent configuration
 */

const API_BASE_URL = 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

/**
 * Make API request with error handling and token management
 */
export async function apiCall<T = any>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header with JWT token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/**
 * GET request
 */
export function apiGet<T = any>(endpoint: string, options?: FetchOptions) {
    return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export function apiPost<T = any>(endpoint: string, data?: any, options?: FetchOptions) {
    return apiCall<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request
 */
export function apiPut<T = any>(endpoint: string, data?: any, options?: FetchOptions) {
    return apiCall<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request
 */
export function apiDelete<T = any>(endpoint: string, options?: FetchOptions) {
    return apiCall<T>(endpoint, {
        ...options,
        method: 'DELETE',
    });
}
