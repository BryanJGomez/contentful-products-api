import { AppDataSource } from '../data-source';
import { User } from '../../app/auth/entities/user.entity';
import { DeepPartial } from 'typeorm';
import { encryptPassword } from '../../utils/encryption';

// constante para password
const PASSWORD = 'Admin1234';
//
export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);
  const passwordHash = await encryptPassword(PASSWORD);

  const userData: DeepPartial<User>[] = [
    {
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: passwordHash,
      isActive: true,
    },
  ];
  //
  try {
    await userRepository.upsert(userData, ['email']);
  } catch (error) {
    await AppDataSource.destroy();
    throw error;
  }
}
