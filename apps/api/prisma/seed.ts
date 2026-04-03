import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 'stage1-user-id' },
    update: {},
    create: {
      id: 'stage1-user-id',
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
