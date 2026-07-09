import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatDate';
import styles from '../members/Members.module.css'; // Reusing table styles

export default async function HistoryPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { paymentDate: 'desc' },
    include: {
      member: true,
      plan: true
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Payment History</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Complete record of all fee collections.</p>
      </div>

      <Card padding="none" className={styles.container}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Receipt No</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount (₹)</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td className={styles.fw600}>{payment.receiptNumber}</td>
                  <td>
                    {payment.member.regNumber} - {payment.member.fullName}
                  </td>
                  <td>{payment.plan.name}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                    {payment.finalAmount}
                  </td>
                  <td>{payment.paymentMethod}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
