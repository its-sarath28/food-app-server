import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async signUp(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password, fullName } = registerDto;

    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    const accessToken = await this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id, user.email);
    await this.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async signIn(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id, user.email);
    await this.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken({ refreshToken }: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });

      const user = await this.userRepo.findOneBy({ id: payload.userId });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newToken = await this.generateAccessToken(user.id, user.email);

      return newToken;
    } catch (err) {
      console.log(`Error: ${JSON.stringify(err)}`);

      if (err.name === 'TokenExpiredError') {
        try {
          const decoded = this.jwtService.decode(refreshToken);

          if (!decoded?.userId) {
            throw new UnauthorizedException('Invalid token');
          }

          const user = await this.userRepo.findOneBy({ id: decoded.userId });

          if (!user) throw new UnauthorizedException('User not found');

          const accessToken = await this.generateAccessToken(
            user.id,
            user.email,
          );
          const newRefreshToken = await this.generateRefreshToken(
            user.id,
            user.email,
          );
          await this.updateRefreshToken(user.id, refreshToken);

          return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
          throw new UnauthorizedException('Refresh token expired');
        }
      }

      throw new UnauthorizedException('Refresh token invalid');
    }
  }

  async generateAccessToken(userId: number, email: string) {
    const payload = { userId, email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '7d',
    });

    return accessToken;
  }

  async generateRefreshToken(userId: number, email: string) {
    const payload = { userId, email };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return refreshToken;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.userRepo.update(userId, { refreshToken });
  }
}
