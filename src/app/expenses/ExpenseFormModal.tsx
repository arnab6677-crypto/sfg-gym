'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createExpense, updateExpense } from './actions';
import { X } from 'lucide-react';

interface ExpenseFormModalProps {
  onClose: () => void;
  expenseToEdit?: any; // If editing
}

export const CATEGORIES = [
  "Rent", 
  "Utilities", 
  "Salary", 
  "Maintenance", 
  "Equipment", 
  "Supplies",
  "Marketing",
  "Other"
];

export const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "BANK_TRANSFER",
  "CARD"
];

export default function ExpenseFormModal({ onClose, expenseToEdit }: ExpenseFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!expenseToEdit;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (isEdit) {
      result = await updateExpense(expenseToEdit.id, formData);
    } else {
      result = await createExpense(formData);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  // Convert Date object to YYYY-MM-DD for the date picker default value
  const defaultDate = isEdit && expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <Input 
            label="Title / Short Description *" 
            name="title" 
            required 
            defaultValue={isEdit ? expenseToEdit.title : ''} 
            placeholder="e.g. Electric Bill July"
          />

          <div style={gridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Category *</label>
              <select name="category" required defaultValue={isEdit ? expenseToEdit.category : ''} style={inputStyle}>
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <Input 
              label="Amount (₹) *" 
              name="amount" 
              type="number" 
              required 
              min="0"
              step="0.01"
              defaultValue={isEdit ? expenseToEdit.amount : ''} 
            />
          </div>

          <div style={gridStyle}>
            <Input 
              label="Date *" 
              name="date" 
              type="date" 
              required 
              defaultValue={defaultDate}
            />

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Payment Method *</label>
              <select name="paymentMethod" required defaultValue={isEdit ? expenseToEdit.paymentMethod : ''} style={inputStyle}>
                <option value="" disabled>Select Method</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <Input 
            label="Paid To *" 
            name="paidTo" 
            required 
            defaultValue={isEdit ? expenseToEdit.paidTo : ''} 
            placeholder="e.g. WBSEDCL"
          />

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Detailed Description (Optional)</label>
            <textarea 
              name="description" 
              defaultValue={isEdit ? expenseToEdit.description : ''} 
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-main)' }}>
            <input type="checkbox" name="isRecurring" defaultChecked={isEdit ? expenseToEdit.isRecurring : false} />
            This is a recurring monthly expense
          </label>

          <div style={footerStyle}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline styles for the modal (to keep it contained without a dedicated CSS module)
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px'
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-main)',
  borderRadius: 'var(--border-radius-lg)',
  width: '100%',
  maxWidth: '500px',
  boxShadow: 'var(--shadow-lg)',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid var(--color-border)',
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--color-bg-main)',
  zIndex: 10
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)'
};

const formStyle: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--color-text-main)'
};

const inputStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-secondary)',
  color: 'var(--color-text-main)',
  fontSize: '14px',
  outline: 'none',
  width: '100%'
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
  paddingTop: '20px',
  borderTop: '1px solid var(--color-border)'
};

const errorStyle: React.CSSProperties = {
  margin: '20px 24px 0',
  padding: '12px',
  backgroundColor: '#FEE2E2',
  color: '#DC2626',
  borderRadius: '6px',
  fontSize: '14px'
};
