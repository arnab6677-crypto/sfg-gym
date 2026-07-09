import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  // Delete all records from tables except Settings and MembershipPlan
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.member.deleteMany();
  
  console.log('Database cleared! Ready for a fresh start.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
