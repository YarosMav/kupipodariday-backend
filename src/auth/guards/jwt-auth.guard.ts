import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 'jwt' — это имя по умолчанию для JwtStrategy
export class JwtAuthGuard extends AuthGuard('jwt') {}
