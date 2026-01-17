import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @Min(1, { message: 'Сумма взноса должна быть не менее 1' })
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsNumber()
  itemId: number; // ID подарка, на который пользователь хочет скинуться
}
