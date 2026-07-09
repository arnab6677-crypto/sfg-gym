import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding new PostgreSQL database with default plans...');
  
  const plans = [
    { name: 'Daily Pass', price: 150, durationDays: 1 },
    { name: 'Monthly Membership (Without Admission)', price: 1400, durationDays: 30 },
    { name: 'Admission + Monthly Membership', price: 800, durationDays: 30 },
    { name: 'Quarterly Membership', price: 4000, durationDays: 90 },
    { name: 'Half-Yearly Membership', price: 5800, durationDays: 180 },
    { name: 'Yearly Membership', price: 8400, durationDays: 365 },
  ];

  for (const plan of plans) {
    try {
      await prisma.membershipPlan.create({
        data: plan
      });
      console.log(`Created plan: ${plan.name}`);
    } catch (e) {
      console.error(`Error creating ${plan.name}:`, e);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
