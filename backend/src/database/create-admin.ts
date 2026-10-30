import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import AppDataSource from './data-source';

import {
  User,
  UserRole,
  UserStatus,
} from '../modules/users/entities/user.entity';

async function createAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error(
        'This email is already registered. Existing users will not be modified.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = userRepository.create({
      email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    await userRepository.save(admin);

    console.log(`ADMIN user created: ${admin.email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

createAdmin().catch((error: unknown) => {
  console.error('Failed to create ADMIN user.', error);
  process.exitCode = 1;
});
