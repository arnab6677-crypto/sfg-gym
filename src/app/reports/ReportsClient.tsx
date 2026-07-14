'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Lock } from 'lucide-react';

export default function ReportsClient() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', maxWidth: '320px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <Lock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)' }}>Reports Access</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Please enter the PIN to view financial reports.</p>
            </div>
            
            <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <input 
                type="password"
                placeholder="Enter PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', outline: 'none', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                autoFocus
              />
              {error && <p style={{ color: '#EF4444', fontSize: '13px' }}>{error}</p>}
              <Button type="submit" variant="primary" style={{ width: '100%' }}>Unlock Reports</Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  const handleGenerate = () => {
    // Generate report logic
    alert('Report generation will be implemented soon!');
  };

  return (
    <Card padding="lg">
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Generate Custom Report</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Select a date range to generate a detailed CSV or PDF report of all transactions.</p>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Start Date</label>
          <CustomDatePicker selected={startDate} onChange={setStartDate} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>End Date</label>
          <CustomDatePicker selected={endDate} onChange={setEndDate} />
        </div>
        <Button variant="primary" onClick={handleGenerate}>Generate</Button>
      </div>
    </Card>
  );
}
