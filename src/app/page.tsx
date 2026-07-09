import { Card } from "@/components/ui/Card";
import styles from "./Dashboard.module.css";
import { Users, TrendingUp, AlertCircle, CreditCard, Activity, CalendarClock, UserPlus } from 'lucide-react';
import prisma from "@/lib/prisma";
import { RevenueChart } from "./DashboardCharts";

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

  const stats = [
    { label: "Total Members", value: totalMembers.toString(), icon: Users, color: "#3B82F6" },
    { label: "Active Members", value: activeMembers.toString(), icon: Activity, color: "#10B981" },
    { label: "Fees Due", value: `₹${feesDue.toLocaleString()}`, icon: AlertCircle, color: "#EF4444" },
    { label: "Today's Collection", value: `₹${todayCollection.toLocaleString()}`, icon: CreditCard, color: "#F59E0B" },
    { label: "Monthly Revenue", value: `₹${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "#8B5CF6" },
    { label: "New Admissions (Month)", value: newAdmissions.toString(), icon: UserPlus, color: "#6366F1" },
    { label: "Expiring Soon (7 Days)", value: expiringSoonCount.toString(), icon: CalendarClock, color: "#F97316" },
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

  const chartData = Array.from(dailyRevenueMap.entries()).map(([name, revenue]) => ({
    name,
    revenue
  }));

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
          <h3 className={styles.sectionTitle}>Revenue Overview (Last 30 Days)</h3>
          <RevenueChart data={chartData} />
        </Card>
      </div>
    </div>
  );
}
