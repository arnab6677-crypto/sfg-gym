import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Phone, Calendar, IndianRupee, Printer, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './Profile.module.css';

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const member = await prisma.member.findUnique({
    where: { id: resolvedParams.id },
    include: {
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: { plan: true }
      }
    }
  });

  if (!member) {
    notFound();
  }

  const latestPayment = member.payments[0];
  const isOverdue = latestPayment && new Date(latestPayment.nextDueDate) < new Date();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{member.fullName}</h1>
          <p className={styles.subtitle}>ID: {member.regNumber}</p>
        </div>
        <div className={styles.actions}>
          <Link href={`/fees?memberId=${member.id}`}>
            <Button variant="primary">
              <IndianRupee size={18} /> Collect Fees
            </Button>
          </Link>
          <Link href={`/members/${member.id}/edit`}>
            <Button variant="outline">
              <Edit size={18} /> Edit
            </Button>
          </Link>
          <Button variant="outline">
            <Printer size={18} /> Print
          </Button>
          <Button variant="danger">
            <Trash2 size={18} /> Delete
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{member.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Gender</span>
                <span className={styles.infoValue}>{member.gender}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Guardian</span>
                <span className={styles.infoValue}>{member.guardianName || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Address</span>
                <span className={styles.infoValue}>{member.address || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Emergency Contact</span>
                <span className={styles.infoValue}>{member.emergencyContact || 'N/A'}</span>
              </div>
            </div>
          </Card>

          <Card padding="md" className={styles.marginTop}>
            <h3 className={styles.sectionTitle}>Membership Details</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <span className={`${styles.badge} ${isOverdue ? styles.badgeDanger : styles.badgeSuccess}`}>
                  {isOverdue ? 'OVERDUE' : 'ACTIVE'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Joining Date</span>
                <span className={styles.infoValue}>{formatDate(member.joiningDate)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Next Due Date</span>
                <span className={styles.infoValue} style={{ color: isOverdue ? '#EF4444' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                  {formatDate(latestPayment?.nextDueDate)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Assigned Trainer</span>
                <span className={styles.infoValue}>{member.assignedTrainer || 'None'}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.rightCol}>
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Payment History</h3>
            <div className={styles.historyList}>
              {member.payments.map((payment) => (
                <div key={payment.id} className={styles.historyItem}>
                  <div className={styles.historyTop}>
                    <span className={styles.planName}>{payment.plan.name} Plan</span>
                    <span className={styles.amount}>₹{payment.finalAmount}</span>
                  </div>
                  <div className={styles.historyBottom}>
                    <span className={styles.date}>{formatDate(payment.paymentDate)}</span>
                    <span className={styles.receipt}>Receipt: {payment.receiptNumber}</span>
                  </div>
                </div>
              ))}
              {member.payments.length === 0 && (
                <p className={styles.empty}>No payments found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
