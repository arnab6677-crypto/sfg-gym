import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import PayLaterClient from './PayLaterClient';

export default async function PayLaterPage() {
  const pendingPayments = await prisma.payment.findMany({
    where: { balanceDue: { gt: 0 } },
    include: {
      member: true,
      plan: true
    },
    orderBy: { paymentDate: 'desc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Pay Later Tracker</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Track and manage members who have partially paid their fees.</p>
      </div>

      <Card padding="none">
        <PayLaterClient initialPayments={pendingPayments} />
      </Card>
    </div>
  );
}
