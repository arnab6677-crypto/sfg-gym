'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Eye, IndianRupee, Dumbbell } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import styles from './Members.module.css';

export default function MembersClient({ initialMembers, initialSearch = '' }: { initialMembers: any[], initialSearch?: string }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

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
            placeholder="Search by Name, ID, Phone, or Receipt..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/admission">
          <Button>New Admission</Button>
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Next Due</th>
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
              const isShortTermPass = member.membershipType === 'Daily Pass' || member.membershipType === '7 Days Pass' || member.membershipType === 'Weekly Pass';
              const statusLabel = isOverdue ? (isShortTermPass ? 'INACTIVE' : 'OVERDUE') : 'ACTIVE';
              
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
                  <td>
                    <span className={`${styles.badge} ${isOverdue ? (isShortTermPass ? styles.badgeDanger : styles.badgeDanger) : styles.badgeSuccess}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    {formatDate(latestPayment?.nextDueDate)}
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
                  No members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
