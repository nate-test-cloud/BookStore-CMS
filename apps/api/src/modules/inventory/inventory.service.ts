import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IdMapper } from '../../common/id-mapper.util';
import {
    CreateBookDto,
    UpdateBookDto,
    CreateCategoryDto,
    UpdateCategoryDto,
    CreateAuthorDto,
    UpdateAuthorDto,
    CreatePublisherDto,
    UpdatePublisherDto,
    AdjustInventoryDto,
    LowStockAlertDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    /**
     * Helper method to transform Prisma book objects to API response format
     * Ensures consistent data structure across all endpoints
     */
    private transformBook(book: any) {
        // Calculate average rating from reviews
        const avgRating = book.reviews && book.reviews.length > 0
            ? Math.round((book.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / book.reviews.length) * 10) / 10
            : 0;

        return {
            id: book.id, // Keep CUID ID for database queries
            title: book.title,
            author: book.authors?.[0]?.name || 'Unknown',
            category: book.category?.name || 'Unknown',
            isbn: book.isbn,
            price: book.currentPrice || book.basePrice,
            costPrice: book.basePrice,
            stock: book.stock,
            status: book.stock > 10 ? 'In Stock' : book.stock > 0 ? 'Low Stock' : 'Out of Stock',
            rating: avgRating,
            coverImage: book.coverImage,
            description: book.description,
            publisher: book.publisher?.name || null,
            publishedYear: book.publicationDate ? new Date(book.publicationDate).getFullYear() : null,
            supplierId: null,
            createdAt: book.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: book.updatedAt?.toISOString() || null,
        };
    }

    // =============================================
    // BOOK MANAGEMENT
    // =============================================

    async createBook(createBookDto: CreateBookDto) {
        const { authorIds, categoryId, isbn, title, basePrice, discountPercent, ...rest } =
            createBookDto;

        // Check if ISBN already exists
        const existingBook = await this.prisma.book.findUnique({
            where: { isbn },
        });

        if (existingBook) {
            throw new ConflictException('A book with this ISBN already exists');
        }

        // Verify category exists
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Calculate current price
        const currentPrice = basePrice * (1 - (discountPercent || 0) / 100);

        // Create book with authors
        const book = await this.prisma.book.create({
            data: {
                isbn,
                title,
                basePrice,
                discountPercent: discountPercent || 0,
                currentPrice,
                categoryId,
                ...rest,
                authors: {
                    connect: authorIds.map((id) => ({ id })),
                },
            },
            include: {
                category: true,
                authors: true,
                publisher: true,
            },
        });

        // Create initial inventory record
        if (createBookDto.stock > 0) {
            await this.prisma.inventory.create({
                data: {
                    bookId: book.id,
                    location: createBookDto.shelfLocation || 'Default',
                    quantity: createBookDto.stock,
                },
            });
        }

        return book;
    }

    async updateBook(id: string, updateBookDto: UpdateBookDto) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        const { authorIds, ...rest } = updateBookDto;

        // Calculate current price if price or discount changed
        let currentPrice = book.currentPrice;
        if (updateBookDto.basePrice || updateBookDto.discountPercent !== undefined) {
            const basePrice = updateBookDto.basePrice || book.basePrice;
            const discount = updateBookDto.discountPercent !== undefined ? updateBookDto.discountPercent : book.discountPercent;
            currentPrice = basePrice * (1 - discount / 100);
        }

        const updatedBook = await this.prisma.book.update({
            where: { id },
            data: {
                ...rest,
                currentPrice,
                authors: authorIds
                    ? {
                        set: [],
                        connect: authorIds.map((authorId) => ({ id: authorId })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                authors: true,
                publisher: true,
            },
        });

        return updatedBook;
    }

    async getBooks(
        page = 1,
        limit = 20,
        categoryId?: string,
        searchTerm?: string,
    ) {
        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,
            isActive: true,
            ...(categoryId && { categoryId }),
            ...(searchTerm && {
                OR: [
                    { title: { contains: searchTerm, mode: 'insensitive' as const } },
                    { isbn: { contains: searchTerm, mode: 'insensitive' as const } },
                    { description: { contains: searchTerm, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [books, total] = await Promise.all([
            this.prisma.book.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: true,
                    authors: true,
                    publisher: true,
                    reviews: { select: { rating: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.book.count({ where }),
        ]);

        return {
            data: books.map(book => this.transformBook(book)),
            total,
            page,
            limit,
        };
    }

    async getBook(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
            include: {
                category: true,
                authors: true,
                publisher: true,
                inventoryItems: true,
                reviews: {
                    include: { user: { select: { id: true, fullName: true, profileImage: true } } },
                },
            },
        });

        if (!book || book.deletedAt) {
            throw new NotFoundException('Book not found');
        }

        return this.transformBook(book);
    }

    async deleteBook(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        return this.prisma.book.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    // =============================================
    // CATEGORY MANAGEMENT
    // =============================================

    async createCategory(createCategoryDto: CreateCategoryDto) {
        const { name } = createCategoryDto;
        const slug = name.toLowerCase().replace(/\s+/g, '-');

        const category = await this.prisma.category.create({
            data: {
                ...createCategoryDto,
                slug,
            },
        });

        return category;
    }

    async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async getCategories() {
        return this.prisma.category.findMany({
            include: {
                children: true,
                parent: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    async getCategory(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                books: true,
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async deleteCategory(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Check if category has books
        const bookCount = await this.prisma.book.count({
            where: { categoryId: id },
        });

        if (bookCount > 0) {
            throw new BadRequestException(
                'Cannot delete category with books. Move or delete books first.',
            );
        }

        return this.prisma.category.delete({
            where: { id },
        });
    }

    // =============================================
    // AUTHOR MANAGEMENT
    // =============================================

    async createAuthor(createAuthorDto: CreateAuthorDto) {
        return this.prisma.author.create({
            data: createAuthorDto,
        });
    }

    async updateAuthor(id: string, updateAuthorDto: UpdateAuthorDto) {
        const author = await this.prisma.author.findUnique({
            where: { id },
        });

        if (!author) {
            throw new NotFoundException('Author not found');
        }

        return this.prisma.author.update({
            where: { id },
            data: updateAuthorDto,
        });
    }

    async getAuthors(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [authors, total] = await Promise.all([
            this.prisma.author.findMany({
                skip,
                take: limit,
                include: { books: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.author.count(),
        ]);

        return {
            authors,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAuthor(id: string) {
        const author = await this.prisma.author.findUnique({
            where: { id },
            include: { books: true },
        });

        if (!author) {
            throw new NotFoundException('Author not found');
        }

        return author;
    }

    async deleteAuthor(id: string) {
        const author = await this.prisma.author.findUnique({
            where: { id },
        });

        if (!author) {
            throw new NotFoundException('Author not found');
        }

        // Check if author has books
        const bookCount = await this.prisma.book.count({
            where: {
                authors: {
                    some: { id },
                },
            },
        });

        if (bookCount > 0) {
            throw new BadRequestException(
                'Cannot delete author with books. Remove author from books first.',
            );
        }

        return this.prisma.author.delete({
            where: { id },
        });
    }

    // =============================================
    // PUBLISHER MANAGEMENT
    // =============================================

    async createPublisher(createPublisherDto: CreatePublisherDto) {
        return this.prisma.publisher.create({
            data: createPublisherDto,
        });
    }

    async updatePublisher(id: string, updatePublisherDto: UpdatePublisherDto) {
        const publisher = await this.prisma.publisher.findUnique({
            where: { id },
        });

        if (!publisher) {
            throw new NotFoundException('Publisher not found');
        }

        return this.prisma.publisher.update({
            where: { id },
            data: updatePublisherDto,
        });
    }

    async getPublishers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [publishers, total] = await Promise.all([
            this.prisma.publisher.findMany({
                skip,
                take: limit,
                include: { books: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.publisher.count(),
        ]);

        return {
            publishers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPublisher(id: string) {
        const publisher = await this.prisma.publisher.findUnique({
            where: { id },
            include: { books: true },
        });

        if (!publisher) {
            throw new NotFoundException('Publisher not found');
        }

        return publisher;
    }

    // =============================================
    // INVENTORY MANAGEMENT
    // =============================================

    async adjustInventory(bookId: string, adjustmentDto: AdjustInventoryDto, userId: string) {
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        // Create adjustment record
        const inventory = await this.prisma.inventory.findFirst({
            where: { bookId },
        });

        if (!inventory) {
            throw new NotFoundException('Inventory record not found');
        }

        // Update inventory quantity
        const updatedInventory = await this.prisma.inventory.update({
            where: { id: inventory.id },
            data: {
                quantity: { increment: adjustmentDto.quantity },
                lastRestockDate: new Date(),
            },
        });

        // Log adjustment
        await this.prisma.inventoryAdjustment.create({
            data: {
                inventoryId: inventory.id,
                adjustmentType: adjustmentDto.adjustmentType as any,
                quantity: adjustmentDto.quantity,
                reason: adjustmentDto.reason,
                adjustedBy: userId,
                notes: adjustmentDto.notes,
            },
        });

        return updatedInventory;
    }

    async getInventory(bookId: string) {
        const inventory = await this.prisma.inventory.findFirst({
            where: { bookId },
            include: { adjustments: { orderBy: { createdAt: 'desc' } } },
        });

        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }

        return inventory;
    }

    async setLowStockAlert(bookId: string, alertDto: LowStockAlertDto) {
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        return this.prisma.lowStockAlert.upsert({
            where: { bookId },
            update: { threshold: alertDto.threshold },
            create: { bookId, threshold: alertDto.threshold },
        });
    }

    async getLowStockBooks() {
        return this.prisma.book.findMany({
            where: {
                AND: [
                    { stock: { lt: 10 } }, // Default minimum stock threshold
                    { isActive: true },
                ],
            },
            include: { category: true },
        });
    }

    async getInventoryValuation() {
        const books = await this.prisma.book.findMany({
            where: { deletedAt: null },
            include: { inventoryItems: true, category: true },
        });

        const valuation = books.reduce(
            (acc, book) => {
                const value = book.currentPrice * book.stock;
                acc.totalValue += value;
                acc.totalBooks += book.stock;

                if (!acc.byCategory[book.category.id]) {
                    acc.byCategory[book.category.id] = {
                        categoryName: book.category.name,
                        value: 0,
                        books: 0,
                    };
                }

                acc.byCategory[book.category.id].value += value;
                acc.byCategory[book.category.id].books += book.stock;

                return acc;
            },
            {
                totalValue: 0,
                totalBooks: 0,
                byCategory: {},
            },
        );

        return valuation;
    }

    async searchBooks(query: string) {
        const searchTerm = query.toLowerCase();

        const books = await this.prisma.book.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                OR: [
                    { title: { contains: searchTerm, mode: 'insensitive' as const } },
                    { isbn: { contains: searchTerm, mode: 'insensitive' as const } },
                    { description: { contains: searchTerm, mode: 'insensitive' as const } },
                    { authors: { some: { name: { contains: searchTerm, mode: 'insensitive' as const } } } },
                ],
            },
            include: {
                category: true,
                authors: true,
                publisher: true,
                reviews: { select: { rating: true } },
            },
            take: 50,
        });

        return books.map(book => this.transformBook(book));
    }

    // =============================================
    // WISHLIST/FAVOURITE MANAGEMENT
    // =============================================

    async addFavourite(userId: string, bookId: string) {
        // Check if book exists
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        // Check if already in wishlist
        const existingWishlistItem = await this.prisma.wishlistItem.findUnique({
            where: { userId_bookId: { userId, bookId } },
        });

        if (existingWishlistItem) {
            return {
                message: 'Book already in favourites',
                wishlistItem: existingWishlistItem,
            };
        }

        // Add to wishlist
        const wishlistItem = await this.prisma.wishlistItem.create({
            data: {
                userId,
                bookId,
            },
            include: {
                book: {
                    include: {
                        authors: true,
                        category: true,
                        publisher: true,
                        reviews: { select: { rating: true } },
                    },
                },
            },
        });

        return {
            message: 'Book added to favourites successfully',
            wishlistItem: {
                ...wishlistItem,
                book: this.transformBook(wishlistItem.book),
            },
        };
    }

    async removeFavourite(userId: string, bookId: string) {
        const wishlistItem = await this.prisma.wishlistItem.findUnique({
            where: { userId_bookId: { userId, bookId } },
        });

        if (!wishlistItem) {
            throw new NotFoundException('Wishlist item not found');
        }

        await this.prisma.wishlistItem.delete({
            where: { userId_bookId: { userId, bookId } },
        });

        return { message: 'Book removed from favourites' };
    }

    async getFavourites(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const wishlistItems = await this.prisma.wishlistItem.findMany({
            where: { userId },
            skip,
            take: limit,
            include: {
                book: {
                    include: {
                        authors: true,
                        category: true,
                        publisher: true,
                        reviews: { select: { rating: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await this.prisma.wishlistItem.count({
            where: { userId },
        });

        return {
            data: wishlistItems.map(item => this.transformBook(item.book)),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getForYouRecommendations(userId: string, limit = 10) {
        // Get user's favourite books to understand preferences
        const favouriteBooks = await this.prisma.wishlistItem.findMany({
            where: { userId },
            include: { book: { select: { categoryId: true, id: true } } },
        });

        // Get user's purchased books
        const purchasedBooks = await this.prisma.order.findMany({
            where: { userId, status: 'PAID' },
            include: {
                items: { select: { book: { select: { categoryId: true, id: true } } } },
            },
        });

        // Extract category IDs from favourites and purchases
        const categoryIds = new Set<string>();

        favouriteBooks.forEach(item => {
            categoryIds.add(item.book.categoryId);
        });

        purchasedBooks.forEach(order => {
            order.items.forEach(item => {
                categoryIds.add(item.book.categoryId);
            });
        });

        // If no preferences found, return trending books
        if (categoryIds.size === 0) {
            return this.getTrendingBooks(limit);
        }

        // Get book IDs from favourites and purchases to exclude them
        const favouriteBookIds = favouriteBooks.map(item => item.bookId);
        const purchasedBookIds = purchasedBooks.flatMap(order =>
            order.items.map(item => item.book.id)
        );
        const excludeBookIds = [...new Set([...favouriteBookIds, ...purchasedBookIds])];

        // Recommend books from similar categories
        const recommendations = await this.prisma.book.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                categoryId: { in: Array.from(categoryIds) },
                id: { notIn: excludeBookIds },
            },
            include: {
                authors: true,
                category: true,
                reviews: { select: { rating: true } },
            },
            orderBy: [
                { rating: 'desc' },
                { views: 'desc' },
            ],
            take: limit,
        });

        return recommendations.map(book => this.transformBook(book));
    }

    private async getTrendingBooks(limit = 10) {
        const books = await this.prisma.book.findMany({
            where: {
                deletedAt: null,
                isActive: true,
            },
            include: {
                authors: true,
                category: true,
                reviews: { select: { rating: true } },
                publisher: true,
            },
            orderBy: [
                { rating: 'desc' },
                { views: 'desc' },
            ],
            take: limit,
        });

        return books.map(book => this.transformBook(book));
    }
}
