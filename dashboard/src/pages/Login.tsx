import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import logoImg from '../assets/logo.png';
import backgroundImg from '../assets/Background.png';
import { Lock, User, Eye, EyeOff, ShieldAlert, Sun, Moon } from 'lucide-react';

interface LoginProps {
  theme: string;
  toggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ theme, toggleTheme }) => {
  const { users, setCurrentUser, getPasswordMap } = useSimulator();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      const activePasswordMap = getPasswordMap();
      const targetPassword = activePasswordMap[trimmedUser];

      if (!targetPassword) {
        setError('User account not found. Please check the username.');
        setLoading(false);
        return;
      }

      if (password !== targetPassword) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      // Find user by custom username, or fallback to default roles
      const loggedUser = users.find(u => 
        (u.username && u.username.toLowerCase() === trimmedUser) || 
        (u.role === 'super_admin' && trimmedUser === 'superadmin') ||
        (u.role === 'admin' && trimmedUser === 'admin') ||
        (u.role === 'principal' && trimmedUser === 'principal') ||
        (u.role === 'trainer' && trimmedUser === 'trainer') ||
        (u.role === 'parent' && trimmedUser === 'parent')
      );

      if (loggedUser) {
        if (loggedUser.status === 'suspended') {
          setError('This account has been suspended/blocked. Contact the Administrator.');
          setLoading(false);
          return;
        }
        setCurrentUser(loggedUser);
      } else {
        setError('User account details not found. Contact admin.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Floating Theme Toggle (top right corner of the screen) */}
      <div style={{ 
        position: 'absolute', 
        top: '24px', 
        right: '24px', 
        zIndex: 10
      }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Left Column - Image Background (Full screen height, border-to-border on the left side) */}
      {!isMobile && (
        <div style={{
          width: '50%',
          height: '100vh',
          backgroundImage: `url(${backgroundImg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px',
          boxSizing: 'border-box'
        }}>
          {/* Overlay to blend with Light/Dark Theme aesthetics */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme === 'dark' 
              ? 'linear-gradient(to top, rgba(8,12,24,0.95) 0%, rgba(8,12,24,0.3) 100%)'
              : 'linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 100%)',
            zIndex: 1
          }} />

          {/* Left panel branding text */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              fontFamily: 'var(--font-title)'
            }}>
              Infinity Minds Portal
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              margin: 0,
              maxWidth: '460px'
            }}>
              Therapy and child development central management system. Connect and track student sessions, behavioral logs, progress schedules, and analytical charts.
            </p>
          </div>
        </div>
      )}

      {/* Right Column - Holds centered small login card */}
      <div style={{
        width: isMobile ? '100%' : '50%',
        height: '100vh',
        background: 'var(--bg-app-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Ambient glows behind the login card */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--brand-crimson-glow)',
          top: '20%',
          right: '15%',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Center Card Wrapper */}
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '50px 42px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-glass)',
          zIndex: 1,
          boxSizing: 'border-box'
        }}>
          {/* Logo container */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img 
              src={logoImg} 
              style={{ 
                width: '220px', 
                height: '100px', 
                objectFit: 'contain',
                margin: '0 auto 6px',
                display: 'block'
              }} 
              alt="Infinity Minds Logo" 
            />
            <span style={{ 
              fontSize: '10px', 
              color: 'var(--text-muted)', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              letterSpacing: '0.12em',
              display: 'block'
            }}>
              Therapy & Development Center
            </span>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'rgba(208, 32, 64, 0.08)',
              border: '1px solid rgba(208, 32, 64, 0.25)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-danger)',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Username Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: '700', 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.04em'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email or Username"
                  required
                  disabled={loading}
                  style={{ 
                    paddingLeft: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: '700', 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.04em'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={loading}
                  style={{ 
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot Password */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer' 
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>Remember Me</span>
              </label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Please contact the Therapy Center administrator to reset your password.'); }}
                style={{ 
                  color: 'var(--text-muted)', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-crimson)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Forgot Password?
              </a>
            </div>

            {/* Log In Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ 
                padding: '12px', 
                fontSize: '14px', 
                fontWeight: '700', 
                width: '100%', 
                marginTop: '10px',
                borderRadius: '24px', // Rounded Pill shape
                background: 'var(--brand-crimson)',
                border: 'none',
                boxShadow: '0 4px 12px var(--brand-crimson-glow)'
              }}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
