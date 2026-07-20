import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { FileText, Activity, Printer, Search } from 'lucide-react';

interface StudentStatusPageProps {
  onViewPdf: (data: { type: 'progress' | 'behavior'; id: number }) => void;
}

export const StudentStatusPage: React.FC<StudentStatusPageProps> = ({ onViewPdf }) => {
  const { children, behaviorReports, progressReports, users, currentUser, parentLinks } = useSimulator();
  const [activeTab, setActiveTab] = useState<'progress' | 'behavior'>('progress');
  const [searchQuery, setSearchQuery] = useState('');

  // Linked child IDs for the current parent
  const parentChildIds = React.useMemo(() => {
    if (currentUser.role !== 'parent') {
      // If staff accesses this page, show for all children
      return new Set(children.map(c => c.id));
    }
    return new Set(parentLinks.filter(link => link.parent_user_id === currentUser.id).map(link => link.child_id));
  }, [parentLinks, currentUser, children]);

  // Filtered reports
  const visibleProgress = progressReports.filter(r => 
    parentChildIds.has(r.child_id) && 
    (currentUser.role !== 'parent' || r.visible_to_parent)
  ).filter(r => {
    const childName = children.find(c => c.id === r.child_id)?.full_name || '';
    const notes = r.notes || '';
    const q = searchQuery.toLowerCase();
    return childName.toLowerCase().includes(q) || notes.toLowerCase().includes(q) || r.report_date.includes(q);
  }).sort((a, b) => b.report_date.localeCompare(a.report_date));

  const visibleBehavior = behaviorReports.filter(r => 
    parentChildIds.has(r.child_id) && 
    (currentUser.role !== 'parent' || (r.status === 'authorized' && r.visibility === 'public'))
  ).filter(r => {
    const childName = children.find(c => c.id === r.child_id)?.full_name || '';
    const incident = r.nature_of_incident || '';
    const q = searchQuery.toLowerCase();
    return childName.toLowerCase().includes(q) || incident.toLowerCase().includes(q) || r.report_date.includes(q);
  }).sort((a, b) => b.report_date.localeCompare(a.report_date));

  const getChildName = (id: number) => children.find(c => c.id === id)?.full_name || 'Child';
  const getTrainerName = (id: number) => users.find(u => u.id === id)?.name || 'Therapist';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header Banner */}
      <div className="section-header">
        <div className="section-accent-bar" />
        <h2 className="section-title">Student Status & Reports Overview</h2>
      </div>

      <p className="text-secondary" style={{ fontSize: '14px', margin: '-12px 0 0 0' }}>
        Track your child's therapeutic development, progress notes, and verified behavior observations.
      </p>

      {/* Tabs and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-solid)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveTab('progress')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '13px',
              fontWeight: activeTab === 'progress' ? '700' : '500',
              color: activeTab === 'progress' ? '#fff' : 'var(--text-secondary)',
              background: activeTab === 'progress' ? 'var(--color-primary)' : 'transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            <FileText size={15} />
            Progress Reports ({visibleProgress.length})
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '13px',
              fontWeight: activeTab === 'behavior' ? '700' : '500',
              color: activeTab === 'behavior' ? '#fff' : 'var(--text-secondary)',
              background: activeTab === 'behavior' ? 'var(--color-success)' : 'transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Activity size={15} />
            Behavior Reports ({visibleBehavior.length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, date or student..."
            style={{ paddingLeft: '38px', borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Therapist / Trainer</th>
                    <th>Session Progress Notes</th>
                    <th>Attachments</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProgress.map(r => (
                    <tr key={`p-page-${r.id}`}>
                      <td><strong>{r.report_date}</strong></td>
                      <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{getChildName(r.child_id)}</td>
                      <td>{getTrainerName(r.trainer_id)}</td>
                      <td style={{ maxWidth: '320px', lineHeight: '1.4' }}>{r.notes}</td>
                      <td>
                        {r.media_links && r.media_links.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {r.media_links.map((link, idx) => (
                              <a key={idx} href={link} target="_blank" rel="noreferrer" className="badge badge-accent" style={{ fontSize: '10px' }}>
                                📎 {link.split('/').pop()}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onViewPdf({ type: 'progress', id: r.id })}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                        >
                          <Printer size={13} /> Render PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibleProgress.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                        No progress reports found for your account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Therapist / Trainer</th>
                    <th>Incident Nature</th>
                    <th>Principal / Review Comment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBehavior.map(r => (
                    <tr key={`b-page-${r.id}`}>
                      <td><strong>{r.report_date}</strong></td>
                      <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{getChildName(r.child_id)}</td>
                      <td>{getTrainerName(r.trainer_id)}</td>
                      <td style={{ maxWidth: '280px', lineHeight: '1.4' }}>{r.nature_of_incident}</td>
                      <td>
                        {r.principal_comment ? (
                          <div style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)', maxWidth: '240px', lineHeight: '1.3' }}>
                            <strong>Principal:</strong> {r.principal_comment}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Verified</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onViewPdf({ type: 'behavior', id: r.id })}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                        >
                          <Printer size={13} /> Render PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibleBehavior.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                        No authorized behavior observation reports found for your account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
