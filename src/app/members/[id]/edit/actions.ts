'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateMember(formData: FormData) {
  try {
    const memberId = formData.get('memberId') as string;
    
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const ageStr = formData.get('age') as string;
    const age = ageStr ? parseInt(ageStr, 10) : null;
    const gender = formData.get('gender') as string;
    const address = formData.get('address') as string;
    const emergencyContact = formData.get('emergencyContact') as string;
    
    const status = formData.get('status') as string;
    const membershipType = formData.get('membershipType') as string;
    const ptPlan = formData.get('ptPlan') as string;
    const assignedTrainer = formData.get('assignedTrainer') as string | null;
    const nextDueDateStr = formData.get('nextDueDate') as string;
    let nextDueDate = nextDueDateStr ? new Date(nextDueDateStr) : undefined;
    
    const applyPlanChangeTo = formData.get('applyPlanChangeTo') as string;
    const isPlanChanged = formData.get('isPlanChanged') === 'true';

    // 1. If membership type changed, get the new plan details to update the base fee
    let monthlyFeeAmount: number | undefined;
    let newPlan: any = null;
    
    if (membershipType) {
      newPlan = await prisma.membershipPlan.findFirst({
        where: { name: membershipType }
      });
      if (newPlan) {
        monthlyFeeAmount = newPlan.price;
      }
    }

    // 2. Perform Current Month sync if requested
    if (isPlanChanged && applyPlanChangeTo === 'CURRENT_MONTH' && newPlan) {
      const latestPayment = await prisma.payment.findFirst({
        where: { memberId },
        orderBy: { paymentDate: 'desc' }
      });

      if (latestPayment) {
        // Calculate new payment values based on the new plan
        const newAmount = newPlan.price;
        const newFinalAmount = newAmount + latestPayment.admissionFee + latestPayment.ptFee - latestPayment.discount;
        const newBalanceDue = newFinalAmount - latestPayment.amountPaid;
        
        // Calculate new next due date based on payment date + new plan duration
        const newCalculatedNextDueDate = new Date(latestPayment.paymentDate);
        newCalculatedNextDueDate.setDate(newCalculatedNextDueDate.getDate() + newPlan.durationDays);
        
        // Override the form's nextDueDate with the mathematically calculated one
        nextDueDate = newCalculatedNextDueDate;

        // Update the payment record
        await prisma.payment.update({
          where: { id: latestPayment.id },
          data: {
            planId: newPlan.id,
            amount: newAmount,
            finalAmount: newFinalAmount,
            balanceDue: newBalanceDue,
            nextDueDate: newCalculatedNextDueDate
          }
        });
      }
    }

    await prisma.member.update({
      where: { id: memberId },
      data: {
        fullName,
        phone,
        age,
        gender,
        address,
        emergencyContact,
        status,
        membershipType,
        ...(monthlyFeeAmount !== undefined && { monthlyFeeAmount }),
        ptPlan: ptPlan === 'None' ? null : ptPlan,
        assignedTrainer: ptPlan === 'None' ? null : assignedTrainer,
        ...(nextDueDate && { nextDueDate }),
      }
    });

    if (nextDueDate && !(isPlanChanged && applyPlanChangeTo === 'CURRENT_MONTH')) {
      // Also update the nextDueDate on their most recent payment, as this is often used for calculating due fees
      // Only do this if we didn't ALREADY update it in the Current Month sync block above
      const latestPayment = await prisma.payment.findFirst({
        where: { memberId },
        orderBy: { paymentDate: 'desc' }
      });
      if (latestPayment) {
        await prisma.payment.update({
          where: { id: latestPayment.id },
          data: { nextDueDate }
        });
      }
    }

    revalidatePath(`/members/${memberId}`);
    revalidatePath('/members');
    revalidatePath('/due-fees');

    return { success: true };
  } catch (error: any) {
    console.error("Update Member Error:", error);
    return { success: false, error: error.message };
  }
}
