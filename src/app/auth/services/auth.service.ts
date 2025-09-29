import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import { AuthRepository } from '../repository/auth.repository';
import { createContextWinston } from '../../..//utils';
import { comparePasswords } from '../../..//utils/encryption';
import { IUser, LoginResponse, RegisterResponse } from '../interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async register(createAuthDto: CreateUserDto): Promise<RegisterResponse> {
    const context = createContextWinston(
      this.constructor.name,
      this.register.name,
    );
    //
    this.logger.log('Register user', { context, createAuthDto });

    return await this.authRepository.createUser(createAuthDto);
  }

  async login({ email, password }: LoginUserDto): Promise<LoginResponse> {
    const user: IUser | null = await this.authRepository.findUserAuth({
      email,
      password,
    });
    //
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('password not valid');
    }

    const result = this._loginJwtReponse(user);
    return result;
  }

  private _loginJwtReponse(user: IUser): LoginResponse {
    const payload = { id: user.id, email: user.email };
    return {
      user: payload,
      token: this.jwtService.sign(payload),
    };
  }
}
