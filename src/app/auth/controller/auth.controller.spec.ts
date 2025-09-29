import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import { IUser } from '../interface';

describe('AuthController (unit)', () => {
  // Service and repository mocks
  let controller: AuthController;
  let authService: AuthService;
  // Mock implementations
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
    // Get instances of service and repository
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
      // Arrange
      mockAuthService.register.mockResolvedValue(mockUser);
      // Spies
      const registerSpy = jest.spyOn(authService, 'register');
      const authServiceRegisterSpy = jest.spyOn(authService, 'register');
      // Act
      const result = await controller.register(createUserDto);
      // Assert
      expect(registerSpy).toHaveBeenCalledWith(createUserDto);
      expect(authServiceRegisterSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should handle registration errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };
      // Arrange
      const error = new Error('Registration failed');
      // Act
      mockAuthService.register.mockRejectedValue(error);
      // Spies
      const registerSpy = jest.spyOn(authService, 'register');
      // Assert
      await expect(controller.register(createUserDto)).rejects.toThrow(error);
      expect(registerSpy).toHaveBeenCalledWith(createUserDto);
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
      // Arrange
      mockAuthService.login.mockResolvedValue(loginResponse);
      // Spies
      const loginSpy = jest.spyOn(authService, 'login');
      // Act
      const result = await controller.login(loginDto);
      // Assert
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(loginResponse);
    });

    it('should handle login errors', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const error = new Error('Login failed');
      /// Arrange
      mockAuthService.login.mockRejectedValue(error);
      // Spies
      const loginSpy = jest.spyOn(authService, 'login');
      // Assert
      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });

    it('should pass through authentication errors', async () => {
      const loginDto: LoginUserDto = {
        email: 'wrong@example.com',
        password: 'WrongPassword123!',
      };

      const authError = new Error('Invalid credentials');
      // Arrange
      mockAuthService.login.mockRejectedValue(authError);
      // Spies
      const loginSpy = jest.spyOn(authService, 'login');
      // Assert
      await expect(controller.login(loginDto)).rejects.toThrow(authError);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });
  });
  afterEach(() => {
    // clean up mocks after each test
    jest.clearAllMocks();
  });
});
