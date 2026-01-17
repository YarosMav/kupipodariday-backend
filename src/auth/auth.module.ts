import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// src/auth/auth.module.ts
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'e0c64c62a0bf4b749e10b558b233f9cd', // Замени на свой
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
