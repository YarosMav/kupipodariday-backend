import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { BaseEntity } from 'src/utils/base-entities';
@Entity()
export class Offer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, { onDelete: 'CASCADE' }) // Добавляем этот конфиг
  item: Wish;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  hidden: boolean;
}
