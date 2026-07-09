'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function markAsPaid(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Payment not found');

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amountPaid: payment.finalAmount,
        balanceDue: 0
      }
    });

    revalidatePath('/pay-later');
    revalidatePath('/history');
    
    return { success: true };
  } catch (error: any) {
    console.error("Mark Paid Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePromisedDate(paymentId: string, promisedDate: Date | null) {
  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        promisedDate
      }
    });

    revalidatePath('/pay-later');
    return { success: true };
  } catch (error: any) {
    console.error("Update Promised Date Error:", error);
    return { success: false, error: error.message };
  }
}
