'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Eye, IndianRupee } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import styles from '../members/Members.module.css';

export default function PTMembersClient({ initialMembers, initialSearch = '' }: { initialMembers: any[], initialSearch?: string }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredMembers = initialMembers.filter(member => {
    const search = searchTerm.toLowerCase();
    
    return (
      member.fullName.toLowerCase().includes(search) ||
      member.regNumber.toLowerCase().includes(search) ||
      member.phone.includes(search) ||
      (member.assignedTrainer && member.assignedTrainer.toLowerCase().includes(search))
    );
  });

  return (
    <Card padding="none" className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by Name, ID, Phone, or Trainer..." 
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
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>PT Plan</th>
              <th>Assigned Trainer</th>
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
              const isDailyPass = member.membershipType === 'Daily Pass';
              const statusLabel = isOverdue ? (isDailyPass ? 'INACTIVE' : 'OVERDUE') : 'ACTIVE';
              
              return (
                <tr key={member.id}>
                  <td className={styles.fw600}>{member.regNumber}</td>
                  <td>{member.fullName}</td>
                  <td>{member.phone}</td>
                  <td><span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{member.ptPlan}</span></td>
                  <td>{member.assignedTrainer || 'Unassigned'}</td>
                  <td>
                    <span className={`${styles.badge} ${isOverdue ? styles.badgeDanger : styles.badgeSuccess}`}>
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
                <td colSpan={7} className={styles.emptyState}>
                  No PT members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
