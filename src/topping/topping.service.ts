import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateToppingDto, UpdateToppingDto } from './dto/topping.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Topping } from './entities/topping.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  deleteFileFromCloudinary,
  uploadFileBufferToCloudinary,
} from 'src/utils/fileOperation';

@Injectable()
export class ToppingService {
  constructor(
    @InjectRepository(Topping) private toppingRepo: Repository<Topping>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async create(
    productId: number,
    createToppingDto: CreateToppingDto,
    file: Express.Multer.File,
  ): Promise<{ success: true; data: Topping }> {
    const existingTopping = await this.toppingRepo.findOne({
      where: {
        name: ILike(`%${createToppingDto.name}%`),
        product: { id: productId },
      },
    });

    if (existingTopping) {
      throw new ConflictException('Topping already exists');
    }

    const product = await this.productRepo.findOneBy({ id: productId });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const imageUrl = await uploadFileBufferToCloudinary(
      file.buffer,
      file.originalname,
      'topping',
    );

    const topping = this.toppingRepo.create({
      ...createToppingDto,
      imageUrl,
      product,
    });

    await this.toppingRepo.save(topping);

    return { success: true, data: topping };
  }

  async findAll(productId: number): Promise<
    {
      id: number;
      name: string;
      price: number;
      available: boolean;
      imageUrl: string | null;
    }[]
  > {
    const qb = this.toppingRepo
      .createQueryBuilder('topping')
      .select([
        'topping.id',
        'topping.name',
        'topping.price',
        'topping.available',
        'topping.imageUrl',
      ])
      .where('topping.productId = :productId', { productId });

    const raw = await qb.getRawMany();

    return raw.map((item) => ({
      id: item.topping_id,
      name: item.topping_name,
      price: parseFloat(item.topping_price),
      available: item.topping_available,
      imageUrl: item.topping_imageUrl,
    }));
  }

  async findOne(id: number): Promise<Topping> {
    const topping = await this.toppingRepo.findOneBy({ id });

    if (!topping) {
      throw new NotFoundException('Topping not found');
    }

    return topping;
  }

  async update(
    id: number,
    updateToppingDto: UpdateToppingDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean; data: Topping }> {
    const topping = await this.toppingRepo.findOneBy({ id });

    if (!topping) {
      throw new NotFoundException('Topping not found');
    }

    let imageUrl = topping.imageUrl;

    if (file) {
      await deleteFileFromCloudinary(imageUrl);
      imageUrl = await uploadFileBufferToCloudinary(
        file.buffer,
        file.originalname,
        'topping',
      );
    }

    await this.toppingRepo.update(id, { ...updateToppingDto, imageUrl });

    return {
      success: true,
      data: (await this.toppingRepo.findOne({ where: { id } }))!,
    };
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const topping = await this.toppingRepo.findOneBy({ id });

    if (!topping) {
      throw new NotFoundException('Topping not found');
    }

    if (topping.imageUrl) {
      await deleteFileFromCloudinary(topping.imageUrl);
    }

    await this.toppingRepo.delete(id);

    return { success: true, message: 'Topping deleted successfully' };
  }
}
