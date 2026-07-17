'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateSettings } from './actions';
import styles from '../admission/Admission.module.css';

interface SettingsData {
  gymName: string;
  admissionFee: number;
  adminEmail: string;
  trainers: string;
  ptPlans: string;
  expenseCategories: string;
}

export default function SettingsForm({ initialData }: { initialData: SettingsData }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Failed to update settings');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.errorBanner} style={{ backgroundColor: '#D1FAE5', color: '#059669', borderColor: '#34D399' }}>Settings saved successfully!</div>}
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>General Preferences</h3>
        <div className={styles.grid}>
          <Input label="Gym Name *" name="gymName" defaultValue={initialData.gymName} required />
          <Input label="Default Admission Fee (₹) *" type="number" name="admissionFee" defaultValue={initialData.admissionFee} required />
          <Input label="Admin Email" type="email" name="adminEmail" defaultValue={initialData.adminEmail} />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Staff & Services</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Trainers (Comma Separated)</label>
            <input type="text" name="trainers" defaultValue={initialData.trainers} className={styles.input} />
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>e.g. Sayon, Uday, Siddhart</p>
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>PT Plans (Comma Separated)</label>
            <input type="text" name="ptPlans" defaultValue={initialData.ptPlans} className={styles.input} />
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>e.g. None, Only Training, Only Diet, Full Coaching</p>
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Expense Categories (Comma Separated)</label>
            <input type="text" name="expenseCategories" defaultValue={initialData.expenseCategories} className={styles.input} />
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>e.g. Rent, Utilities, Salary, Equipment, Drinks</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Database (Advanced)</h3>
        <div className={styles.grid}>
          <div style={{ display: 'flex', gap: '16px', gridColumn: '1 / -1' }}>
            <Button type="button" variant="outline" onClick={() => alert('Backup feature would generate and download a copy of dev.db')}>Backup Database</Button>
            <Button type="button" variant="danger" onClick={() => alert('Restore feature would overwrite dev.db with an uploaded file')}>Restore Database</Button>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
