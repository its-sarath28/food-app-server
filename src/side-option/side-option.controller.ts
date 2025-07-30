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
import { SideOptionService } from './side-option.service';
import {
  CreateSideOptionDto,
  UpdateSideOptionDto,
} from './dto/side-option.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/gurads/role.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/user/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('side-option')
export class SideOptionController {
  constructor(private readonly sideOptionService: SideOptionService) {}

  @Post(':productId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @Param('productId') productId: string,
    @Body() createSideOptionDto: CreateSideOptionDto,
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
    console.log({
      productId,
      createSideOptionDto,
    });

    return this.sideOptionService.create(+productId, createSideOptionDto, file);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(@Query('productId') productId: string) {
    return this.sideOptionService.findAll(+productId);
  }

  @Get(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.sideOptionService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() updateSideOptionDto: UpdateSideOptionDto,
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
    return this.sideOptionService.update(+id, updateSideOptionDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.sideOptionService.remove(+id);
  }
}
