import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/utils/types';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createOfferDto: CreateOfferDto) {
    // Теперь передаем реального пользователя из токена
    return this.offersService.create(createOfferDto, req.user);
  }

  @Get()
  findAll() {
    return this.offersService.findMany({
      relations: ['user', 'item'],
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOne(id);
  }
}
