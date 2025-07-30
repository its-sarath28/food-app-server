import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateSideOptionDto,
  UpdateSideOptionDto,
} from './dto/side-option.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SideOption } from './entities/side-option.entity';
import { ILike, Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import {
  deleteFileFromCloudinary,
  uploadFileBufferToCloudinary,
} from 'src/utils/fileOperation';

@Injectable()
export class SideOptionService {
  constructor(
    @InjectRepository(SideOption)
    private sideOptionRepo: Repository<SideOption>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(
    productId: number,
    createSideOptionDto: CreateSideOptionDto,
    file: Express.Multer.File,
  ): Promise<{ success: true; data: SideOption }> {
    const existingTopping = await this.sideOptionRepo.findOne({
      where: {
        name: ILike(`%${createSideOptionDto.name}%`),
        product: { id: productId },
      },
    });

    if (existingTopping) {
      throw new ConflictException('Side option already exists');
    }

    const product = await this.productRepo.findOneBy({ id: productId });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const imageUrl = await uploadFileBufferToCloudinary(
      file.buffer,
      file.originalname,
      'side-option',
    );

    const topping = this.sideOptionRepo.create({
      ...createSideOptionDto,
      imageUrl,
      product,
    });

    await this.sideOptionRepo.save(topping);

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
    const qb = this.sideOptionRepo
      .createQueryBuilder('sideOption')
      .select([
        'sideOption.id',
        'sideOption.name',
        'sideOption.price',
        'sideOption.available',
        'sideOption.imageUrl',
      ])
      .where('sideOption.productId = :productId', { productId });

    const raw = await qb.getRawMany();

    return raw.map((item) => ({
      id: item.sideOption_id,
      name: item.sideOption_name,
      price: parseFloat(item.sideOption_price),
      available: item.sideOption_available,
      imageUrl: item.sideOption_imageUrl,
    }));
  }

  async findOne(id: number) {
    const option = await this.sideOptionRepo.findOneBy({ id });

    if (!option) {
      throw new NotFoundException('Side option not found');
    }

    return option;
  }

  async update(
    id: number,
    updateSideOptionDto: UpdateSideOptionDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean; data: SideOption }> {
    const option = await this.sideOptionRepo.findOneBy({ id });

    if (!option) {
      throw new NotFoundException('Side option not found');
    }

    let imageUrl = option.imageUrl;

    if (file) {
      await deleteFileFromCloudinary(imageUrl);
      imageUrl = await uploadFileBufferToCloudinary(
        file.buffer,
        file.originalname,
        'side-option',
      );
    }

    await this.sideOptionRepo.update(id, { ...updateSideOptionDto, imageUrl });

    return {
      success: true,
      data: (await this.sideOptionRepo.findOne({ where: { id } }))!,
    };
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const option = await this.sideOptionRepo.findOneBy({ id });

    if (!option) {
      throw new NotFoundException('Side option not found');
    }

    if (option.imageUrl) {
      await deleteFileFromCloudinary(option.imageUrl);
    }

    await this.sideOptionRepo.delete(id);

    return { success: true, message: 'Side option deleted successfully' };
  }
}
