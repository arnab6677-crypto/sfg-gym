'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAdmission(formData: FormData) {
  try {
    // Generate Registration Number
    const lastMember = await prisma.member.findFirst({
      orderBy: { regNumber: 'desc' },
    });
    
    let newRegNumber = 'SFG0001';
    if (lastMember && lastMember.regNumber.startsWith('SFG')) {
      const lastNum = parseInt(lastMember.regNumber.replace('SFG', ''), 10);
      newRegNumber = `SFG${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Extract basic data
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as string;
    
    // Extract optional details
    const ageStr = formData.get('age') as string;
    const age = ageStr ? parseInt(ageStr, 10) : null;
    const address = formData.get('address') as string;
    const emergencyContact = formData.get('emergencyContact') as string;
    const joiningDateStr = formData.get('joiningDate') as string;
    const joiningDate = joiningDateStr ? new Date(joiningDateStr) : new Date();
    
    // PT Details
    const ptPlan = formData.get('ptPlan') as string;
    const assignedTrainer = formData.get('assignedTrainer') as string | null;

    // Extract payment details
    const planId = formData.get('planId') as string;
    const admissionFee = parseFloat(formData.get('admissionFee') as string) || 0;
    const amount = parseFloat(formData.get('amount') as string) || 0;
    const discount = parseFloat(formData.get('discount') as string) || 0;
    const ptFee = parseFloat(formData.get('ptFee') as string) || 0;
    const finalAmount = parseFloat(formData.get('finalAmount') as string) || 0;
    const amountPaid = parseFloat(formData.get('amountPaid') as string) || finalAmount;
    const balanceDue = Math.max(0, finalAmount - amountPaid);
    const paymentMethod = formData.get('paymentMethod') as string;
    const promisedDateStr = formData.get('promisedDate') as string;
    const promisedDate = promisedDateStr ? new Date(promisedDateStr) : undefined;

    // Generate Receipt Number
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    let nextReceiptNum = 1;
    if (lastPayment && lastPayment.receiptNumber.startsWith('RCTP-')) {
      const parts = lastPayment.receiptNumber.split('-');
      if (parts.length === 2) {
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) nextReceiptNum = lastNum + 1;
      }
    } else if (lastPayment) {
      const count = await prisma.payment.count();
      nextReceiptNum = count + 1;
    }
    const receiptNumber = `RCTP-${nextReceiptNum}`;

    // Calculate Next Due Date
    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    const nextDueDate = new Date(joiningDate);
    nextDueDate.setDate(nextDueDate.getDate() + plan.durationDays);

    // Create Transaction
    const member = await prisma.$transaction(async (tx) => {
      const newMember = await tx.member.create({
        data: {
          regNumber: newRegNumber,
          fullName,
          phone,
          gender,
          joiningDate,
          age,
          address,
          emergencyContact,
          membershipType: plan.name,
          monthlyFeeAmount: plan.price,
          ptPlan: ptPlan === 'None' ? null : ptPlan,
          assignedTrainer: ptPlan === 'None' ? null : assignedTrainer,
          nextDueDate,
          status: 'ACTIVE',
        }
      });

      await tx.payment.create({
        data: {
          memberId: newMember.id,
          planId: plan.id,
          amount,
          admissionFee,
          ptFee,
          ptPlan: ptPlan === 'None' ? null : ptPlan,
          discount,
          finalAmount,
          amountPaid,
          balanceDue,
          paymentMethod,
          receiptNumber,
          paymentDate: new Date(),
          nextDueDate,
          ...(promisedDate && { promisedDate })
        }
      });

      return newMember;
    });

    revalidatePath('/');
    revalidatePath('/members');
    
    return { success: true, memberId: member.id, regNumber: member.regNumber, receiptNumber };
  } catch (error: any) {
    console.error("Admission Error:", error);
    return { success: false, error: error.message };
  }
}
