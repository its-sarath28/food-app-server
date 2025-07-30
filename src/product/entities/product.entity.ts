import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodType } from '../enums/type.enum';
import { Topping } from '../../topping/entities/topping.entity';
import { SideOption } from '../../side-option/entities/side-option.entity';
import { Category } from '../../category/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imageUrl: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 2, scale: 2, default: 0 })
  rating: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  tags: string[];

  @Column({
    type: 'enum',
    enum: FoodType,
    default: FoodType.VEG,
  })
  type: FoodType;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => Category, (category) => category.product, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @OneToMany(() => Topping, (topping) => topping.product, { cascade: true })
  topping: Topping[];

  @OneToMany(() => SideOption, (option) => option.product, { cascade: true })
  sideOption: SideOption[];
}
