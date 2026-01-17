import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
  Delete,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateWishDto } from './dto/update-wish.dto';
import type { RequestWithUser } from 'src/utils/types';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: number) {
    return this.wishesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.updateWithCheck(id, updateWishDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: number) {
    return this.wishesService.removeWithCheck(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  copy(@Req() req: RequestWithUser, @Param('id') id: number) {
    return this.wishesService.copyWish(id, req.user);
  }
}
