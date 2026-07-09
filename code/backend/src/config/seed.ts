import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@modules/users/entities/user.entity.js';
import { Table } from '@modules/tables/table.entity.js';
import { Role, TableStatus } from '@common/enums.js';

/**
 * Seed script — creates a default Owner account and default Tables if they do not exist.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/config/seed.ts
 * Or:
 *   npm run seed
 *
 * This script:
 * 1. Connects to the database using env vars
 * 2. Checks if any user already exists, if not creates default Owner
 * 3. Checks if any table already exists, if not creates default Tables
 * 4. Disconnects and exits
 */

async function seed() {
  // Create a standalone DataSource (not using NestJS DI) to manage connection directly
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, Table], // Include Table entity in the data source config
    synchronize: true,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
  });

  await dataSource.initialize();
  console.log('Database connected for seeding');

  // --- SEED USERS ---
  const userRepository = dataSource.getRepository(User);
  const existingUserCount = await userRepository.count();

  if (existingUserCount > 0) {
    console.log(`Database already has ${existingUserCount} user(s). Skipping user seed.`);
  } else {
    // Hash password before saving to protect user credentials
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
  }

  // --- SEED TABLES ---
  const tableRepository = dataSource.getRepository(Table);
  const existingTableCount = await tableRepository.count();

  if (existingTableCount > 0) {
    console.log(`Database already has ${existingTableCount} table(s). Skipping table seed.`);
  } else {
    // Generate a set of default dining tables for the cafe/restaurant
    const defaultTables = [
      { name: 'Bàn 01', capacity: 2 },
      { name: 'Bàn 02', capacity: 2 },
      { name: 'Bàn 03', capacity: 4 },
      { name: 'Bàn 04', capacity: 4 },
      { name: 'Bàn 05', capacity: 6 },
      { name: 'Bàn 06', capacity: 6 },
      { name: 'Bàn VIP 01', capacity: 8 },
      { name: 'Bàn VIP 02', capacity: 10 },
    ];

    const tablesToCreate = defaultTables.map((t) =>
      tableRepository.create({
        name: t.name,
        capacity: t.capacity,
        status: TableStatus.AVAILABLE,
      })
    );

    await tableRepository.save(tablesToCreate);
    console.log(`Created ${defaultTables.length} default dining tables.`);
  }

  await dataSource.destroy();
  console.log('Seed completed successfully');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
