import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ReportsClient from './ReportsClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export default async function ReportsPage() {
  const cookieStore = await cookies();
  const reportsAuth = cookieStore.get('sfg_reports_auth');
  
  if (!reportsAuth) {
    redirect('/reports/login');
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const [month, day, year] = formatter.format(now).split('/');
  
  // Calculate Daily Collection & Expenses
  const startOfDay = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+05:30`);
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
  const startOfMonth = new Date(`${year}-${month.padStart(2, '0')}-01T00:00:00+05:30`);
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
  const startOfYear = new Date(`${year}-01-01T00:00:00+05:30`);
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

  // --- CHART DATA CALCULATIONS ---
  // Last 30 Days Revenue Chart Data
  const thirtyDaysAgo = new Date(startOfDay);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const recentPayments = await prisma.payment.findMany({
    where: {
      paymentDate: { gte: thirtyDaysAgo }
    },
    select: {
      paymentDate: true,
      finalAmount: true
    }
  });

  const dailyRevenueMap = new Map<string, number>();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfDay);
    d.setDate(d.getDate() - i);
    const formatterDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    const dateStr = formatterDay.format(d);
    dailyRevenueMap.set(dateStr, 0);
  }

  recentPayments.forEach(payment => {
    const d = new Date(payment.paymentDate);
    const formatterDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    const dateStr = formatterDay.format(d);
    if (dailyRevenueMap.has(dateStr)) {
      dailyRevenueMap.set(dateStr, dailyRevenueMap.get(dateStr)! + payment.finalAmount);
    }
  });

  const recentExpenses = await prisma.expense.findMany({
    where: { date: { gte: thirtyDaysAgo } }
  });

  const dailyExpensesMap = new Map<string, number>();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfDay);
    d.setDate(d.getDate() - i);
    const formatterDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    const dateStr = formatterDay.format(d);
    dailyExpensesMap.set(dateStr, 0);
  }

  recentExpenses.forEach(expense => {
    const d = new Date(expense.date);
    const formatterDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    const dateStr = formatterDay.format(d);
    if (dailyExpensesMap.has(dateStr)) {
      dailyExpensesMap.set(dateStr, dailyExpensesMap.get(dateStr)! + expense.amount);
    }
  });

  const incomeVsExpensesData = Array.from(dailyRevenueMap.entries()).map(([name, income]) => ({
    name,
    income,
    expenses: dailyExpensesMap.get(name) || 0
  }));

  // Expense Categories Data (for the pie chart)
  const monthlyExpensesList = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth } }
  });

  const categoriesMap = new Map<string, number>();
  monthlyExpensesList.forEach(expense => {
    categoriesMap.set(expense.category, (categoriesMap.get(expense.category) || 0) + expense.amount);
  });

  const categoriesChartData = Array.from(categoriesMap.entries()).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

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

      <ReportsClient 
        data={{
          dailyCollection, dailyExpenseAmt, dailyProfit,
          monthlyCollection, monthlyExpenseAmt, monthlyProfit,
          yearlyCollection, yearlyExpenseAmt, yearlyProfit,
          incomeVsExpensesData, categoriesChartData
        }}
      />
    </div>
  );
}
