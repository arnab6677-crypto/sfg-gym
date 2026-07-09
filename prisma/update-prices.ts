import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.membershipPlan.updateMany({
    where: { name: 'Yearly' },
    data: { price: 8400 }
  });

  await prisma.membershipPlan.updateMany({
    where: { name: 'Half Yearly' },
    data: { price: 5800 }
  });

  await prisma.membershipPlan.updateMany({
    where: { name: 'Quarterly' },
    data: { price: 4000 }
  });

  await prisma.membershipPlan.updateMany({
    where: { name: 'Monthly' },
    data: { price: 1500 }
  });

  console.log('Membership plan prices updated successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
