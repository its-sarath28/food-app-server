import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/gurads/role.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/user/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @Body() createMenuDto: CreateMenuDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({
          maxSize: 1000 * 500,
          message: 'File size must be below 500KB',
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.menuService.create(createMenuDto, file);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({
          maxSize: 1000 * 500,
          message: 'File size must be below 500KB',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    return this.menuService.update(+id, updateMenuDto, file);
  }

  @Patch('update-status/:id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  changeStatus(@Param('id') id: string) {
    return this.menuService.changeStatus(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }
}
