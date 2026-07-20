import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { FileCheck, Check, Ban, Eye, EyeOff } from 'lucide-react';

export const BehaviorReview: React.FC = () => {
  const { currentUser, behaviorReports, children, users, reviewBehaviorReport } = useSimulator();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  // Review inputs
  const [comment, setComment] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('public');

  const pendingReports = behaviorReports.filter(r => r.status === 'pending_review');

  const getChildName = (id: number) => children.find(c => c.id === id)?.full_name || 'Unknown';
  const getTrainerName = (id: number) => users.find(u => u.id === id)?.name || 'Unknown';

  const selectedReport = behaviorReports.find(r => r.id === selectedReportId);

  const handleReview = (status: 'authorized' | 'rejected') => {
    if (selectedReportId) {
      reviewBehaviorReport(selectedReportId, status, comment, visibility);
      setSelectedReportId(null);
      setComment('');
      setVisibility('public');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Pending Reviews List View */}
      {selectedReportId === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Pending Behavior Report Authorizations</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingReports.map(r => (
              <div 
                key={r.id} 
                className="glass-panel" 
                style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div>
                  <span className="badge badge-warning" style={{ fontSize: '9px', marginBottom: '6px' }}>Pending Principal Sign-off</span>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '4px' }}>Child: {getChildName(r.child_id)}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Submitted by Trainer {getTrainerName(r.trainer_id)} on {r.report_date}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setComment(r.principal_comment || '');
                    setVisibility(r.visibility || 'public');
                  }}
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  Review Report
                </button>
              </div>
            ))}

            {pendingReports.length === 0 && (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No behavior reports currently awaiting principal authorization review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Review View */}
      {selectedReportId !== null && selectedReport && (
        <div style={{ width: '100%' }}>
          <button
            type="button"
            onClick={() => setSelectedReportId(null)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', width: 'fit-content', marginBottom: '16px' }}
          >
            ← Back to Pending List
          </button>
          
          <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <FileCheck size={18} color="var(--color-primary)" />
                Reviewing Behavior Report
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Child: {getChildName(selectedReport.child_id)} | Trainer: {getTrainerName(selectedReport.trainer_id)}
              </p>
            </div>

            {/* Observations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>1) Nature of Incident</span>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.4' }}>
                  {selectedReport.nature_of_incident}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>2) Triggers / Causes of Incident</span>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.4' }}>
                  {selectedReport.triggers_causes}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>3) Actions Taken</span>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.4' }}>
                  {selectedReport.actions_taken}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>4) Observations after Follow-up</span>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.4' }}>
                  {selectedReport.follow_up_observations}
                </div>
              </div>
            </div>

            {/* Principal Signature inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Authorization Actions</h4>
              
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Mandatory Principal Comment
                </label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Insert feedback or professional recommendations for the parent..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Parent Visibility Status</label>
                {currentUser.role === 'super_admin' ? (
                  <div style={{ display: 'flex' }}>
                    {visibility === 'public' ? (
                      <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--color-success)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <Eye size={12} /> Public (Parents View)
                      </div>
                    ) : (
                      <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-primary)', background: 'rgba(139, 92, 246, 0.05)', color: 'var(--color-primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <EyeOff size={12} /> Private (Staff Only)
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setVisibility('public')}
                      className="btn btn-secondary" 
                      style={{ 
                        flex: 1, 
                        fontSize: '12px', 
                        display: 'flex', 
                        gap: '4px',
                        border: visibility === 'public' ? '1.5px solid var(--color-success)' : '1.5px solid var(--border-glass)',
                        background: visibility === 'public' ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                        color: visibility === 'public' ? 'var(--color-success)' : 'var(--text-secondary)'
                      }}
                    >
                      <Eye size={12} /> Public (Parents View)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVisibility('private')}
                      className="btn btn-secondary" 
                      style={{ 
                        flex: 1, 
                        fontSize: '12px', 
                        display: 'flex', 
                        gap: '4px',
                        border: visibility === 'private' ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-glass)',
                        background: visibility === 'private' ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                        color: visibility === 'private' ? 'var(--color-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      <EyeOff size={12} /> Private (Staff Only)
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  disabled={!comment.trim()}
                  onClick={() => handleReview('rejected')}
                  className="btn btn-secondary" 
                  style={{ flex: 1, color: 'var(--color-danger)', fontSize: '13px', display: 'flex', gap: '4px', justifyContent: 'center' }}
                >
                  <Ban size={14} /> Reject Report
                </button>
                <button 
                  disabled={!comment.trim()}
                  onClick={() => handleReview('authorized')}
                  className="btn btn-success" 
                  style={{ flex: 1, fontSize: '13px', display: 'flex', gap: '4px', justifyContent: 'center' }}
                >
                  <Check size={14} /> Authorize & Sign
                </button>
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedReportId(null)}>Cancel Review</button>
          </div>
        </div>
      )}

    </div>
  );
};
