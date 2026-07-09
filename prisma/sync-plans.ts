import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_PLANS = [
  { name: 'Daily Pass', durationDays: 1, price: 150 },
  { name: 'Monthly Membership (Without Admission)', durationDays: 30, price: 1400 },
  { name: 'Admission + Monthly Membership', durationDays: 30, price: 800 },
  { name: 'Quarterly Membership', durationDays: 90, price: 4000 },
  { name: 'Half-Yearly Membership', durationDays: 180, price: 5800 },
  { name: 'Yearly Membership', durationDays: 365, price: 8400 }
];

async function main() {
  for (const plan of TARGET_PLANS) {
    const existing = await prisma.membershipPlan.findFirst({
      where: { name: plan.name }
    });
    
    if (existing) {
      await prisma.membershipPlan.update({
        where: { id: existing.id },
        data: { durationDays: plan.durationDays, price: plan.price }
      });
      console.log(`Updated plan: ${plan.name}`);
    } else {
      await prisma.membershipPlan.create({
        data: plan
      });
      console.log(`Created plan: ${plan.name}`);
    }
  }

  console.log("All plans synced successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
