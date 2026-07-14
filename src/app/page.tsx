import { Card } from "@/components/ui/Card";
import styles from "./Dashboard.module.css";
import { Users, AlertCircle, Activity, CalendarClock, UserPlus } from 'lucide-react';
import prisma from "@/lib/prisma";

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
  
  const feesDue = pastPayments.reduce((acc, p) => acc + (p.plan?.price || 0), 0);

  const stats = [
    { label: "Total Members", value: totalMembers.toString(), icon: Users, color: "#3B82F6" },
    { label: "Active Members", value: activeMembers.toString(), icon: Activity, color: "#10B981" },
    { label: "Fees Due", value: `₹${feesDue.toLocaleString()}`, icon: AlertCircle, color: "#EF4444" },
    
    // Quick Insights
    { label: "New Admissions", value: newAdmissions.toString(), icon: UserPlus, color: "#8B5CF6" },
    { label: "Expiring Soon", value: expiringSoonCount.toString(), icon: CalendarClock, color: "#F97316" },
  ];

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
    </div>
  );
}
