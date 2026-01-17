import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  Length,
  IsOptional,
  IsUrl,
  IsArray,
  IsNumber,
} from 'class-validator';

// src/wishlists/dto/create-wishlist.dto.ts
export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 1500)
  description?: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  itemsId?: number[]; // Массив ID подарков
}

// src/wishlists/dto/update-wishlist.dto.ts
export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {}
