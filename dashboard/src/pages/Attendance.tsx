import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Users, Clock, CheckCircle, XCircle, Search, Edit2, LogIn, LogOut } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { children, sessions, attendanceRecords, users, therapyTypes, currentUser, markAttendance } = useSimulator();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<{ sessionId: number; childName: string; checkIn: string; checkOut: string; notes: string } | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const isTrainer = currentUser.role === 'trainer';
  const isAdmin = ['super_admin', 'admin', 'principal'].includes(currentUser.role);
  const canEditAttendance = currentUser.role === 'trainer';

  // Helper resolvers
  const getChildName = (id: number) => children.find(c => c.id === id)?.full_name || 'Unknown Child';
  const getTrainerName = (id: number) => users.find(u => u.id === id)?.name || 'Unknown Trainer';
  const getTherapyName = (id: number) => therapyTypes.find(t => t.id === id)?.name || 'General Therapy';

  const getCurrentTimeStr = () => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  // 1. Filter sessions based on user role
  const relevantSessions = sessions.filter(s => {
    if (isTrainer) {
      return s.trainer_id === currentUser.id;
    }
    return true; // admin, super admin, principal see all
  });

  // Get all unique month-years from relevant sessions
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    relevantSessions.forEach(s => {
      if (s.session_date) {
        const date = new Date(s.session_date);
        const monthYear = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        months.add(monthYear);
      }
    });
    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [relevantSessions]);

  // 2. Map sessions to their attendance status
  const attendanceRows = relevantSessions.map(s => {
    const record = attendanceRecords.find(r => r.session_id === s.id);
    const childName = getChildName(s.child_id);
    const trainerName = getTrainerName(s.trainer_id);
    const therapyName = getTherapyName(s.therapy_type_id);
    
    let status: 'completed' | 'checked_in' | 'absent' | 'scheduled' = 'scheduled';
    if (record) {
      if (record.check_out_time) {
        status = 'completed';
      } else if (record.check_in_time) {
        status = 'checked_in';
      }
    } else {
      // If the session date is in the past, mark as absent/no-show
      const today = new Date().toISOString().split('T')[0];
      if (s.session_date < today) {
        status = 'absent';
      }
    }

    return {
      session: s,
      record,
      childName,
      trainerName,
      therapyName,
      status
    };
  });

  // 3. Sort by date desc, then start time desc
  const sortedRows = attendanceRows.sort((a, b) => {
    const dateCompare = b.session.session_date.localeCompare(a.session.session_date);
    if (dateCompare !== 0) return dateCompare;
    return b.session.start_time.localeCompare(a.session.start_time);
  });

  // 4. Apply searches and filters
  const filteredRows = sortedRows.filter(row => {
    const matchesSearch = 
      row.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.trainerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTherapy = selectedTherapy === 'all' || row.session.therapy_type_id === parseInt(selectedTherapy);
    const matchesStatus = selectedStatus === 'all' || row.status === selectedStatus;

    let matchesMonth = true;
    if (selectedMonth !== 'all' && row.session.session_date) {
      const date = new Date(row.session.session_date);
      const rowMonthYear = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
      matchesMonth = rowMonthYear === selectedMonth;
    }

    return matchesSearch && matchesTherapy && matchesStatus && matchesMonth;
  });

  // Statistics calculation
  const totalCount = filteredRows.length;
  const completedCount = filteredRows.filter(r => r.status === 'completed').length;
  const activeCount = filteredRows.filter(r => r.status === 'checked_in').length;
  const absentCount = filteredRows.filter(r => r.status === 'absent').length;
  const rate = totalCount > 0 ? Math.round(((completedCount + activeCount) / totalCount) * 100) : 0;

  // Handle Quick Check-In
  const handleQuickCheckIn = (sessionId: number) => {
    const time = getCurrentTimeStr();
    markAttendance(sessionId, time, undefined, undefined);
  };

  // Handle Quick Check-Out
  const handleQuickCheckOut = (sessionId: number, existingRecord: any) => {
    const time = getCurrentTimeStr();
    markAttendance(sessionId, undefined, time, existingRecord?.notes);
  };

  // Open Edit Modal
  const handleOpenEdit = (sessionId: number, childName: string, record: any) => {
    setEditingRecord({
      sessionId,
      childName,
      checkIn: record?.check_in_time || '',
      checkOut: record?.check_out_time || '',
      notes: record?.notes || ''
    });
  };

  // Save Edit Modal Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      markAttendance(
        editingRecord.sessionId,
        editingRecord.checkIn || undefined,
        editingRecord.checkOut || undefined,
        editingRecord.notes
      );
      setEditingRecord(null);
    }
  };



  // ─── STANDARD DASHBOARD SCREEN ───
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Title description bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '6px' }}>
            {isTrainer ? 'My Student Attendance Log' : 'Student Therapy Attendance Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {isTrainer 
              ? 'Monitor check-ins, check-outs, and behavioral session logs for your assigned children.' 
              : 'Access logs, attendance statistics, and therapy check-in status across all therapists and children.'}
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="stat-grid">
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Registered Sessions</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{totalCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Completed / Checked In</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{completedCount + activeCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No-Show / Absent</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{absentCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overall Attendance Rate</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{rate}%</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}><Search size={16} /></span>
            <input 
              type="text" 
              placeholder="Search student or trainer..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', minWidth: '280px' }}>
            <select 
              value={selectedTherapy} 
              onChange={e => setSelectedTherapy(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="all">All Therapy Programs</option>
              {therapyTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="checked_in">Checked In</option>
              <option value="absent">Absent / No-Show</option>
              <option value="scheduled">Scheduled / Pending</option>
            </select>

            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="all">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Student</th>
                <th>Therapy Program</th>
                {isAdmin && <th>Assigned Trainer</th>}
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Attendance Notes</th>
                {canEditAttendance && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ session, record, childName, trainerName, therapyName, status }) => (
                <tr key={session.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{session.session_date}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{session.start_time} - {session.end_time}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '13px'
                      }}>
                        {childName.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{childName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                      {therapyName}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{trainerName}</span>
                    </td>
                  )}
                  <td>
                    {record?.check_in_time ? (
                      <span className="badge badge-success" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {record.check_in_time}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>--:--</span>
                    )}
                  </td>
                  <td>
                    {record?.check_out_time ? (
                      <span className="badge badge-primary" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {record.check_out_time}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>--:--</span>
                    )}
                  </td>
                  <td>
                    {status === 'completed' && <span className="badge badge-success">Completed</span>}
                    {status === 'checked_in' && <span className="badge badge-info" style={{ animation: 'pulse-ring 2s infinite' }}>Checked In</span>}
                    {status === 'absent' && <span className="badge badge-danger">No-Show</span>}
                    {status === 'scheduled' && <span className="badge badge-warning">Scheduled</span>}
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', 
                      color: record?.notes ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontStyle: record?.notes ? 'normal' : 'italic',
                      display: 'block',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={record?.notes}>
                      {record?.notes || 'No session notes recorded'}
                    </span>
                  </td>
                  {canEditAttendance && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {status !== 'completed' && status !== 'checked_in' && (
                          <button 
                            onClick={() => handleQuickCheckIn(session.id)}
                            className="btn btn-success"
                            style={{ padding: '6px 10px', fontSize: '11px', gap: '4px', borderRadius: '4px' }}
                            title="Quick Check-In (Current Time)"
                          >
                            <LogIn size={12} />
                            Check In
                          </button>
                        )}
                        {status === 'checked_in' && (
                          <button 
                            onClick={() => handleQuickCheckOut(session.id, record)}
                            className="btn btn-accent"
                            style={{ padding: '6px 10px', fontSize: '11px', gap: '4px', borderRadius: '4px' }}
                            title="Quick Check-Out (Current Time)"
                          >
                            <LogOut size={12} />
                            Check Out
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(session.id, childName, record)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          className="btn-ghost"
                          title="Edit log details"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    No matching attendance logs found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Edit Attendance Modal Dialog */}
      {editingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }}>
          <div className="glass-panel animate-scale-up modal-card" style={{
            width: '100%',
            maxWidth: '450px',
            background: 'var(--bg-surface-solid)',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-accent)',
            boxShadow: 'var(--shadow-2xl)'
          }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              Update Session Attendance
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Recording attendance for: <strong style={{ color: 'var(--color-primary)' }}>{editingRecord.childName}</strong>
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Check-In Time</label>
                <input 
                  type="time" 
                  value={editingRecord.checkIn} 
                  onChange={e => setEditingRecord({...editingRecord, checkIn: e.target.value})} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Check-Out Time</label>
                <input 
                  type="time" 
                  value={editingRecord.checkOut} 
                  onChange={e => setEditingRecord({...editingRecord, checkOut: e.target.value})} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Session / Behavior Notes</label>
                <textarea 
                  rows={3} 
                  placeholder="Enter notes about session behavior, goals, or warnings..."
                  value={editingRecord.notes} 
                  onChange={e => setEditingRecord({...editingRecord, notes: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRecord(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
