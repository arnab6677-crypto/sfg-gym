'use client';

import React, { useState, useEffect } from 'react';
import { login, getSecurityQuestions, verifySecurityAnswers, resetPasswordWithSecurity } from './actions';
import styles from './Login.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 'login' | 'forgot' | 'reset'
  const [view, setView] = useState('login');
  
  // Security Question States
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  
  // Reset States
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

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    const result = await getSecurityQuestions();
    setLoading(false);

    if (result.success) {
      setQuestion1(result.question1 || 'What city were you born in?');
      setQuestion2(result.question2 || "What is your mother's maiden name?");
      setView('forgot');
    } else {
      setError(result.error || 'Failed to fetch security questions');
    }
  };

  const handleVerifyAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await verifySecurityAnswers(answer1, answer2);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Security answers verified! Enter your new password.');
      setView('reset');
    } else {
      setError(result.error || 'Incorrect answers to security questions');
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
    const result = await resetPasswordWithSecurity(newPassword, answer1, answer2);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Password changed successfully! You can now login.');
      setView('login');
      setPassword('');
      setAnswer1('');
      setAnswer2('');
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
              <button onClick={handleForgotPassword} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '14px' }}>
                {loading ? 'Loading...' : 'Forgot Password?'}
              </button>
            </div>
          </>
        )}

        {view === 'forgot' && (
          <>
            <h1 className={styles.title}>Security Verification</h1>
            <p className={styles.subtitle}>Answer your security questions to reset your password</p>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleVerifyAnswers} className={styles.form}>
              <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>{question1}</p>
                <input 
                  type="text" 
                  placeholder="Your answer" 
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  className={styles.input}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>{question2}</p>
                <input 
                  type="text" 
                  placeholder="Your answer" 
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Verifying...' : 'Verify Answers'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
                Back to Login
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
