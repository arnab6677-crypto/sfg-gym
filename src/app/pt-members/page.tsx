import prisma from '@/lib/prisma';
import PTMembersClient from './PTMembersClient';

export default async function PTMembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const members = await prisma.member.findMany({
    where: {
      ptPlan: { not: null }
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Personal Training Members</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Manage members who have active personal training plans.</p>
      </div>

      <PTMembersClient initialMembers={members} initialSearch={params.q || ''} />
    </div>
  );
}
