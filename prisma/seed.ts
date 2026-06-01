import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@poultry.com' },
    update: {},
    create: {
      name: 'Admin Poultry',
      email: 'admin@poultry.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user seeded:', admin.email);

  const cages = [
    { name: 'Kandang A1', chickenCount: 50 },
    { name: 'Kandang A2', chickenCount: 50 },
    { name: 'Kandang B1', chickenCount: 40 },
    { name: 'Kandang B2', chickenCount: 40 },
    { name: 'Kandang C1', chickenCount: 30 },
  ];

  for (const cage of cages) {
    const created = await prisma.cage.upsert({
      where: { name: cage.name },
      update: {},
      create: cage,
    });
    console.log('Cage seeded:', created.name);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });