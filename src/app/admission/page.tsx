import prisma from '@/lib/prisma';
import AdmissionForm from './AdmissionForm';
import { Card } from '@/components/ui/Card';

export default async function AdmissionPage() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { durationDays: 'asc' }
  });
  
  const settings = await prisma.settings.findFirst();
  const admissionFee = settings?.admissionFee || 500;
  const trainers = settings?.trainers?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const ptPlans = settings?.ptPlans?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>New Admission</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Register a new member and process their first payment.</p>
      </div>

      <Card padding="lg">
        <AdmissionForm plans={plans} defaultAdmissionFee={admissionFee} trainers={trainers} ptPlans={ptPlans} />
      </Card>
    </div>
  );
}
