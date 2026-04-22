import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MASTER_ADMIN_ID = '00000000-0000-0000-0000-000000000000';

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@koen.app' },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      id: MASTER_ADMIN_ID,
      email: 'admin@koen.app',
      name: 'Master Admin',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      name: 'Sample Construction Site',
      client: 'Apex Builders',
      startDate: new Date(),
      stage: 'foundations',
      userId: user.id,
    },
  });

  console.log('Seed data created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
