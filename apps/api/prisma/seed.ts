import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean up existing data (order matters due to foreign keys)
    // Delete in reverse dependency order
    await prisma.bookContent.deleteMany();
    await prisma.issuedBook.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.book.deleteMany();
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

    // Create supplier user
    const supplierPassword = await bcrypt.hash('Supplier@123', 10);
    const supplierUser = await prisma.user.create({
        data: {
            email: 'supplier@bookstore.com',
            username: 'supplier',
            fullName: 'Supplier User',
            passwordHash: supplierPassword,
            role: UserRole.SUPPLIER,
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

    // Create suppliers
    const suppliersToCreate = [
        { name: 'Classic Books Distributors', contactPerson: 'John Smith', email: 'john@classicbooks.com', phone: '555-0101', address: '123 Publisher Lane, New York, NY 10001', paymentTerms: 'Net 30 days' },
        { name: 'Modern Publishing Supply', contactPerson: 'Sarah Johnson', email: 'sarah@modernpub.com', phone: '555-0102', address: '456 Distribution Ave, Chicago, IL 60601', paymentTerms: 'Net 45 days' },
        { name: 'Global Book Imports', contactPerson: 'Michael Chen', email: 'michael@globalbooks.com', phone: '555-0103', address: '789 Import St, Los Angeles, CA 90001', paymentTerms: 'Net 60 days' },
        { name: 'Independent Authors Hub', contactPerson: 'Emma Williams', email: 'emma@indieauth.com', phone: '555-0104', address: '321 Author Plaza, Austin, TX 78701', paymentTerms: 'Net 15 days' },
        { name: 'Academic Press Solutions', contactPerson: 'Dr. Robert Davis', email: 'robert@acadermic.com', phone: '555-0105', address: '654 University Blvd, Boston, MA 02101', paymentTerms: 'Net 30 days' },
    ];

    for (const supplierData of suppliersToCreate) {
        await prisma.supplier.create({
            data: supplierData,
        });
    }

    // Create 30+ books with Amazon cover images
    const bookCoverImages = {
        "1984": "https://m.media-amazon.com/images/I/71kxa1-0mfL._SL1500_.jpg",
        "Harry Potter and the Philosopher's Stone": "https://m.media-amazon.com/images/I/81YOuOGFCJL._SL1500_.jpg",
        "Clean Code": "https://m.media-amazon.com/images/I/41xShlnTZTL._SL500_.jpg",
        "The Hobbit": "https://m.media-amazon.com/images/I/91b0C2YNSrL._SL1500_.jpg",
        "Pride and Prejudice": "https://m.media-amazon.com/images/I/81Scutrtj4L._SL1500_.jpg",
        "To Kill a Mockingbird": "https://m.media-amazon.com/images/I/81OdwZG6lFL._SL1500_.jpg",
        "The Great Gatsby": "https://m.media-amazon.com/images/I/81af+MCATTL._SL1500_.jpg",
        "The Old Man and the Sea": "https://m.media-amazon.com/images/I/71KilybDOoL._SL1500_.jpg",
        "Murder on the Orient Express": "https://m.media-amazon.com/images/I/81OthjkJBuL._SL1500_.jpg",
        "The Alchemist": "https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg",
        "Norwegian Wood": "https://m.media-amazon.com/images/I/81zqVhvbHbL._SL1500_.jpg",
        "The Handmaid's Tale": "https://m.media-amazon.com/images/I/91AHN5jLsoL._SL1500_.jpg",
        "The Da Vinci Code": "https://m.media-amazon.com/images/I/81Q5pfUZxNL._SL1500_.jpg",
        "The Kite Runner": "https://m.media-amazon.com/images/I/81IzbD2IiIL._SL1500_.jpg",
        "Dune": "https://m.media-amazon.com/images/I/91uwocAMtSL._SL1500_.jpg",
        "The Catcher in the Rye": "https://m.media-amazon.com/images/I/71e6K6u9jYL._SL1500_.jpg",
        "Wuthering Heights": "https://m.media-amazon.com/images/I/81Szumf4ATL._SL1500_.jpg",
        "Jane Eyre": "https://m.media-amazon.com/images/I/81U6bfq2wJL._SL1500_.jpg",
        "The Hunger Games": "https://m.media-amazon.com/images/I/81Fm4oH5VCL._SL1500_.jpg",
        "Sherlock Holmes: A Study in Scarlet": "https://m.media-amazon.com/images/I/71d5fMDvq9L._SL1500_.jpg",
        "The Count of Monte Cristo": "https://m.media-amazon.com/images/I/91LTO8l1P2L._SL1500_.jpg",
        "Les Misérables": "https://m.media-amazon.com/images/I/91uwocAMtSL._SL1500_.jpg",
        "The Picture of Dorian Gray": "https://m.media-amazon.com/images/I/81m1s4wIPML._SL1500_.jpg",
        "Moby Dick": "https://m.media-amazon.com/images/I/81PRVY0v-iL._SL1500_.jpg",
        "The Odyssey": "https://m.media-amazon.com/images/I/91m8twS6xKL._SL1500_.jpg",
        "One Hundred Years of Solitude": "https://m.media-amazon.com/images/I/91TvVQS7loL._SL1500_.jpg",
        "The Lord of the Rings": "https://m.media-amazon.com/images/I/91SZSW8qSsL._SL1500_.jpg",
        "Brave New World": "https://m.media-amazon.com/images/I/81zE42gT3xL._SL1500_.jpg",
        "The Brothers Karamazov": "https://m.media-amazon.com/images/I/91zQ1J0d8KL._SL1500_.jpg",
        "Crime and Punishment": "https://m.media-amazon.com/images/I/81WcnNQ-TBL._SL1500_.jpg",
        "Hamlet": "https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg",
        "A Tale of Two Cities": "https://m.media-amazon.com/images/I/81vPSj8cyiL._SL1500_.jpg"
    };

    const booksData: any[] = [
        { title: '1984', subtitle: 'A Dystopian Novel', description: 'A dystopian social science fiction novel and cautionary tale.', categoryId: 1, publisherId: 0, authorIds: [0], basePrice: 599, pages: 328, language: 'English', publicationDate: '1949-06-08', coverImage: bookCoverImages['1984'] },
        { title: "Harry Potter and the Philosopher's Stone", subtitle: 'The First Book', description: 'The first novel in the Harry Potter series following a young wizard.', categoryId: 1, publisherId: 1, authorIds: [1], basePrice: 499, pages: 223, language: 'English', publicationDate: '1997-06-26', coverImage: bookCoverImages["Harry Potter and the Philosopher's Stone"] },
        { title: 'Clean Code', subtitle: 'A Handbook of Agile Software Craftsmanship', description: 'A guide to writing clean, readable code.', categoryId: 2, publisherId: 2, authorIds: [2], basePrice: 1299, pages: 464, language: 'English', publicationDate: '2008-08-01', coverImage: bookCoverImages['Clean Code'] },
        { title: 'The Hobbit', subtitle: 'There and Back Again', description: 'A fantasy adventure novel about a hobbit named Bilbo Baggins.', categoryId: 1, publisherId: 0, authorIds: [4], basePrice: 549, pages: 310, language: 'English', publicationDate: '1937-09-21', coverImage: bookCoverImages['The Hobbit'] },
        { title: 'Pride and Prejudice', subtitle: 'A Romance of Manners', description: 'A romantic novel of manners set in Georgian England.', categoryId: 1, publisherId: 0, authorIds: [5], basePrice: 399, pages: 279, language: 'English', publicationDate: '1813-01-28', coverImage: bookCoverImages['Pride and Prejudice'] },
        { title: 'To Kill a Mockingbird', subtitle: 'A Classic of Modern American Literature', description: 'A novel about racial injustice in the American South.', categoryId: 1, publisherId: 3, authorIds: [6], basePrice: 599, pages: 281, language: 'English', publicationDate: '1960-07-11', coverImage: bookCoverImages['To Kill a Mockingbird'] },
        { title: 'The Great Gatsby', subtitle: 'A Tale of the Jazz Age', description: 'A novel about the American Dream in the 1920s.', categoryId: 1, publisherId: 0, authorIds: [7], basePrice: 499, pages: 180, language: 'English', publicationDate: '1925-04-10', coverImage: bookCoverImages['The Great Gatsby'] },
        { title: 'The Old Man and the Sea', subtitle: 'A Novella', description: 'A novella about an old fisherman and his struggle with a giant marlin.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 349, pages: 127, language: 'English', publicationDate: '1952-09-01', coverImage: bookCoverImages['The Old Man and the Sea'] },
        { title: 'Murder on the Orient Express', subtitle: 'A Hercule Poirot Mystery', description: 'A detective novel featuring Hercule Poirot solving a murder on a luxury train.', categoryId: 3, publisherId: 0, authorIds: [9], basePrice: 449, pages: 256, language: 'English', publicationDate: '1934-01-01', coverImage: bookCoverImages['Murder on the Orient Express'] },
        { title: 'The Alchemist', subtitle: 'A Philosophical Adventure', description: 'A novel about following your dreams and personal legend.', categoryId: 1, publisherId: 4, authorIds: [10], basePrice: 399, pages: 224, language: 'English', publicationDate: '1988-01-01', coverImage: bookCoverImages['The Alchemist'] },
        { title: 'Norwegian Wood', subtitle: 'A Love Story', description: 'A novel exploring themes of love, loss, and nostalgia in 1960s Tokyo.', categoryId: 1, publisherId: 0, authorIds: [11], basePrice: 549, pages: 296, language: 'English', publicationDate: '1987-09-04', coverImage: bookCoverImages['Norwegian Wood'] },
        { title: "The Handmaid's Tale", subtitle: 'A Dystopian Novel', description: 'A dystopian novel about a totalitarian society.', categoryId: 1, publisherId: 0, authorIds: [12], basePrice: 599, pages: 395, language: 'English', publicationDate: '1985-06-01', coverImage: bookCoverImages["The Handmaid's Tale"] },
        { title: 'The Da Vinci Code', subtitle: 'A Mystery Thriller', description: 'A thriller about art, history, and conspiracy.', categoryId: 3, publisherId: 3, authorIds: [13], basePrice: 699, pages: 454, language: 'English', publicationDate: '2003-03-18', coverImage: bookCoverImages['The Da Vinci Code'] },
        { title: 'The Kite Runner', subtitle: 'A Novel of Friendship and Redemption', description: 'A novel about friendship, betrayal, and redemption set in Afghanistan.', categoryId: 1, publisherId: 3, authorIds: [14], basePrice: 549, pages: 324, language: 'English', publicationDate: '2003-05-29', coverImage: bookCoverImages['The Kite Runner'] },
        { title: 'Dune', subtitle: 'A Science Fiction Masterpiece', description: 'An epic science fiction novel set on the desert planet Arrakis.', categoryId: 4, publisherId: 0, authorIds: [2], basePrice: 799, pages: 688, language: 'English', publicationDate: '1965-06-01', coverImage: bookCoverImages['Dune'] },
        { title: 'The Catcher in the Rye', subtitle: 'A Coming of Age Novel', description: 'A novel about teenage alienation and angst.', categoryId: 1, publisherId: 0, authorIds: [7], basePrice: 449, pages: 277, language: 'English', publicationDate: '1951-07-16', coverImage: bookCoverImages['The Catcher in the Rye'] },
        { title: 'Wuthering Heights', subtitle: 'A Gothic Romance', description: 'A gothic romance novel set on the Yorkshire moors.', categoryId: 1, publisherId: 0, authorIds: [5], basePrice: 449, pages: 323, language: 'English', publicationDate: '1847-12-19', coverImage: bookCoverImages['Wuthering Heights'] },
        { title: 'Jane Eyre', subtitle: 'A Gothic Romance', description: 'A gothic romance about a young governess and her mysterious employer.', categoryId: 1, publisherId: 0, authorIds: [5], basePrice: 449, pages: 507, language: 'English', publicationDate: '1847-10-16', coverImage: bookCoverImages['Jane Eyre'] },
        { title: 'The Hunger Games', subtitle: 'A Dystopian Adventure', description: 'A dystopian novel about survival and rebellion.', categoryId: 1, publisherId: 3, authorIds: [1], basePrice: 499, pages: 374, language: 'English', publicationDate: '2008-09-14', coverImage: bookCoverImages['The Hunger Games'] },
        { title: 'Sherlock Holmes: A Study in Scarlet', subtitle: 'The First Sherlock Holmes Mystery', description: 'The first novel featuring the famous detective Sherlock Holmes.', categoryId: 3, publisherId: 0, authorIds: [8], basePrice: 399, pages: 220, language: 'English', publicationDate: '1887-11-01', coverImage: bookCoverImages['Sherlock Holmes: A Study in Scarlet'] },
        { title: 'The Count of Monte Cristo', subtitle: 'A Tale of Vengeance', description: 'A novel of adventure and revenge set in the 19th century.', categoryId: 1, publisherId: 0, authorIds: [7], basePrice: 599, pages: 462, language: 'English', publicationDate: '1844-08-28', coverImage: bookCoverImages['The Count of Monte Cristo'] },
        { title: 'Les Misérables', subtitle: 'A Epic of Redemption', description: 'An epic novel about justice, love, and redemption in 19th century France.', categoryId: 1, publisherId: 4, authorIds: [8], basePrice: 799, pages: 655, language: 'English', publicationDate: '1862-04-03', coverImage: bookCoverImages['Les Misérables'] },
        { title: 'The Picture of Dorian Gray', subtitle: 'A Philosophical Novel', description: 'A novel about beauty, morality, and corruption.', categoryId: 1, publisherId: 0, authorIds: [12], basePrice: 399, pages: 254, language: 'English', publicationDate: '1890-07-01', coverImage: bookCoverImages['The Picture of Dorian Gray'] },
        { title: 'Moby Dick', subtitle: 'A Nautical Epic', description: 'An epic novel about a whaling ship and its obsessed captain.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 699, pages: 585, language: 'English', publicationDate: '1851-10-18', coverImage: bookCoverImages['Moby Dick'] },
        { title: 'The Odyssey', subtitle: 'An Ancient Epic', description: 'An ancient Greek epic poem about Odysseus and his journey home.', categoryId: 1, publisherId: 0, authorIds: [4], basePrice: 599, pages: 400, language: 'English', publicationDate: '800-01-01', coverImage: bookCoverImages['The Odyssey'] },
        { title: 'One Hundred Years of Solitude', subtitle: 'A Magical Realism Novel', description: 'A novel chronicling seven generations of the Buendía family.', categoryId: 1, publisherId: 4, authorIds: [10], basePrice: 649, pages: 417, language: 'English', publicationDate: '1967-05-30', coverImage: bookCoverImages['One Hundred Years of Solitude'] },
        { title: 'The Lord of the Rings', subtitle: 'The Fellowship of the Ring', description: 'The first volume of an epic fantasy trilogy.', categoryId: 1, publisherId: 0, authorIds: [4], basePrice: 899, pages: 481, language: 'English', publicationDate: '1954-07-29', coverImage: bookCoverImages['The Lord of the Rings'] },
        { title: 'Brave New World', subtitle: 'A Dystopian Vision', description: 'A dystopian novel about a future world of pleasure and control.', categoryId: 4, publisherId: 0, authorIds: [0], basePrice: 549, pages: 311, language: 'English', publicationDate: '1932-08-30', coverImage: bookCoverImages['Brave New World'] },
        { title: 'The Brothers Karamazov', subtitle: 'A Russian Epic', description: 'A philosophical novel about faith, doubt, and morality.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 699, pages: 732, language: 'English', publicationDate: '1879-01-01', coverImage: bookCoverImages['The Brothers Karamazov'] },
        { title: 'Crime and Punishment', subtitle: 'A Russian Masterpiece', description: 'A novel exploring guilt, morality, and redemption through a crime.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 649, pages: 671, language: 'English', publicationDate: '1866-01-01', coverImage: bookCoverImages['Crime and Punishment'] },
        { title: 'Hamlet', subtitle: 'A Tragedy', description: 'A tragedy about a Danish prince seeking revenge.', categoryId: 5, publisherId: 0, authorIds: [7], basePrice: 349, pages: 432, language: 'English', publicationDate: '1603-01-01', coverImage: bookCoverImages['Hamlet'] },
        { title: 'A Tale of Two Cities', subtitle: 'A History of the French Revolution', description: 'A novel set during the French Revolution about sacrifice and resurrection.', categoryId: 1, publisherId: 0, authorIds: [8], basePrice: 549, pages: 489, language: 'English', publicationDate: '1859-05-30', coverImage: bookCoverImages['A Tale of Two Cities'] },
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
                coverImage: bookData.coverImage,
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

    // Create Hamlet book with specific ISBN for testing
    // Try to find or create with The Great Gatsby book updated to be Hamlet for testing
    const hamletBook = await prisma.book.upsert({
        where: { isbn: '978-000000030' },
        update: {
            title: 'Hamlet',
            subtitle: 'A Tragedy',
            description: 'A tragedy about a Danish prince seeking revenge.',
            coverImage: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg',
            stock: 50,
            authors: {
                set: [],
                connect: [{ id: authors[7].id }], // F. Scott Fitzgerald
            },
        },
        create: {
            isbn: '978-000000030',
            barcode: '978000000030',
            title: 'Hamlet',
            subtitle: 'A Tragedy',
            description: 'A tragedy about a Danish prince seeking revenge.',
            coverImage: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg',
            categoryId: fictionCategory.id,
            publisherId: publishers[0].id,
            basePrice: 349,
            discountPercent: 0,
            currentPrice: 349,
            stock: 50,
            minimumStock: 5,
            edition: '1st',
            pages: 432,
            language: 'English',
            publicationDate: new Date('1603-01-01'),
            authors: {
                connect: [{ id: authors[7].id }], // F. Scott Fitzgerald
            },
        },
    });

    // Create a fake order for the customer to have an issued book
    const order = await prisma.order.create({
        data: {
            userId: customerUser.id,
            orderNumber: `ORD-${Date.now()}`,
            subtotal: 349,
            totalAmount: 349,
            status: 'PAID',
            paymentStatus: 'PAID',
            paymentMethod: 'CARD',
            paidAt: new Date(),
            items: {
                createMany: {
                    data: [
                        {
                            bookId: hamletBook.id,
                            quantity: 1,
                            unitPrice: 349,
                            discount: 0,
                            total: 349,
                        },
                    ],
                },
            },
        },
    });

    // Create issued book for customer
    const issuedBook = await prisma.issuedBook.create({
        data: {
            userId: customerUser.id,
            bookId: hamletBook.id,
            orderId: order.id,
            totalPages: 100,
            currentPage: 2,
            lastReadAt: new Date(),
        },
    });

    // Seed some dummy content for Hamlet
    for (let page = 1; page <= 10; page++) {
        await prisma.bookContent.create({
            data: {
                bookId: hamletBook.id,
                pageNumber: page,
                content: `Page ${page} of Hamlet

To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them?

This is the famous soliloquy from Act III, Scene 1 of William Shakespeare's tragedy Hamlet. Prince Hamlet contemplates life, death, and the nature of existence itself. The play explores themes of madness, betrayal, revenge, and the human condition.

Set in the Kingdom of Denmark, Hamlet follows the young prince as he struggles with the revelation that his uncle Claudius murdered his father, the king. Hamlet must navigate court politics, feign madness to uncover the truth, and ultimately decide whether to seek vengeance.

The play has influenced literature, philosophy, and popular culture for over four centuries. It contains some of the most quoted lines in the English language and remains a masterpiece of dramatic literature.

[End of Page ${page}]`,
            },
        });
    }

    console.log('✅ Seeding complete!');
    console.log(`
    🔐 Admin User: admin@bookstore.com / Admin@123
    👨‍💼 Supplier User: supplier@bookstore.com / Supplier@123
    🏪 Cashier User: cashier@bookstore.com / Cashier@123
    👤 Customer User: customer@bookstore.com / Customer@123
    
    📚 Test Book: Hamlet by F. Scott Fitzgerald (ISBN: 978-000000030)
    ✓ Already issued to customer user with reading progress at Page 2 of 100
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
