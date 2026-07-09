import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate membership plans...');
  
  const plansToDelete = [
    'One Day',
    'Monthly',
    'Monthly (No Admission)',
    'Quarterly',
    'Half Yearly',
    'Yearly'
  ];

  for (const name of plansToDelete) {
    try {
      await prisma.membershipPlan.deleteMany({
        where: { name: name }
      });
      console.log(`Deleted plan: ${name}`);
    } catch (e) {
      console.error(`Error deleting ${name}:`, e);
    }
  }

  console.log('Cleanup complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
