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

describe('AuthService (unit)', () => {
  // Mock data
  const mockUser: IUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    password: '$2b$10$hashedPassword',
    isActive: true,
  };
  // Service and repository mocks
  let service: AuthService;
  let jwtService: JwtService;
  let authRepository: AuthRepository;
  // Mock implementations

  const mockJwtService = {
    sign: jest.fn(),
  };
  const mockAuthRepository = {
    createUser: jest.fn(),
    findUserAuth: jest.fn(),
  };
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
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
    // Get instances of service and repository
    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };
      // arrange
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      // Spies
      const createUserSpy = jest.spyOn(authRepository, 'createUser');
      // act
      const result = await service.register(createUserDto);
      // assert
      expect(createUserSpy).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException when asynchronous error occurs', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };
      // arrange
      mockAuthRepository.createUser.mockRejectedValue(
        new Error('Database error'),
      );
      // act & assert
      await expect(service.register(createUserDto)).rejects.toThrow(Error);
    });
  });

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    beforeEach(() => {
      jest.mocked(encryption.comparePasswords).mockClear();
    });

    it('should login user successfully', async () => {
      // Arrange
      const token = 'jwt-token';
      mockAuthRepository.findUserAuth.mockResolvedValue(mockUser);
      (encryption.comparePasswords as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);
      // Spies
      const findUserSpy = jest.spyOn(authRepository, 'findUserAuth');
      const signSpy = jest.spyOn(jwtService, 'sign');
      // Act
      const result = await service.login(loginDto);
      // Assert
      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email },
        token,
      });
      //
      expect(findUserSpy).toHaveBeenCalledWith(loginDto);
      expect(encryption.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      //
      expect(signSpy).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockAuthRepository.findUserAuth.mockResolvedValue(null);
      // Spies
      const findUserSpy = jest.spyOn(authRepository, 'findUserAuth');
      // Act + Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      // Assert
      expect(findUserSpy).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      // Arrange
      mockAuthRepository.findUserAuth.mockResolvedValue(mockUser);
      (encryption.comparePasswords as jest.Mock).mockResolvedValue(false);
      // Spies
      const findUserSpy = jest.spyOn(authRepository, 'findUserAuth');
      // Act + Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      // Assert
      expect(findUserSpy).toHaveBeenCalledWith(loginDto);
      expect(encryption.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('should handle user without password', async () => {
      // Arrange
      const userWithoutPassword: IUser = { ...mockUser, password: '' };
      mockAuthRepository.findUserAuth.mockResolvedValue(userWithoutPassword);
      (encryption.comparePasswords as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedException('password not valid');
      });
      // Spies
      const findUserSpy = jest.spyOn(authRepository, 'findUserAuth');
      // Act + Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      // Assert
      expect(findUserSpy).toHaveBeenCalledWith(loginDto);
      expect(encryption.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        userWithoutPassword.password,
      );
    });

    it('should throw HttpException when repository fails', async () => {
      // Arrange
      mockAuthRepository.findUserAuth.mockRejectedValue(
        new Error('Database error'),
      );
      // Spies
      const findUserSpy = jest.spyOn(authRepository, 'findUserAuth');
      // Act + Assert
      await expect(service.login(loginDto)).rejects.toThrow(Error);
      // Assert
      expect(findUserSpy).toHaveBeenCalledWith(loginDto);
    });

    it('should rethrow UnauthorizedException from repository', async () => {
      // Arrange
      mockAuthRepository.findUserAuth.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );
      // Spies
      const findUserSpy = jest.spyOn(authRepository, 'findUserAuth');
      // Act + Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      // Assert
      expect(findUserSpy).toHaveBeenCalledWith(loginDto);
    });
  });

  afterEach(() => {
    // clean up mocks after each test
    jest.clearAllMocks();
  });
});
