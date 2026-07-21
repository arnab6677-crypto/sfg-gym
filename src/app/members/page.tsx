import prisma from '@/lib/prisma';
import MembersClient from './MembersClient';

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const members = await prisma.member.findMany({
    where: {
      membershipType: { notIn: ['Daily Pass', '7 Days Pass', 'Weekly Pass', 'Monthly Membership (Without Admission)'] }
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Members</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Manage your gym members and view their status.</p>
      </div>

      <MembersClient initialMembers={members} initialSearch={params.q || ''} />
    </div>
  );
}
