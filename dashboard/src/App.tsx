import React, { useState, useEffect } from 'react';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Mail, MessageSquare, Send, PlusCircle, Search, Users, CheckSquare, Square, X, Lock } from 'lucide-react';
import { DashboardHome } from './pages/DashboardHome';
import { ChildrenList } from './pages/ChildrenList';
import { Scheduler } from './pages/Scheduler';
import { Reports } from './pages/Reports';
import { AcademicCalendar } from './pages/AcademicCalendar';
import { Todos } from './pages/Todos';
import { PDFViewer } from './pages/PDFViewer';
import { Login } from './pages/Login';
import { UserManagement } from './pages/UserManagement';
import { AttendancePage } from './pages/Attendance';
import { StudentStatusPage } from './pages/StudentStatusPage';

const DashboardContent: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingPdf, setViewingPdf] = useState<{ type: 'progress' | 'behavior'; id: number } | null>(null);
  const { 
    currentUser, 
    isLoggedIn,
    users,
    directMessages,
    messageGroups,
    sendMessage,
    createMessageGroup,
    markMessagesAsRead,
    showMessagesModal,
    setShowMessagesModal,
    activeChat,
    setActiveChat
  } = useSimulator();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ima-sidebar-collapsed') === 'true';
  });

  // Local messaging states
  const [typedMessage, setTypedMessage] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  
  // Group creation states
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupParticipants, setSelectedGroupParticipants] = useState<number[]>([]);
  const [hideGroupFromOthers, setHideGroupFromOthers] = useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directMessages, activeChat, showMessagesModal]);

  useEffect(() => {
    localStorage.setItem('ima-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLoggedIn) {
    return <Login theme={theme} toggleTheme={toggleTheme} />;
  }

  // Guard routing for specific tabs if active role changes to unauthorized
  const getSanitizedTab = () => {
    const adminRolesOnly = ['super_admin', 'admin'];
    const staffRolesOnly = ['super_admin', 'admin', 'principal', 'trainer'];

    if (activeTab === 'user_management' && !adminRolesOnly.includes(currentUser.role)) return 'dashboard';
    if (activeTab === 'todos' && !staffRolesOnly.includes(currentUser.role)) return 'dashboard';
    if (activeTab === 'reports_form' && !staffRolesOnly.includes(currentUser.role)) return 'dashboard';
    if (activeTab === 'attendance' && currentUser.role === 'parent') return 'dashboard';
    
    return activeTab;
  };

  const currentTab = getSanitizedTab();

  const renderActivePage = () => {
    if (viewingPdf) {
      return <PDFViewer pdfData={viewingPdf} onBack={() => setViewingPdf(null)} />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'student_status':
        return <StudentStatusPage onViewPdf={setViewingPdf} />;
      case 'children':
        return <ChildrenList />;
      case 'scheduler':
        return <Scheduler />;
      case 'reports_form':
        return <Reports onViewPdf={setViewingPdf} />;
      case 'academic_calendar':
        return <AcademicCalendar />;
      case 'todos':
        return <Todos />;
      case 'user_management':
        return <UserManagement />;
      case 'attendance':
        return <AttendancePage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar Navigation */}
      {!viewingPdf && (
        <Sidebar 
          activeTab={currentTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }} 
          theme={theme} 
          isOpen={sidebarOpen}
          isMobile={isMobile}
          isCollapsed={sidebarCollapsed}
        />
      )}

      {/* Backdrop overlay for mobile sidebar */}
      {isMobile && sidebarOpen && !viewingPdf && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}
      
      {/* Main Container */}
      <div style={{ 
        flex: 1, 
        marginLeft: viewingPdf ? '0' : (isMobile ? '0' : (sidebarCollapsed ? '0' : '260px')), 
        paddingTop: viewingPdf ? '20px' : '90px', 
        paddingLeft: isMobile ? '16px' : '32px', 
        paddingRight: isMobile ? '16px' : '32px', 
        paddingBottom: '40px',
        transition: 'margin var(--transition-normal), padding var(--transition-normal)'
      }}>
        {/* Top Header */}
        {!viewingPdf && (
          <Header 
            activeTab={currentTab} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isMobile={isMobile}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          />
        )}
        
        {/* Active Page View */}
        <main style={{ marginTop: viewingPdf ? '0' : '20px', width: '100%' }}>
          {renderActivePage()}
        </main>
      </div>

      {showMessagesModal && (
        <>
          <div 
            onClick={() => setShowMessagesModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              transition: 'all 0.3s ease'
            }}
          />
          
          <div className="glass-panel animate-fade-in" style={{
            position: 'fixed',
            top: '5%',
            left: '10%',
            right: '10%',
            bottom: '5%',
            zIndex: 1001,
            display: 'flex',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
            overflow: 'hidden',
            background: 'var(--bg-surface)'
          }}>
            
            {/* Left Sidebar Panel: Chat contacts and groups */}
            <div style={{
              width: '320px',
              borderRight: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface-solid)',
              height: '100%'
            }}>
              {/* Header */}
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={20} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Message Portal</h3>
                </div>
                <button 
                  onClick={() => setShowMessagesModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search User bar */}
              <div style={{ padding: '12px 16px', position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '26px', top: '22px' }} />
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={searchUserQuery}
                  onChange={e => setSearchUserQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Group chat controls */}
              {['super_admin', 'admin'].includes(currentUser.role) && (
                <div style={{ padding: '0 16px 10px 16px' }}>
                  <button 
                    onClick={() => {
                      setShowCreateGroup(true);
                      setNewGroupName('');
                      setSelectedGroupParticipants([]);
                      setHideGroupFromOthers(false);
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', fontSize: '12px' }}
                  >
                    <PlusCircle size={14} /> Create Message Group
                  </button>
                </div>
              )}

              {/* Scrollable Chats List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px 8px' }}>
                {/* 1. Group list */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', padding: '6px 12px' }}>Group Channels</span>
                  
                  {messageGroups
                    .filter(g => !g.hide_from_non_participants || g.participant_ids.includes(currentUser.id))
                    .map(g => {
                      const isParticipant = g.participant_ids.includes(currentUser.id);
                      const groupMessages = directMessages.filter(m => m.group_id === g.id);
                      const unreadCount = groupMessages.filter(m => isParticipant && !m.is_read_by_ids.includes(currentUser.id)).length;
                      const isActive = activeChat?.type === 'group' && activeChat.id === g.id;
                      
                      return (
                        <div 
                          key={`group-${g.id}`}
                          onClick={() => {
                            if (isParticipant) {
                              setActiveChat({ type: 'group', id: g.id });
                              markMessagesAsRead(undefined, g.id);
                            }
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: isParticipant ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                            border: isActive ? '1px solid rgba(139, 92, 246, 0.15)' : '1px solid transparent',
                            opacity: isParticipant ? 1 : 0.5,
                            transition: 'all 0.2s ease',
                            marginBottom: '4px'
                          }}
                          onMouseEnter={(e) => { if (isParticipant && !isActive) e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
                          onMouseLeave={(e) => { if (isParticipant && !isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Users size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {g.name}
                                {g.hide_from_non_participants && (
                                   <span title="Anonymous Members Group" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                     <Lock size={12} color="var(--color-primary)" style={{ marginLeft: '2px' }} />
                                   </span>
                                 )}
                              </div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                {g.participant_ids.length} members {!isParticipant && '(Read-only)'}
                              </span>
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <span style={{ background: 'var(--color-primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* 2. Direct Messages list */}
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', padding: '6px 12px' }}>Direct Conversations</span>
                  
                  {users
                    .filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(searchUserQuery.toLowerCase()))
                    .map(u => {
                      const userMessages = directMessages.filter(m => m.sender_id === u.id && m.recipient_id === currentUser.id);
                      const unreadCount = userMessages.filter(m => !m.is_read_by_ids.includes(currentUser.id)).length;
                      const isActive = activeChat?.type === 'user' && activeChat.id === u.id;
                      
                      return (
                        <div 
                          key={`user-${u.id}`}
                          onClick={() => {
                            setActiveChat({ type: 'user', id: u.id });
                            markMessagesAsRead(u.id, undefined);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                            border: isActive ? '1px solid rgba(139, 92, 246, 0.15)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            marginBottom: '4px'
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {u.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <span style={{ background: 'var(--color-primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Chat panel */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface)',
              height: '100%'
            }}>
              {activeChat === null ? (
                // ─── BLANK CHAT VIEW ───
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={48} color="var(--border-accent)" />
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', margin: '0 0 6px 0' }}>Start a Conversation</h4>
                    <p style={{ fontSize: '13px', maxWidth: '320px', margin: 0, lineHeight: '1.5' }}>
                      Select a team member or a group channel from the list on the left to start sending messages.
                    </p>
                  </div>
                </div>
              ) : (
                // ─── ACTIVE CHAT VIEW ───
                (() => {
                  const chatTitle = activeChat.type === 'user'
                    ? (users.find(u => u.id === activeChat.id)?.name || 'Direct Message')
                    : (messageGroups.find(g => g.id === activeChat.id)?.name || 'Group Chat');
                  
                  const activeGroup = activeChat.type === 'group' ? messageGroups.find(g => g.id === activeChat.id) : null;
                  const activeUser = activeChat.type === 'user' ? users.find(u => u.id === activeChat.id) : null;
                  
                  // Filter chat messages
                  const chatMessages = directMessages.filter(m => {
                    if (activeChat.type === 'user') {
                      return (m.sender_id === currentUser.id && m.recipient_id === activeChat.id) ||
                             (m.sender_id === activeChat.id && m.recipient_id === currentUser.id);
                    } else {
                      return m.group_id === activeChat.id;
                    }
                  });

                  return (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Chat Header */}
                      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-solid)' }}>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                            {chatTitle}
                          </h4>
                          {activeGroup && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Participants: {
                                (!['super_admin', 'admin'].includes(currentUser.role) && activeGroup.hide_from_non_participants)
                                  ? 'Hidden (Anonymous Channel)'
                                  : activeGroup.participant_ids.map(pid => users.find(u => u.id === pid)?.name).filter(Boolean).join(', ')
                              }
                            </span>
                          )}
                          {activeUser && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                              Role: {activeUser.role.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chat Messages Log */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {chatMessages.map(m => {
                          const isMe = m.sender_id === currentUser.id;
                          const senderName = users.find(u => u.id === m.sender_id)?.name || 'Unknown';
                          const displaySenderName = (!['super_admin', 'admin'].includes(currentUser.role) && activeGroup?.hide_from_non_participants)
                            ? 'Group Member'
                            : senderName;
                          
                          return (
                            <div 
                              key={m.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '70%'
                              }}
                            >
                              {!isMe && activeChat.type === 'group' && (
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '2px', marginLeft: '4px' }}>
                                  {displaySenderName}
                                </span>
                              )}
                              <div style={{
                                padding: '10px 14px',
                                borderRadius: '12px',
                                borderTopRightRadius: isMe ? '2px' : '12px',
                                borderTopLeftRadius: isMe ? '12px' : '2px',
                                background: isMe ? 'var(--color-primary)' : 'var(--bg-surface-solid)',
                                color: isMe ? '#fff' : 'var(--text-primary)',
                                border: isMe ? 'none' : '1px solid var(--border-glass)',
                                fontSize: '13px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                {m.message_text}
                              </div>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', marginRight: isMe ? '4px' : 0, marginLeft: isMe ? 0 : '4px' }}>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}

                        {chatMessages.length === 0 && (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px' }}>
                            No messages in this chat yet.
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Input Bar */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (typedMessage.trim()) {
                            sendMessage(
                              typedMessage.trim(),
                              activeChat.type === 'user' ? activeChat.id : undefined,
                              activeChat.type === 'group' ? activeChat.id : undefined
                            );
                            setTypedMessage('');
                          }
                        }}
                        style={{ padding: '16px 24px', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface-solid)', display: 'flex', gap: '12px', alignItems: 'center' }}
                      >
                        <input 
                          type="text"
                          placeholder="Type your message here..."
                          value={typedMessage}
                          onChange={e => setTypedMessage(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            fontSize: '13px',
                            borderRadius: '24px',
                            border: '1px solid var(--border-glass)',
                            background: 'var(--bg-surface-hover)',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <button 
                          type="submit"
                          className="btn btn-primary"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          title="Send Message"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Create Group Modal Overlay */}
            {showCreateGroup && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 1002,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}>
                <div className="glass-panel animate-fade-in" style={{
                  width: '400px',
                  background: 'var(--bg-surface)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Create Message Group</h4>
                    <button 
                      onClick={() => setShowCreateGroup(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Group Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Clinical Discussion"
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '13px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-glass)',
                        background: 'var(--bg-surface-hover)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Participants</label>
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      padding: '8px',
                      background: 'var(--bg-surface-solid)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      {users
                        .filter(u => u.id !== currentUser.id)
                        .map(u => {
                          const isSelected = selectedGroupParticipants.includes(u.id);
                          return (
                            <div 
                              key={u.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedGroupParticipants(selectedGroupParticipants.filter(id => id !== u.id));
                                } else {
                                  setSelectedGroupParticipants([...selectedGroupParticipants, u.id]);
                                }
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {isSelected ? <CheckSquare size={16} color="var(--color-primary)" /> : <Square size={16} color="var(--text-muted)" />}
                              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{u.name} ({u.role.replace('_', ' ')})</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Hide from non-participants toggle option */}
                  <div 
                    onClick={() => setHideGroupFromOthers(!hideGroupFromOthers)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}
                  >
                    {hideGroupFromOthers ? <CheckSquare size={16} color="var(--color-primary)" /> : <Square size={16} color="var(--text-muted)" />}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Hide member identities from regular members</span>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>
                        If checked, regular group members cannot see who else is in this group (only Admins view member names).
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setShowCreateGroup(false)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (newGroupName.trim()) {
                          createMessageGroup(newGroupName.trim(), selectedGroupParticipants, hideGroupFromOthers);
                          setShowCreateGroup(false);
                        }
                      }}
                      className="btn btn-primary"
                      disabled={!newGroupName.trim()}
                      style={{ padding: '8px 18px', fontSize: '12px' }}
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
};

function App() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('ima-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ima-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <SimulatorProvider>
      <DashboardContent theme={theme} toggleTheme={toggleTheme} />
    </SimulatorProvider>
  );
}

export default App;
