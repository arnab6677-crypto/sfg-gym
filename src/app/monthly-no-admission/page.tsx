import prisma from '@/lib/prisma';
import MonthlyNoAdmissionClient from './MonthlyNoAdmissionClient';

export default async function MonthlyNoAdmissionPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const members = await prisma.member.findMany({
    where: {
      membershipType: 'Monthly Membership (Without Admission)'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Monthly (No Admission)</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Manage members who purchased a monthly pass without admission fee.</p>
      </div>

      <MonthlyNoAdmissionClient initialMembers={members} initialSearch={params.q || ''} />
    </div>
  );
}
