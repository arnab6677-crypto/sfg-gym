import { Bell, User } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProfileDropdown from './ProfileDropdown';
import styles from './TopBar.module.css';

export default async function TopBar() {
  const overdueCount = await prisma.member.count({
    where: {
      nextDueDate: { lt: new Date() },
      status: { not: 'INACTIVE' }
    }
  });

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        {/* Assume the user places logo.png in the public folder */}
        {/* <Image src="/logo.png" alt="SFG Logo" width={32} height={32} className={styles.logo} /> */}
        <h1 className={styles.gymName}>STRENGTH FUSION GYM</h1>
      </div>

      <div className={styles.actions}>

        <Link href="/due-fees" className={styles.notificationBtn} title="View Overdue Fees">
          <Bell size={20} />
          {overdueCount > 0 && <span className={styles.badge}>{overdueCount}</span>}
        </Link>

        <ProfileDropdown />
      </div>
    </header>
  );
}
