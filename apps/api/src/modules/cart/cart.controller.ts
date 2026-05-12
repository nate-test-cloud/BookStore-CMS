import {
    Controller,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCartItemDto, CheckoutDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private cartService: CartService) { }

    @Get()
    async getCart(@CurrentUser() user: any) {
        return this.cartService.getCart(user.userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async addItem(@CurrentUser() user: any, @Body() dto: CreateCartItemDto) {
        return this.cartService.addItem(user.userId, dto);
    }

    @Delete(':cartItemId')
    async removeItem(@CurrentUser() user: any, @Param('cartItemId') cartItemId: string) {
        return this.cartService.removeItem(user.userId, cartItemId);
    }

    @Put(':cartItemId')
    async updateItem(
        @CurrentUser() user: any,
        @Param('cartItemId') cartItemId: string,
        @Body('quantity') quantity: number,
    ) {
        return this.cartService.updateItem(user.userId, cartItemId, quantity);
    }

    @Delete()
    async clearCart(@CurrentUser() user: any) {
        return this.cartService.clearCart(user.userId);
    }

    @Post('checkout')
    @HttpCode(HttpStatus.CREATED)
    async checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
        return this.cartService.checkout(user.userId, dto);
    }
}
