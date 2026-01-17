import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/utils/types';

@UseGuards(JwtAuthGuard)
@Controller('wishlistlists') // В ТЗ часто эндпоинт называется именно так, проверь документацию API
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  findMany() {
    return this.wishlistsService.findMany({ relations: ['owner', 'items'] });
  }

  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    // Убираем заглушку, берем реального юзера
    return this.wishlistsService.create(req.user.id, createWishlistDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistsService.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWishlistDto,
  ) {
    // Вызываем метод с проверкой прав
    return this.wishlistsService.updateWithCheck(id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    // Вызываем метод с проверкой прав
    return this.wishlistsService.removeWithCheck(id, req.user.id);
  }
}
