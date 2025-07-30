import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';

import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';

import { UpdateUserDto } from './dto/user.dto';
import { AddUserAddressDto, UpdateUserAddressDto } from './dto/address.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard())
  getProfile(@Req() req): Promise<User> {
    return this.userService.getProfile(req.user.id);
  }

  @Patch()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
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
  ): Promise<{ success: boolean; data: User }> {
    return this.userService.updateProfile(req.user.id, updateUserDto, file);
  }

  @Post('add-address')
  @UseGuards(AuthGuard())
  addAddress(
    @Req() req,
    @Body() addressDto: AddUserAddressDto,
  ): Promise<{ success: boolean; data: Address }> {
    return this.userService.addUserAddress(req.user.id, addressDto);
  }

  @Patch('update-address/:addressId')
  @UseGuards(AuthGuard())
  updateAddress(
    @Param('addressId') addressId: string,
    @Req() req,
    @Body() addressDto: UpdateUserAddressDto,
  ): Promise<{ success: boolean; data: Address }> {
    return this.userService.updateAddress(+addressId, req.user.id, addressDto);
  }
}
