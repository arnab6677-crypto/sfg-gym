import prisma from '@/lib/prisma';
import DueFeesClient from './DueFeesClient';
import styles from '../members/Members.module.css';

export default async function DueFeesPage() {
  // Find members whose latest payment has a nextDueDate < today
  const members = await prisma.member.findMany({
    where: { 
      status: 'ACTIVE',
      membershipType: {
        notIn: ['Daily Pass', '7 Days Pass', 'Weekly Pass', 'Monthly Membership (Without Admission)']
      }
    },
    include: {
      payments: {
        orderBy: { nextDueDate: 'desc' },
        take: 1
      }
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  threeDaysFromNow.setHours(23, 59, 59, 999); // End of 3rd day

  const dueMembers: any[] = [];
  const upcomingMembers: any[] = [];

  members.forEach(member => {
    const latestPayment = member.payments[0];
    const dueDate = latestPayment ? new Date(latestPayment.nextDueDate) : new Date();
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const memberData = {
      ...member,
      dueDate,
      daysOverdue: Math.max(0, daysOverdue)
    };

    if (!latestPayment || dueDate < today) {
      dueMembers.push(memberData);
    } else if (dueDate >= today && dueDate <= threeDaysFromNow) {
      // Calculate days until due instead of days overdue
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      upcomingMembers.push({
        ...memberData,
        daysUntilDue
      });
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Due Fees</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Members with expired memberships or upcoming dues.</p>
      </div>

      <DueFeesClient initialMembers={dueMembers} initialUpcoming={upcomingMembers} />
    </div>
  );
}
