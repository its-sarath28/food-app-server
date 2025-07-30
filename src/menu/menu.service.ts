import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import {
  deleteFileFromCloudinary,
  uploadFileBufferToCloudinary,
} from 'src/utils/fileOperation';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(Menu) private menuRepo: Repository<Menu>) {}

  async create(
    createMenuDto: CreateMenuDto,
    file: Express.Multer.File,
  ): Promise<{ success: boolean; data: Menu }> {
    const imageUrl = await uploadFileBufferToCloudinary(
      file.buffer,
      file.originalname,
      'menu',
    );

    const menu = this.menuRepo.create({
      ...createMenuDto,
      imageUrl,
    });

    await this.menuRepo.save(menu);

    return { success: true, data: menu };
  }

  async findAll(): Promise<Menu[]> {
    const menus = await this.menuRepo.find({ where: { status: true } });

    return menus;
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepo.findOneBy({ id });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return menu;
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean; data: Menu }> {
    const menu = await this.menuRepo.findOneBy({ id });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    let imageUrl = menu.imageUrl;

    if (file) {
      await deleteFileFromCloudinary(imageUrl);
      imageUrl = await uploadFileBufferToCloudinary(
        file.buffer,
        file.originalname,
        'menu',
      );
    }

    const updatedMenu = this.menuRepo.create({
      ...menu,
      ...updateMenuDto,
      imageUrl,
    });

    await this.menuRepo.save(updatedMenu);

    return {
      success: true,
      data: (await this.menuRepo.findOne({ where: { id } }))!,
    };
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const menu = await this.menuRepo.findOneBy({ id });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    if (menu.imageUrl) {
      await deleteFileFromCloudinary(menu.imageUrl);
    }

    await this.menuRepo.delete(id);

    return { success: true, message: 'Menu deleted successfully' };
  }

  async changeStatus(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const menu = await this.menuRepo.findOneBy({ id });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    menu.status = !menu.status;
    await this.menuRepo.save(menu);

    return {
      success: true,
      message: 'Menu status updated',
    };
  }
}
