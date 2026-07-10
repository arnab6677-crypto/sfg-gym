'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updatePassword } from './actions';
import { useRouter } from 'next/navigation';
import styles from '../../admission/Admission.module.css';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result.success) {
      setSuccess('Password updated successfully!');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setError(result.error || 'Failed to update password');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Change Password</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Update your admin access password.</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          {success && <div className={styles.errorBanner} style={{ backgroundColor: '#D1FAE5', color: '#059669', borderColor: '#34D399' }}>{success}</div>}

          <div className={styles.section}>
            <div className={styles.grid}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Current Password *" type="password" name="currentPassword" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="New Password *" type="password" name="newPassword" required minLength={6} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Confirm New Password *" type="password" name="confirmPassword" required minLength={6} />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
