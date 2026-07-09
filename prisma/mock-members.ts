import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { durationDays: 'asc' } // One Day, Monthly, Quarterly, Half Yearly, Yearly
  });

  if (plans.length === 0) {
    console.error("No plans found. Seed the db first.");
    return;
  }

  const membersData = [
    { name: 'Arnab', rcpt: 'RCTP-1', planIndex: 0, overdueDays: 0 }, // One Day
    { name: 'Uday', rcpt: 'RCTP-2', planIndex: 1, overdueDays: 0 },  // Monthly
    { name: 'Sayon', rcpt: 'RCTP-3', planIndex: 2, overdueDays: 0 }, // Quarterly
    { name: 'Animesh', rcpt: 'RCTP-4', planIndex: 3, overdueDays: 0 }, // Half Yearly
    { name: 'Bhumi', rcpt: 'RCTP-5', planIndex: 4, overdueDays: 0 }, // Yearly
    { name: 'Sallu', rcpt: 'RCTP-6', planIndex: 1, overdueDays: 10 }, // Monthly, OVERDUE
    { name: 'Adi', rcpt: 'RCTP-7', planIndex: 2, overdueDays: 5 }, // Quarterly, OVERDUE
    { name: 'Billy', rcpt: 'RCTP-8', planIndex: 3, overdueDays: 2 }, // Half Yearly, OVERDUE
  ];

  for (let i = 0; i < membersData.length; i++) {
    const data = membersData[i];
    const plan = plans[data.planIndex % plans.length];
    
    // RegNumber logic
    const regNumber = `SFG${String(i + 1).padStart(4, '0')}`;
    
    // Date calculation
    const today = new Date();
    // If they are overdue, their payment date must have been (durationDays + overdueDays) ago
    const daysAgo = data.overdueDays > 0 ? (plan.durationDays + data.overdueDays) : 0;
    
    const joiningDate = new Date();
    joiningDate.setDate(today.getDate() - daysAgo);
    
    const nextDueDate = new Date(joiningDate);
    nextDueDate.setDate(joiningDate.getDate() + plan.durationDays);

    const member = await prisma.member.create({
      data: {
        regNumber,
        fullName: data.name,
        phone: `+91 98765 4321${i}`,
        gender: 'MALE',
        joiningDate: joiningDate,
        status: 'ACTIVE',
      }
    });

    await prisma.payment.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        amount: plan.price,
        finalAmount: plan.price,
        paymentMethod: 'CASH',
        receiptNumber: data.rcpt,
        paymentDate: joiningDate,
        nextDueDate: nextDueDate
      }
    });

    console.log(`Added ${data.name} with ${plan.name} plan (Receipt: ${data.rcpt})`);
  }

  console.log('Mock members added successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
