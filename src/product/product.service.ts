import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import {
  deleteFileFromCloudinary,
  uploadFileBufferToCloudinary,
} from 'src/utils/fileOperation';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<{ success: true; data: Product }> {
    const existingProduct = await this.productRepo.findOne({
      where: {
        name: ILike(`%${createProductDto.name}%`),
        category: { id: createProductDto.categoryId },
      },
    });

    if (existingProduct) {
      throw new ConflictException('Product already exists');
    }

    const category = await this.categoryRepo.findOneBy({
      id: createProductDto.categoryId,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const imageUrl = await uploadFileBufferToCloudinary(
      file.buffer,
      file.originalname,
      'product',
    );

    const product = this.productRepo.create({
      ...createProductDto,
      imageUrl,
      category,
    });

    await this.productRepo.save(product);

    return { success: true, data: product };
  }

  async findAll(
    categoryId?: number,
    query?: string,
  ): Promise<
    {
      id: number;
      name: string;
      price: number;
      available: boolean;
      type: string;
      imageUrl: string | null;
    }[]
  > {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.name',
        'product.price',
        'product.available',
        'product.imageUrl',
        'product.type',
      ]);

    if (categoryId) {
      qb.where('product.categoryId = :categoryId', { categoryId });
    }

    if (query) {
      const condition = 'product.name ILIKE :name';
      if (categoryId) {
        qb.andWhere(condition, { name: `%${query}%` });
      } else {
        qb.where(condition, { name: `%${query}%` }); // fallback if no categoryId
      }
    }

    const raw = await qb.getRawMany();

    return raw.map((item) => ({
      id: item.product_id,
      name: item.product_name,
      price: parseFloat(item.product_price),
      available: item.product_available,
      type: item.product_type,
      imageUrl: item.product_imageUrl,
    }));
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean; data: Product }> {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let imageUrl = product.imageUrl;

    if (file) {
      await deleteFileFromCloudinary(imageUrl);
      imageUrl = await uploadFileBufferToCloudinary(
        file.buffer,
        file.originalname,
        'product',
      );
    }

    await this.productRepo.update(id, { ...updateProductDto, imageUrl });

    return {
      success: true,
      data: (await this.productRepo.findOne({ where: { id } }))!,
    };
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['topping', 'sideOption'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.imageUrl) {
      await deleteFileFromCloudinary(product.imageUrl);
    }

    for (const topping of product.topping) {
      if (topping.imageUrl) {
        await deleteFileFromCloudinary(topping.imageUrl);
      }
    }

    for (const side of product.sideOption) {
      if (side.imageUrl) {
        await deleteFileFromCloudinary(side.imageUrl);
      }
    }

    await this.productRepo.delete(id);

    return {
      success: true,
      message: 'Product and all related data deleted successfully',
    };
  }
}
