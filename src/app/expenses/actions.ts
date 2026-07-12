'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createExpense(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dateStr = formData.get('date') as string;
    const date = new Date(dateStr);
    const paymentMethod = formData.get('paymentMethod') as string;
    const paidTo = formData.get('paidTo') as string;
    const description = formData.get('description') as string;
    const isRecurring = formData.get('isRecurring') === 'on';

    await prisma.expense.create({
      data: {
        title,
        category,
        amount,
        date,
        paymentMethod,
        paidTo,
        description,
        isRecurring
      }
    });

    revalidatePath('/');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error: any) {
    console.error("Expense creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateExpense(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dateStr = formData.get('date') as string;
    const date = new Date(dateStr);
    const paymentMethod = formData.get('paymentMethod') as string;
    const paidTo = formData.get('paidTo') as string;
    const description = formData.get('description') as string;
    const isRecurring = formData.get('isRecurring') === 'on';

    await prisma.expense.update({
      where: { id },
      data: {
        title,
        category,
        amount,
        date,
        paymentMethod,
        paidTo,
        description,
        isRecurring
      }
    });

    revalidatePath('/');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error: any) {
    console.error("Expense update error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id }
    });

    revalidatePath('/');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error: any) {
    console.error("Expense deletion error:", error);
    return { success: false, error: error.message };
  }
}
