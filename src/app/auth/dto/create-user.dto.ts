import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@gmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description:
      'Password must be 6-50 characters long, include uppercase, lowercase letters, and a number.',
    example: 'Password123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(1)
  fullName: string;
}
