'use client';

import React, { useState } from 'react';
import { login, sendOtp, verifyOtp, resetPassword } from './actions';
import styles from './Login.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 'login' | 'forgot' | 'verify' | 'reset'
  const [view, setView] = useState('login');
  
  // Forgot Password States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('password', password);

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
    if (result.success) {
      window.location.href = '/';
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    const result = await sendOtp();
    setLoading(false);

    if (result.success) {
      setSuccessMsg('OTP sent to sfg.silchar@gmail.com');
      setView('verify');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await verifyOtp(otp);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('OTP Verified! Enter your new password.');
      setView('reset');
    } else {
      setError(result.error || 'Invalid or expired OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError('');
    const result = await resetPassword(newPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Password changed successfully! You can now login.');
      setView('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Failed to reset password');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src="/logo.jpg" alt="STRENGTH FUSION GYM" className={styles.logo} />
        </div>
        
        {view === 'login' && (
          <>
            <h1 className={styles.title}>Admin Access</h1>
            <p className={styles.subtitle}>Enter your password to access the dashboard</p>
            
            {error && <div className={styles.error}>{error}</div>}
            {successMsg && <div style={{ color: '#10B981', backgroundColor: '#ECFDF5', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{successMsg}</div>}
            
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                  autoFocus
                />
              </div>
              
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '14px' }}>
                Forgot Password?
              </button>
            </div>
          </>
        )}

        {view === 'forgot' && (
          <>
            <h1 className={styles.title}>Forgot Password</h1>
            <p className={styles.subtitle}>We will send a 6-digit OTP to <b>sfg.silchar@gmail.com</b></p>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.form}>
              <button onClick={handleSendOtp} disabled={loading} className={styles.button}>
                {loading ? 'Sending Email...' : 'Send OTP via Email'}
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
                Back to Login
              </button>
            </div>
          </>
        )}

        {view === 'verify' && (
          <>
            <h1 className={styles.title}>Verify OTP</h1>
            <p className={styles.subtitle}>Check your email for the 6-digit code</p>
            
            {error && <div className={styles.error}>{error}</div>}
            {successMsg && <div style={{ color: '#10B981', backgroundColor: '#ECFDF5', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{successMsg}</div>}
            
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={styles.input}
                  style={{ letterSpacing: '4px', textAlign: 'center' }}
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </>
        )}

        {view === 'reset' && (
          <>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Create a new admin password</p>
            
            {error && <div className={styles.error}>{error}</div>}
            {successMsg && <div style={{ color: '#10B981', backgroundColor: '#ECFDF5', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{successMsg}</div>}
            
            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputGroup} style={{ marginBottom: '12px' }}>
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.inputGroup}>
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Saving...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
