import { Module } from '@nestjs/common';
import { SideOptionService } from './side-option.service';
import { SideOptionController } from './side-option.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SideOption } from './entities/side-option.entity';
import { Product } from 'src/product/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SideOption, Product]), AuthModule],
  controllers: [SideOptionController],
  providers: [SideOptionService],
})
export class SideOptionModule {}
