import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean up existing data (order matters due to foreign keys)
    await prisma.book.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.author.deleteMany();
    await prisma.publisher.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@bookstore.com',
            username: 'admin',
            fullName: 'Admin User',
            passwordHash: adminPassword,
            role: UserRole.ADMIN,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });

    // Create manager user
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const managerUser = await prisma.user.create({
        data: {
            email: 'manager@bookstore.com',
            username: 'manager',
            fullName: 'Manager User',
            passwordHash: managerPassword,
            role: UserRole.MANAGER,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });

    // Create cashier user
    const cashierPassword = await bcrypt.hash('Cashier@123', 10);
    const cashierUser = await prisma.user.create({
        data: {
            email: 'cashier@bookstore.com',
            username: 'cashier',
            fullName: 'Cashier User',
            passwordHash: cashierPassword,
            role: UserRole.CASHIER,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });

    // Create customer user
    const customerPassword = await bcrypt.hash('Customer@123', 10);
    const customerUser = await prisma.user.create({
        data: {
            email: 'customer@bookstore.com',
            username: 'customer',
            fullName: 'Customer User',
            passwordHash: customerPassword,
            role: UserRole.CUSTOMER,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });

    // Create categories
    const fictionCategory = await prisma.category.create({
        data: {
            name: 'Fiction',
            slug: 'fiction',
            description: 'Fiction and novels',
        },
    });

    const nonFictionCategory = await prisma.category.create({
        data: {
            name: 'Non-Fiction',
            slug: 'non-fiction',
            description: 'Non-fiction and educational',
        },
    });

    const techCategory = await prisma.category.create({
        data: {
            name: 'Technology',
            slug: 'technology',
            parentId: nonFictionCategory.id,
            description: 'Technology and programming',
        },
    });

    // Create authors
    const author1 = await prisma.author.create({
        data: {
            name: 'George Orwell',
            bio: 'British author and journalist',
        },
    });

    const author2 = await prisma.author.create({
        data: {
            name: 'J.K. Rowling',
            bio: 'British author of the Harry Potter series',
        },
    });

    const author3 = await prisma.author.create({
        data: {
            name: 'Robert C. Martin',
            bio: 'American software engineer and author',
        },
    });

    // Create publishers
    const publisher1 = await prisma.publisher.create({
        data: {
            name: 'Penguin Books',
            country: 'United Kingdom',
            website: 'www.penguin.co.uk',
        },
    });

    const publisher2 = await prisma.publisher.create({
        data: {
            name: 'Bloomsbury',
            country: 'United Kingdom',
            website: 'www.bloomsbury.com',
        },
    });

    const publisher3 = await prisma.publisher.create({
        data: {
            name: 'Prentice Hall',
            country: 'United States',
            website: 'www.pearson.com',
        },
    });

    // Create books
    const book1 = await prisma.book.create({
        data: {
            isbn: '978-0451524935',
            barcode: '9780451524935',
            title: '1984',
            subtitle: 'A Dystopian Novel',
            description:
                'A dystopian social science fiction novel and cautionary tale, written by English author George Orwell.',
            categoryId: fictionCategory.id,
            publisherId: publisher1.id,
            basePrice: 599,
            discountPercent: 10,
            currentPrice: 539.1,
            stock: 50,
            minimumStock: 10,
            edition: '1st',
            pages: 328,
            language: 'English',
            publicationDate: new Date('1949-06-08'),
            authors: {
                connect: [{ id: author1.id }],
            },
        },
    });

    const book2 = await prisma.book.create({
        data: {
            isbn: '978-0439708180',
            barcode: '9780439708180',
            title: 'Harry Potter and the Philosopher\'s Stone',
            description: 'The first novel in the Harry Potter series.',
            categoryId: fictionCategory.id,
            publisherId: publisher2.id,
            basePrice: 499,
            discountPercent: 5,
            currentPrice: 474.05,
            stock: 100,
            minimumStock: 15,
            edition: '1st',
            pages: 223,
            language: 'English',
            publicationDate: new Date('1997-06-26'),
            authors: {
                connect: [{ id: author2.id }],
            },
        },
    });

    const book3 = await prisma.book.create({
        data: {
            isbn: '978-0132350884',
            barcode: '9780132350884',
            title: 'Clean Code',
            description: 'A Handbook of Agile Software Craftsmanship',
            categoryId: techCategory.id,
            publisherId: publisher3.id,
            basePrice: 1299,
            discountPercent: 15,
            currentPrice: 1104.15,
            stock: 30,
            minimumStock: 5,
            edition: '1st',
            pages: 464,
            language: 'English',
            publicationDate: new Date('2008-08-01'),
            authors: {
                connect: [{ id: author3.id }],
            },
        },
    });

    // Create store settings
    await prisma.storeSettings.create({
        data: {
            storeName: 'BookStore Pro',
            storeEmail: 'contact@bookstore.com',
            storePhone: '+91-9876543210',
            gstRate: 18,
            currency: 'INR',
            address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
        },
    });

    console.log('✅ Seeding complete!');
    console.log(`
    🔐 Admin User: admin@bookstore.com / Admin@123
    👨‍💼 Manager User: manager@bookstore.com / Manager@123
    🏪 Cashier User: cashier@bookstore.com / Cashier@123
    👤 Customer User: customer@bookstore.com / Customer@123
  `);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
