import { Product } from '../../product/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SideOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imageUrl: string;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => Product, (product) => product.sideOption, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
