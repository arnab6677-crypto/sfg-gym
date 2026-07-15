'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteMember(memberId: string) {
  try {
    // Delete all related payments first (and any other relations if added later)
    await prisma.payment.deleteMany({
      where: { memberId }
    });

    // Delete the member
    await prisma.member.delete({
      where: { id: memberId }
    });

  } catch (error) {
    console.error("Failed to delete member:", error);
    return { success: false, error: "Failed to delete member" };
  }

  // Revalidate and redirect
  revalidatePath('/');
  revalidatePath('/members');
  redirect('/members');
}
