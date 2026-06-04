import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

// DTO for authentication responses
export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        username: string;
        fullName: string;
        role: string;
    };
}

// DTO for login request
export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

// DTO for signup request
export class SignupDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(1)
    fullName: string;

    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;

    @IsString()
    confirmPassword: string;
}

// DTO for refresh token request
export class RefreshTokenDto {
    @IsString()
    refreshToken: string;
}

// DTO for password reset request
export class PasswordResetRequestDto {
    @IsEmail()
    email: string;
}

// DTO for password reset confirmation
export class PasswordResetDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    newPassword: string;

    @IsString()
    confirmPassword: string;
}

// DTO for email verification
export class VerifyEmailDto {
    @IsString()
    token: string;
}

// DTO for change password (while logged in)
export class ChangePasswordDto {
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    newPassword: string;

    @IsString()
    confirmPassword: string;
}

// DTO for 2FA setup
export class Setup2faDto {
    @IsString()
    @MinLength(6)
    password: string;
}

// DTO for 2FA verification
export class Verify2faDto {
    @IsString()
    code: string;
}

// JWT Payload interface
export interface JwtPayload {
    sub: string; // user id
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

// Refresh Token Payload interface
export interface RefreshJwtPayload {
    sub: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}
