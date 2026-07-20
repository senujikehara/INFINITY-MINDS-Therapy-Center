import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Plus, Clock, AlertCircle, Trash2, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Scheduler: React.FC = () => {
  const { 
    currentUser, 
    sessions, 
    children, 
    users, 
    therapyTypes, 
    attendanceRecords,
    addSession, 
    rescheduleSession, 
    cancelSession, 
    markAttendance,
    addTherapyType,
    parentLinks
  } = useSimulator();

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Tab states
  const [currentTab, setCurrentTab] = useState<'schedule' | 'class_create'>('schedule');

  // Class create state
  const [classForm, setClassForm] = useState({
    name: '',
    description: '',
    color_tag: '#8B5CF6'
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    addTherapyType(classForm);
    setClassForm({
      name: '',
      description: '',
      color_tag: '#8B5CF6'
    });
  };
  
  // Add session state
  const [newSessionData, setNewSessionData] = useState<{
    child_id: number;
    trainer_id: number;
    therapy_type_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    recurrence_rule: 'WEEKLY' | 'DAILY' | 'NONE';
  }>({
    child_id: 1,
    trainer_id: 4,
    therapy_type_id: 1,
    session_date: '2026-07-06',
    start_time: '09:00',
    end_time: '10:00',
    is_recurring: false,
    recurrence_rule: 'NONE',
  });

  // Reschedule state
  const [rescheduleData, setRescheduleData] = useState({
    session_date: '2026-07-07',
    start_time: '09:00',
    end_time: '10:00',
  });

  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [activeView, setActiveView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-09');
  const [hoveredSession, setHoveredSession] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const schedulerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent, session: any) => {
    setHoveredSession(session);
    if (schedulerRef.current) {
      const rect = schedulerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (schedulerRef.current) {
      const rect = schedulerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const getLiveLineTop = () => {
    // Current simulated hours / mins:
    // If selectedDate matches simulated today (2026-07-09), we can check system hours.
    // Or we can let it read system hours directly.
    const hrs = currentTime.getHours();
    const mins = currentTime.getMinutes();
    
    // Calendar is 8 AM to 8 PM (8 to 20)
    if (hrs < 8 || hrs >= 20) return null;
    
    const hoursSinceStart = hrs - 8 + (mins / 60);
    const rowHeight = 85; // matching minHeight: '85px'
    return hoursSinceStart * rowHeight;
  };

  const handlePrev = () => {
    if (activeView === 'Day') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    } else if (activeView === 'Week') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      setSelectedDate(d.toISOString().split('T')[0]);
    } else if (activeView === 'Month') {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const handleNext = () => {
    if (activeView === 'Day') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    } else if (activeView === 'Week') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      setSelectedDate(d.toISOString().split('T')[0]);
    } else if (activeView === 'Month') {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() + 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const handleToday = () => {
    setSelectedDate('2026-07-09');
  };

  const getWeekRangeString = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    const formatMonthName = (date: Date) => date.toLocaleString('default', { month: 'long' });
    
    if (monday.getMonth() === friday.getMonth()) {
      return `${formatMonthName(monday)} ${monday.getDate()}–${friday.getDate()}, ${monday.getFullYear()}`;
    } else {
      return `${formatMonthName(monday)} ${monday.getDate()} – ${formatMonthName(friday)} ${friday.getDate()}, ${monday.getFullYear()}`;
    }
  };

  const getWeekDays = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    
    const weekDays = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (let i = 0; i < 5; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const dayNum = current.getDate();
      const monthNum = current.getMonth() + 1;
      const yearNum = current.getFullYear();
      const mStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const dStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      weekDays.push({
        label: `${dayNum} ${dayNames[i]}`,
        dateStr: `${yearNum}-${mStr}-${dStr}`,
        dayNum,
        dayName: dayNames[i]
      });
    }
    return weekDays;
  };

  const getDayInfo = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      label: `${d.getDate()} ${dayNames[d.getDay()]}`,
      dateStr,
      dayNum: d.getDate(),
      dayName: dayNames[d.getDay()]
    };
  };

  const getMonthWeeks = () => {
    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const dates = [];
    
    // Fill in days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDay = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const mStr = (prevMonth + 1) < 10 ? `0${prevMonth + 1}` : `${prevMonth + 1}`;
      const dStr = prevDay < 10 ? `0${prevDay}` : `${prevDay}`;
      dates.push({
        day: prevDay,
        isCurrentMonth: false,
        dateStr: `${prevYear}-${mStr}-${dStr}`
      });
    }
    
    // Fill in days of the current month
    for (let i = 1; i <= totalDays; i++) {
      const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
      const dStr = i < 10 ? `0${i}` : `${i}`;
      dates.push({
        day: i,
        isCurrentMonth: true,
        dateStr: `${year}-${mStr}-${dStr}`
      });
    }
    
    // Fill in days of the next month to make a complete 42-cell grid
    const remainingCells = 42 - dates.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const mStr = (nextMonth + 1) < 10 ? `0${nextMonth + 1}` : `${nextMonth + 1}`;
      const dStr = i < 10 ? `0${i}` : `${i}`;
      dates.push({
        day: i,
        isCurrentMonth: false,
        dateStr: `${nextYear}-${mStr}-${dStr}`
      });
    }
    
    const weeks = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }
    return weeks;
  };

  // Helpers to resolve items
  const getChildName = (id: number) => children.find(c => c.id === id)?.full_name || 'Unknown Child';
  const getTrainerName = (id: number) => users.find(u => u.id === id)?.name || 'Unknown Trainer';
  const getTherapyType = (id: number) => therapyTypes.find(t => t.id === id);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const selectedSessionAttendance = attendanceRecords.find(a => a.session_id === selectedSessionId);

  // Filter sessions based on role
  const getFilteredSessions = () => {
    if (currentUser.role === 'parent') {
      const parentChildIds = parentLinks
        .filter(link => link.parent_user_id === currentUser.id)
        .map(link => link.child_id);
      return sessions.filter(s => parentChildIds.includes(s.child_id));
    }
    if (currentUser.role === 'trainer') {
      return sessions.filter(s => s.trainer_id === currentUser.id);
    }
    return sessions;
  };

  const filteredSessions = getFilteredSessions();

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      ...newSessionData,
      status: 'scheduled',
      branch_id: 1,
      created_by: currentUser.id
    });
    setShowAddForm(false);
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSessionId) {
      rescheduleSession(
        selectedSessionId,
        rescheduleData.session_date,
        rescheduleData.start_time,
        rescheduleData.end_time
      );
      setShowRescheduleForm(false);
      setSelectedSessionId(null);
    }
  };

  const handleCheckIn = () => {
    if (selectedSessionId) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      markAttendance(selectedSessionId, nowTime, undefined, attendanceNotes);
    }
  };

  const handleCheckOut = () => {
    if (selectedSessionId) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      markAttendance(selectedSessionId, undefined, nowTime, attendanceNotes);
    }
  };

  const canEdit = currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'trainer';

  // Hours layout (8:00 - 20:00, 12 hours)
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const formatHourDisplay = (hourStr: string) => {
    const hr = parseInt(hourStr.split(':')[0]);
    if (hr === 12) return '12 PM';
    return hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
  };

  const isClassManageAllowed = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  return (
    <>
    {isClassManageAllowed && (
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '12px' }}>
        <button
          onClick={() => setCurrentTab('schedule')}
          className={`btn ${currentTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            padding: '8px 16px', 
            fontSize: '13px', 
            fontWeight: '600',
            background: currentTab === 'schedule' ? 'var(--color-primary)' : 'transparent',
            color: currentTab === 'schedule' ? '#fff' : 'var(--text-secondary)',
            border: currentTab === 'schedule' ? 'none' : '1.5px solid var(--border-glass)',
            borderRadius: '6px'
          }}
        >
          Timetable Schedule
        </button>
        <button
          onClick={() => setCurrentTab('class_create')}
          className={`btn ${currentTab === 'class_create' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            padding: '8px 16px', 
            fontSize: '13px', 
            fontWeight: '600',
            background: currentTab === 'class_create' ? 'var(--color-primary)' : 'transparent',
            color: currentTab === 'class_create' ? '#fff' : 'var(--text-secondary)',
            border: currentTab === 'class_create' ? 'none' : '1.5px solid var(--border-glass)',
            borderRadius: '6px'
          }}
        >
          Class Create
        </button>
      </div>
    )}

    {currentTab === 'class_create' && isClassManageAllowed ? (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Therapy Classes Directory</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage and create therapy class categories and color codes</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '24px', alignItems: 'start' }}>
          {/* Add form */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Create New Therapy Class</h4>
            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical Therapy"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the therapy goals..."
                  value={classForm.description}
                  onChange={e => setClassForm({ ...classForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Class Color Tag</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setClassForm({ ...classForm, color_tag: col })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: col,
                        border: classForm.color_tag === col ? '2px solid var(--text-primary)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', background: 'var(--color-primary)', marginTop: '12px' }}>
                <Plus size={16} /> Create Class
              </button>
            </form>
          </div>

          {/* List display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Active Therapy Classes</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {therapyTypes.map(tt => (
                <div 
                  key={tt.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    borderLeft: `4px solid ${tt.color_tag}`,
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{tt.name}</h5>
                    <span style={{ fontSize: '10px', color: '#fff', background: tt.color_tag, padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      ID: {tt.id}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div ref={schedulerRef} className="animate-fade-in" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', height: isMobile ? 'auto' : 'calc(100vh - 120px)', overflow: isMobile ? 'visible' : 'hidden' }}>
      
      {/* Top Outlook Control Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-glass)', 
        borderRadius: '8px', 
        padding: '8px 16px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleToday} style={{ padding: '6px 12px', fontSize: '12px' }}>Today</button>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handlePrev} 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1.5px solid var(--border-glass)' 
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleNext} 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1.5px solid var(--border-glass)' 
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {activeView === 'Day' && (() => {
              const d = new Date(selectedDate);
              return d.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
            })()}
            {activeView === 'Week' && getWeekRangeString(selectedDate)}
            {activeView === 'Month' && (() => {
              const d = new Date(selectedDate);
              return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
            })()}
            {' '}▾
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            {(['Day', 'Week', 'Month'] as const).map(view => (
              <button 
                key={view} 
                onClick={() => setActiveView(view)}
                className={`btn ${view === activeView ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '12px', border: 'none', background: view === activeView ? 'var(--color-primary)' : 'transparent', color: view === activeView ? '#fff' : 'var(--text-secondary)' }}
              >
                {view}
              </button>
            ))}
          </div>

          {canEdit && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddForm(true)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '6px 12px', 
                fontSize: '12px' 
              }}
            >
              <Plus size={14} /> New session
            </button>
          )}
        </div>
      </div>

        {/* Month View Grid */}
        {activeView === 'Month' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>
            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: 'var(--text-secondary)', minWidth: isMobile ? '700px' : 'auto' }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
            </div>
            
            {/* Grid Days */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '400px', minWidth: isMobile ? '700px' : 'auto' }}>
              {getMonthWeeks().map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, borderBottom: wIdx < 4 ? '1px solid var(--border-glass)' : 'none' }}>
                  {week.map(dayCell => {
                    const daySessions = filteredSessions.filter(s => s.session_date === dayCell.dateStr);
                    const isToday = dayCell.dateStr === '2026-07-09';
                    
                    return (
                      <div 
                        key={dayCell.dateStr} 
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setSelectedDate(dayCell.dateStr);
                            setActiveView('Day');
                          }
                        }}
                        style={{
                          borderLeft: '1px solid var(--border-glass)',
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          height: '100px',
                          background: dayCell.isCurrentMonth ? 'transparent' : 'rgba(255,255,255,0.005)',
                          cursor: 'pointer',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: isToday ? 'bold' : 'normal',
                            color: isToday ? '#fff' : (dayCell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)'),
                            background: isToday ? 'var(--color-primary)' : 'transparent',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {dayCell.day}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', flex: 1 }}>
                          {daySessions.slice(0, 2).map(s => {
                            const tType = getTherapyType(s.therapy_type_id);
                            return (
                              <div
                                key={s.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSessionId(s.id);
                                }}
                                onMouseEnter={(e) => handleMouseEnter(e, s)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => setHoveredSession(null)}
                                style={{
                                  background: s.status === 'cancelled' ? 'rgba(239, 68, 68, 0.08)' : `${tType?.color_tag}15`,
                                  borderLeft: `2px solid ${s.status === 'cancelled' ? 'var(--color-danger)' : tType?.color_tag}`,
                                  borderRadius: '3px',
                                  padding: '2px 4px',
                                  fontSize: '9px',
                                  color: 'var(--text-primary)',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {s.start_time} {getChildName(s.child_id)}
                              </div>
                            );
                          })}
                          
                          {daySessions.length > 2 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(dayCell.dateStr);
                                setActiveView('Day');
                              }}
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 'bold',
                                color: 'var(--color-primary)',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              + {daySessions.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Day & Week View Grid */}
        {(activeView === 'Day' || activeView === 'Week') && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>
            
            {/* Day Columns Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: activeView === 'Day' ? '80px 1fr' : '80px repeat(5, 1fr)', 
              borderBottom: '1px solid var(--border-glass)', 
              paddingBottom: '10px', 
              textAlign: 'center',
              minWidth: activeView === 'Day' ? 'auto' : (isMobile ? '650px' : 'auto')
            }}>
              <div></div>
              {(activeView === 'Day' ? [getDayInfo(selectedDate)] : getWeekDays(selectedDate)).map((dayObj) => {
                const isToday = dayObj.dateStr === '2026-07-09';
                return (
                  <div key={dayObj.dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: isToday ? 'var(--color-primary)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {dayObj.dayName}
                    </span>
                    <span style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: isToday ? '#fff' : 'var(--text-primary)',
                      background: isToday ? 'var(--color-primary)' : 'transparent',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '4px'
                    }}>
                      {dayObj.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div style={{ overflowY: 'auto', flex: 1, position: 'relative', minWidth: activeView === 'Day' ? 'auto' : (isMobile ? '650px' : 'auto') }}>
              {/* Live Time Indicator Line (only in Day/Week view for today) */}
              {(() => {
                const topVal = getLiveLineTop();
                if (topVal === null) return null;
                
                const isTodayActive = (() => {
                  const todayStr = '2026-07-09';
                  if (activeView === 'Day') {
                    return selectedDate === todayStr;
                  } else if (activeView === 'Week') {
                    const days = getWeekDays(selectedDate);
                    return days.some(d => d.dateStr === todayStr);
                  }
                  return false;
                })();

                if (!isTodayActive) return null;

                let leftPos = '80px';
                let widthVal = 'calc(100% - 80px)';
                
                if (activeView === 'Week') {
                  const days = getWeekDays(selectedDate);
                  const todayIdx = days.findIndex(d => d.dateStr === '2026-07-09');
                  if (todayIdx !== -1) {
                    leftPos = `calc(80px + (100% - 80px) / 5 * ${todayIdx})`;
                    widthVal = `calc((100% - 80px) / 5)`;
                  }
                }

                return (
                  <div style={{
                    position: 'absolute',
                    top: `${topVal}px`,
                    left: leftPos,
                    width: widthVal,
                    height: '2px',
                    background: 'var(--brand-crimson)',
                    boxShadow: '0 0 8px var(--brand-crimson)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-crimson)', marginLeft: '-4px' }} />
                  </div>
                );
              })()}

              {hours.map(hour => {
                const displayHour = formatHourDisplay(hour);
                
                return (
                  <div key={hour} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: activeView === 'Day' ? '80px 1fr' : '80px repeat(5, 1fr)', 
                    minHeight: '85px', 
                    borderBottom: '1px solid var(--border-glass)' 
                  }}>
                    {/* Time label */}
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right', paddingRight: '12px', paddingTop: '8px', fontWeight: '500' }}>
                      {displayHour}
                    </div>
                    
                    {/* Days columns */}
                    {(activeView === 'Day' ? [getDayInfo(selectedDate)] : getWeekDays(selectedDate)).map((dayObj, dayIndex) => {
                      const daySessions = filteredSessions.filter(s => {
                        const startHour = s.start_time.split(':')[0] + ':00';
                        return s.session_date === dayObj.dateStr && startHour === hour;
                      });
                      
                      return (
                        <div key={dayObj.dateStr} style={{ borderLeft: '1px solid var(--border-glass)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', background: dayIndex % 2 === 0 ? 'rgba(255,255,255,0.005)' : 'transparent' }}>
                          {daySessions.map(s => {
                            const tType = getTherapyType(s.therapy_type_id);
                            const isCompleted = s.status === 'completed';
                            const isCancelled = s.status === 'cancelled';
                            const isReplaced = s.status === 'replaced';
                            const isActive = selectedSessionId === s.id;
                            
                            return (
                              <div
                                key={s.id}
                                onClick={() => setSelectedSessionId(s.id)}
                                style={{
                                  background: isCancelled ? 'rgba(239, 68, 68, 0.08)' : 
                                              isReplaced ? 'rgba(245, 158, 11, 0.08)' : 
                                              isCompleted ? 'rgba(16, 185, 129, 0.08)' : `${tType?.color_tag}18`,
                                  border: `1px solid ${
                                    isActive ? 'var(--color-primary)' :
                                    isCancelled ? 'rgba(239, 68, 68, 0.3)' :
                                    isReplaced ? 'rgba(245, 158, 11, 0.3)' :
                                    isCompleted ? 'rgba(16, 185, 129, 0.3)' : tType?.color_tag
                                  }`,
                                  borderLeft: `4px solid ${
                                    isCancelled ? 'var(--color-danger)' :
                                    isReplaced ? 'var(--color-warning)' :
                                    isCompleted ? 'var(--color-success)' : tType?.color_tag
                                  }`,
                                  borderRadius: '4px',
                                  padding: '6px 8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  opacity: isCancelled || isReplaced ? 0.7 : 1,
                                  fontSize: '11px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                  handleMouseEnter(e, s);
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'none';
                                  e.currentTarget.style.boxShadow = 'none';
                                  setHoveredSession(null);
                                }}
                              >
                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {getChildName(s.child_id)}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                                  {s.start_time} - {s.end_time}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '9px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {getTrainerName(s.trainer_id)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      {/* Floating Side Drawer details overlay (opens from right) */}
      {selectedSession !== undefined && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '350px',
          background: 'var(--bg-surface-solid)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          borderLeft: '1.5px solid var(--border-accent)',
          zIndex: 9999,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto'
        }} className="animate-slide-in-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-info">Session ID: #{selectedSession.id}</span>
            <button onClick={() => setSelectedSessionId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '6px' }}>{getChildName(selectedSession.child_id)}</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Program: {getTherapyType(selectedSession.therapy_type_id)?.name}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Clock size={14} /> {selectedSession.session_date} | {selectedSession.start_time} - {selectedSession.end_time}
            </p>
          </div>

          {/* Attendance Check-in/out */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <h5 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>Session Attendance</h5>
            
            {selectedSession.status === 'cancelled' || selectedSession.status === 'replaced' ? (
              <div style={{ fontSize: '13px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> Attendance cannot be marked for cancelled/replaced slots.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>CHECK-IN</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: selectedSessionAttendance?.check_in_time ? 'var(--color-success)' : 'var(--text-muted)' }}>
                      {selectedSessionAttendance?.check_in_time || '--:--'}
                    </div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>CHECK-OUT</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: selectedSessionAttendance?.check_out_time ? 'var(--color-success)' : 'var(--text-muted)' }}>
                      {selectedSessionAttendance?.check_out_time || '--:--'}
                    </div>
                  </div>
                </div>

                {currentUser.role === 'trainer' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Attendance / behavior notes" 
                      value={attendanceNotes} 
                      onChange={e => setAttendanceNotes(e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={handleCheckIn}
                        className="btn btn-secondary" 
                        disabled={!!selectedSessionAttendance?.check_in_time}
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                      >
                        Check In
                      </button>
                      <button 
                        onClick={handleCheckOut}
                        className="btn btn-success" 
                        disabled={!selectedSessionAttendance?.check_in_time || !!selectedSessionAttendance?.check_out_time}
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                      >
                        Check Out
                      </button>
                    </div>
                  </div>
                )}

                {currentUser.role !== 'trainer' && selectedSessionAttendance?.notes && (
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)', 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-glass)',
                    lineHeight: '1.4'
                  }}>
                    <strong>Trainer Notes:</strong> {selectedSessionAttendance.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rescheduling & Cancellations */}
          {canEdit && selectedSession.status === 'scheduled' && (
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h5 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Reschedule or Cancel</h5>
              
              {showRescheduleForm ? (
                <form onSubmit={handleReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>New Date</label>
                    <input type="date" required value={rescheduleData.session_date} onChange={e => setRescheduleData({...rescheduleData, session_date: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Start Time</label>
                      <input type="time" required value={rescheduleData.start_time} onChange={e => setRescheduleData({...rescheduleData, start_time: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>End Time</label>
                      <input type="time" required value={rescheduleData.end_time} onChange={e => setRescheduleData({...rescheduleData, end_time: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setShowRescheduleForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px' }}>Confirm Replacement</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setShowRescheduleForm(true)}
                    className="btn btn-secondary" 
                    style={{ flex: 1, fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '4px' }}
                  >
                    <ArrowRight size={14} color="var(--color-warning)" /> Reschedule
                  </button>
                  <button 
                    onClick={() => {
                      cancelSession(selectedSession.id);
                      setSelectedSessionId(null);
                    }}
                    className="btn btn-secondary" 
                    style={{ flex: 1, fontSize: '12px', color: 'var(--color-danger)', display: 'flex', justifyContent: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Audit trace link */}
          {selectedSession.parent_session_id && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              fontSize: '11px',
              color: 'var(--color-warning)'
            }}>
              ℹ️ This is a replacement session. Links back to original session ID: #{selectedSession.parent_session_id}.
            </div>
          )}

          <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => setSelectedSessionId(null)}>Close panel</button>
        </div>
      )}

      {/* Quick Hover Tooltip */}
      {hoveredSession && (
        <div style={{
          position: 'absolute',
          top: `${tooltipPos.y + 12}px`,
          left: `${tooltipPos.x + 12}px`,
          background: 'var(--bg-surface-solid)',
          border: '1.5px solid var(--border-accent)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 99999,
          pointerEvents: 'none',
          maxWidth: '240px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '11px',
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Quick Preview</div>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', marginBottom: '2px' }}>{getChildName(hoveredSession.child_id)}</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Program:</span> {getTherapyType(hoveredSession.therapy_type_id)?.name}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Time:</span> {hoveredSession.start_time} - {hoveredSession.end_time}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Trainer:</span> {getTrainerName(hoveredSession.trainer_id)}
          </div>
          {hoveredSession.status !== 'scheduled' && (
            <div style={{ 
              marginTop: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 'bold',
              alignSelf: 'flex-start',
              background: hoveredSession.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: hoveredSession.status === 'completed' ? 'var(--color-success)' : 'var(--color-danger)',
              textTransform: 'uppercase'
            }}>
              {hoveredSession.status}
            </div>
          )}
        </div>
      )}

    </div>
    )}

    {/* Modal Add Session Form — rendered OUTSIDE overflow:hidden container to cover full viewport */}
    {showAddForm && (
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '80px 16px 40px',
        overflowY: 'auto',
      }}>
        <div className="glass-panel animate-scale-up modal-card" style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--bg-surface-solid)',
          padding: '28px',
          borderRadius: '14px',
          border: '1.5px solid var(--border-accent)',
          boxShadow: 'var(--shadow-xl)',
          flexShrink: 0,
        }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '18px' }}>Schedule New Session</h3>
          
          <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Select Child</label>
              <select value={newSessionData.child_id} onChange={e => setNewSessionData({...newSessionData, child_id: parseInt(e.target.value)})}>
                {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Select Trainer</label>
              <select value={newSessionData.trainer_id} onChange={e => setNewSessionData({...newSessionData, trainer_id: parseInt(e.target.value)})}>
                {users.filter(u => u.role === 'trainer').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Therapy Program Category</label>
              <select value={newSessionData.therapy_type_id} onChange={e => setNewSessionData({...newSessionData, therapy_type_id: parseInt(e.target.value)})}>
                {therapyTypes.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Date</label>
              <input type="date" required value={newSessionData.session_date} onChange={e => setNewSessionData({...newSessionData, session_date: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Start Time</label>
                <input type="time" required value={newSessionData.start_time} onChange={e => setNewSessionData({...newSessionData, start_time: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>End Time</label>
                <input type="time" required value={newSessionData.end_time} onChange={e => setNewSessionData({...newSessionData, end_time: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
              <input 
                type="checkbox" 
                id="recurring-check"
                checked={newSessionData.is_recurring} 
                onChange={e => setNewSessionData({...newSessionData, is_recurring: e.target.checked, recurrence_rule: e.target.checked ? 'WEEKLY' : 'NONE'})}
                style={{ width: 'auto', marginRight: '6px', cursor: 'pointer' }}
              />
              <label htmlFor="recurring-check" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>Repeat Session Weekly (Recurrence Schedule)</label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Booking</button>
            </div>
          </form>
        </div>
      </div>
    )}

    </>
  );
};
