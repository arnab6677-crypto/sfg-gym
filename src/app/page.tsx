import { Card } from "@/components/ui/Card";
import styles from "./Dashboard.module.css";
import { Users, AlertCircle, Activity, CalendarClock, UserPlus } from 'lucide-react';
import { DailyPassWidget } from "@/components/DailyPassWidget";
import { ExpiredPassesAlert } from "@/components/ExpiredPassesAlert";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const totalMembers = await prisma.member.count();
  const activeMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
  // Get current date/time in IST (Asia/Kolkata)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const [month, day, year] = formatter.format(now).split('/');
  
  // Start of today in IST
  const todayStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+05:30`;
  const today = new Date(todayStr);

  // New Admissions this month
  const firstDayOfMonthStr = `${year}-${month.padStart(2, '0')}-01T00:00:00+05:30`;
  const firstDayOfMonth = new Date(firstDayOfMonthStr);
  const newAdmissions = await prisma.member.count({
    where: { joiningDate: { gte: firstDayOfMonth } }
  });

  // Admissions Today
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  const admissionsToday = await prisma.member.count({
    where: {
      joiningDate: {
        gte: today,
        lt: nextDay
      }
    }
  });

  // Expiring Soon (Next 7 days)
  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);
  
  const expiringSoonCount = await prisma.payment.count({
    where: {
      nextDueDate: {
        gte: today,
        lte: next7Days
      }
    }
  });

  // Calculate Due Fees Total (Sum of monthly fees for active overdue members)
  const overdueMembers = await prisma.member.findMany({
    where: { 
      status: 'ACTIVE',
      membershipType: { notIn: ['Daily Pass', '7 Days Pass', 'Weekly Pass'] },
      OR: [
        { nextDueDate: { lt: today } },
        { nextDueDate: null }
      ]
    }
  });
  
  const feesDue = overdueMembers.reduce((acc, m) => acc + (m.monthlyFeeAmount || 0), 0);

  // Fetch or create Daily Pass plan
  let dailyPassPlan = await prisma.membershipPlan.findFirst({
    where: {
      OR: [
        { name: { contains: 'Daily' } },
        { name: { contains: 'One Day' } }
      ]
    }
  });
  if (!dailyPassPlan) {
    dailyPassPlan = await prisma.membershipPlan.create({
      data: { name: 'Daily Pass', durationDays: 1, price: 150 }
    });
  }

  // Fetch or create 7 Days Pass plan
  let weeklyPassPlan = await prisma.membershipPlan.findFirst({
    where: {
      OR: [
        { name: { contains: '7 Day' } },
        { name: { contains: 'Weekly' } }
      ]
    }
  });
  if (!weeklyPassPlan) {
    weeklyPassPlan = await prisma.membershipPlan.create({
      data: { name: '7 Days Pass', durationDays: 7, price: 800 }
    });
  }

  // Expired Short-Term Passes
  const expiredShortTermPasses = await prisma.member.findMany({
    where: {
      status: 'ACTIVE',
      membershipType: { in: ['Daily Pass', '7 Days Pass', 'Weekly Pass'] },
      nextDueDate: { lt: today }
    },
    orderBy: { nextDueDate: 'desc' },
    select: {
      id: true,
      fullName: true,
      phone: true,
      membershipType: true,
      nextDueDate: true
    }
  });

  const stats = [
    { label: "Total Members", value: totalMembers.toString(), icon: Users, color: "#3B82F6" },
    { label: "Active Members", value: activeMembers.toString(), icon: Activity, color: "#10B981" },
    { label: "Fees Due", value: `₹${feesDue.toLocaleString()}`, icon: AlertCircle, color: "#EF4444" },
    
    // Quick Insights
    { label: "Admissions (Today)", value: admissionsToday.toString(), icon: UserPlus, color: "#8B5CF6" },
    { label: "Admissions (This Month)", value: newAdmissions.toString(), icon: UserPlus, color: "#8B5CF6" },
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

      <ExpiredPassesAlert passes={expiredShortTermPasses} />

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>Quick Short-Term Pass</h2>
        <Card padding="lg" style={{ maxWidth: '600px' }}>
          {/* @ts-ignore */}
          <DailyPassWidget dailyPassPlan={dailyPassPlan} weeklyPassPlan={weeklyPassPlan} />
        </Card>
      </div>
    </div>
  );
}
