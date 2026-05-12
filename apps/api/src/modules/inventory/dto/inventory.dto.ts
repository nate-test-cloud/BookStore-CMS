import { BookFormat } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsISBN, IsDate, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
    @IsISBN()
    isbn: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    categoryId: string;

    @IsArray()
    authorIds: string[];

    @IsOptional()
    @IsString()
    publisherId?: string;

    @IsNumber()
    @Min(0)
    basePrice: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercent?: number;

    @IsNumber()
    @Min(0)
    stock: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    minimumStock?: number;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsString()
    format?: BookFormat;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    edition?: string;

    @IsOptional()
    @IsNumber()
    pages?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    publicationDate?: Date;

    @IsOptional()
    @IsString()
    shelfLocation?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;
}

export class UpdateBookDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    authorIds?: string[];

    @IsOptional()
    @IsString()
    publisherId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    basePrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercent?: number;

    @IsOptional()
    @IsString()
    format?: BookFormat;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    edition?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    minimumStock?: number;

    @IsOptional()
    @IsString()
    shelfLocation?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;
}

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    parentId?: string;

    @IsOptional()
    @IsString()
    image?: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    parentId?: string;

    @IsOptional()
    @IsString()
    image?: string;
}

export class CreateAuthorDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    born?: Date;
}

export class UpdateAuthorDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    born?: Date;
}

export class CreatePublisherDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    website?: string;
}

export class UpdatePublisherDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    website?: string;
}

export class AdjustInventoryDto {
    @IsNumber()
    quantity: number;

    @IsString()
    adjustmentType: string; // PURCHASE, RETURN, DAMAGE, LOSS, CORRECTION, RECOUNT

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class LowStockAlertDto {
    @IsNumber()
    @Min(1)
    threshold: number;
}

export class BulkImportBooksDto {
    @IsArray()
    books: CreateBookDto[];
}
