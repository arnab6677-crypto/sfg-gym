'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, KeyRound, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';
import styles from './ProfileDropdown.module.css';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.profile} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.avatar}>
          <User size={20} />
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.adminName}>Admin</span>
          <span className={styles.role}>Owner</span>
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownName}>Admin</span>
            <span className={styles.dropdownEmail}>owner@sfg.com</span>
          </div>
          
          <div className={styles.dropdownBody}>
            <Link href="/settings" className={styles.menuItem} onClick={() => setIsOpen(false)}>
              <Settings size={16} />
              <span>Gym Settings</span>
            </Link>
            <Link href="/settings/password" className={styles.menuItem} onClick={() => setIsOpen(false)}>
              <KeyRound size={16} />
              <span>Change Password</span>
            </Link>
          </div>
          
          <div className={styles.dropdownFooter}>
            <button className={styles.logoutButton} onClick={() => logout()}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
