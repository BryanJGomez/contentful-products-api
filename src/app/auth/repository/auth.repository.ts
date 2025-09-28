import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//
import { User } from '../entities/user.entity';
import { encryptPassword } from '../../..//utils/encryption';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUser } from '../interface/';
import { LoginUserDto } from '../dto/login.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly productsRepository: Repository<User>,
  ) {}

  async createUser(user: CreateUserDto): Promise<IUser> {
    const passwordHash = await encryptPassword(user.password);
    return this.productsRepository.save({
      ...user,
      password: passwordHash,
    });
  }

  findUserAuth(usuario: LoginUserDto): Promise<IUser | null> {
    return this.productsRepository.findOne({
      where: { email: usuario.email, isActive: true },
      select: ['id', 'email', 'password'],
    });
  }
}
