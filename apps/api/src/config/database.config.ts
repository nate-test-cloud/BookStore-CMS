import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
    url: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    meilisearch: {
        url: process.env.MEILISEARCH_URL || 'http://localhost:7700',
        masterKey: process.env.MEILISEARCH_MASTER_KEY || 'masterKey',
    },
}));
