'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updatePassword(formData: FormData) {
  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'New passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("Settings not found");

    // Validate current password
    if (settings.adminPassword !== currentPassword) {
      return { success: false, error: 'Incorrect current password' };
    }

    // Update password
    await prisma.settings.update({
      where: { id: settings.id },
      data: { adminPassword: newPassword }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Password Update Error:", error);
    return { success: false, error: 'Server error occurred' };
  }
}
