'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Lock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { RevenueChart, IncomeVsExpensesChart, ExpenseCategoriesChart } from '../DashboardCharts';
import { getCustomReportData } from './actions';

interface ReportsData {
  dailyCollection: number;
  dailyExpenseAmt: number;
  dailyProfit: number;
  monthlyCollection: number;
  monthlyExpenseAmt: number;
  monthlyProfit: number;
  yearlyCollection: number;
  yearlyExpenseAmt: number;
  yearlyProfit: number;
  incomeVsExpensesData: any[];
  categoriesChartData: any[];
}

export default function ReportsClient({ data }: { data: ReportsData }) {

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both a start date and an end date.");
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be after the end date.");
      return;
    }

    setIsGenerating(true);

    try {
      const data = await getCustomReportData(startDate.toISOString(), endDate.toISOString());
      
      if (!data.success) {
        alert("Failed to generate report: " + data.error);
        setIsGenerating(false);
        return;
      }

      // Generate CSV
      let csv = "Date,Type,Description,Category,Payment Method,Income Amount (Rs),Expense Amount (Rs)\n";
      let totalIncome = 0;
      let totalExpense = 0;

      // Add Payments
      if (data.payments) {
        for (const p of data.payments) {
          const dateStr = new Date(p.paymentDate).toLocaleDateString();
          csv += `"${dateStr}","Income","Member Fee - ${p.member?.fullName || 'Unknown'} (Receipt: ${p.receiptNumber})","Membership","${p.paymentMethod}",${p.finalAmount},0\n`;
          totalIncome += p.finalAmount;
        }
      }

      // Add Store Sales
      if (data.storeSales) {
        for (const s of data.storeSales) {
          const dateStr = new Date(s.date).toLocaleDateString();
          csv += `"${dateStr}","Income","Store Sale - ${s.productName} (Qty: ${s.quantity})","${s.category}","-",${s.totalAmount},0\n`;
          totalIncome += s.totalAmount;
        }
      }

      // Add Expenses
      if (data.expenses) {
        for (const e of data.expenses) {
          const dateStr = new Date(e.date).toLocaleDateString();
          csv += `"${dateStr}","Expense","${e.title}${e.paidTo ? ' - Paid to: ' + e.paidTo : ''}","${e.category}","${e.paymentMethod}",0,${e.amount}\n`;
          totalExpense += e.amount;
        }
      }

      // Add Totals
      csv += `\n"TOTALS","","","","",${totalIncome},${totalExpense}\n`;
      csv += `"NET PROFIT","","","","",${totalIncome - totalExpense},""\n`;

      // Trigger Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SFG_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      alert("Error generating report: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* TODAY'S BREAKDOWN */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Today's Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10B981" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Income</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{data.dailyCollection.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} color="#EF4444" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expenses</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{data.dailyExpenseAmt.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Profit</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: data.dailyProfit >= 0 ? '#10B981' : '#EF4444', marginTop: '8px' }}>
              ₹{data.dailyProfit.toLocaleString()}
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
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{data.monthlyCollection.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} color="#EF4444" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expenses</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{data.monthlyExpenseAmt.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Profit</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: data.monthlyProfit >= 0 ? '#10B981' : '#EF4444', marginTop: '8px' }}>
              ₹{data.monthlyProfit.toLocaleString()}
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
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{data.yearlyCollection.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} color="#EF4444" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expenses</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>₹{data.yearlyExpenseAmt.toLocaleString()}</h3>
          </Card>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Profit</p>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: data.yearlyProfit >= 0 ? '#10B981' : '#EF4444', marginTop: '8px' }}>
              ₹{data.yearlyProfit.toLocaleString()}
            </h3>
          </Card>
        </div>
      </div>

      {/* CHARTS */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Financial Charts</h2>
        <Card padding="lg" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Income vs Expenses (Last 30 Days)</h3>
          <IncomeVsExpensesChart data={data.incomeVsExpensesData} />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <Card padding="lg">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Revenue Trend (Last 30 Days)</h3>
            <RevenueChart data={data.incomeVsExpensesData.map((d: any) => ({ name: d.name, revenue: d.income }))} />
          </Card>
          
          <Card padding="lg">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Expense Categories (This Month)</h3>
            <ExpenseCategoriesChart data={data.categoriesChartData} />
          </Card>
        </div>
      </div>

      <Card padding="lg">
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Generate Custom Report</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Select a date range to generate a detailed CSV or PDF report of all transactions.</p>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Start Date</label>
            <CustomDatePicker selected={startDate} onChange={setStartDate} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>End Date</label>
            <CustomDatePicker selected={endDate} onChange={setEndDate} />
          </div>
          <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Report (CSV)'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
