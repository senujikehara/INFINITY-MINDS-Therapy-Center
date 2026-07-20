import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import logoImg from '../assets/logo.png';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CalendarDays, 
  CheckSquare,
  LogOut,
  UserCheck,
  ClipboardCheck,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string;
  isOpen?: boolean;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, isMobile, isCollapsed }) => {
  const { currentUser, logout } = useSimulator();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'principal', 'trainer', 'parent'] },
    { id: 'student_status', label: 'Student Status', icon: Activity, roles: ['parent'] },
    { id: 'children', label: 'Student', icon: Users, roles: ['super_admin', 'admin', 'principal', 'trainer', 'parent'] },
    { id: 'scheduler', label: 'Session Timetable', icon: Calendar, roles: ['super_admin', 'admin', 'principal', 'trainer', 'parent'] },
    { id: 'attendance', label: 'Student Attendance', icon: ClipboardCheck, roles: ['super_admin', 'admin', 'principal', 'trainer'] },
    { id: 'reports_form', label: 'Reports', icon: FileText, roles: ['super_admin', 'admin', 'principal', 'trainer'] },
    { id: 'academic_calendar', label: 'Academic Calendar', icon: CalendarDays, roles: ['super_admin', 'admin', 'principal', 'trainer', 'parent'] },
    { id: 'todos', label: 'My To-Dos', icon: CheckSquare, roles: ['super_admin', 'admin', 'principal', 'trainer'] },
    { id: 'user_management', label: 'User Management', icon: UserCheck, roles: ['super_admin', 'admin'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: isMobile ? (isOpen ? 0 : '-260px') : (isCollapsed ? '-260px' : 0),
      background: 'var(--bg-surface-solid)',
      borderRight: '1px solid var(--border-glass)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      transition: 'all var(--transition-normal)',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', paddingLeft: '4px', flexShrink: 0 }}>
        <div style={{ width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <img src={logoImg} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.50)' }} alt="Infinity Minds Logo" />
        </div>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>INFINITY MINDS</h2>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Therapy Center</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, flexShrink: 0 }}>
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--brand-crimson) 0%, var(--brand-crimson-deep) 100%)'
                  : 'transparent',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? '0 4px 14px var(--brand-crimson-glow)' : 'none',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ opacity: isActive ? 1 : 0.8 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--brand-navy-subtle)',
        border: '1px solid var(--border-accent)',
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--color-accent)',
        textAlign: 'center',
        letterSpacing: '0.03em',
        marginTop: '16px',
        flexShrink: 0
      }}>
        Petaling Jaya
      </div>

      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px',
          width: '100%',
          marginTop: '12px',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-danger)',
          background: 'rgba(208, 32, 64, 0.08)',
          border: '1.5px solid rgba(208, 32, 64, 0.25)',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'all var(--transition-fast)',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(208, 32, 64, 0.15)';
          e.currentTarget.style.borderColor = 'var(--color-danger)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(208, 32, 64, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(208, 32, 64, 0.25)';
        }}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </aside>
  );
};
