
/**
 * Injibara Campus Lost & Found
 * Prisma database seed
 *
 * Responsibilities:
 * - Seed item categories.
 * - Seed campus locations.
 * - Optionally create the first administrator.
 * - Optionally create the first security officer.
 * - Hash passwords using Argon2.
 * - Keep the seed process repeatable and safe.
 *
 * IMPORTANT:
 * - Never put real passwords in this file.
 * - Bootstrap accounts are configured through backend/.env.
 * - Existing users are never silently promoted or have passwords changed.
 */

import 'dotenv/config';

import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

// ------------------------------------------------------
// 1. ENVIRONMENT VALIDATION
// ------------------------------------------------------

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing. Configure it in backend/.env.',
  );
}

// ------------------------------------------------------
// 2. DATABASE CONNECTION
// ------------------------------------------------------

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

// ------------------------------------------------------
// 3. TYPES
// ------------------------------------------------------

interface CategorySeed {
  name: string;
  description: string;
  icon: string;
}

interface LocationSeed {
  name: string;
  description: string;
  building: string;
}

interface BootstrapAccount {
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'SECURITY';
  studentId?: string;
  phone?: string;
}

// ------------------------------------------------------
// 4. ITEM CATEGORIES
// ------------------------------------------------------

const categories: CategorySeed[] = [
  {
    name: 'Electronics',
    description:
      'Phones, laptops, tablets, chargers, headphones and electronic devices.',
    icon: 'smartphone',
  },
  {
    name: 'Documents',
    description:
      'Student identification cards, certificates, books and personal documents.',
    icon: 'file-text',
  },
  {
    name: 'Bags',
    description:
      'Backpacks, handbags, school bags and travel bags.',
    icon: 'backpack',
  },
  {
    name: 'Clothing',
    description:
      'Jackets, sweaters, uniforms, shoes and other clothing.',
    icon: 'shirt',
  },
  {
    name: 'Accessories',
    description:
      'Watches, glasses, jewelry, keys and personal accessories.',
    icon: 'watch',
  },
  {
    name: 'Books and Stationery',
    description:
      'Textbooks, notebooks, pens, pencils and learning materials.',
    icon: 'book-open',
  },
  {
    name: 'Wallets and Money',
    description:
      'Wallets, purses and other personal financial belongings.',
    icon: 'wallet',
  },
  {
    name: 'Sports Equipment',
    description:
      'Sports clothing, balls, shoes and athletic equipment.',
    icon: 'volleyball',
  },
  {
    name: 'Keys',
    description:
      'Room keys, office keys, vehicle keys and keychains.',
    icon: 'key',
  },
  {
    name: 'Other',
    description:
      'Items that do not belong to another category.',
    icon: 'package',
  },
];

// ------------------------------------------------------
// 5. CAMPUS LOCATIONS
// ------------------------------------------------------

/**
 * These are starter location records.
 *
 * Confirm the exact building names with Injibara University
 * before using them as official campus locations.
 */

const locations: LocationSeed[] = [
  {
    name: 'Main Library',
    description: 'Main university library area.',
    building: 'Library',
  },
  {
    name: 'Main Gate',
    description: 'Main entrance and exit area.',
    building: 'Main Gate',
  },
  {
    name: 'Student Cafeteria',
    description: 'Student dining and cafeteria area.',
    building: 'Cafeteria',
  },
  {
    name: 'Administration Building',
    description: 'University administration offices.',
    building: 'Administration',
  },
  {
    name: 'Lecture Hall',
    description: 'Lecture rooms and teaching areas.',
    building: 'Lecture Hall',
  },
  {
    name: 'Computer Laboratory',
    description: 'Computer laboratory and technology facilities.',
    building: 'Computer Laboratory',
  },
  {
    name: 'Engineering Building',
    description: 'Engineering department facilities.',
    building: 'Engineering',
  },
  {
    name: 'Student Dormitory',
    description: 'Student residential and dormitory area.',
    building: 'Dormitory',
  },
  {
    name: 'Sports Field',
    description: 'Outdoor sports and recreation area.',
    building: 'Sports Field',
  },
  {
    name: 'Registrar Office',
    description: 'Student registration and academic records office.',
    building: 'Registrar',
  },
  {
    name: 'Health Center',
    description: 'University health service area.',
    building: 'Health Center',
  },
  {
    name: 'Other Campus Area',
    description: 'Another location within the university campus.',
    building: 'Other',
  },
];

// ------------------------------------------------------
// 6. VALIDATION HELPERS
// ------------------------------------------------------

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getOptionalValue(
  value: string | undefined,
): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function validateBootstrapAccount(
  account: BootstrapAccount,
): void {
  if (!account.email.includes('@')) {
    throw new Error(
      `Invalid bootstrap email for ${account.role}.`,
    );
  }

  if (account.password.length < 12) {
    throw new Error(
      `${account.role} bootstrap password must contain at least 12 characters.`,
    );
  }

  if (account.fullName.length < 2) {
    throw new Error(
      `Invalid full name for ${account.role}.`,
    );
  }
}

// ------------------------------------------------------
// 7. SEED CATEGORIES
// ------------------------------------------------------

async function seedCategories(): Promise<void> {
  console.log('\nSeeding item categories...');

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: {
        name: category.name,
      },

      update: {
        description: category.description,
        icon: category.icon,
        isActive: true,
      },

      create: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: true,
      },
    });

    console.log(`  Category ready: ${result.name}`);
  }

  console.log(
    `Successfully processed ${categories.length} categories.`,
  );
}

// ------------------------------------------------------
// 8. SEED CAMPUS LOCATIONS
// ------------------------------------------------------

async function seedLocations(): Promise<void> {
  console.log('\nSeeding campus locations...');

  for (const location of locations) {
    const result = await prisma.location.upsert({
      where: {
        name: location.name,
      },

      update: {
        description: location.description,
        building: location.building,
        isActive: true,
      },

      create: {
        name: location.name,
        description: location.description,
        building: location.building,
        isActive: true,
      },
    });

    console.log(`  Location ready: ${result.name}`);
  }

  console.log(
    `Successfully processed ${locations.length} locations.`,
  );
}

// ------------------------------------------------------
// 9. CREATE BOOTSTRAP ACCOUNT
// ------------------------------------------------------

async function createBootstrapAccount(
  account: BootstrapAccount,
): Promise<void> {
  validateBootstrapAccount(account);

  const email = normalizeEmail(account.email);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  if (existingUser) {
    console.log(
      `Account already exists: ${email} (${existingUser.role}).`,
    );

    console.log(
      'Existing account was not modified.',
    );

    return;
  }

  const passwordHash = await argon2.hash(
    account.password,
    {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    },
  );

  await prisma.user.create({
    data: {
      fullName: account.fullName,
      email,
      passwordHash,
      role: account.role,
      studentId: account.studentId,
      phone: account.phone,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(
    `Created ${account.role} account: ${email}`,
  );
}

// ------------------------------------------------------
// 10. OPTIONAL ADMINISTRATOR
// ------------------------------------------------------

async function seedAdministrator(): Promise<void> {
  const email = getOptionalValue(
    process.env.SEED_ADMIN_EMAIL,
  );

  const password = process.env.SEED_ADMIN_PASSWORD;

  const fullName =
    getOptionalValue(process.env.SEED_ADMIN_NAME) ??
    'System Administrator';

  if (!email && !password) {
    console.log(
      '\nAdministrator bootstrap skipped: no credentials configured.',
    );

    return;
  }

  if (!email || !password) {
    throw new Error(
      'Configure both SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.',
    );
  }

  console.log('\nChecking administrator account...');

  await createBootstrapAccount({
    email,
    password,
    fullName,
    role: 'ADMIN',
  });
}

// ------------------------------------------------------
// 11. OPTIONAL SECURITY ACCOUNT
// ------------------------------------------------------

async function seedSecurityAccount(): Promise<void> {
  const email = getOptionalValue(
    process.env.SEED_SECURITY_EMAIL,
  );

  const password = process.env.SEED_SECURITY_PASSWORD;

  const fullName =
    getOptionalValue(process.env.SEED_SECURITY_NAME) ??
    'Campus Security Officer';

  if (!email && !password) {
    console.log(
      '\nSecurity bootstrap skipped: no credentials configured.',
    );

    return;
  }

  if (!email || !password) {
    throw new Error(
      'Configure both SEED_SECURITY_EMAIL and SEED_SECURITY_PASSWORD.',
    );
  }

  console.log('\nChecking security account...');

  await createBootstrapAccount({
    email,
    password,
    fullName,
    role: 'SECURITY',
  });
}

// ------------------------------------------------------
// 12. DATABASE SUMMARY
// ------------------------------------------------------

async function printDatabaseSummary(): Promise<void> {
  console.log('\n========== DATABASE SUMMARY ==========');

  const [
    userCount,
    categoryCount,
    locationCount,
    itemCount,
    claimCount,
    notificationCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.location.count(),
    prisma.item.count(),
    prisma.claim.count(),
    prisma.notification.count(),
  ]);

  console.log(`Users:          ${userCount}`);
  console.log(`Categories:     ${categoryCount}`);
  console.log(`Locations:      ${locationCount}`);
  console.log(`Items:          ${itemCount}`);
  console.log(`Claims:         ${claimCount}`);
  console.log(`Notifications:  ${notificationCount}`);

  console.log('=======================================\n');
}

// ------------------------------------------------------
// 13. MAIN SEED FUNCTION
// ------------------------------------------------------

async function main(): Promise<void> {
  console.log('\n======================================');
  console.log('INJIBARA CAMPUS LOST & FOUND');
  console.log('DATABASE SEED STARTED');
  console.log('======================================');

  await seedCategories();

  await seedLocations();

  await seedAdministrator();

  await seedSecurityAccount();

  await printDatabaseSummary();

  console.log('Database seeding completed successfully.');
}

// ------------------------------------------------------
// 14. EXECUTION AND CLEANUP
// ------------------------------------------------------

main()
  .catch((error: unknown) => {
    console.error('\nDatabase seeding failed.');

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
