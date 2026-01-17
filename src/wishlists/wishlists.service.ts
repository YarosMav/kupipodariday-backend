import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from 'src/wishes/wishes.service';
@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishListRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(userId: number, createWishlistDto: CreateWishlistDto) {
    // ИСПРАВЛЕНО: достаем items, так как в DTO поле называется так
    const { itemsId, ...rest } = createWishlistDto;

    // Находим подарки по ID из массива items
    const foundItems =
      itemsId && itemsId.length > 0
        ? await this.wishesService.findMany({ where: { id: In(itemsId) } })
        : [];

    const wishlist = this.wishListRepository.create({
      ...rest,
      items: foundItems, // Передаем найденные сущности
      owner: { id: userId },
    });

    return await this.wishListRepository.save(wishlist);
  }

  findMany(query: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    return this.wishListRepository.find(query);
  }

  async findOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishListRepository.findOne(query);
    if (!wishlist) {
      throw new NotFoundException('подборка не найдена');
    }
    return wishlist;
  }

  async updateOne(id: number, updateWishlistDto: UpdateWishlistDto) {
    const wishlist = await this.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });
    const { itemsId, ...rest } = updateWishlistDto;

    let updatedItems = wishlist.items;
    if (itemsId) {
      updatedItems = await this.wishesService.findMany({
        where: { id: In(itemsId) },
      });
    }

    return this.wishListRepository.save({
      ...wishlist,
      ...rest,
      items: updatedItems,
    });
  }

  async removeOne(id: number): Promise<Wishlist> {
    const wishlist = await this.findOne({ where: { id } });
    return this.wishListRepository.remove(wishlist);
  }
  async updateWithCheck(
    id: number,
    updateDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishlist = await this.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужие подборки');
    }

    return this.updateOne(id, updateDto);
  }
  async removeWithCheck(id: number, userId: number) {
    const wishlist = await this.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подборки');
    }

    return this.removeOne(id);
  }
}
