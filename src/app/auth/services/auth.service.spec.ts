import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
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
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(result).toEqual(mockUser);

      expect(jest.spyOn(authRepository, 'createUser')).toHaveBeenCalledWith(
        createUserDto,
      );
    });

    it('should throw HttpException when asynchronous error occurs', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockAuthRepository.createUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.register(createUserDto)).rejects.toThrow(Error);
    });
  });

  describe('POST /auth/login', () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    beforeEach(() => {
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
      expect(encryption.comparePasswords).toHaveBeenCalledWith(
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
      (encryption.comparePasswords as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedException('password not valid');
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(encryption.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        userWithoutPassword.password,
      );
    });

    it('should throw HttpException when repository fails', async () => {
      mockAuthRepository.findUserAuth.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(Error);
    });

    it('should rethrow UnauthorizedException from repository', async () => {
      mockAuthRepository.findUserAuth.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  afterEach(() => {
    // Limpia todos los mocks
    jest.clearAllMocks();
  });
});
