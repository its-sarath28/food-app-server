import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entities/category.entity';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/gurads/role.guards';
import { Roles } from '../auth/decorators/roles.decorators';
import { UserRole } from '../user/enums/role.enum';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<{ success: boolean; data: Category }> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(+id, updateCategoryDto);
  }
}
