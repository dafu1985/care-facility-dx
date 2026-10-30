import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import AppDataSource from './data-source';

import {
  User,
  UserRole,
  UserStatus,
} from '../modules/users/entities/user.entity';

async function resetAdminPassword(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This script is only allowed in development.');
  }

  if (process.env.DATABASE_URL) {
    throw new Error('Cloud database connections are not allowed.');
  }

  if (!['localhost', '127.0.0.1'].includes(process.env.DB_HOST ?? '')) {
    throw new Error('Only local database connections are allowed.');
  }

  const databaseName = process.env.DB_DATABASE;
  const allowedDatabaseName = process.env.ADMIN_RESET_ALLOWED_DB;

  if (!allowedDatabaseName) {
    throw new Error('ADMIN_RESET_ALLOWED_DB must be explicitly configured.');
  }

  if (!databaseName || databaseName !== allowedDatabaseName) {
    throw new Error(
      'Password reset is only allowed for the explicitly configured development database.',
    );
  }

  if (!email || !password || password.length < 12) {
    throw new Error(
      'ADMIN_EMAIL and a password of at least 12 characters are required.',
    );
  }

  await AppDataSource.initialize();

  try {
    const repository = AppDataSource.getRepository(User);

    const admin = await repository.findOne({
      where: {
        email,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    if (!admin) {
      throw new Error('Active ADMIN user not found.');
    }

    admin.passwordHash = await bcrypt.hash(password, 12);

    await repository.save(admin);

    console.log(`ADMIN password updated: ${admin.email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

resetAdminPassword().catch((error: unknown) => {
  console.error('ADMIN password reset failed.', error);
  process.exitCode = 1;
});
