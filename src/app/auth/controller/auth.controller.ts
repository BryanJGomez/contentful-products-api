import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import { Public } from '../../../decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { LoginResponse, RegisterResponse } from '../interface';

@ApiTags('Auth')
@Public() // Modulo publico(sin autenticacion)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: CreateUserDto): Promise<RegisterResponse> {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  login(@Body() login: LoginUserDto): Promise<LoginResponse> {
    return this.authService.login(login);
  }
}
