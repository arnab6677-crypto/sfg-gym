'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, CheckCircle, Search } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import styles from '../members/Members.module.css';
import { markAsPaid, updatePromisedDate } from './actions';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { useRouter } from 'next/navigation';

export default function PayLaterClient({ initialPayments }: { initialPayments: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleMarkPaid = async (paymentId: string) => {
    if (confirm('Are you sure you want to mark this balance as fully paid?')) {
      await markAsPaid(paymentId);
      router.refresh();
    }
  };

  const handlePromisedDateChange = async (paymentId: string, date: Date | null) => {
    await updatePromisedDate(paymentId, date);
    router.refresh();
  };

  const filteredPayments = initialPayments.filter(payment => {
    const search = searchTerm.toLowerCase();
    return (
      payment.member.fullName.toLowerCase().includes(search) ||
      payment.member.phone.includes(search) ||
      payment.plan.name.toLowerCase().includes(search)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by Name, Phone, or Plan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
      <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Plan</th>
            <th>Final Amount</th>
            <th>Balance Due</th>
            <th>Promised Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment) => {
            const phone = (payment.member.phone || '').replace(/\D/g, '');
            let message = `Hi ${payment.member.fullName},\n\nThis is a gentle reminder from STRENGTH FUSION GYM that your pending balance of ₹${payment.balanceDue} is due.`;
            
            if (payment.promisedDate) {
              const pDate = new Date(payment.promisedDate);
              message = `Hi ${payment.member.fullName},\n\nThis is a gentle reminder from STRENGTH FUSION GYM that your pending balance of ₹${payment.balanceDue} is due on ${formatDate(pDate)} as promised.`;
            }
            
            message += `\n\nPlease clear it at the earliest! 💪\n\nThank you!`;
            const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

            return (
              <tr key={payment.id}>
                <td className={styles.fw600}>{payment.member.fullName}</td>
                <td>{payment.member.phone}</td>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{payment.plan.name}</td>
                <td>₹{payment.finalAmount}</td>
                <td style={{ color: '#F59E0B', fontWeight: 600 }}>₹{payment.balanceDue}</td>
                <td style={{ minWidth: '150px' }}>
                  <CustomDatePicker 
                    selected={payment.promisedDate ? new Date(payment.promisedDate) : null} 
                    onChange={(date) => handlePromisedDateChange(payment.id, date)} 
                  />
                </td>
                <td>
                  <div className={styles.actions}>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" title="Send WhatsApp Reminder">
                        <MessageSquare size={16} color="#25D366" />
                      </Button>
                    </a>
                    <Button variant="primary" size="sm" title="Mark as Paid" onClick={() => handleMarkPaid(payment.id)}>
                      <CheckCircle size={16} /> Mark Paid
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredPayments.length === 0 && (
            <tr>
              <td colSpan={8} className={styles.emptyState}>
                No pending payments found! Everyone is paid up.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
