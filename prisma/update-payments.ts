import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.membershipPlan.findMany();
  
  for (const plan of plans) {
    await prisma.payment.updateMany({
      where: { planId: plan.id },
      data: {
        amount: plan.price,
        finalAmount: plan.price // Updating the final amount to match the new prices for historical mock data
      }
    });
  }

  console.log('Past payments updated to match new plan prices successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
