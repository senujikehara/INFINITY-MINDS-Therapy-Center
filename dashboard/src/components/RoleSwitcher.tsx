import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Users, Shuffle } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, users, loginAs } = useSimulator();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999
    }}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #10B981 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.5), 0 0 15px rgba(139, 92, 246, 0.3)',
          cursor: 'pointer',
          border: 'none'
        }}
      >
        {isOpen ? <Shuffle size={24} /> : <Users size={24} />}
      </button>

      {/* Switcher Card */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          bottom: '70px',
          right: 0,
          width: '320px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          background: 'rgba(22, 16, 38, 0.95)'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-title)',
            color: '#fff',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shuffle size={16} color="var(--color-primary)" />
            Role Sandbox Simulator
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select a role below to test the database filters, security blocks, and authorization workflow.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map(u => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    loginAs(u.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600' }}>{u.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.email}</span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: u.role === 'super_admin' ? 'rgba(239, 68, 68, 0.15)' : 
                               u.role === 'principal' ? 'rgba(245, 158, 11, 0.15)' : 
                               u.role === 'trainer' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: u.role === 'super_admin' ? 'var(--color-danger)' : 
                           u.role === 'principal' ? 'var(--color-warning)' : 
                           u.role === 'trainer' ? 'var(--color-info)' : 'var(--color-success)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {u.role.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
