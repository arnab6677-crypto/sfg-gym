import prisma from '@/lib/prisma';
import FeeForm from './FeeForm';
import { Card } from '@/components/ui/Card';

export default async function FeesPage({ searchParams }: { searchParams: Promise<{ memberId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  const [plans, members, settings] = await Promise.all([
    prisma.membershipPlan.findMany({ orderBy: { durationDays: 'asc' } }),
    prisma.member.findMany({
      orderBy: { fullName: 'asc' },
      select: { 
        id: true, 
        fullName: true, 
        regNumber: true,
        phone: true,
        membershipType: true,
        monthlyFeeAmount: true,
        nextDueDate: true,
        ptPlan: true,
        assignedTrainer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 1,
          select: { paymentDate: true }
        }
      }
    }),
    prisma.settings.findFirst()
  ]);

  const trainers = settings?.trainers?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const ptPlans = settings?.ptPlans?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Fee Collection</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Process membership renewals and fee payments.</p>
      </div>

      <Card padding="lg">
        <FeeForm plans={plans as any} members={members as any} initialMemberId={resolvedSearchParams.memberId} trainers={trainers} ptPlans={ptPlans} />
      </Card>
    </div>
  );
}
