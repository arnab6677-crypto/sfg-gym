import prisma from '@/lib/prisma';
import SettingsForm from './SettingsForm';
import MembershipPlansManager from './MembershipPlansManager';
import { Card } from '@/components/ui/Card';

export default async function SettingsPage() {
  let settings = await prisma.settings.findFirst();
  
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        gymName: 'STRENGTH FUSION GYM',
        admissionFee: 500,
        adminPassword: 'admin',
        adminEmail: 'admin@example.com',
        trainers: 'Sayon,Uday,Siddhart',
        ptPlans: 'None,Only Training,Only Diet,Full Coaching'
      }
    });
  }

  const plans = await prisma.membershipPlan.findMany({
    orderBy: { durationDays: 'asc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Configure your gym application preferences.</p>
      </div>

      <Card padding="lg">
        <SettingsForm initialData={settings} />
        <MembershipPlansManager plans={plans} />
      </Card>
    </div>
  );
}
