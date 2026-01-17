import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async getUserWishes(username: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.wishRepository.find({
      where: { owner: { id: user.id } },
      relations: ['owner', 'offers'], // Подгружаем связи, чтобы фронтенд видел, кто владелец и сколько скинули
    });
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findMany(query: string): Promise<User[]> {
    return this.userRepository.find({
      where: [{ username: query }, { email: query }],
      select: ['id', 'username', 'about', 'avatar', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(query);

    if (!user) {
      throw new NotFoundException('пользователь не найден');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword as User;
  }

  async findOneWithPassword(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      // Принудительно выбираем пароль и email, даже если в Entity стоит select: false
      select: ['id', 'username', 'password', 'email', 'avatar', 'about'],
    });

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Извлекаем email и password, а всё остальное складываем в userPublicData
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, ...userPublicData } = user;

    return userPublicData;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, updateUserDto);
    // Снова используем наш findOne, чтобы вернуть обновленный объект без any
    return this.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}
