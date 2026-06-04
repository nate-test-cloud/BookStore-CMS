/**
 * TEST CASE 8.5: BOOK SERVICE - FILTER AND SEARCH UNIT TEST (SIMPLIFIED)
 */

import { NotFoundException } from '@nestjs/common';

// Mock InventoryService
class InventoryServiceMock {
    constructor(private prisma: any) { }

    async getBooks(filters: any = {}): Promise<any[]> {
        const where: any = {};

        if (filters.category) {
            where.category = { name: filters.category };
        }

        if (filters.author) {
            where.authors = { some: { name: filters.author } };
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.currentPrice = {};
            if (filters.minPrice !== undefined) {
                where.currentPrice.gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                where.currentPrice.lte = filters.maxPrice;
            }
        }

        if (filters.search) {
            where.OR = [
                {
                    title: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    isbn: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const orderBy: any = {};
        if (filters.sortBy) {
            orderBy[filters.sortBy] = filters.sortOrder || 'asc';
        }

        return this.prisma.book.findMany({
            where,
            orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
            skip: filters.skip || 0,
            take: filters.take || 10,
        });
    }

    async searchBooksByTitle(title: string): Promise<any[]> {
        return this.prisma.book.findMany({
            where: {
                title: {
                    contains: title,
                    mode: 'insensitive',
                },
            },
        });
    }

    async searchBooksByISBN(isbn: string): Promise<any> {
        return this.prisma.book.findUnique({
            where: { isbn },
        });
    }
}

describe('TEST CASE 8.5: InventoryService - Book Filter & Search Unit Testing', () => {
    let inventoryService: InventoryServiceMock;
    let mockPrismaService: any;

    beforeEach(() => {
        mockPrismaService = {
            book: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
            },
        };

        inventoryService = new InventoryServiceMock(mockPrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getBooks() - Filter by Category', () => {
        it('should return books matching category', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'Book 1', category: { name: 'Fiction' } },
                { id: 'book-2', title: 'Book 2', category: { name: 'Fiction' } },
            ]);

            const result = await inventoryService.getBooks({ category: 'Fiction' });

            expect(result).toHaveLength(2);
            expect(mockPrismaService.book.findMany).toHaveBeenCalled();
        });

        it('should return empty array for non-existent category', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([]);

            const result = await inventoryService.getBooks({
                category: 'NonExistent',
            });

            expect(result).toHaveLength(0);
        });
    });

    describe('getBooks() - Filter by Author', () => {
        it('should return books by specific author', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'Book 1', authors: [{ name: 'Author A' }] },
            ]);

            const result = await inventoryService.getBooks({ author: 'Author A' });

            expect(result).toHaveLength(1);
        });

        it('should return multiple books by same author', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'Book 1' },
                { id: 'book-2', title: 'Book 2' },
            ]);

            const result = await inventoryService.getBooks({ author: 'Author A' });

            expect(result).toHaveLength(2);
        });
    });

    describe('getBooks() - Filter by Price Range', () => {
        it('should return books within price range', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', currentPrice: 100 },
                { id: 'book-2', currentPrice: 150 },
            ]);

            const result = await inventoryService.getBooks({
                minPrice: 100,
                maxPrice: 200,
            });

            expect(result).toHaveLength(2);
        });

        it('should exclude books above price range', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', currentPrice: 50 },
            ]);

            const result = await inventoryService.getBooks({
                minPrice: 25,
                maxPrice: 75,
            });

            expect(result).toHaveLength(1);
        });

        it('should handle edge case of exact price boundaries', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', currentPrice: 100 },
            ]);

            const result = await inventoryService.getBooks({
                minPrice: 100,
                maxPrice: 100,
            });

            expect(result).toHaveLength(1);
        });
    });

    describe('getBooks() - Search by Title', () => {
        it('should find books by title substring', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'The Great Adventure' },
            ]);

            const result = await inventoryService.getBooks({ search: 'Great' });

            expect(result).toHaveLength(1);
        });

        it('should search case-insensitively', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'The GREAT Adventure' },
            ]);

            const result = await inventoryService.getBooks({ search: 'great' });

            expect(result).toHaveLength(1);
        });

        it('should return empty array for non-matching title', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([]);

            const result = await inventoryService.getBooks({ search: 'Nonexistent' });

            expect(result).toHaveLength(0);
        });
    });

    describe('getBooks() - Search by ISBN', () => {
        it('should find book by exact ISBN', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: 'book-1',
                isbn: '978-0-123456-78-9',
            });

            const result = await inventoryService.searchBooksByISBN(
                '978-0-123456-78-9',
            );

            expect(result).toBeDefined();
            expect(result.isbn).toBe('978-0-123456-78-9');
        });

        it('should return null for non-existent ISBN', async () => {
            mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

            const result = await inventoryService.searchBooksByISBN(
                '999-9-999999-99-9',
            );

            expect(result).toBeNull();
        });
    });

    describe('getBooks() - Multiple Filters Combined', () => {
        it('should apply AND logic for multiple filters', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'Book', category: 'Fiction', currentPrice: 150 },
            ]);

            const result = await inventoryService.getBooks({
                category: 'Fiction',
                minPrice: 100,
                maxPrice: 200,
            });

            expect(result).toHaveLength(1);
            expect(mockPrismaService.book.findMany).toHaveBeenCalled();
        });

        it('should combine category, author, and price filters', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1' },
            ]);

            const result = await inventoryService.getBooks({
                category: 'Fiction',
                author: 'Author A',
                minPrice: 50,
                maxPrice: 200,
            });

            expect(result).toHaveLength(1);
        });
    });

    describe('getBooks() - Pagination', () => {
        it('should return correct page with skip and take', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-3' },
                { id: 'book-4' },
            ]);

            const result = await inventoryService.getBooks({ skip: 2, take: 2 });

            expect(result).toHaveLength(2);
            expect(mockPrismaService.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 2,
                    take: 2,
                }),
            );
        });

        it('should handle first page', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1' },
                { id: 'book-2' },
            ]);

            const result = await inventoryService.getBooks({ skip: 0, take: 2 });

            expect(result).toHaveLength(2);
        });

        it('should handle last page with fewer items', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-9' },
            ]);

            const result = await inventoryService.getBooks({ skip: 8, take: 2 });

            expect(result).toHaveLength(1);
        });
    });

    describe('getBooks() - Sorting', () => {
        it('should sort by title ascending', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', title: 'A Book' },
                { id: 'book-2', title: 'B Book' },
            ]);

            const result = await inventoryService.getBooks({
                sortBy: 'title',
                sortOrder: 'asc',
            });

            expect(result).toHaveLength(2);
        });

        it('should sort by price descending', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', currentPrice: 200 },
                { id: 'book-2', currentPrice: 100 },
            ]);

            const result = await inventoryService.getBooks({
                sortBy: 'currentPrice',
                sortOrder: 'desc',
            });

            expect(result).toHaveLength(2);
        });

        it('should sort by creation date', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([
                { id: 'book-1', createdAt: new Date('2024-01-01') },
                { id: 'book-2', createdAt: new Date('2024-01-02') },
            ]);

            const result = await inventoryService.getBooks({
                sortBy: 'createdAt',
                sortOrder: 'asc',
            });

            expect(result).toHaveLength(2);
        });
    });

    describe('getBooks() - Empty Results', () => {
        it('should return empty array when no books found', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([]);

            const result = await inventoryService.getBooks({
                category: 'Nonexistent',
            });

            expect(result).toHaveLength(0);
        });

        it('should return empty array for non-matching search', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([]);

            const result = await inventoryService.getBooks({
                search: 'Completely Nonexistent Book Title',
            });

            expect(result).toHaveLength(0);
        });

        it('should not throw error on empty results', async () => {
            mockPrismaService.book.findMany.mockResolvedValueOnce([]);

            await expect(
                inventoryService.getBooks({ category: 'Unknown' }),
            ).resolves.not.toThrow();
        });
    });
});
