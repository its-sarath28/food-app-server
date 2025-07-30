import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  colorCode: string;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
