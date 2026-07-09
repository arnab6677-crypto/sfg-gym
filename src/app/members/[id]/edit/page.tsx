import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import EditMemberForm from './EditMemberForm';
import { notFound } from 'next/navigation';

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [member, plans, settings] = await Promise.all([
    prisma.member.findUnique({
      where: { id }
    }),
    prisma.membershipPlan.findMany({ orderBy: { durationDays: 'asc' } }),
    prisma.settings.findFirst()
  ]);

  if (!member) {
    notFound();
  }

  const trainers = settings?.trainers?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const ptPlans = settings?.ptPlans?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Edit Member</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Update profile details and membership settings for {member.fullName}.</p>
      </div>

      <Card padding="lg">
        <EditMemberForm member={member} plans={plans} trainers={trainers} ptPlans={ptPlans} />
      </Card>
    </div>
  );
}
