import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';

import { UpdateUserDto } from './dto/user.dto';
import { AddUserAddressDto, UpdateUserAddressDto } from './dto/address.dto';

import {
  deleteFileFromCloudinary,
  uploadFileBufferToCloudinary,
} from 'src/utils/fileOperation';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
  ) {}

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean; data: User }> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let imageUrl: string = '';
    if (file) {
      if (user.imageUrl) {
        await deleteFileFromCloudinary(user.imageUrl);
      }

      imageUrl = await uploadFileBufferToCloudinary(
        file.buffer,
        file.filename,
        'User',
      );
    }

    await this.userRepo.update(userId, { ...updateUserDto, imageUrl });

    return {
      success: true,
      data: (await this.userRepo.findOne({ where: { id: userId } }))!,
    };
  }

  async addUserAddress(
    userId: number,
    addressDto: AddUserAddressDto,
  ): Promise<{ success: boolean; data: Address }> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const address = this.addressRepo.create({
      ...addressDto,
      user,
      latitude: Number(addressDto.latitude),
      longitude: Number(addressDto.longitude),
    });

    await this.addressRepo.save(address);

    return {
      success: true,
      data: address,
    };
  }

  async updateAddress(
    addressId: number,
    userId: number,
    addressDto: UpdateUserAddressDto,
  ): Promise<{ success: boolean; data: Address }> {
    const [user, address] = await Promise.all([
      this.userRepo.findOneBy({ id: userId }),
      this.addressRepo.findOneBy({ id: addressId }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepo.update(
      { id: addressId },
      {
        ...addressDto,
        latitude: Number(addressDto.latitude),
        longitude: Number(addressDto.longitude),
      },
    );

    return {
      success: true,
      data: (await this.addressRepo.findOne({ where: { id: addressId } }))!,
    };
  }
}
