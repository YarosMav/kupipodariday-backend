import { Length, IsUrl } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/base-entities';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';

@Entity()
export class Wishlist extends BaseEntity {
  @Column()
  @Length(1, 250)
  name: string;

  @Column({ nullable: true })
  @Length(0, 1500)
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish)
  @JoinTable() // Создает промежуточную таблицу для связей
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
