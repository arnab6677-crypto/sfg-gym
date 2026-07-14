'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Lock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { RevenueChart, IncomeVsExpensesChart, ExpenseCategoriesChart } from '../DashboardCharts';

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', maxWidth: '320px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <Lock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)' }}>Reports Access</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Please enter the PIN to view financial reports.</p>
            </div>
            
            <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <input 
                type="password"
                placeholder="Enter PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', outline: 'none', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                autoFocus
              />
              {error && <p style={{ color: '#EF4444', fontSize: '13px' }}>{error}</p>}
              <Button type="submit" variant="primary" style={{ width: '100%' }}>Unlock Reports</Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  const handleGenerate = () => {
    // Generate report logic
    alert('Report generation will be implemented soon!');
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
          <Button variant="primary" onClick={handleGenerate}>Generate</Button>
        </div>
      </Card>
    </div>
  );
}
