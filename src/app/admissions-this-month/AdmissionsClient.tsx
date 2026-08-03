'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Eye, IndianRupee, Dumbbell, UserPlus } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import styles from '../members/Members.module.css';

export default function AdmissionsClient({ initialMembers }: { initialMembers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = initialMembers.filter(member => {
    const search = searchTerm.toLowerCase();
    const latestReceipt = member.payments[0]?.receiptNumber || '';
    
    return (
      member.fullName.toLowerCase().includes(search) ||
      member.regNumber.toLowerCase().includes(search) ||
      member.phone.includes(search) ||
      latestReceipt.toLowerCase().includes(search)
    );
  });

  return (
    <Card padding="none" className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by Name, ID, Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/admission">
          <Button><UserPlus size={18} style={{ marginRight: '8px' }}/> New Admission</Button>
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => {
              const latestPayment = member.payments[0];
              const isOverdue = latestPayment && (() => {
                const d = new Date(latestPayment.nextDueDate);
                d.setHours(0,0,0,0);
                const t = new Date();
                t.setHours(0,0,0,0);
                return d < t;
              })();
              
              let statusLabel = member.status || 'ACTIVE';
              let badgeClass = statusLabel === 'ACTIVE' ? styles.badgeSuccess : styles.badgeDanger;
              
              if (statusLabel === 'ACTIVE' && isOverdue) {
                statusLabel = 'OVERDUE';
                badgeClass = styles.badgeDanger;
              }
              
              return (
                <tr key={member.id}>
                  <td className={styles.fw600}>{member.regNumber}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {member.fullName}
                      {member.ptPlan && (
                        <span title={`PT Plan: ${member.ptPlan} ${member.assignedTrainer ? `(${member.assignedTrainer})` : ''}`}>
                          <Dumbbell size={16} style={{ color: 'var(--color-primary)' }} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{member.phone}</td>
                  <td>{formatDate(member.joiningDate)}</td>
                  <td>
                    <span className={`${styles.badge} ${badgeClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/members/${member.id}`}>
                        <Button variant="outline" size="sm" title="View Profile">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link href={`/fees?memberId=${member.id}`}>
                        <Button variant="primary" size="sm" title="Collect Fee">
                          <IndianRupee size={16} />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No admissions found this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
