import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: 'One Day', durationDays: 1, price: 100 },
    { name: 'Monthly', durationDays: 30, price: 1500 },
    { name: 'Quarterly', durationDays: 90, price: 4000 },
    { name: 'Half Yearly', durationDays: 180, price: 7500 },
    { name: 'Yearly', durationDays: 365, price: 12000 },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.create({
      data: plan,
    });
  }

  // Create default settings
  await prisma.settings.create({
    data: {
      gymName: 'STRENGTH FUSION GYM',
      admissionFee: 500,
      adminPassword: 'admin',
    },
  });

  console.log('Seeded database with plans and settings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
