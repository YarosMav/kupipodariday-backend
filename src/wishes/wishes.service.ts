import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  create(createWishDto: CreateWishDto, owner?: User): Promise<Wish> {
    return this.wishRepository.save({
      ...createWishDto,
      owner: owner,
    });
  }

  findMany(query: FindManyOptions<Wish>): Promise<Wish[]> {
    return this.wishRepository.find(query);
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: {
          user: true, // ВАЖНО: именно это подгружает твой профиль в список меценатов
        },
      },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return wish;
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto) {
    await this.wishRepository.update(id, updateWishDto);
    return this.findOne(id);
  }

  async updateWithCheck(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const wish = await this.findOne(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужие подарки');
    }

    // ТЗ: нельзя изменять стоимость, если уже есть желающие скинуться
    if (updateWishDto.price && wish.raised > 0) {
      throw new ForbiddenException(
        'Нельзя изменить цену, так как сбор средств уже начат',
      );
    }

    return await this.updateOne(id, updateWishDto);
  }

  async updateRaised(id: number, newRaised: number) {
    return await this.wishRepository.update(id, { raised: newRaised });
  }

  async removeWithCheck(id: number, userId: number) {
    const wish = await this.findOne(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подарки');
    }

    return await this.wishRepository.remove(wish);
  }

  async copyWish(wishId: number, user: User) {
    const wish = await this.findOne(wishId);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    await this.wishRepository.update(wishId, {
      copied: wish.copied + 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, raised, copied, ...wishData } = wish;

    return await this.wishRepository.save({
      ...wishData,
      owner: user, // Новый владелец
      raised: 0, // Сбрасываем сборы
      copied: 0, // Сбрасываем счетчик копий у дубликата
    });
  }

  findLast(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  findTop(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { copied: 'DESC' },
      take: 20,
    });
  }
}
