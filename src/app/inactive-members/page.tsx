import prisma from '@/lib/prisma';
import InactiveMembersClient from './InactiveMembersClient';

export const dynamic = 'force-dynamic';

export default async function InactiveMembersPage() {
  const inactiveMembers = await prisma.member.findMany({
    where: { 
      status: 'INACTIVE'
    },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Inactive Members</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Members whose status has been manually set to Inactive.</p>
      </div>

      <InactiveMembersClient initialMembers={inactiveMembers} />
    </div>
  );
}
