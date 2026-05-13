import { Module } from '@nestjs/common';
import { BooksReadingController } from './books-reading.controller';
import { BooksReadingService } from './books-reading.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [BooksReadingController],
    providers: [BooksReadingService],
})
export class BooksReadingModule { }
