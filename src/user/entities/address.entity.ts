import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  house: string;

  @Column()
  area: string;

  @Column({ default: null })
  landmark: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @ManyToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  user: User;
}
