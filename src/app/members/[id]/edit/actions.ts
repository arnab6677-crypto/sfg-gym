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
    const nextDueDate = nextDueDateStr ? new Date(nextDueDateStr) : undefined;

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
        ptPlan: ptPlan === 'None' ? null : ptPlan,
        assignedTrainer: ptPlan === 'None' ? null : assignedTrainer,
        ...(nextDueDate && { nextDueDate }),
      }
    });

    if (nextDueDate) {
      // Also update the nextDueDate on their most recent payment, as this is often used for calculating due fees
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
