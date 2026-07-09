'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import styles from '@/app/admission/Admission.module.css';
import { updateMember } from './actions';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

export default function EditMemberForm({ member, plans, trainers, ptPlans }: { member: any, plans: any[], trainers: string[], ptPlans: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State initialization from member object
  const [ptPlan, setPtPlan] = useState<string>(member.ptPlan || 'None');
  const [assignedTrainer, setAssignedTrainer] = useState<string>(member.assignedTrainer || '');
  const [status, setStatus] = useState<string>(member.status);
  const [planName, setPlanName] = useState<string>(member.membershipType || '');
  
  // Try to find the next due date from the latest payment, fallback to member.nextDueDate
  const latestPayment = member.payments && member.payments.length > 0 ? member.payments[0] : null;
  const initialNextDueDate = latestPayment ? new Date(latestPayment.nextDueDate) : (member.nextDueDate ? new Date(member.nextDueDate) : new Date());
  const [nextDueDate, setNextDueDate] = useState<Date>(initialNextDueDate);

  const ptOptions = [
    { name: 'None' },
    { name: 'Only Training' },
    { name: 'Only Diet' },
    { name: 'Full Coaching' }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('memberId', member.id);
    formData.append('ptPlan', ptPlan);
    formData.append('nextDueDate', nextDueDate.toISOString());
    if (assignedTrainer) formData.append('assignedTrainer', assignedTrainer);

    const result = await updateMember(formData);
    
    if (result.success) {
      router.push(`/members/${member.id}`);
      router.refresh(); // force client refresh for the badge and details
    } else {
      setError(result.error || 'Failed to update member');
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Account Status</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Status *</label>
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select} required>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Manual Next Due Date Override</label>
            <CustomDatePicker selected={nextDueDate} onChange={(date) => setNextDueDate(date || new Date())} name="nextDueDateDummy" />
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Useful for fixing dates when adding old members.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal Details</h3>
        <div className={styles.grid}>
          <Input label="Full Name *" name="fullName" defaultValue={member.fullName} required />
          <Input label="Phone (WhatsApp) *" name="phone" defaultValue={member.phone} required />
          <Input label="Age" type="number" name="age" defaultValue={member.age || ''} />
          <div className={styles.inputGroup}>
            <label className={styles.label}>Gender *</label>
            <select name="gender" defaultValue={member.gender} className={styles.select} required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input label="Address" name="address" defaultValue={member.address || ''} />
          <Input label="Emergency Contact" name="emergencyContact" defaultValue={member.emergencyContact || ''} />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Membership Settings</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Monthly Plan (Membership Type) *</label>
            <select name="membershipType" value={planName} onChange={(e) => setPlanName(e.target.value)} className={styles.select} required>
              {plans.map(plan => (
                <option key={plan.id} value={plan.name}>{plan.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>Personal Training</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>PT Plan</label>
            <select name="ptPlan" value={ptPlan} onChange={(e) => setPtPlan(e.target.value)} className={styles.select}>
              {ptPlans.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {ptPlan !== 'None' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Assigned Trainer Name *</label>
              <select name="assignedTrainer" defaultValue={member.assignedTrainer || ''} className={styles.select}>
                <option value="">No Trainer</option>
                {trainers.map(trainer => (
                  <option key={trainer} value={trainer}>{trainer}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => router.push(`/members/${member.id}`)}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
