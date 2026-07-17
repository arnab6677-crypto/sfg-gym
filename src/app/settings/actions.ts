'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
  try {
    const gymName = formData.get('gymName') as string;
    const admissionFee = parseFloat(formData.get('admissionFee') as string);
    const adminPassword = formData.get('adminPassword') as string;

    const adminEmail = formData.get('adminEmail') as string;
    const trainers = formData.get('trainers') as string;
    const ptPlans = formData.get('ptPlans') as string;
    const expenseCategories = formData.get('expenseCategories') as string;

    const currentSettings = await prisma.settings.findFirst();
    if (!currentSettings) throw new Error("Settings not found");

    await prisma.settings.update({
      where: { id: currentSettings.id },
      data: {
        gymName,
        admissionFee,
        adminEmail,
        trainers,
        ptPlans,
        expenseCategories,
        ...(adminPassword && adminPassword.length > 0 ? { adminPassword } : {})
      }
    });

    revalidatePath('/');
    revalidatePath('/settings');
    revalidatePath('/admission');
    
    return { success: true };
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    return { success: false, error: error.message };
  }
}

// Membership Plan Actions

export async function createMembershipPlan(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationDays = parseInt(formData.get('durationDays') as string);

    await prisma.membershipPlan.create({
      data: { name, price, durationDays }
    });

    revalidatePath('/settings');
    revalidatePath('/admission');
    revalidatePath('/fees');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMembershipPlan(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationDays = parseInt(formData.get('durationDays') as string);

    await prisma.membershipPlan.update({
      where: { id },
      data: { name, price, durationDays }
    });

    revalidatePath('/settings');
    revalidatePath('/admission');
    revalidatePath('/fees');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMembershipPlan(id: string) {
  try {
    await prisma.membershipPlan.delete({ where: { id } });
    revalidatePath('/settings');
    revalidatePath('/admission');
    revalidatePath('/fees');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Cannot delete this plan, it might be in use by members." };
  }
}
