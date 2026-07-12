import { Card } from "@/components/ui/Card";
import styles from "./Dashboard.module.css";
import { Users, TrendingUp, AlertCircle, CreditCard, Activity, CalendarClock, UserPlus, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import prisma from "@/lib/prisma";
import { RevenueChart, IncomeVsExpensesChart, ExpenseCategoriesChart } from "./DashboardCharts";

export default async function Dashboard() {
  const totalMembers = await prisma.member.count();
  const activeMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // New Admissions this month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const newAdmissions = await prisma.member.count({
    where: { joiningDate: { gte: firstDayOfMonth } }
  });

  // Today's Collection
  const todaysPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: today } }
  });
  const todayCollection = todaysPayments._sum.finalAmount || 0;

  // Monthly Revenue
  const monthlyPayments = await prisma.payment.aggregate({
    _sum: { finalAmount: true },
    where: { paymentDate: { gte: firstDayOfMonth } }
  });
  const monthlyRevenue = monthlyPayments._sum.finalAmount || 0;

  // Expiring Soon (Next 7 days)
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  
  const expiringSoonCount = await prisma.payment.count({
    where: {
      nextDueDate: {
        gte: today,
        lte: next7Days
      }
    }
  });

  // Calculate Due Fees Total
  const pastPayments = await prisma.payment.findMany({
    where: { nextDueDate: { lt: today } },
    include: { plan: true }
  });
  
  // A simplistic calculation for prototype: if past due, assume they owe the plan amount
  const feesDue = pastPayments.reduce((acc, p) => acc + p.plan.price, 0);

  // Today's Expenses
  const todaysExpensesQuery = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: today } }
  });
  const todayExpenses = todaysExpensesQuery._sum.amount || 0;
  const todayProfit = todayCollection - todayExpenses;

  // Monthly Expenses
  const monthlyExpensesQuery = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: firstDayOfMonth } }
  });
  const monthlyExpenses = monthlyExpensesQuery._sum.amount || 0;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  const stats = [
    { label: "Total Members", value: totalMembers.toString(), icon: Users, color: "#3B82F6" },
    { label: "Active Members", value: activeMembers.toString(), icon: Activity, color: "#10B981" },
    { label: "Fees Due", value: `₹${feesDue.toLocaleString()}`, icon: AlertCircle, color: "#EF4444" },
    
    // Financials
    { label: "Today's Income", value: `₹${todayCollection.toLocaleString()}`, icon: CreditCard, color: "#3B82F6" },
    { label: "Today's Expenses", value: `₹${todayExpenses.toLocaleString()}`, icon: TrendingDown, color: "#EF4444" },
    { label: "Today's Profit", value: `₹${todayProfit.toLocaleString()}`, icon: DollarSign, color: todayProfit >= 0 ? "#10B981" : "#EF4444" },
    
    { label: "Monthly Income", value: `₹${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "#3B82F6" },
    { label: "Monthly Expenses", value: `₹${monthlyExpenses.toLocaleString()}`, icon: Wallet, color: "#EF4444" },
    { label: "Monthly Profit", value: `₹${monthlyProfit.toLocaleString()}`, icon: DollarSign, color: monthlyProfit >= 0 ? "#10B981" : "#EF4444" },
    
    // Quick Insights
    { label: "New Admissions", value: newAdmissions.toString(), icon: UserPlus, color: "#8B5CF6" },
    { label: "Expiring Soon", value: expiringSoonCount.toString(), icon: CalendarClock, color: "#F97316" },
  ];

  // Last 30 Days Revenue Chart Data
  const thirtyDaysAgo = new Date(today);
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
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    dailyRevenueMap.set(dateStr, 0);
  }

  recentPayments.forEach(payment => {
    const d = new Date(payment.paymentDate);
    const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    if (dailyRevenueMap.has(dateStr)) {
      dailyRevenueMap.set(dateStr, dailyRevenueMap.get(dateStr)! + payment.finalAmount);
    }
  });

  const recentExpenses = await prisma.expense.findMany({
    where: { date: { gte: thirtyDaysAgo } }
  });

  const dailyExpensesMap = new Map<string, number>();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    dailyExpensesMap.set(dateStr, 0);
  }

  recentExpenses.forEach(expense => {
    const d = new Date(expense.date);
    const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
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
    where: { date: { gte: firstDayOfMonth } }
  });

  const categoriesMap = new Map<string, number>();
  monthlyExpensesList.forEach(expense => {
    categoriesMap.set(expense.category, (categoriesMap.get(expense.category) || 0) + expense.amount);
  });

  const categoriesChartData = Array.from(categoriesMap.entries()).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value); // sort descending by amount

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back! Here's what's happening at STRENGTH FUSION GYM today.</p>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>{stat.label}</p>
                <h3 className={styles.statValue}>{stat.value}</h3>
              </div>
            </Card>
          );
        })}
      </div>

      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard} padding="lg">
          <h3 className={styles.sectionTitle}>Income vs Expenses (Last 30 Days)</h3>
          <IncomeVsExpensesChart data={incomeVsExpensesData} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <Card className={styles.chartCard} padding="lg">
          <h3 className={styles.sectionTitle}>Revenue Trend (Last 30 Days)</h3>
          <RevenueChart data={incomeVsExpensesData.map(d => ({ name: d.name, revenue: d.income }))} />
        </Card>
        
        <Card className={styles.chartCard} padding="lg">
          <h3 className={styles.sectionTitle}>Expense Categories (This Month)</h3>
          <ExpenseCategoriesChart data={categoriesChartData} />
        </Card>
      </div>
    </div>
  );
}
