-- CreateTable
CREATE TABLE "IssuedBook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 1,
    "totalPages" INTEGER NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssuedBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookContent" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IssuedBook_userId_idx" ON "IssuedBook"("userId");

-- CreateIndex
CREATE INDEX "IssuedBook_bookId_idx" ON "IssuedBook"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedBook_userId_bookId_key" ON "IssuedBook"("userId", "bookId");

-- CreateIndex
CREATE INDEX "BookContent_bookId_idx" ON "BookContent"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookContent_bookId_pageNumber_key" ON "BookContent"("bookId", "pageNumber");

-- AddForeignKey
ALTER TABLE "IssuedBook" ADD CONSTRAINT "IssuedBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedBook" ADD CONSTRAINT "IssuedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedBook" ADD CONSTRAINT "IssuedBook_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookContent" ADD CONSTRAINT "BookContent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
