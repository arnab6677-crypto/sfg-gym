'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';

interface ExpiredPass {
  id: string;
  fullName: string;
  phone: string;
  membershipType: string;
  nextDueDate: Date | null;
}

export function ExpiredPassesAlert({ passes }: { passes: ExpiredPass[] }) {
  if (!passes || passes.length === 0) return null;

  const handleWhatsApp = (pass: ExpiredPass) => {
    const cleanPhone = pass.phone.replace(/\D/g, '');
    
    // Customize the message based on the membership type
    const passName = pass.membershipType === 'Daily Pass' ? '1 Day Pass' : '7 Days Pass';
    
    const message = `Hello ${pass.fullName},
    
This is a quick reminder from STRENGTH FUSION GYM (SFG) 💪

Your ${passName} has just ended. We hope you had a great time training with us!

Would you like to renew your pass or upgrade to a monthly membership? Let us know!

— Team SFG 💙`;

    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle color="#F59E0B" /> Expired Short-Term Passes
      </h2>
      <Card padding="none" style={{ border: '1px solid #FCD34D', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#FEF3C7', padding: '12px 16px', borderBottom: '1px solid #FDE68A' }}>
          <p style={{ color: '#92400E', fontSize: '14px', fontWeight: 500 }}>
            The following members have passes that recently expired.
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Pass Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Expired On</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((pass) => (
                <tr key={pass.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{pass.fullName}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4B5563' }}>{pass.membershipType}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#EF4444' }}>{formatDate(pass.nextDueDate)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleWhatsApp(pass)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', borderColor: '#16A34A' }}
                    >
                      <MessageCircle size={14} /> Send WhatsApp
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
