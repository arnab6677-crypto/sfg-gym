'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Eye } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import styles from '../members/Members.module.css'; // Reusing Members styles

export default function PassesClient({ initialPasses, initialSearch = '' }: { initialPasses: any[], initialSearch?: string }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredPasses = initialPasses.filter(member => {
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
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Pass Type</th>
              <th>Status</th>
              <th>Expired On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPasses.map((pass) => {
              const latestPayment = pass.payments[0];
              const isExpired = latestPayment && (() => {
                const d = new Date(latestPayment.nextDueDate);
                d.setHours(0,0,0,0);
                const t = new Date();
                t.setHours(0,0,0,0);
                return d < t;
              })();
              const statusLabel = isExpired ? 'EXPIRED' : 'ACTIVE';
              
              return (
                <tr key={pass.id}>
                  <td className={styles.fw600}>{pass.regNumber}</td>
                  <td>{pass.fullName}</td>
                  <td>{pass.phone}</td>
                  <td>{pass.membershipType}</td>
                  <td>
                    <span className={`${styles.badge} ${isExpired ? styles.badgeDanger : styles.badgeSuccess}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    {formatDate(latestPayment?.nextDueDate)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/members/${pass.id}`}>
                        <Button variant="outline" size="sm" title="View Profile">
                          <Eye size={16} />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredPasses.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                  No short-term passes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
