import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Users, Calendar, Clock } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { children, sessions, behaviorReports, therapyTypes, currentUser, parentLinks } = useSimulator();

  // Filter data specifically for parent and trainer roles
  const isParent = currentUser.role === 'parent';
  const isTrainer = currentUser.role === 'trainer';

  // Trainer's child IDs based on sessions assigned to them
  const myChildIds = React.useMemo(() => {
    return new Set(sessions.filter(s => s.trainer_id === currentUser.id).map(s => s.child_id));
  }, [sessions, currentUser.id]);

  // Parent's child IDs based on parent-child links
  const parentChildIds = React.useMemo(() => {
    if (!isParent) return new Set<number>();
    return new Set(parentLinks.filter(link => link.parent_user_id === currentUser.id).map(link => link.child_id));
  }, [parentLinks, currentUser.id, isParent]);

  // Statistics
  const activeChildren = children.filter(c => 
    c.status === 'active' && 
    (!isTrainer || myChildIds.has(c.id)) &&
    (!isParent || parentChildIds.has(c.id))
  );
  
  // Calculate therapy enrollment
  const getEnrollmentCount = (typeId: number) => {
    return activeChildren.filter(c => c.therapy_type_id === typeId).length;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter(s => 
    s.session_date === todayStr && 
    (!isTrainer || s.trainer_id === currentUser.id) &&
    (!isParent || parentChildIds.has(s.child_id))
  );
  const pendingReviews = behaviorReports.filter(r => 
    r.status === 'pending_review' && 
    (!isTrainer || r.trainer_id === currentUser.id) &&
    (!isParent || parentChildIds.has(r.child_id))
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel dashboard-welcome" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Welcome Back, {currentUser.name}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px' }}>
            Infinity Minds Therapy Center operations are running smoothly. Switch roles using the floating selector in the bottom right corner to simulate and audit access logs.
          </p>
        </div>
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          fontSize: '120px',
          fontWeight: 900,
          color: 'rgba(139, 92, 246, 0.05)',
          userSelect: 'none'
        }}>
          IMA
        </div>
      </div>

      <div className="stat-grid">
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Children</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{activeChildren.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-success)'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sessions Today</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{sessionsToday.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-warning)'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pending Reviews</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{pendingReviews.length}</div>
          </div>
        </div>
      </div>

      {/* Therapy Types Enrollment Section */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
          Therapy Programs Enrollment
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {therapyTypes.map(type => {
            const count = getEnrollmentCount(type.id);
            const percent = activeChildren.length > 0 ? (count / activeChildren.length) * 100 : 0;
            return (
              <div key={type.id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>{type.name}</h4>
                  <span className="badge" style={{
                    background: `${type.color_tag}20`,
                    color: type.color_tag,
                    border: `1px solid ${type.color_tag}40`
                  }}>
                    {count} Enrolled
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', height: '36px', overflow: 'hidden' }}>
                  {type.description}
                </p>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    background: type.color_tag,
                    width: `${percent}%`,
                    height: '100%',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>



    </div>
  );
};
