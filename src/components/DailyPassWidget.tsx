'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { createAdmission } from '@/app/admission/actions';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: number;
}

export function DailyPassWidget({ dailyPassPlan, weeklyPassPlan }: { dailyPassPlan: Plan, weeklyPassPlan: Plan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [passType, setPassType] = useState<'daily' | 'weekly'>('daily');
  
  const currentPlan = passType === 'daily' ? dailyPassPlan : weeklyPassPlan;
  
  const [amount, setAmount] = useState<number | string>(currentPlan?.price || 150);
  const [amountPaid, setAmountPaid] = useState<number | string>(currentPlan?.price || 150);
  const [promisedDate, setPromisedDate] = useState<Date | null>(null);

  // Update amount automatically when passType changes
  useEffect(() => {
    if (currentPlan) {
      setAmount(currentPlan.price);
      setAmountPaid(currentPlan.price);
    }
  }, [passType, currentPlan]);

  // Sync amountPaid to amount automatically when amount changes
  useEffect(() => {
    setAmountPaid(amount);
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('gender', 'Other'); // Default
    formData.append('planId', currentPlan?.id || '');
    formData.append('admissionFee', '0');
    formData.append('amount', amount.toString());
    formData.append('discount', '0');
    formData.append('ptPlan', 'None');
    formData.append('ptFee', '0');
    formData.append('finalAmount', amount.toString());
    formData.append('amountPaid', amountPaid.toString());
    formData.append('paymentMethod', 'Cash');
    
    if (promisedDate && Number(amountPaid) < Number(amount)) {
      formData.append('promisedDate', promisedDate.toISOString());
    }

    const result = await createAdmission(formData);
    
    if (result.success) {
      alert(`${currentPlan.name} recorded successfully!`);
      setFullName('');
      setPhone('');
      setPassType('daily');
      setAmount(dailyPassPlan?.price || 150);
      setAmountPaid(dailyPassPlan?.price || 150);
      setPromisedDate(null);
      router.refresh();
    } else {
      setError(result.error || 'Failed to record daily pass');
    }
    setLoading(false);
  };

  if (!dailyPassPlan) return <p style={{ color: 'var(--color-text-secondary)' }}>Short-Term Pass plan not configured.</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div style={{ color: '#EF4444', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="passType" 
            value="daily" 
            checked={passType === 'daily'} 
            onChange={() => setPassType('daily')}
          />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>1 Day Pass (₹{dailyPassPlan?.price || 150})</span>
        </label>
        
        {weeklyPassPlan && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="passType" 
              value="weekly" 
              checked={passType === 'weekly'} 
              onChange={() => setPassType('weekly')}
            />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>7 Days Pass (₹{weeklyPassPlan?.price || 800})</span>
          </label>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <Input 
            label="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required 
            placeholder="e.g. John Doe"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input 
            label="Phone Number" 
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required 
            placeholder="10-digit number"
            maxLength={10}
            minLength={10}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <Input 
            label="Amount (₹)" 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input 
            label="Amount Paid (₹)" 
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            required
            min="0"
            max={amount}
          />
        </div>
      </div>

      {Number(amountPaid) < Number(amount) && (
        <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
            Balance Due: ₹{Number(amount) - Number(amountPaid)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Promised Date for Balance</label>
            <CustomDatePicker
              selected={promisedDate}
              onChange={(date) => setPromisedDate(date)}
              required
              minDate={new Date()}
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading} style={{ marginTop: '8px' }}>
        {loading ? 'Recording...' : `Record ${currentPlan?.name || 'Pass'}`}
      </Button>
    </form>
  );
}
