import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReceiptClient from './ReceiptClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Receipt - STRENGTH FUSION GYM',
  description: 'Official Digital Receipt',
};

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const receiptNumber = params.id;
  
  const payment = await prisma.payment.findUnique({
    where: { receiptNumber },
    include: {
      member: true,
      plan: true,
    }
  });

  if (!payment) {
    notFound();
  }

  const gymSettings = await prisma.settings.findFirst();

  return (
    <ReceiptClient payment={payment} gymName={gymSettings?.gymName || 'STRENGTH FUSION GYM'} />
  );
}
