import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BooksReadingService {
    constructor(private prisma: PrismaService) { }

    async getIssuedBooks(userId: string) {
        const issuedBooks = await this.prisma.issuedBook.findMany({
            where: { userId },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        isbn: true,
                        authors: true,
                        coverImage: true,
                        description: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            issuedBooks: issuedBooks.map((issued) => ({
                id: issued.id,
                bookId: issued.bookId,
                currentPage: issued.currentPage,
                totalPages: issued.totalPages,
                lastReadAt: issued.lastReadAt,
                createdAt: issued.createdAt,
                book: issued.book,
            })),
        };
    }

    async getPurchases(userId: string) {
        const purchases = await this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                isbn: true,
                                authors: true,
                                coverImage: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            purchases: purchases.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
                subtotal: order.subtotal,
                createdAt: order.createdAt,
                items: order.items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total,
                    book: item.book,
                })),
            })),
        };
    }

    async getBookContent(userId: string, bookId: string) {
        // Check if user has access to this book (has issued it)
        const issuedBook = await this.prisma.issuedBook.findFirst({
            where: { userId, bookId },
            include: { book: true },
        });

        if (!issuedBook) {
            throw new ForbiddenException('You do not have access to this book');
        }

        // Get total pages
        const totalPages = issuedBook.totalPages;

        return {
            id: issuedBook.id,
            bookId: issuedBook.bookId,
            title: issuedBook.book.title,
            currentPage: issuedBook.currentPage,
            totalPages,
            lastReadAt: issuedBook.lastReadAt,
            message: `Book "${issuedBook.book.title}" loaded. Total pages: ${totalPages}`,
        };
    }

    async getPageContent(userId: string, bookId: string, pageNumber: number) {
        // Check if user has access to this book
        const issuedBook = await this.prisma.issuedBook.findFirst({
            where: { userId, bookId },
        });

        if (!issuedBook) {
            throw new ForbiddenException('You do not have access to this book');
        }

        // Validate page number
        if (pageNumber < 1 || pageNumber > issuedBook.totalPages) {
            throw new NotFoundException('Page not found');
        }

        // Get page content
        let pageContent = await this.prisma.bookContent.findFirst({
            where: { bookId, pageNumber },
        });

        // If no content, generate dummy content
        if (!pageContent) {
            pageContent = await this.generateDummyPageContent(bookId, pageNumber);
        }

        // Update last read page and time
        await this.prisma.issuedBook.update({
            where: { id: issuedBook.id },
            data: {
                currentPage: pageNumber,
                lastReadAt: new Date(),
            },
        });

        return {
            bookId,
            pageNumber,
            totalPages: issuedBook.totalPages,
            content: pageContent.content,
            title: (await this.prisma.book.findUnique({ where: { id: bookId } }))?.title,
        };
    }

    private async generateDummyPageContent(bookId: string, pageNumber: number) {
        const dummyParagraphs = [
            'The morning sun cast long shadows across the quiet street. Birds sang in the distance, their melodies creating a peaceful symphony that echoed through the neighborhood. A gentle breeze rustled the leaves of the old oak trees that lined the sidewalk.',
            'She walked slowly, taking in every detail of the world around her. The world seemed different today, more vibrant, more alive. Colors appeared richer, sounds more distinct, and the air itself felt charged with possibility.',
            'It was in that moment that she realized something profound about life. Everything we experience is filtered through our perception, shaped by our beliefs and experiences. The world we see is not objective reality, but our unique interpretation of it.',
            'As the day progressed, she found herself lost in thought. Memories from her past flooded back, each one carrying its own emotional weight. Some brought smiles, others brought tears, but all of them were valuable pieces of her journey.',
            'The evening came quickly, painting the sky in shades of orange and pink. She sat on the porch, watching the sunset, feeling grateful for the simple beauty of the moment. In this stillness, she found peace.',
            'Night fell gently, bringing with it the promise of rest. The stars emerged one by one, like diamonds scattered across black velvet. She gazed up at them, pondering the mysteries of the universe and her place within it.',
            'As midnight approached, she reflected on the events of the day. So much had changed, yet nothing had really changed at all. It was she who had changed, in the ways she saw the world and understood herself.',
            'The next morning brought new hope. With fresh eyes and renewed spirit, she stepped forward into a new chapter of her story. Whatever lay ahead, she was ready to face it with courage and grace.',
        ];

        const content = dummyParagraphs
            .map(
                (para) =>
                    `${para}\n\n[Page ${pageNumber} of your reading journey]`,
            )
            .join('\n\n');

        // Save to database
        return await this.prisma.bookContent.create({
            data: {
                bookId,
                pageNumber,
                content,
            },
        });
    }

    async seedBookContent(bookId: string, totalPages: number) {
        // Check if book exists
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        // Generate and save dummy content for all pages
        for (let page = 1; page <= totalPages; page++) {
            const existingContent = await this.prisma.bookContent.findFirst({
                where: { bookId, pageNumber: page },
            });

            if (!existingContent) {
                await this.generateDummyPageContent(bookId, page);
            }
        }

        return {
            message: `Book content seeded successfully`,
            bookId,
            totalPages,
        };
    }
}
