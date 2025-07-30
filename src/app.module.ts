import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { ProductModule } from './product/product.module';
import { ToppingModule } from './topping/topping.module';
import { CategoryModule } from './category/category.module';
import { SideOptionModule } from './side-option/side-option.module';

import { Menu } from './menu/entities/menu.entity';
import { User } from './user/entities/user.entity';
import { Address } from './user/entities/address.entity';
import { Product } from './product/entities/product.entity';
import { Topping } from './topping/entities/topping.entity';
import { Category } from './category/entities/category.entity';
import { SideOption } from './side-option/entities/side-option.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Product, Topping, Category, SideOption, User, Menu, Address],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    ToppingModule,
    SideOptionModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
