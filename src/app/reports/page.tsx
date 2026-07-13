import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const today = new Date();
  
  // Calculate Daily Collection & Expenses
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const dailyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: startOfDay } }
  });
  const dailyStoreSales = await prisma.storeSale.aggregate({
    _sum: { totalAmount: true },
    where: { date: { gte: startOfDay } }
  });
  const dailyExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfDay } }
  });
  const dailyCollection = (dailyPayments._sum.finalAmount || 0) + (dailyStoreSales._sum.totalAmount || 0);
  const dailyExpenseAmt = dailyExpenses._sum.amount || 0;
  const dailyProfit = dailyCollection - dailyExpenseAmt;

  // Calculate Monthly Collection & Expenses
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: startOfMonth } }
  });
  const monthlyStoreSales = await prisma.storeSale.aggregate({
    _sum: { totalAmount: true },
    where: { date: { gte: startOfMonth } }
  });
  const monthlyExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfMonth } }
  });
  const monthlyCollection = (monthlyPayments._sum.finalAmount || 0) + (monthlyStoreSales._sum.totalAmount || 0);
  const monthlyExpenseAmt = monthlyExpenses._sum.amount || 0;
  const monthlyProfit = monthlyCollection - monthlyExpenseAmt;

  // Calculate Yearly Collection & Expenses
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const yearlyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: startOfYear } }
  });
  const yearlyStoreSales = await prisma.storeSale.aggregate({
    _sum: { totalAmount: true },
    where: { date: { gte: startOfYear } }
  });
  const yearlyExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfYear } }
  });
  const yearlyCollection = (yearlyPayments._sum.finalAmount || 0) + (yearlyStoreSales._sum.totalAmount || 0);
  const yearlyExpenseAmt = yearlyExpenses._sum.amount || 0;
  const yearlyProfit = yearlyCollection - yearlyExpenseAmt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Financial Reports</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Overview of collections, expenses, and net profit.</p>
        </div>
        <Button variant="outline">
          <Download size={18} /> Export CSV
        </Button>
      </div>

      {/* TODAY'S BREAKDOWN */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Today's Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10B981" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Income</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{dailyCollection.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} color="#EF4444" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expenses</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{dailyExpenseAmt.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Profit</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: dailyProfit >= 0 ? '#10B981' : '#EF4444', marginTop: '8px' }}>
              ₹{dailyProfit.toLocaleString()}
            </h3>
          </Card>
        </div>
      </div>

      {/* THIS MONTH'S BREAKDOWN */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>This Month's Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10B981" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Income</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{monthlyCollection.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} color="#EF4444" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expenses</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{monthlyExpenseAmt.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Profit</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: monthlyProfit >= 0 ? '#10B981' : '#EF4444', marginTop: '8px' }}>
              ₹{monthlyProfit.toLocaleString()}
            </h3>
          </Card>
        </div>
      </div>

      {/* THIS YEAR'S BREAKDOWN */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>This Year's Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10B981" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Income</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{yearlyCollection.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} color="#EF4444" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expenses</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{yearlyExpenseAmt.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Profit</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: yearlyProfit >= 0 ? '#10B981' : '#EF4444', marginTop: '8px' }}>
              ₹{yearlyProfit.toLocaleString()}
            </h3>
          </Card>
        </div>
      </div>

      <ReportsClient />
    </div>
  );
}
