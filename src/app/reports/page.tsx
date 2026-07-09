import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import ReportsClient from './ReportsClient';
import styles from '../members/Members.module.css'; // Reusing table styles

export default async function ReportsPage() {
  const today = new Date();
  
  // Calculate Daily Collection
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const dailyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: startOfDay } }
  });
  const dailyCollection = dailyPayments._sum.finalAmount || 0;

  // Calculate Monthly Collection
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: startOfMonth } }
  });
  const monthlyCollection = monthlyPayments._sum.finalAmount || 0;

  // Calculate Yearly Collection
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const yearlyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: startOfYear } }
  });
  const yearlyCollection = yearlyPayments._sum.finalAmount || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Financial Reports</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Overview of collections and revenue statistics.</p>
        </div>
        <Button variant="outline">
          <Download size={18} /> Export CSV
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <Card padding="md">
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Daily Collection (Today)</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>₹{dailyCollection.toLocaleString()}</h3>
        </Card>
        <Card padding="md">
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Monthly Collection</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>₹{monthlyCollection.toLocaleString()}</h3>
        </Card>
        <Card padding="md">
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Yearly Collection</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>₹{yearlyCollection.toLocaleString()}</h3>
        </Card>
      </div>

      <ReportsClient />
    </div>
  );
}
