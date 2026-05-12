import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import {
    LoginDto,
    SignupDto,
    RefreshTokenDto,
    PasswordResetRequestDto,
    PasswordResetDto,
    VerifyEmailDto,
    JwtPayload,
    AuthResponseDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
        const { email, username, fullName, password, confirmPassword } = signupDto;

        // Validation
        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        // Check if user exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                fullName,
                passwordHash,
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Send verification email (implement email service)
        // await this.emailService.sendVerificationEmail(user.email, verificationToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is disabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.get('auth.refresh.secret'),
            });

            // Verify token exists in DB and is not revoked
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshTokenDto.refreshToken },
                include: { user: true },
            });

            if (!storedToken || storedToken.revokedAt) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const user = storedToken.user;

            // Revoke old token
            await this.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revokedAt: new Date() },
            });

            // Generate new tokens
            const tokens = await this.generateTokens(user.id, user.email, user.role);

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                },
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async requestPasswordReset(dto: PasswordResetRequestDto): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            // Don't reveal if email exists
            return;
        }

        // Generate reset token
        const resetToken = this.jwtService.sign(
            { sub: user.id, type: 'password-reset' },
            { expiresIn: '24h' },
        );

        // Store reset token
        await this.prisma.passwordReset.create({
            data: {
                email: user.email,
                token: resetToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        // Send email with reset link
        // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }

    async resetPassword(dto: PasswordResetDto): Promise<void> {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (dto.newPassword.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        // Verify token
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token: dto.token },
        });

        if (!resetRecord || resetRecord.expiresAt < new Date() || resetRecord.usedAt) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);

        // Update user password
        await this.prisma.user.update({
            where: { email: resetRecord.email },
            data: { passwordHash },
        });

        // Mark reset token as used
        await this.prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { usedAt: new Date() },
        });
    }

    async verifyEmail(dto: VerifyEmailDto): Promise<void> {
        const verification = await this.prisma.emailVerification.findUnique({
            where: { token: dto.token },
        });

        if (!verification || verification.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.prisma.user.update({
            where: { email: verification.email },
            data: { isEmailVerified: true, emailVerifiedAt: new Date() },
        });

        await this.prisma.emailVerification.update({
            where: { id: verification.id },
            data: { verified: true, verifiedAt: new Date() },
        });
    }

    async logout(refreshToken: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
    }

    private async generateTokens(
        userId: string,
        email: string,
        role: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload: JwtPayload = {
            sub: userId,
            email,
            role,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('auth.jwt.secret'),
            expiresIn: this.configService.get('auth.jwt.expiresIn'),
        });

        const refreshTokenPayload = {
            sub: userId,
            type: 'refresh',
        };

        const refreshToken = this.jwtService.sign(refreshTokenPayload, {
            secret: this.configService.get('auth.refresh.secret'),
            expiresIn: this.configService.get('auth.refresh.expiresIn'),
        });

        // Store refresh token in DB
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: new Date(Date.now() + this.configService.get('auth.refresh.expiresIn') * 1000),
            },
        });

        return { accessToken, refreshToken };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                profileImage: true,
                phoneNumber: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, updateData: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Don't allow updating email/password through this endpoint
        const { email, passwordHash, ...safeData } = updateData;

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: safeData,
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                profileImage: true,
                phoneNumber: true,
                isActive: true,
                createdAt: true,
            },
        });

        return updated;
    }
}
