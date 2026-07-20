import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Bell, Check, Sun, Moon, Menu, PanelLeftClose, PanelLeftOpen, User, Mail } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  theme: string;
  toggleTheme: () => void;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, theme, toggleTheme, isMobile, onToggleSidebar, sidebarCollapsed, onToggleCollapse }) => {
  const { 
    currentUser, 
    notifications, 
    markNotificationRead, 
    updateUserDetails, 
    changePassword,
    directMessages,
    messageGroups,
    setShowMessagesModal
  } = useSimulator();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editPhone, setEditPhone] = useState(currentUser.phone);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleOpenEdit = () => {
    setEditName(currentUser.name);
    setEditEmail(currentUser.email);
    setEditPhone(currentUser.phone);
    setShowPasswordChange(false);
    setNewPassword('');
    setConfirmPassword('');
    setPwdError('');
    setPwdSuccess(false);
    setShowEditProfile(true);
  };

  const unreadMessagesCount = directMessages.filter(m => {
    if (m.recipient_id === currentUser.id) {
      return !m.is_read_by_ids.includes(currentUser.id);
    }
    if (m.group_id) {
      const group = messageGroups.find(g => g.id === m.group_id);
      if (group && group.participant_ids.includes(currentUser.id)) {
        return !m.is_read_by_ids.includes(currentUser.id);
      }
    }
    return false;
  }).length;

  // Filter notifications for active user
  const myNotifications = notifications.filter(n => n.user_id === currentUser.id);
  const unreadCount = myNotifications.filter(n => !n.is_read).length;

  const tabTitles: { [key: string]: string } = {
    dashboard: 'Dashboard Overview',
    student_status: 'Student Status Reports',
    children: 'Student Management',
    scheduler: 'Therapy Timetable Schedule',
    reports_form: 'Create Progress & Behavior Reports',
    behavior_review: 'Principal Review Portal',
    academic_calendar: 'Academic Calendar Notice Board',
    todos: 'My Personal To-Do Tasks',
    user_management: 'User & Access Management',
    attendance: 'Therapy Attendance Logs',
    audit_logs: 'Security Audit logs (Auditing Database Access)'
  };

  return (
    <header style={{
      height: '70px',
      position: 'fixed',
      top: 0,
      left: isMobile ? 0 : (sidebarCollapsed ? 0 : '260px'),
      right: 0,
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(16px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 32px',
      zIndex: 99,
      transition: 'all var(--transition-slow)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isMobile && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              marginRight: '8px'
            }}
          >
            <Menu size={20} />
          </button>
        )}
        
        {!isMobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-fast)',
              marginRight: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-hover)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}

        <h1 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {tabTitles[activeTab] || 'Infinity Minds'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark'
            ? <Sun size={18} />
            : <Moon size={18} />
          }
        </button>

        {/* Messages Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowMessagesModal(true); setShowNotifications(false); }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Messages"
          >
            <Mail size={18} />
            {unreadMessagesCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--color-danger)',
                color: '#fff',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              width: '320px',
              maxHeight: '360px',
              overflowY: 'auto',
              zIndex: 1000,
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>In-App Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMTP Alerts active</span>
              </div>

              {myNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '13px' }}>
                  No notifications yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myNotifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        background: n.is_read ? 'transparent' : 'rgba(139,92,246,0.08)',
                        borderLeft: `3px solid ${n.is_read ? 'var(--border-glass)' : 'var(--color-primary)'}`,
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</span>
                        {!n.is_read && (
                          <button 
                            onClick={() => markNotificationRead(n.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-success)', cursor: 'pointer' }}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Card - Clickable profile details edit trigger */}
        <div 
          onClick={handleOpenEdit}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background var(--transition-fast)'
          }}
          className="header-profile-card"
          title="Click to edit your profile details"
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '14px',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <User size={18} />
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser.name}</span>
              <span style={{
                fontSize: '10px',
                color: currentUser.role === 'super_admin' ? 'var(--color-danger)' : 
                       currentUser.role === 'principal' ? 'var(--color-warning)' : 
                       currentUser.role === 'trainer' ? 'var(--color-info)' : 'var(--color-success)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Edit My Profile Dropdown Panel */}
      {showEditProfile && (
        <>
          {/* Backdrop transparent helper click-away overlay */}
          <div 
            onClick={() => setShowEditProfile(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'transparent',
              zIndex: 999
            }}
          />

          <div 
            className="glass-panel animate-scale-up modal-card" 
            style={{
              position: 'absolute',
              top: '75px',
              right: '30px',
              width: '360px',
              background: 'var(--bg-surface-solid)',
              padding: '24px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-accent)',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'left',
              zIndex: 1000,
              boxSizing: 'border-box'
            }}
          >
            {/* Arrow pointing up */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '35px',
              width: '14px',
              height: '14px',
              background: 'var(--bg-surface-solid)',
              transform: 'rotate(45deg)',
              borderLeft: '1.5px solid var(--border-accent)',
              borderTop: '1.5px solid var(--border-accent)',
              zIndex: -1
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Edit My Profile
              </h3>
              <button 
                onClick={() => setShowEditProfile(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (showPasswordChange) {
                setPwdError('');
                setPwdSuccess(false);
                if (newPassword.length < 4) {
                  setPwdError('Password must be at least 4 characters.');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setPwdError('Passwords do not match.');
                  return;
                }
                const uname = currentUser.role === 'super_admin' ? 'superadmin' : currentUser.role;
                changePassword(uname, newPassword);
                setPwdSuccess(true);
                setNewPassword('');
                setConfirmPassword('');
              }
              
              updateUserDetails(currentUser.id, { name: editName, email: editEmail, phone: editPhone });
              
              // Only close the panel if there's no active password error or if password change wasn't attempted
              if (!showPasswordChange) {
                setShowEditProfile(false);
              } else {
                // If password change is successful, close after short delay so they see the success message
                setTimeout(() => {
                  setShowEditProfile(false);
                }, 1000);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Phone Number</label>
                <input 
                  type="text" 
                  required 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                />
              </div>

              {/* Password change divider / toggle */}
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {showPasswordChange ? '✖ Cancel Password Reset' : '🔑 Reset My Password'}
                </button>
              </div>

              {showPasswordChange && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  {pwdError && (
                    <div style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: '600' }}>⚠️ {pwdError}</div>
                  )}
                  {pwdSuccess && (
                    <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: '600' }}>✅ Password updated successfully!</div>
                  )}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditProfile(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}
  </header>
  );
};
