import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { ToppingService } from './topping.service';
import { CreateToppingDto, UpdateToppingDto } from './dto/topping.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/gurads/role.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/user/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('topping')
export class ToppingController {
  constructor(private readonly toppingService: ToppingService) {}

  @Post(':productId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @Body() createToppingDto: CreateToppingDto,
    @Param('productId') productId: string,
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
    return this.toppingService.create(+productId, createToppingDto, file);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(@Query('productId') productId: string) {
    return this.toppingService.findAll(+productId);
  }

  @Get(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.toppingService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() updateToppingDto: UpdateToppingDto,
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
    return this.toppingService.update(+id, updateToppingDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.toppingService.remove(+id);
  }
}
