// Auth Types
export interface User {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: UserRole;
    profileImage?: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    CASHIER = 'CASHIER',
    INVENTORY_STAFF = 'INVENTORY_STAFF',
    CUSTOMER = 'CUSTOMER',
}

// Book Types
export interface Book {
    id: string;
    isbn: string;
    barcode?: string;
    title: string;
    subtitle?: string;
    description?: string;
    coverImage?: string;
    pages?: number;
    format: BookFormat;
    language: string;
    edition: string;
    publicationDate?: string;
    categoryId: string;
    category?: Category;
    publisherId?: string;
    publisher?: Publisher;
    basePrice: number;
    discountPercent: number;
    currentPrice: number;
    stock: number;
    minimumStock: number;
    shelfLocation?: string;
    isActive: boolean;
    rating: number;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export enum BookFormat {
    PAPERBACK = 'PAPERBACK',
    HARDCOVER = 'HARDCOVER',
    EBOOK = 'EBOOK',
    AUDIOBOOK = 'AUDIOBOOK',
}

// Category Types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    parent?: Category;
    children?: Category[];
    image?: string;
    createdAt: string;
    updatedAt: string;
}

// Author Types
export interface Author {
    id: string;
    name: string;
    bio?: string;
    image?: string;
    born?: string;
    createdAt: string;
    updatedAt: string;
}

// Publisher Types
export interface Publisher {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

// Order Types
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    orderType: OrderType;
    status: OrderStatus;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    items: OrderItem[];
    couponId?: string;
    shippingCost?: number;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export enum OrderType {
    POS = 'POS',
    ECOMMERCE = 'ECOMMERCE',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    UPI = 'UPI',
    BANK_TRANSFER = 'BANK_TRANSFER',
    WALLET = 'WALLET',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    PARTIAL = 'PARTIAL',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED',
}

// Order Item
export interface OrderItem {
    id: string;
    orderId: string;
    bookId: string;
    book?: Book;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
    createdAt: string;
}

// Cart Types
export interface CartItem {
    bookId: string;
    book?: Book;
    quantity: number;
    unitPrice: number;
}

// Coupon Types
export interface Coupon {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount?: number;
    minPurchase?: number;
    maxUses?: number;
    usageCount: number;
    maxUsesPerUser?: number;
    startDate: string;
    expiryDate: string;
    isActive: boolean;
    applicableBooks?: string[];
    applicableCategories?: string[];
    createdAt: string;
    updatedAt: string;
}

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
}

// Return Types
export interface Return {
    id: string;
    returnNumber: string;
    orderId: string;
    order?: Order;
    reason: ReturnReason;
    description?: string;
    status: ReturnStatus;
    refundAmount: number;
    refundedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export enum ReturnReason {
    DEFECTIVE = 'DEFECTIVE',
    NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
    CHANGED_MIND = 'CHANGED_MIND',
    DAMAGED_IN_TRANSIT = 'DAMAGED_IN_TRANSIT',
    WRONG_ITEM = 'WRONG_ITEM',
}

export enum ReturnStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REFUNDED = 'REFUNDED',
}

// API Response
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Auth Response
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface SignupResponse {
    user: User;
    message: string;
}
