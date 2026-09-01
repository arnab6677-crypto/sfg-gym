import prisma from '@/lib/prisma';
import PassesClient from './PassesClient';

export const dynamic = 'force-dynamic';

export default async function PassesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;

  // Auto-cleanup: Delete Daily Passes older than 48 hours
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  // First, find all daily pass members older than 48 hours
  const oldPassMembers = await prisma.member.findMany({
    where: {
      membershipType: 'Daily Pass',
      createdAt: { lt: fortyEightHoursAgo }
    },
    select: { id: true }
  });

  if (oldPassMembers.length > 0) {
    const oldPassIds = oldPassMembers.map(m => m.id);
    
    // Delete their payments first due to foreign key constraints
    await prisma.payment.deleteMany({
      where: { memberId: { in: oldPassIds } }
    });
    
    // Then delete the members
    await prisma.member.deleteMany({
      where: { id: { in: oldPassIds } }
    });
  }

  const passes = await prisma.member.findMany({
    where: {
      membershipType: { in: ['Daily Pass', '7 Days Pass', 'Weekly Pass'] }
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Short-Term Passes</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Manage 1-Day and 7-Day pass holders.</p>
      </div>

      <PassesClient initialPasses={passes} initialSearch={params.q || ''} />
    </div>
  );
}
