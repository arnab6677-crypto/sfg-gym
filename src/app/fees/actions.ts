'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function collectFee(formData: FormData) {
  try {
    const memberId = formData.get('memberId') as string;
    const planId = formData.get('planId') as string;
    const amount = parseFloat(formData.get('amount') as string) || 0;
    const admissionFee = parseFloat(formData.get('admissionFee') as string) || 0;
    const discount = parseFloat(formData.get('discount') as string) || 0;
    const finalAmount = parseFloat(formData.get('finalAmount') as string) || 0;
    const amountPaid = parseFloat(formData.get('amountPaid') as string) || finalAmount;
    const balanceDue = Math.max(0, finalAmount - amountPaid);
    const paymentMethod = formData.get('paymentMethod') as string;
    const promisedDateStr = formData.get('promisedDate') as string;
    const promisedDate = promisedDateStr ? new Date(promisedDateStr) : undefined;
    
    // PT Details
    const ptPlan = formData.get('ptPlan') as string;
    const ptFee = parseFloat(formData.get('ptFee') as string) || 0;
    const assignedTrainer = formData.get('assignedTrainer') as string | null;

    // Generate Receipt Number
    const latestGlobalPayment = await prisma.payment.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    let nextReceiptNum = 1;
    if (latestGlobalPayment && latestGlobalPayment.receiptNumber.startsWith('RCTP-')) {
      const parts = latestGlobalPayment.receiptNumber.split('-');
      if (parts.length === 2) {
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) nextReceiptNum = lastNum + 1;
      }
    } else if (latestGlobalPayment) {
      const count = await prisma.payment.count();
      nextReceiptNum = count + 1;
    }
    const receiptNumber = `RCTP-${nextReceiptNum}`;

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    // Fetch the member's last payment to determine the new due date
    const lastPayment = await prisma.payment.findFirst({
      where: { memberId },
      orderBy: { nextDueDate: 'desc' },
    });

    // If the old due date has already passed, start from today.
    // If it's still in the future, add the new days to the existing due date.
    let baseDate = new Date();
    if (lastPayment && new Date(lastPayment.nextDueDate) > baseDate) {
      baseDate = new Date(lastPayment.nextDueDate);
    }

    const nextDueDate = new Date(baseDate);
    nextDueDate.setDate(nextDueDate.getDate() + plan.durationDays);

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          memberId,
          planId,
          amount,
          admissionFee,
          discount,
          ptFee,
          ptPlan: ptPlan === 'None' ? null : ptPlan,
          finalAmount,
          amountPaid,
          balanceDue,
          paymentMethod,
          receiptNumber,
          paymentDate: new Date(),
          nextDueDate,
          ...(promisedDate && { promisedDate })
        }
      });

      await tx.member.update({
        where: { id: memberId },
        data: {
          membershipType: plan.name,
          monthlyFeeAmount: amount,
          ...(admissionFee > 0 && { admissionFeePaid: true }),
          ptPlan: ptPlan === 'None' ? null : ptPlan,
          assignedTrainer: ptPlan === 'None' ? null : assignedTrainer,
          nextDueDate,
          status: 'ACTIVE'
        }
      });

      return payment;
    });

    revalidatePath('/');
    revalidatePath('/members');
    revalidatePath(`/members/${memberId}`);
    revalidatePath('/fees');
    revalidatePath('/history');
    revalidatePath('/due-fees');
    
    return { success: true, paymentId: result.id, receiptNumber };
  } catch (error: any) {
    console.error("Fee Collection Error:", error);
    return { success: false, error: error.message };
  }
}
