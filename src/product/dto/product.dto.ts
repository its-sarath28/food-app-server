import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FoodType } from '../enums/type.enum';
import { CreateToppingDto } from '../../topping/dto/topping.dto';
import { Type } from 'class-transformer';
import { CreateSideOptionDto } from '../../side-option/dto/side-option.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  tags: string[];

  @IsEnum(FoodType)
  type: FoodType;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateToppingDto)
  toppings?: CreateToppingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSideOptionDto)
  sideOption?: CreateSideOptionDto[];
}

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['categoryId'] as const),
) {}
