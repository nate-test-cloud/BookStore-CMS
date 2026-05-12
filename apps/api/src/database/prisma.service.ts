import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connected successfully');
    }

    async enableShutdownHooks(app: INestApplication) {
        process.on('beforeExit', async () => {
            await app.close();
        });
    }

    async disconnect() {
        await this.$disconnect();
    }

    // Helper method for soft deletes
    async softDelete(model: string, id: string) {
        return this[model].update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    // Helper method to exclude deleted items
    excludeDeleted() {
        return {
            where: { deletedAt: null },
        };
    }
}
