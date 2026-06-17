import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@modules/users/entities/user.entity.js';
import { Role } from '@common/enums.js';

/**
 * Seed script — creates a default Owner account if no users exist.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/config/seed.ts
 *
 * This script:
 * 1. Connects to the database using env vars
 * 2. Checks if any user already exists
 * 3. If no users found, creates the default Owner account
 * 4. Disconnects and exits
 */

async function seed() {
  // Create a standalone DataSource (not using NestJS DI)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding');

  const userRepository = dataSource.getRepository(User);

  // Check if any user already exists
  const existingCount = await userRepository.count();

  if (existingCount > 0) {
    console.log(
      `Database already has ${existingCount} user(s). Skipping seed.`,
    );
    await dataSource.destroy();
    return;
  }

  // Create default Owner account
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD as string, 10);

  const owner = userRepository.create({
    email: process.env.SEED_ADMIN_EMAIL,
    passwordHash,
    role: Role.OWNER,
    fullName: 'Restaurant Owner',
    phone: null,
    isActive: true,
  });

  await userRepository.save(owner);
  console.log('Default Owner account created:');
  console.log('  Email: ', process.env.SEED_ADMIN_EMAIL);
  console.log('  Password: ', process.env.SEED_ADMIN_PASSWORD);
  console.log('  Role: ', Role.OWNER);

  await dataSource.destroy();
  console.log('Seed completed successfully');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
