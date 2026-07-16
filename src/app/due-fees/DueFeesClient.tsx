'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IndianRupee, Eye, MessageSquare, Search } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import styles from '../members/Members.module.css';

export default function DueFeesClient({ initialMembers, initialUpcoming = [] }: { initialMembers: any[], initialUpcoming?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overdue' | 'upcoming'>('overdue');

  const currentList = activeTab === 'overdue' ? initialMembers : initialUpcoming;

  const filteredMembers = currentList.filter(member => {
    const search = searchTerm.toLowerCase();
    return (
      member.fullName.toLowerCase().includes(search) ||
      member.regNumber.toLowerCase().includes(search) ||
      member.phone.includes(search)
    );
  });

  return (
    <Card padding="none" className={styles.container}>
      <div className={styles.toolbar} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => setActiveTab('overdue')}
            style={{ 
              padding: '12px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'overdue' ? '3px solid #EF4444' : '3px solid transparent',
              color: activeTab === 'overdue' ? '#EF4444' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'overdue' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Overdue ({initialMembers.length})
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{ 
              padding: '12px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'upcoming' ? '3px solid #F59E0B' : '3px solid transparent',
              color: activeTab === 'upcoming' ? '#F59E0B' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'upcoming' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Upcoming in 3 Days ({initialUpcoming.length})
          </button>
        </div>
      </div>
      <div className={styles.toolbar} style={{ paddingTop: '16px' }}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Phone..." 
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
              <th>Member ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Due Date</th>
              <th>{activeTab === 'overdue' ? 'Days Overdue' : 'Days Until Due'}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td className={styles.fw600}>{member.regNumber}</td>
                <td>{member.fullName}</td>
                <td>{member.phone}</td>
                <td style={{ color: activeTab === 'overdue' ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>
                  {formatDate(member.dueDate)}
                </td>
                <td>
                  {activeTab === 'overdue' ? (
                    <span className={styles.badgeDanger} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                      {member.daysOverdue} Days
                    </span>
                  ) : (
                    <span className={styles.badgeWarning} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309' }}>
                      {member.daysUntilDue === 0 ? 'Today' : `In ${member.daysUntilDue} Days`}
                    </span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/members/${member.id}`}>
                      <Button variant="outline" size="sm" title="View Profile">
                        <Eye size={16} />
                      </Button>
                    </Link>
                    
                    {(() => {
                      const phone = (member.phone || '').replace(/\D/g, '');
                      const getDisplayPlanName = (name: string) => {
                        if (!name) return 'Membership';
                        if (name.includes('Monthly')) return 'Monthly Membership';
                        return name;
                      };
                      const planName = getDisplayPlanName(member.membershipType);

                      let message = '';
                      if (activeTab === 'overdue') {
                        message = `Hi ${member.fullName},\n\nThis is a gentle reminder from STRENGTH FUSION GYM that your ${planName} fee is currently overdue.\n\nPlease clear your pending dues at the earliest to continue your fitness journey uninterrupted! 💪\n\nThank you!`;
                      } else {
                        const dayText = member.daysUntilDue === 0 ? 'today' : `in ${member.daysUntilDue} days`;
                        message = `Hi ${member.fullName},\n\nThis is a gentle reminder from STRENGTH FUSION GYM that your ${planName} fee will be due ${dayText}.\n\nPlease renew soon to continue your fitness journey uninterrupted! 💪\n\nThank you!`;
                      }
                      
                      const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
                      
                      return (
                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" title="Send WhatsApp Reminder">
                            <MessageSquare size={16} color="#25D366" />
                          </Button>
                        </a>
                      );
                    })()}

                    <Link href={`/fees?memberId=${member.id}`}>
                      <Button variant="primary" size="sm" title="Collect Fee">
                        <IndianRupee size={16} /> Collect
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {activeTab === 'overdue' ? 'Great! No members currently have overdue fees.' : 'No upcoming dues in the next 3 days.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
