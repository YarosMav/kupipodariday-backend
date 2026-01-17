import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/utils/types';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    // Благодаря JwtStrategy, здесь уже лежит юзер без пароля
    return req.user;
  }

  @Patch('me')
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, UpdateUserDto);
  }

  @Post('find')
  async findMany(@Body('query') query: string) {
    // ТЗ: поиск по строке (username или email)
    return this.usersService.findMany(query);
  }

  @Get('me/wishes')
  getMyWishes(@Req() req: RequestWithUser) {
    return this.usersService.getUserWishes(req.user.username);
  }

  @Get(':username/wishes')
  getAnotherUserWishes(@Param('username') username: string) {
    return this.usersService.getUserWishes(username);
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    // ТЗ: просмотр чужого профиля по имени
    return this.usersService.findByUsername(username);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne({ where: { id } });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
