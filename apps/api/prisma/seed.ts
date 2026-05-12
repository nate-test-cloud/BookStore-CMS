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
    const authors: any[] = [];
    const authorData = [
        { name: 'George Orwell', bio: 'British author and journalist' },
        { name: 'J.K. Rowling', bio: 'British author of the Harry Potter series' },
        { name: 'Robert C. Martin', bio: 'American software engineer and author' },
        { name: 'Stephen King', bio: 'American author of horror and suspense novels' },
        { name: 'J.R.R. Tolkien', bio: 'English author and philologist' },
        { name: 'Jane Austen', bio: 'English novelist known for her romantic fiction' },
        { name: 'Harper Lee', bio: 'American author of To Kill a Mockingbird' },
        { name: 'F. Scott Fitzgerald', bio: 'American novelist of the Jazz Age' },
        { name: 'Ernest Hemingway', bio: 'American novelist and short-story writer' },
        { name: 'Agatha Christie', bio: 'British author of detective novels' },
        { name: 'Paulo Coelho', bio: 'Brazilian author of philosophical fiction' },
        { name: 'Haruki Murakami', bio: 'Japanese author of surreal fiction' },
        { name: 'Margaret Atwood', bio: 'Canadian author and poet' },
        { name: 'Dan Brown', bio: 'American author of thriller novels' },
        { name: 'Khaled Hosseini', bio: 'Afghan-American author' },
    ];

    for (const author of authorData) {
        const created = await prisma.author.create({
            data: author,
        });
        authors.push(created);
    }

    // Create publishers
    const publishers: any[] = [];
    const publisherData = [
        { name: 'Penguin Books', country: 'United Kingdom', website: 'www.penguin.co.uk' },
        { name: 'Bloomsbury', country: 'United Kingdom', website: 'www.bloomsbury.com' },
        { name: 'Prentice Hall', country: 'United States', website: 'www.pearson.com' },
        { name: 'Simon & Schuster', country: 'United States', website: 'www.simonandschuster.com' },
        { name: 'Hachette', country: 'France', website: 'www.hachette.com' },
    ];

    for (const publisher of publisherData) {
        const created = await prisma.publisher.create({
            data: publisher,
        });
        publishers.push(created);
    }

    // Create 30+ books
    const booksData: any[] = [
        { title: '1984', subtitle: 'A Dystopian Novel', description: 'A dystopian social science fiction novel and cautionary tale.', categoryId: 1, publisherId: 0, authorIds: [0], basePrice: 599, pages: 328, language: 'English', publicationDate: '1949-06-08' },
        { title: "Harry Potter and the Philosopher's Stone", subtitle: 'The First Book', description: 'The first novel in the Harry Potter series following a young wizard.', categoryId: 1, publisherId: 1, authorIds: [1], basePrice: 499, pages: 223, language: 'English', publicationDate: '1997-06-26' },
        { title: 'Clean Code', subtitle: 'A Handbook of Agile Software Craftsmanship', description: 'A guide to writing clean, readable code.', categoryId: 2, publisherId: 2, authorIds: [2], basePrice: 1299, pages: 464, language: 'English', publicationDate: '2008-08-01' },
        { title: 'The Hobbit', subtitle: 'There and Back Again', description: 'A fantasy adventure novel about a hobbit named Bilbo Baggins.', categoryId: 1, publisherId: 0, authorIds: [4], basePrice: 549, pages: 310, language: 'English', publicationDate: '1937-09-21' },
        { title: 'Pride and Prejudice', subtitle: 'A Romance of Manners', description: 'A romantic novel of manners set in Georgian England.', categoryId: 1, publisherId: 0, authorIds: [5], basePrice: 399, pages: 279, language: 'English', publicationDate: '1813-01-28' },
        { title: 'To Kill a Mockingbird', subtitle: 'A Classic of Modern American Literature', description: 'A novel about racial injustice in the American South.', categoryId: 1, publisherId: 3, authorIds: [6], basePrice: 599, pages: 281, language: 'English', publicationDate: '1960-07-11' },
        { title: 'The Great Gatsby', subtitle: 'A Tale of the Jazz Age', description: 'A novel about the American Dream in the 1920s.', categoryId: 1, publisherId: 0, authorIds: [7], basePrice: 499, pages: 180, language: 'English', publicationDate: '1925-04-10' },
        { title: 'The Old Man and the Sea', subtitle: 'A Novella', description: 'A novella about an old fisherman and his struggle with a giant marlin.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 349, pages: 127, language: 'English', publicationDate: '1952-09-01' },
        { title: 'Murder on the Orient Express', subtitle: 'A Hercule Poirot Mystery', description: 'A detective novel featuring Hercule Poirot solving a murder on a luxury train.', categoryId: 3, publisherId: 0, authorIds: [9], basePrice: 449, pages: 256, language: 'English', publicationDate: '1934-01-01' },
        { title: 'The Alchemist', subtitle: 'A Philosophical Adventure', description: 'A novel about following your dreams and personal legend.', categoryId: 1, publisherId: 4, authorIds: [10], basePrice: 399, pages: 224, language: 'English', publicationDate: '1988-01-01' },
        { title: 'Norwegian Wood', subtitle: 'A Love Story', description: 'A novel exploring themes of love, loss, and nostalgia in 1960s Tokyo.', categoryId: 1, publisherId: 0, authorIds: [11], basePrice: 549, pages: 296, language: 'English', publicationDate: '1987-09-04' },
        { title: "The Handmaid's Tale", subtitle: 'A Dystopian Novel', description: 'A dystopian novel about a totalitarian society.', categoryId: 1, publisherId: 0, authorIds: [12], basePrice: 599, pages: 395, language: 'English', publicationDate: '1985-06-01' },
        { title: 'The Da Vinci Code', subtitle: 'A Mystery Thriller', description: 'A thriller about art, history, and conspiracy.', categoryId: 3, publisherId: 3, authorIds: [13], basePrice: 699, pages: 454, language: 'English', publicationDate: '2003-03-18' },
        { title: 'The Kite Runner', subtitle: 'A Novel of Friendship and Redemption', description: 'A novel about friendship, betrayal, and redemption set in Afghanistan.', categoryId: 1, publisherId: 3, authorIds: [14], basePrice: 549, pages: 324, language: 'English', publicationDate: '2003-05-29' },
        { title: 'Dune', subtitle: 'A Science Fiction Masterpiece', description: 'An epic science fiction novel set on the desert planet Arrakis.', categoryId: 4, publisherId: 0, authorIds: [2], basePrice: 799, pages: 688, language: 'English', publicationDate: '1965-06-01' },
        { title: 'The Catcher in the Rye', subtitle: 'A Coming of Age Novel', description: 'A novel about teenage alienation and angst.', categoryId: 1, publisherId: 0, authorIds: [7], basePrice: 449, pages: 277, language: 'English', publicationDate: '1951-07-16' },
        { title: 'Wuthering Heights', subtitle: 'A Gothic Romance', description: 'A gothic romance novel set on the Yorkshire moors.', categoryId: 1, publisherId: 0, authorIds: [5], basePrice: 449, pages: 323, language: 'English', publicationDate: '1847-12-19' },
        { title: 'Jane Eyre', subtitle: 'A Gothic Romance', description: 'A gothic romance about a young governess and her mysterious employer.', categoryId: 1, publisherId: 0, authorIds: [5], basePrice: 449, pages: 507, language: 'English', publicationDate: '1847-10-16' },
        { title: 'The Hunger Games', subtitle: 'A Dystopian Adventure', description: 'A dystopian novel about survival and rebellion.', categoryId: 1, publisherId: 3, authorIds: [1], basePrice: 499, pages: 374, language: 'English', publicationDate: '2008-09-14' },
        { title: 'Sherlock Holmes: A Study in Scarlet', subtitle: 'The First Sherlock Holmes Mystery', description: 'The first novel featuring the famous detective Sherlock Holmes.', categoryId: 3, publisherId: 0, authorIds: [8], basePrice: 399, pages: 220, language: 'English', publicationDate: '1887-11-01' },
        { title: 'The Count of Monte Cristo', subtitle: 'A Tale of Vengeance', description: 'A novel of adventure and revenge set in the 19th century.', categoryId: 1, publisherId: 0, authorIds: [7], basePrice: 599, pages: 462, language: 'English', publicationDate: '1844-08-28' },
        { title: 'Les Misérables', subtitle: 'A Epic of Redemption', description: 'An epic novel about justice, love, and redemption in 19th century France.', categoryId: 1, publisherId: 4, authorIds: [8], basePrice: 799, pages: 655, language: 'English', publicationDate: '1862-04-03' },
        { title: 'The Picture of Dorian Gray', subtitle: 'A Philosophical Novel', description: 'A novel about beauty, morality, and corruption.', categoryId: 1, publisherId: 0, authorIds: [12], basePrice: 399, pages: 254, language: 'English', publicationDate: '1890-07-01' },
        { title: 'Moby Dick', subtitle: 'A Nautical Epic', description: 'An epic novel about a whaling ship and its obsessed captain.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 699, pages: 585, language: 'English', publicationDate: '1851-10-18' },
        { title: 'The Odyssey', subtitle: 'An Ancient Epic', description: 'An ancient Greek epic poem about Odysseus and his journey home.', categoryId: 1, publisherId: 0, authorIds: [4], basePrice: 599, pages: 400, language: 'English', publicationDate: '800-01-01' },
        { title: 'One Hundred Years of Solitude', subtitle: 'A Magical Realism Novel', description: 'A novel chronicling seven generations of the Buendía family.', categoryId: 1, publisherId: 4, authorIds: [10], basePrice: 649, pages: 417, language: 'English', publicationDate: '1967-05-30' },
        { title: 'The Lord of the Rings', subtitle: 'The Fellowship of the Ring', description: 'The first volume of an epic fantasy trilogy.', categoryId: 1, publisherId: 0, authorIds: [4], basePrice: 899, pages: 481, language: 'English', publicationDate: '1954-07-29' },
        { title: 'Brave New World', subtitle: 'A Dystopian Vision', description: 'A dystopian novel about a future world of pleasure and control.', categoryId: 4, publisherId: 0, authorIds: [0], basePrice: 549, pages: 311, language: 'English', publicationDate: '1932-08-30' },
        { title: 'The Brothers Karamazov', subtitle: 'A Russian Epic', description: 'A philosophical novel about faith, doubt, and morality.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 699, pages: 732, language: 'English', publicationDate: '1879-01-01' },
        { title: 'Crime and Punishment', subtitle: 'A Russian Masterpiece', description: 'A novel exploring guilt, morality, and redemption through a crime.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 649, pages: 671, language: 'English', publicationDate: '1866-01-01' },
        { title: 'Hamlet', subtitle: 'A Tragedy', description: 'A tragedy about a Danish prince seeking revenge.', categoryId: 5, publisherId: 0, authorIds: [7], basePrice: 349, pages: 432, language: 'English', publicationDate: '1603-01-01' },
        { title: 'A Tale of Two Cities', subtitle: 'A History of the French Revolution', description: 'A novel set during the French Revolution about sacrifice and resurrection.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 549, pages: 489, language: 'English', publicationDate: '1859-05-30' },
    ];

    const books: any[] = [];
    for (let i = 0; i < booksData.length; i++) {
        const bookData = booksData[i];
        const created = await prisma.book.create({
            data: {
                isbn: `978-${String(1000000000 + i).slice(-9)}`,
                barcode: `${String(1000000000 + i).slice(-9)}`,
                title: bookData.title,
                subtitle: bookData.subtitle,
                description: bookData.description,
                categoryId: bookData.categoryId === 1 ? fictionCategory.id : 
                           bookData.categoryId === 2 ? techCategory.id :
                           bookData.categoryId === 3 ? fictionCategory.id :
                           bookData.categoryId === 4 ? nonFictionCategory.id :
                           bookData.categoryId === 5 ? fictionCategory.id : fictionCategory.id,
                publisherId: publishers[bookData.publisherId % publishers.length].id,
                basePrice: bookData.basePrice,
                discountPercent: Math.floor(Math.random() * 20),
                currentPrice: Math.floor(bookData.basePrice * (1 - Math.random() * 0.2)),
                stock: Math.floor(Math.random() * 100) + 10,
                minimumStock: 5,
                edition: '1st',
                pages: bookData.pages,
                language: bookData.language,
                publicationDate: new Date(bookData.publicationDate),
                authors: {
                    connect: bookData.authorIds.map(id => ({ id: authors[id].id })),
                },
            },
        });
        books.push(created);
    }

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
