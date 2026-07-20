import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSimulator } from '../context/SimulatorContext';
import { Plus, CalendarDays, FileText, UserCheck, ShieldAlert, Check, X, ArrowLeft, Search, Filter, RotateCcw, Edit2, Trash2 } from 'lucide-react';

export const AcademicCalendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent, currentUser } = useSimulator();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [viewMode, setViewMode] = useState<'calendar' | 'admin_notes' | 'my_notes'>('calendar');
  
  // Modals / Add form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[] | null>(null);

  // Form states for general holiday management
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    event_type: 'parents_teacher', 
  });

  // Form states for simple notes management
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    event_date: '',
  });

  // Filters for notes list view
  const [notesFilterYear, setNotesFilterYear] = useState('2026');
  const [notesFilterMonth, setNotesFilterMonth] = useState('all');
  const [notesSearchQuery, setNotesSearchQuery] = useState('');

  // Active filter state after clicking 'Filter' button
  const [activeNotesFilter, setActiveNotesFilter] = useState({
    year: '2026',
    month: 'all',
    search: '',
  });

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'admin';
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePostEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addCalendarEvent({
      ...eventData,
      end_date: dateMode === 'range' ? eventData.end_date : undefined,
      branch_id: 1
    });
    setShowAddForm(false);
    setEventData({
      title: '',
      description: '',
      event_date: '',
      end_date: '',
      event_type: 'parents_teacher',
    });
    setDateMode('single');
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    addCalendarEvent({
      title: noteForm.title,
      description: noteForm.description,
      event_date: noteForm.event_date,
      event_type: viewMode === 'admin_notes' ? 'admin_note' : 'my_note',
      branch_id: 1
    });
    setShowAddNoteForm(false);
    setNoteForm({
      title: '',
      description: '',
      event_date: '',
    });
  };

  const getDaysInMonth = (monthIndex: number, year: number) => {
    const date = new Date(year, monthIndex, 1);
    const days = [];
    const firstDayOfWeek = date.getDay();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    const lastDate = new Date(year, monthIndex + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }
    
    return days;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format countdown
  const getDaysCountDown = (dateStr: string) => {
    const diffTime = new Date(dateStr).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  // Filter events for sidebar lists
  const upcomingHolidays = calendarEvents
    .filter(e => {
      const isUpcoming = (e.end_date || e.event_date) >= todayStr;
      const isHolidayOrBreak = ['public_holiday', 'holiday', 'break', 'semester_break'].includes(e.event_type);
      return isUpcoming && isHolidayOrBreak;
    })
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const upcomingStaffLeaves = calendarEvents
    .filter(e => {
      const isUpcoming = (e.end_date || e.event_date) >= todayStr;
      return isUpcoming && e.event_type === 'staff_leave';
    })
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'parents_teacher': return <span className="badge badge-success">Parents Teacher Meeting</span>;
      case 'public_holiday':
      case 'holiday': return <span className="badge badge-danger">Public Holiday</span>;
      case 'staff_leave': return <span className="badge" style={{ background: '#EC4899', color: '#fff' }}>Staff Leave</span>;
      case 'term_exam': return <span className="badge badge-warning">Term Exam</span>;
      case 'break':
      case 'semester_break': return <span className="badge" style={{ background: '#8B5CF6', color: '#fff' }}>Break</span>;
      case 'admin_note': return <span className="badge" style={{ background: '#F97316', color: '#fff' }}>Admin Note</span>;
      case 'my_note': return <span className="badge" style={{ background: '#14B8A6', color: '#fff' }}>My Note</span>;
      default: return <span className="badge badge-info">Notice</span>;
    }
  };

  const renderDayCell = (day: number | null, monthIndex: number) => {
    if (day === null) {
      return <div key={`empty-${monthIndex}-${Math.random()}`} style={{ width: '32px', height: '32px' }} />;
    }
    
    const dateStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = calendarEvents.filter(e => {
      if (e.end_date) {
        return dateStr >= e.event_date && dateStr <= e.end_date;
      }
      return e.event_date === dateStr;
    });

    const isToday = todayStr === dateStr;
    
    // Check event tags on this day
    const hasHoliday = dayEvents.some(e => e.event_type === 'public_holiday' || e.event_type === 'holiday');
    const hasBreak = dayEvents.some(e => e.event_type === 'break' || e.event_type === 'semester_break');
    const hasExam = dayEvents.some(e => e.event_type === 'term_exam');
    const hasMeeting = dayEvents.some(e => e.event_type === 'parents_teacher');
    const hasStaffLeave = dayEvents.some(e => e.event_type === 'staff_leave');
    
    // Notes checks
    const hasAdminNote = dayEvents.some(e => e.event_type === 'admin_note');
    const hasMyNote = dayEvents.some(e => e.event_type === 'my_note' && e.created_by_id === currentUser.id);

    let bgStyle = 'transparent';
    let colorStyle = 'var(--text-primary)';
    let borderStyle = 'none';

    if (hasHoliday) {
      bgStyle = '#EF4444'; // Red circle
      colorStyle = '#ffffff';
    } else if (hasBreak) {
      bgStyle = '#8B5CF6'; // Purple circle
      colorStyle = '#ffffff';
    } else if (hasExam) {
      bgStyle = '#F59E0B'; // Yellow circle
      colorStyle = '#ffffff';
    } else if (hasMeeting) {
      bgStyle = '#10B981'; // Green circle
      colorStyle = '#ffffff';
    } else if (hasStaffLeave) {
      bgStyle = 'rgba(236, 72, 153, 0.25)'; // Pinkish outline/dot
      borderStyle = '2px solid #EC4899';
    } else if (hasMyNote) {
      bgStyle = '#14B8A6'; // Teal circle
      colorStyle = '#ffffff';
    }

    if (isToday) {
      borderStyle = borderStyle === 'none' ? '2px solid var(--text-primary)' : '2px dashed #ffffff';
    }

    return (
      <div 
        key={dateStr}
        className="calendar-day-cell"
        onClick={() => {
          if (dayEvents.length > 0) {
            setSelectedDayEvents(dayEvents);
          }
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: isToday ? 'bold' : '500',
          background: bgStyle,
          color: colorStyle,
          border: borderStyle,
          cursor: dayEvents.length > 0 ? 'pointer' : 'default',
          position: 'relative',
          transition: 'all 0.2s',
          boxShadow: bgStyle !== 'transparent' ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'
        }}
        title={dayEvents.map(e => `${e.title}: ${e.description}`).join('\n')}
      >
        {day}
        
        {/* Admin Note flag - orange triangle flag in top right corner */}
        {hasAdminNote && (
          <div 
            title="Admin Note available"
            style={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 6px 6px 0',
              borderColor: 'transparent #F97316 transparent transparent',
            }} 
          />
        )}
      </div>
    );
  };

  // Filter notes based on active filter state
  const getFilteredNotes = () => {
    const targetType = viewMode === 'admin_notes' ? 'admin_note' : 'my_note';
    return calendarEvents.filter(e => {
      if (e.event_type !== targetType) return false;
      if (targetType === 'my_note' && e.created_by_id !== currentUser.id) return false;
      
      // Match year
      if (activeNotesFilter.year !== 'all') {
        const year = e.event_date.split('-')[0];
        if (year !== activeNotesFilter.year) return false;
      }
      
      // Match month
      if (activeNotesFilter.month !== 'all') {
        const month = String(parseInt(e.event_date.split('-')[1], 10));
        if (month !== activeNotesFilter.month) return false;
      }
      
      // Match search query
      if (activeNotesFilter.search.trim()) {
        const query = activeNotesFilter.search.toLowerCase();
        const titleMatch = e.title.toLowerCase().includes(query);
        const descMatch = e.description.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }
      
      return true;
    });
  };

  const handleApplyFilter = () => {
    setActiveNotesFilter({
      year: notesFilterYear,
      month: notesFilterMonth,
      search: notesSearchQuery,
    });
  };

  const handleResetFilter = () => {
    setNotesFilterYear('2026');
    setNotesFilterMonth('all');
    setNotesSearchQuery('');
    setActiveNotesFilter({
      year: '2026',
      month: 'all',
      search: '',
    });
  };

  // ─── VIEW 1: DEDICATED ADMIN / MY NOTES MANAGER ───
  if (viewMode === 'admin_notes' || viewMode === 'my_notes') {
    const titleText = viewMode === 'admin_notes' ? 'Admin Notes' : 'My Notes';
    const subtitleText = viewMode === 'admin_notes' 
      ? 'Manage administrative calendar notes and reminders' 
      : 'Manage your personal calendar notes';
    
    // Add Note button visibility guard: ONLY Admin/Super Admin for Admin Notes, or anyone for My Notes
    const showAddNoteButton = viewMode === 'admin_notes' ? canManage : true;
    const filteredNotes = getFilteredNotes();

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', paddingBottom: '30px' }}>
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{titleText}</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitleText}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setViewMode('calendar')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Back to Calendar
            </button>
            
            {showAddNoteButton && (
              <button className="btn btn-primary" onClick={() => setShowAddNoteForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)' }}>
                <Plus size={16} /> Add Note
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar row */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>Year</label>
            <select 
              value={notesFilterYear} 
              onChange={e => setNotesFilterYear(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-solid)', color: 'var(--text-primary)', fontSize: '13px', width: '100px' }}
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>Month</label>
            <select 
              value={notesFilterMonth} 
              onChange={e => setNotesFilterMonth(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-solid)', color: 'var(--text-primary)', fontSize: '13px', width: '130px' }}
            >
              <option value="all">All Months</option>
              {months.map((m, idx) => (
                <option key={m} value={String(idx + 1)}>{m}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input 
                type="text" 
                placeholder="Search notes..." 
                value={notesSearchQuery}
                onChange={e => setNotesSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-solid)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleApplyFilter} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)' }}>
              <Filter size={14} /> Filter
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilter} title="Reset filters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0 }}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Notes Grid Cards layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredNotes.map(note => {
            const isUpcoming = note.event_date >= todayStr;
            const borderCol = isUpcoming ? '1px solid #EC4899' : '1px solid var(--border-glass)';
            
            return (
              <div 
                key={note.id} 
                className="glass-panel" 
                style={{ 
                  padding: '20px', 
                  borderLeft: isUpcoming ? '4px solid #EC4899' : '4px solid var(--border-accent)',
                  borderTop: borderCol,
                  borderRight: borderCol,
                  borderBottom: borderCol,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                    <CalendarDays size={14} color="var(--color-primary)" />
                    {new Date(note.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  
                  {/* Action buttons (only edit/delete for authorized managers) */}
                  {canManage && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="text-btn" style={{ color: 'var(--text-secondary)' }} title="Edit"><Edit2 size={13} /></button>
                      <button className="text-btn" style={{ color: '#EF4444' }} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: isUpcoming ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-surface-hover)', 
                    color: isUpcoming ? '#EC4899' : 'var(--text-muted)'
                  }}>
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                </div>

                <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{note.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{note.description}</p>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>✍️ Admin System</span>
                  <span>📅 Created Dec 31, 2025</span>
                </div>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notes found matching the filter query.
            </div>
          )}
        </div>

        {/* Add Note Modal Overlay */}
        {showAddNoteForm && createPortal(
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '24px'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: 'bold' }}>Add {viewMode === 'admin_notes' ? 'Admin Note' : 'My Note'}</h3>
                <button onClick={() => setShowAddNoteForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePostNote} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Note Date</label>
                  <input 
                    type="date" 
                    required 
                    value={noteForm.event_date} 
                    onChange={e => setNoteForm({...noteForm, event_date: e.target.value})} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Title</label>
                  <input 
                    type="text" 
                    required 
                    value={noteForm.title} 
                    onChange={e => setNoteForm({...noteForm, title: e.target.value})} 
                    placeholder="e.g. concert practice / special task"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea 
                    rows={3} 
                    required 
                    value={noteForm.description} 
                    onChange={e => setNoteForm({...noteForm, description: e.target.value})} 
                    placeholder="Provide note description details..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddNoteForm(false)} style={{ padding: '8px 16px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', background: 'var(--color-primary)' }}>Save Note</button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // ─── VIEW 2: DEDICATED ACADEMIC CALENDAR OVERVIEW ───
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', paddingBottom: '30px' }}>
      
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Academic Calendar</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overview for {selectedYear}</span>
        </div>

        {/* Calendar Management Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Year selector */}
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-surface-solid)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          {canManage && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--color-primary)' }}
            >
              <Plus size={16} /> Holiday Management
            </button>
          )}

          {currentUser.role !== 'parent' && (
            <button 
              className="btn btn-secondary"
              onClick={() => setViewMode('admin_notes')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 14px',
                border: '1px solid var(--border-glass)',
                background: 'transparent',
                color: 'var(--text-secondary)'
              }}
            >
              <ShieldAlert size={14} /> Admin Notes
            </button>
          )}

          <button 
            className="btn btn-secondary"
            onClick={() => setViewMode('my_notes')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 14px',
              border: '1px solid var(--border-glass)',
              background: 'transparent',
              color: 'var(--text-secondary)'
            }}
          >
            <FileText size={14} /> My Notes
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Yearly Months Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {months.map((month, monthIndex) => {
              const days = getDaysInMonth(monthIndex, selectedYear);
              
              return (
                <div key={month} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', margin: 0 }}>
                    {month}
                  </h4>
                  
                  {/* Calendar Month Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                      <span key={d} style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{d}</span>
                    ))}
                    
                    {days.map((day) => renderDayCell(day, monthIndex))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Holiday types Legend */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '14px', marginTop: 0 }}>Holiday Types</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8B5CF6' }} /> Break
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} /> First term exam
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} /> Parents teacher meeting
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} /> Public Holidays
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} /> Second term exam
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--text-primary)' }} /> Today
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 8px 8px 0',
                  borderColor: 'transparent #F97316 transparent transparent',
                }} /> Admin Note
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#14B8A6' }} /> My Note
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #EC4899' }} /> Staff on Leave
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Column Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upcoming Staff Leaves panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: 0 }}>
              <UserCheck size={16} color="var(--color-primary)" /> Upcoming Staff Leaves
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingStaffLeaves.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-glass)' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>{e.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.event_date} {e.end_date ? `to ${e.end_date}` : ''}</span>
                  </div>
                </div>
              ))}
              
              {upcomingStaffLeaves.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <Check size={18} />
                  </div>
                  <p style={{ margin: 0 }}>No staff on leave soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Holidays / Events Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: 0 }}>
              <CalendarDays size={16} color="var(--color-primary)" /> Upcoming Holidays
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingHolidays.slice(0, 5).map(e => (
                <div key={e.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{e.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.event_type === 'break' ? '#8B5CF6' : '#EF4444' }} />
                      {new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', background: 'var(--bg-surface-solid)', padding: '4px 8px', borderRadius: '12px' }}>
                    {getDaysCountDown(e.event_date)}
                  </span>
                </div>
              ))}

              {upcomingHolidays.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No upcoming holidays.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Selected Date events popup detail overlay */}
      {selectedDayEvents && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '400px',
            background: 'var(--bg-surface-solid)',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Events on {selectedDayEvents[0]?.event_date}</h4>
              <button onClick={() => setSelectedDayEvents(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDayEvents.map(e => (
                <div key={e.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    {getEventBadge(e.event_type)}
                    {e.end_date && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>To {e.end_date}</span>}
                  </div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{e.title}</h5>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Holiday notice modal */}
      {showAddForm && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '450px',
            background: 'var(--bg-surface)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: 'bold' }}>Post New Academic Event</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePostEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Event Title</label>
                <input 
                  type="text" 
                  required 
                  value={eventData.title} 
                  onChange={e => setEventData({...eventData, title: e.target.value})} 
                  placeholder="e.g. parents teacher meeting / Public Holiday"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Event Description</label>
                <textarea 
                  rows={3} 
                  required 
                  value={eventData.description} 
                  onChange={e => setEventData({...eventData, description: e.target.value})} 
                  placeholder="Add some details about the event"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Date Mode</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className={`btn ${dateMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDateMode('single')}
                    style={{ flex: 1, padding: '6px', fontSize: '12px', background: dateMode === 'single' ? 'var(--color-primary)' : 'transparent', color: dateMode === 'single' ? '#fff' : 'var(--text-secondary)' }}
                  >
                    1 Day
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${dateMode === 'range' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDateMode('range')}
                    style={{ flex: 1, padding: '6px', fontSize: '12px', background: dateMode === 'range' ? 'var(--color-primary)' : 'transparent', color: dateMode === 'range' ? '#fff' : 'var(--text-secondary)' }}
                  >
                    Date Range
                  </button>
                </div>
              </div>

              {dateMode === 'single' ? (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Event Date</label>
                  <input 
                    type="date" 
                    required 
                    value={eventData.event_date} 
                    onChange={e => setEventData({...eventData, event_date: e.target.value})} 
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      background: 'var(--bg-surface-hover)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Start Date</label>
                    <input 
                      type="date" 
                      required 
                      value={eventData.event_date} 
                      onChange={e => setEventData({...eventData, event_date: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-glass)',
                        background: 'var(--bg-surface-hover)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={eventData.end_date} 
                      onChange={e => setEventData({...eventData, end_date: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-glass)',
                        background: 'var(--bg-surface-hover)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Event Category</label>
                <select 
                  value={eventData.event_type} 
                  onChange={e => setEventData({...eventData, event_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="parents_teacher">Parents Teacher Meeting</option>
                  <option value="public_holiday">Public Holiday</option>
                  <option value="staff_leave">Staff on Leave</option>
                  <option value="term_exam">Term Exam</option>
                  <option value="break">Break / Semester Break</option>
                  <option value="admin_note">Admin Note</option>
                  <option value="my_note">My Note</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>Post Notice</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
