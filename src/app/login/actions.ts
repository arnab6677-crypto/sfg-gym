'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;

  try {
    const settings = await prisma.settings.findFirst();
    
    // If settings exist, compare password. If no settings, use default '123456'
    const validPassword = settings ? settings.adminPassword : '123456';

    if (password === validPassword) {
      // Set the auth cookie
      const cookieStore = await cookies();
      cookieStore.set('sfg_admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
      
      return { success: true };
    } else {
      return { success: false, error: 'Incorrect password' };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: 'Server error occurred' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('sfg_admin_auth');
  redirect('/login');
}
export async function getSecurityQuestions() {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'System settings not found' };

    return { 
      success: true, 
      question1: settings.securityQuestion1, 
      question2: settings.securityQuestion2 
    };
  } catch (error) {
    console.error("Failed to fetch security questions:", error);
    return { success: false, error: 'Server error occurred' };
  }
}

export async function verifySecurityAnswers(answer1: string, answer2: string) {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'System settings not found' };

    // Standardize answers for comparison (lowercase, trimmed)
    const valid1 = settings.securityAnswer1?.toLowerCase().trim() === answer1.toLowerCase().trim();
    const valid2 = settings.securityAnswer2?.toLowerCase().trim() === answer2.toLowerCase().trim();

    if (!valid1 || !valid2) {
      return { success: false, error: 'Incorrect answers to security questions' };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to verify security answers:", error);
    return { success: false, error: 'Server error occurred' };
  }
}

export async function resetPasswordWithSecurity(newPassword: string, answer1: string, answer2: string) {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'System settings not found' };

    const valid1 = settings.securityAnswer1?.toLowerCase().trim() === answer1.toLowerCase().trim();
    const valid2 = settings.securityAnswer2?.toLowerCase().trim() === answer2.toLowerCase().trim();

    if (!valid1 || !valid2) {
      return { success: false, error: 'Security verification failed' };
    }

    // Update password
    await prisma.settings.update({
      where: { id: settings.id },
      data: { adminPassword: newPassword }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { success: false, error: 'Server error occurred' };
  }
}
