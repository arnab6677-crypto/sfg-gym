'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function loginToReports(formData: FormData) {
  const password = formData.get('password') as string;

  try {
    const settings = await prisma.settings.findFirst();
    
    // If settings exist, compare password. If no settings, use default 'admin123'
    const validPassword = settings ? settings.reportsPassword : 'admin123';

    if (password === validPassword) {
      // Set the auth cookie for reports
      const cookieStore = await cookies();
      cookieStore.set('sfg_reports_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour for reports access
        path: '/reports' // only valid on reports routes
      });
      
      return { success: true };
    } else {
      return { success: false, error: 'Incorrect reports password' };
    }
  } catch (error) {
    console.error("Reports login error:", error);
    return { success: false, error: 'Server error occurred' };
  }
}

export async function sendReportsOtp() {
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
        reportsResetOtp: otp,
        reportsResetOtpExpiry: expiry
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
      subject: 'Reports Password Reset OTP',
      text: `Your Reports Password reset OTP is: ${otp}\n\nIt will expire in 10 minutes. If you did not request this, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return { success: false, error: 'Failed to send OTP email' };
  }
}

export async function verifyReportsOtp(otp: string) {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'Settings not found' };

    if (!settings.reportsResetOtp || settings.reportsResetOtp !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }

    if (!settings.reportsResetOtpExpiry || settings.reportsResetOtpExpiry < new Date()) {
      return { success: false, error: 'OTP has expired' };
    }

    return { success: true };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, error: 'Server error' };
  }
}

export async function resetReportsPassword(newPassword: string) {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { success: false, error: 'Settings not found' };

    // Update password and clear OTP
    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        reportsPassword: newPassword,
        reportsResetOtp: null,
        reportsResetOtpExpiry: null
      }
    });

    revalidatePath('/');
    revalidatePath('/reports');
    revalidatePath('/reports/login');

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: 'Failed to reset reports password' };
  }
}
