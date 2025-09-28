import {
  HttpException,
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

  register(createAuthDto: CreateUserDto): Promise<RegisterResponse> {
    const context = createContextWinston(
      this.constructor.name,
      this.register.name,
    );
    try {
      this.logger.log('Register user', { context, createAuthDto });
      return this.authRepository.createUser(createAuthDto);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to register user';
      throw new HttpException(message, 500);
    }
  }

  async login({ email, password }: LoginUserDto): Promise<LoginResponse> {
    let user: IUser | null;
    let isMatch = false;

    try {
      user = await this.authRepository.findUserAuth({ email, password });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.password) {
        isMatch = await comparePasswords(password, user.password);
      }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to login user';
      throw new HttpException(message, 500);
    }

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
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
