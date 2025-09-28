import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import { IUser } from '../interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: IUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    password: '$2b$10$hashedPassword',
    isActive: true,
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/register', () => {
    it('should register a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockUser);
      expect(jest.spyOn(authService, 'register')).toHaveBeenCalledWith(
        createUserDto,
      );
      expect(jest.spyOn(authService, 'register')).toHaveBeenCalledTimes(1);
    });

    it('should handle registration errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(createUserDto)).rejects.toThrow(error);
      expect(jest.spyOn(authService, 'register')).toHaveBeenCalledWith(
        createUserDto,
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const loginResponse = {
        user: { id: mockUser.id, email: mockUser.email },
        token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(loginResponse);
      expect(jest.spyOn(authService, 'login')).toHaveBeenCalledWith(loginDto);
      expect(jest.spyOn(authService, 'login')).toHaveBeenCalledTimes(1);
    });

    it('should handle login errors', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const error = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(jest.spyOn(authService, 'login')).toHaveBeenCalledWith(loginDto);
    });

    it('should pass through authentication errors', async () => {
      const loginDto: LoginUserDto = {
        email: 'wrong@example.com',
        password: 'WrongPassword123!',
      };

      const authError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(authError);

      await expect(controller.login(loginDto)).rejects.toThrow(authError);
      expect(jest.spyOn(authService, 'login')).toHaveBeenCalledWith(loginDto);
    });
  });
  afterEach(() => {
    // Limpia todos los mocks
    jest.clearAllMocks();
  });
});
