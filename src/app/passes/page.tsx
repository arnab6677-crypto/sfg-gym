import prisma from '@/lib/prisma';
import PassesClient from './PassesClient';

export default async function PassesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
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
