import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update Settings
  await prisma.settings.updateMany({
    data: {
      admissionFee: 2000
    }
  });
  console.log("Updated Admission Fee to 2000");

  // Fetch all plans
  const plans = await prisma.membershipPlan.findMany();
  for (const plan of plans) {
    if (plan.name.toLowerCase().includes('one day')) {
      await prisma.membershipPlan.update({
        where: { id: plan.id },
        data: { price: 150 }
      });
      console.log("Updated One Day Pass to 150");
    } else if (plan.name.toLowerCase() === 'monthly plan') {
      await prisma.membershipPlan.update({
        where: { id: plan.id },
        data: { name: 'Monthly (With Admission)', price: 800 }
      });
      console.log("Updated Monthly to Monthly (With Admission) at 800");
    }
  }

  // Ensure "Monthly (No Admission)" exists
  const noAdmissionPlan = plans.find(p => p.name === 'Monthly (No Admission)');
  if (!noAdmissionPlan) {
    await prisma.membershipPlan.create({
      data: {
        name: 'Monthly (No Admission)',
        durationDays: 30,
        price: 1400
      }
    });
    console.log("Created Monthly (No Admission) plan at 1400");
  } else {
    await prisma.membershipPlan.update({
      where: { id: noAdmissionPlan.id },
      data: { price: 1400 }
    });
    console.log("Updated Monthly (No Admission) plan at 1400");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
