import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      // 1. Где искать токен? В заголовках как Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Не игнорировать срок годности
      ignoreExpiration: false,
      // 3. Секретный ключ (должен совпадать с тем, что в AuthModule)
      secretOrKey: 'e0c64c62a0bf4b749e10b558b233f9cd',
    });
  }

  // Сюда попадает расшифрованный полезный груз (payload) из токена
  async validate(payload: JwtPayload) {
    // В payload.sub мы при логине положили ID пользователя
    const user = await this.usersService.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // То, что мы вернем здесь, окажется в req.user
    return user;
  }
}
