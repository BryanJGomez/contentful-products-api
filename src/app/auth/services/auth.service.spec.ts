import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthService } from './auth.service';
import { AuthRepository } from '../repository/auth.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import { IUser } from '../interface/';
import * as encryption from '../../../utils/encryption';

jest.mock('../../../utils/encryption', () => ({
  comparePasswords: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let authRepository: AuthRepository;

  const mockUser: IUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    password: '$2b$10$hashedPassword',
    isActive: true,
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockAuthRepository = {
    createUser: jest.fn(),
    findUserAuth: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const result = service.register(createUserDto);

      expect(result).toEqual(mockAuthRepository.createUser(createUserDto));

      expect(jest.spyOn(authRepository, 'createUser')).toHaveBeenCalledWith(
        createUserDto,
      );
    });

    it('should throw HttpException when synchronous error occurs', () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockAuthRepository.createUser.mockImplementation(() => {
        throw new Error('Database error');
      });

      expect(() => service.register(createUserDto)).toThrow(
        new HttpException('Database error', 500),
      );
    });

    it('should throw HttpException with generic message when error is not instance of Error', () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockAuthRepository.createUser.mockImplementation(() => {
        throw { message: 'Unknown error' } as unknown as Error;
      });

      expect(() => service.register(createUserDto)).toThrow(
        new HttpException('Failed to register user', 500),
      );
    });
  });

  describe('POST /auth/login', () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    beforeEach(() => {
      // Reset the encryption mock before each login test
      jest.mocked(encryption.comparePasswords).mockClear();
    });

    it('should login user successfully', async () => {
      const token = 'jwt-token';
      mockAuthRepository.findUserAuth.mockResolvedValue(mockUser);
      (encryption.comparePasswords as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email },
        token,
      });

      expect(jest.spyOn(authRepository, 'findUserAuth')).toHaveBeenCalledWith(
        loginDto,
      );

      expect(jest.spyOn(encryption, 'comparePasswords')).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );

      expect(jest.spyOn(jwtService, 'sign')).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthRepository.findUserAuth.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jest.spyOn(authRepository, 'findUserAuth')).toHaveBeenCalledWith(
        loginDto,
      );
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      mockAuthRepository.findUserAuth.mockResolvedValue(mockUser);
      (encryption.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(encryption.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('should handle user without password', async () => {
      const userWithoutPassword: IUser = {
        ...mockUser,
        password: '',
      };
      mockAuthRepository.findUserAuth.mockResolvedValue(userWithoutPassword);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(encryption.comparePasswords).not.toHaveBeenCalled();
    });

    it('should throw HttpException when repository fails', async () => {
      mockAuthRepository.findUserAuth.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
    });

    it('should rethrow UnauthorizedException from repository', async () => {
      mockAuthRepository.findUserAuth.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw HttpException with generic message when error is not instance of Error', async () => {
      mockAuthRepository.findUserAuth.mockRejectedValue('Unknown error');

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException('Failed to login user', 500),
      );
    });
  });
  afterEach(() => {
    // Limpia todos los mocks
    jest.clearAllMocks();
  });
});
