import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
    LoginDto,
    SignupDto,
    RefreshTokenDto,
    PasswordResetRequestDto,
    PasswordResetDto,
    VerifyEmailDto,
    AuthResponseDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const result = await this.authService.refreshToken(refreshTokenDto);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }

    @Post('password-reset-request')
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(
        @Body() dto: PasswordResetRequestDto,
    ): Promise<{ message: string }> {
        await this.authService.requestPasswordReset(dto);
        return { message: 'Password reset email sent' };
    }

    @Post('password-reset')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: PasswordResetDto): Promise<{ message: string }> {
        await this.authService.resetPassword(dto);
        return { message: 'Password reset successfully' };
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
        await this.authService.verifyEmail(dto);
        return { message: 'Email verified successfully' };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
        @Body('refreshToken') refreshToken: string,
    ): Promise<{ message: string }> {
        await this.authService.logout(refreshToken);
        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user: any) {
        return this.authService.validateUser(user.userId);
    }
}
