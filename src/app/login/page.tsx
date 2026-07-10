'use client';

import React, { useState } from 'react';
import { login } from './actions';
import styles from './Login.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    // If successful, the server action will set the cookie and the client will need to refresh or redirect
    // Since server action uses cookies().set, we can manually redirect here
    if (result.success) {
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src="/logo.jpg" alt="STRENGTH FUSION GYM" className={styles.logo} />
        </div>
        
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>Enter your password to access the dashboard</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
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
      </div>
    </div>
  );
}
