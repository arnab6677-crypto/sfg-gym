'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

export default function ReportsClient() {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

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
