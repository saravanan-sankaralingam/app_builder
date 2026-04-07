import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Bot user constants - export for use in other modules
export const BOT_USER_EMAIL = 'system@kissflow.local';
export const BOT_USER_ID_KEY = 'SYSTEM_BOT_USER_ID';

async function main() {
  console.log('Starting database seed...');

  // Create or update the System Bot user
  const botPasswordHash = await bcrypt.hash('system-bot-password-not-for-login', 12);

  const botUser = await prisma.user.upsert({
    where: { email: BOT_USER_EMAIL },
    update: {
      name: 'System Bot',
      role: UserRole.admin,
      isActive: true,
    },
    create: {
      email: BOT_USER_EMAIL,
      passwordHash: botPasswordHash,
      name: 'System Bot',
      role: UserRole.admin,
      isActive: true,
      department: 'System',
      jobTitle: 'Automated System User',
    },
  });

  console.log(`System Bot user created/updated with ID: ${botUser.id}`);
  console.log(`Email: ${botUser.email}`);
  console.log('');
  console.log('='.repeat(50));
  console.log('IMPORTANT: Save this Bot User ID for your .env file:');
  console.log(`SYSTEM_BOT_USER_ID=${botUser.id}`);
  console.log('='.repeat(50));

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
