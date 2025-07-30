import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<{ success: boolean; data: Category }> {
    const existingCategory = await this.categoryRepo.findOne({
      where: { name: ILike(`%${createCategoryDto.name}%`) },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoryRepo.create(createCategoryDto);

    await this.categoryRepo.save(category);

    return { success: true, data: category };
  }

  async findAll(): Promise<Category[]> {
    const category = await this.categoryRepo.find();

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    await this.categoryRepo.update(id, updateCategoryDto);

    return (await this.categoryRepo.findOne({ where: { id } }))!;
  }
}
