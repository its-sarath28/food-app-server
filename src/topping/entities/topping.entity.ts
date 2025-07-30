import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Topping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: null })
  imageUrl: string;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => Product, (product) => product.topping, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
