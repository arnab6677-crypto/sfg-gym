'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createMembershipPlan, updateMembershipPlan, deleteMembershipPlan } from './actions';
import styles from '../admission/Admission.module.css';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export default function MembershipPlansManager({ plans }: { plans: Plan[] }) {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await createMembershipPlan(formData);
    
    if (result.success) {
      setIsCreating(false);
    } else {
      setError(result.error || 'Failed to create plan');
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('id', editingPlan!.id);
    const result = await updateMembershipPlan(formData);
    
    if (result.success) {
      setEditingPlan(null);
    } else {
      setError(result.error || 'Failed to update plan');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this membership plan? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      const result = await deleteMembershipPlan(id);
      if (!result.success) {
        setError(result.error || 'Failed to delete plan');
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.section} style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className={styles.sectionTitle} style={{ margin: 0, padding: 0, border: 'none' }}>Membership Plans</h3>
        <Button variant="primary" size="sm" onClick={() => setIsCreating(true)} disabled={isCreating || !!editingPlan}>
          + New Plan
        </Button>
      </div>
      
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Price (₹)</th>
              <th>Duration (Days)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr>
                <td colSpan={4}>
                  <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <Input label="Name" name="name" required autoFocus />
                    <Input label="Price" type="number" name="price" required />
                    <Input label="Duration (Days)" type="number" name="durationDays" required />
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <Button type="submit" variant="primary" disabled={loading}>Save</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                    </div>
                  </form>
                </td>
              </tr>
            )}
            {plans.map(plan => (
              <React.Fragment key={plan.id}>
                {editingPlan?.id === plan.id ? (
                  <tr>
                    <td colSpan={4}>
                      <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <Input label="Name" name="name" defaultValue={plan.name} required autoFocus />
                        <Input label="Price" type="number" name="price" defaultValue={plan.price} required />
                        <Input label="Duration (Days)" type="number" name="durationDays" defaultValue={plan.durationDays} required />
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                          <Button type="submit" variant="primary" disabled={loading}>Update</Button>
                          <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className={styles.fw600}>{plan.name}</td>
                    <td>₹{plan.price}</td>
                    <td>{plan.durationDays} Days</td>
                    <td>
                      <div className={styles.actions}>
                        <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)} disabled={isCreating || !!editingPlan}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(plan.id)} disabled={isCreating || !!editingPlan || loading}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {plans.length === 0 && !isCreating && (
              <tr>
                <td colSpan={4} className={styles.emptyState}>No membership plans found. Create one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
