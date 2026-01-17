// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // Метод auth из урока: генерирует токен
  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  // Проверка пароля (из твоего урока)
  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOneWithPassword(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
