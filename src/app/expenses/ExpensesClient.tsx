'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit2, Trash2, Download, FileText } from 'lucide-react';
import ExpenseFormModal, { CATEGORIES } from './ExpenseFormModal';
import { deleteExpense } from './actions';
import { formatDate } from '@/lib/formatDate';
import styles from '../admission/Admission.module.css';

export default function ExpensesClient({ expenses }: { expenses: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  // Filtering
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expense.paidTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? expense.category === categoryFilter : true;
    
    let matchesMonth = true;
    if (monthFilter) {
      const expenseMonth = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      matchesMonth = expenseMonth === monthFilter;
    }

    return matchesSearch && matchesCategory && matchesMonth;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Export functions
  const exportCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Paid To', 'Method', 'Amount'];
    const rows = filteredExpenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.title,
      e.category,
      e.paidTo,
      e.paymentMethod,
      e.amount.toString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    // Standard print function - browsers will handle PDF generation natively and beautifully
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Expense Tracker</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage gym expenses and track your outgoing cash flow.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={exportCSV} variant="outline" style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <Download size={16} /> CSV
          </Button>
          <Button onClick={exportPDF} variant="outline" style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <FileText size={16} /> Print/PDF
          </Button>
          <Button onClick={handleAddNew} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <Plus size={16} /> Add Expense
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card padding="md" style={{ backgroundColor: 'var(--color-bg-main)' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Filtered Total</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>
            ₹{totalFilteredAmount.toLocaleString()}
          </h3>
        </Card>
      </div>

      <Card padding="none">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by title or recipient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', outline: 'none' }}
            />
          </div>
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', outline: 'none' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input 
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', outline: 'none' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Title</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Paid To</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Method</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '16px 20px', width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No expenses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--color-text-main)' }}>
                      {formatDate(expense.date)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>{expense.title}</p>
                      {expense.isRecurring && <span style={{ fontSize: '10px', backgroundColor: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'inline-block' }}>RECURRING</span>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 8px', borderRadius: '20px', backgroundColor: 'var(--color-primary)', color: 'white', opacity: 0.9 }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                      {expense.paidTo}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                      {expense.paymentMethod.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', textAlign: 'right' }}>
                      ₹{expense.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleEdit(expense)}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-text-main)' }}
                        title="Edit Expense"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', cursor: 'pointer', color: '#DC2626' }}
                        title="Delete Expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <ExpenseFormModal 
          onClose={() => setShowModal(false)} 
          expenseToEdit={editingExpense} 
        />
      )}

      {/* Hide elements when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          th:last-child, td:last-child {
            display: none;
          }
        }
      `}} />
    </div>
  );
}
