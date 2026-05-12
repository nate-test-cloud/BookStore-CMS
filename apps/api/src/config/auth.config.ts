import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        expiresIn: parseInt(process.env.JWT_EXPIRATION || '900', 10),
    },
    refresh: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
        expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10),
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'noreply@bookstore.com',
    },
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    twoFactorEnabled: process.env.ENABLE_2FA === 'true',
}));
