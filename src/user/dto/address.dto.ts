import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserAddressType } from '../enums/address.enum';
import { PartialType } from '@nestjs/mapped-types';

export class AddUserAddressDto {
  @IsEnum(UserAddressType)
  type: UserAddressType;

  @IsString()
  @IsNotEmpty()
  house: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  landmark: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: string;

  @IsNumber()
  @IsNotEmpty()
  longitude: string;
}

export class UpdateUserAddressDto extends PartialType(AddUserAddressDto) {}
