import prisma from '@/lib/prisma';
import AdmissionsClient from './AdmissionsClient';

export const dynamic = 'force-dynamic';

export default async function AdmissionsThisMonthPage() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const [month, day, year] = formatter.format(now).split('/');
  
  const firstDayOfMonthStr = `${year}-${month.padStart(2, '0')}-01T00:00:00+05:30`;
  const firstDayOfMonth = new Date(firstDayOfMonthStr);

  const excludedTypes = ['Daily Pass', '7 Days Pass', 'Weekly Pass', 'Monthly Membership (Without Admission)'];

  const admissions = await prisma.member.findMany({
    where: { 
      joiningDate: { gte: firstDayOfMonth },
      membershipType: { notIn: excludedTypes }
    },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { joiningDate: 'desc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>This Month's Admissions</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Members who took standard admission since {firstDayOfMonth.toLocaleDateString('en-IN')}</p>
      </div>

      <AdmissionsClient initialMembers={admissions} />
    </div>
  );
}
