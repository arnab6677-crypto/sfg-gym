'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  IndianRupee, 
  History, 
  AlertTriangle, 
  BarChart, 
  Clock,
  Settings, 
  Dumbbell,
  Wallet,
  ShoppingCart
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Members', path: '/members', icon: Users },
  { name: 'PT Members', path: '/pt-members', icon: Dumbbell },
  { name: 'New Admission', path: '/admission', icon: UserPlus },
  { name: 'Fee Collection', path: '/fees', icon: IndianRupee },
  { name: 'Store', path: '/store', icon: ShoppingCart },
  { name: 'Expenses', path: '/expenses', icon: Wallet },
  { name: 'Payment History', path: '/history', icon: History },
  { name: 'Due Fees', path: '/due-fees', icon: AlertTriangle },
  { name: 'Reports', path: '/reports', icon: BarChart },
  { name: 'Pay Later', path: '/pay-later', icon: Clock },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/logo.jpg" 
            alt="STRENGTH FUSION GYM Logo" 
            width={90} 
            height={90} 
            className={styles.logoImage}
            priority
          />
        </div>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path} className={styles.menuItem}>
                <Link 
                  href={item.path}
                  className={`${styles.menuLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon className={styles.icon} size={20} />
                  <span className={styles.menuText}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
