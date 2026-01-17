import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService, // Нужно для проверок и обновления raised
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    // 1. Находим подарок по itemId из DTO

    const wish = await this.wishesService.findOne(createOfferDto.itemId);

    // 2. Проверка: Нельзя скидываться на свой подарок
    if (wish.owner.id === user.id) {
      throw new ForbiddenException(
        'Вы не можете вносить деньги на собственный подарок',
      );
    }

    // 3. Проверка: Нельзя превысить стоимость
    const amount = Number(createOfferDto.amount);
    const newRaised = Number(wish.raised) + amount;

    if (newRaised > wish.price) {
      throw new BadRequestException(
        'Сумма взноса слишком велика. Сбор не может превышать стоимость подарка',
      );
    }

    // 4. Обновляем сумму в самом подарке (используем базовый метод)
    await this.wishesService.updateRaised(wish.id, newRaised);

    const savedOffer = await this.offerRepository.save({
      ...createOfferDto,
      user: user,
      item: wish,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedOffer.user;

    return {
      ...savedOffer,
      user: userWithoutPassword as User,
    };
  }

  async findMany(query: FindManyOptions<Offer>): Promise<Offer[]> {
    return await this.offerRepository.find(query);
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['user', 'item'], // Добавляем связи, чтобы видеть кто и на что скинулся
    });

    if (!offer) {
      throw new NotFoundException('Предложение не найдено');
    }

    return offer;
  }

  // Методы update и delete удаляем, так как по ТЗ они запрещены
}
