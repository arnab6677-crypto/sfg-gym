'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;

  try {
    const settings = await prisma.settings.findFirst();
    
    // If settings exist, compare password. If no settings, use default '123456'
    const validPassword = settings ? settings.adminPassword : '123456';

    if (password === validPassword) {
      // Set the auth cookie
      cookies().set('sfg_admin_auth', 'true', {
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
  cookies().delete('sfg_admin_auth');
  redirect('/login');
}
