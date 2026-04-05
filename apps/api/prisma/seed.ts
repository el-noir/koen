import { PrismaClient } from '@prisma/client';
import { STAGE1_USER_ID } from '../src/constants/stage1-user';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: STAGE1_USER_ID },
    update: {},
    create: {
      id: STAGE1_USER_ID,
      email: 'koen@example.com',
      name: 'Stage 1 User',
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
