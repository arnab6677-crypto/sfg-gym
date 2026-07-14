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

export async function sendOtp() {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'System settings not found' };

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // Expires in 10 mins

    // Save to database
    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry
      }
    });

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sfg.silchar@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '' // MUST be set in .env
      }
    });

    if (!process.env.GMAIL_APP_PASSWORD) {
      return { success: false, error: 'Email sending is not configured (Missing GMAIL_APP_PASSWORD)' };
    }

    const mailOptions = {
      from: 'STRENGTH FUSION GYM <sfg.silchar@gmail.com>',
      to: 'sfg.silchar@gmail.com',
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is: ${otp}\n\nIt will expire in 10 minutes. If you did not request this, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return { success: false, error: 'Failed to send OTP email' };
  }
}

export async function verifyOtp(otp: string) {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'Settings not found' };

    if (!settings.resetOtp || settings.resetOtp !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }

    if (!settings.resetOtpExpiry || settings.resetOtpExpiry < new Date()) {
      return { success: false, error: 'OTP has expired' };
    }

    return { success: true };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, error: 'Server error' };
  }
}

export async function resetPassword(newPassword: string) {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'Settings not found' };

    // Update password and clear OTP
    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        adminPassword: newPassword,
        resetOtp: null,
        resetOtpExpiry: null
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: 'Failed to reset password' };
  }
}
