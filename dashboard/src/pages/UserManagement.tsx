import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { UserCheck, UserX, Search, Phone, Mail, CheckCircle, AlertCircle, Users, ShieldAlert } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, currentUser, children, toggleUserStatus, updateUserDetails, createUserAccount } = useSimulator();
  const [activeTab, setActiveTab] = useState<'staff' | 'parents'>('staff');
  const [searchQuery, setSearchQuery] = useState('');

  // Create User States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createRole, setCreateRole] = useState<'admin' | 'principal' | 'trainer' | 'parent'>('trainer');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRelationship, setCreateRelationship] = useState<'father' | 'mother' | 'guardian'>('father');
  const [createChildId, setCreateChildId] = useState<number>(children[0]?.id || 1);

  // Editing User States
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const handleStartEdit = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
  };

  // Filter users based on active category tab and search query
  const filteredUsers = users.filter(u => {
    const matchesTab = activeTab === 'staff' ? u.role !== 'parent' : u.role === 'parent';
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="badge badge-danger">Super Admin</span>;
      case 'admin':
        return <span className="badge badge-primary">Admin</span>;
      case 'principal':
        return <span className="badge badge-warning">Principal</span>;
      case 'trainer':
        return <span className="badge badge-success">Trainer</span>;
      case 'parent':
        return <span className="badge badge-soft">Parent</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="section-header">
        <div className="section-accent-bar" />
        <h2 className="section-title">User Account Management</h2>
      </div>

      <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '800px' }}>
        Manage platform access credentials, view profile cards, and toggle authentication status for all system participants.
      </p>

      {/* Tabs Selector & Search Control Panel */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '20px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-solid)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => { setActiveTab('staff'); setSearchQuery(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '13px',
              fontWeight: activeTab === 'staff' ? '700' : '500',
              color: activeTab === 'staff' ? '#fff' : 'var(--text-secondary)',
              background: activeTab === 'staff' ? 'var(--color-primary)' : 'transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            <ShieldAlert size={14} />
            Staff Members ({users.filter(u => u.role !== 'parent').length})
          </button>
          <button
            onClick={() => { setActiveTab('parents'); setSearchQuery(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '13px',
              fontWeight: activeTab === 'parents' ? '700' : '500',
              color: activeTab === 'parents' ? '#fff' : 'var(--text-secondary)',
              background: activeTab === 'parents' ? 'var(--color-primary)' : 'transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Users size={14} />
            Parent Accounts ({users.filter(u => u.role === 'parent').length})
          </button>
        </div>

        {/* Search & Create Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setCreateRole('trainer');
              setCreateName('');
              setCreateEmail('');
              setCreatePhone('');
              setCreateUsername('');
              setCreatePassword('');
              setCreateRelationship('father');
              setCreateChildId(children[0]?.id || 1);
              setShowCreateForm(true);
            }}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            Create Account
          </button>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'staff' ? "Search staff..." : "Search parents..."}
              style={{ paddingLeft: '38px', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No accounts found matching your query in this category.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Access Role</th>
                <th>Contact Details</th>
                <th>Security State</th>
                <th style={{ textAlign: 'right' }}>Action controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((member) => {
                const isMe = member.id === currentUser.id;
                const isSuspended = member.status === 'suspended';

                return (
                  <tr key={member.id} style={{ opacity: isSuspended ? 0.75 : 1 }}>
                    <td>
                      <div 
                        onClick={() => handleStartEdit(member)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        title="Click to edit user profile details"
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isSuspended 
                            ? 'rgba(208, 32, 64, 0.15)' 
                            : 'linear-gradient(135deg, var(--brand-crimson) 0%, var(--brand-navy) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: isSuspended ? 'var(--color-danger)' : '#fff',
                          fontSize: '14px',
                          border: isSuspended ? '1.5px solid var(--color-danger)' : 'none',
                          transition: 'transform var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                          {member.name[0]}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span 
                              style={{ fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px dashed transparent', transition: 'all var(--transition-fast)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-primary)';
                                e.currentTarget.style.borderBottomColor = 'var(--color-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.borderBottomColor = 'transparent';
                              }}
                            >
                              {member.name}
                            </span>
                            {isMe && <span className="badge badge-accent" style={{ fontSize: '9px', padding: '1px 5px' }}>You</span>}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{member.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(member.role)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                          <Mail size={12} color="var(--text-muted)" /> {member.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                          <Phone size={12} /> {member.phone}
                        </span>
                      </div>
                    </td>
                    <td>
                      {isSuspended ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={10} /> Suspended
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} /> Active
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleUserStatus(member.id); }}
                        disabled={isMe} // Users cannot suspend themselves
                        className={`btn ${isSuspended ? 'btn-success' : 'btn-danger'}`}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          borderRadius: 'var(--radius-sm)',
                          opacity: isMe ? 0.4 : 1,
                          cursor: isMe ? 'not-allowed' : 'pointer'
                        }}
                        title={isMe ? 'You cannot suspend your own account' : isSuspended ? 'Restore account access' : 'Block user'}
                      >
                        {isSuspended ? (
                          <>
                            <UserCheck size={14} /> Restore Access
                          </>
                        ) : (
                          <>
                            <UserX size={14} /> Suspend / Block
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Details Overlay Modal Dialog */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }}>
          <div className="glass-panel animate-scale-up modal-card" style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-surface-solid)',
            padding: '28px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-accent)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Edit {editingUser.role === 'parent' ? 'Parent' : 'Staff'} Profile Details
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateUserDetails(editingUser.id, { name: editName, email: editEmail, phone: editPhone });
              setEditingUser(null);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Phone Number</label>
                <input 
                  type="text" 
                  required 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Account Overlay Modal Dialog */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }}>
          <div className="glass-panel animate-scale-up modal-card" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            background: 'var(--bg-surface-solid)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Create New Account</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              createUserAccount(
                { name: createName, email: createEmail, phone: createPhone, role: createRole, username: createUsername, password: createPassword },
                createRole === 'parent' ? { relationship: createRelationship, childId: createChildId } : undefined
              );
              setShowCreateForm(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Account Type</label>
                <select 
                  value={createRole} 
                  onChange={(e) => setCreateRole(e.target.value as any)}
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                >
                  <option value="trainer">Trainer</option>
                  <option value="principal">Principal</option>
                  <option value="admin">Admin</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={createName} 
                  onChange={(e) => setCreateName(e.target.value)} 
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={createEmail} 
                  onChange={(e) => setCreateEmail(e.target.value)} 
                  placeholder="name@infinityminds.lk"
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Phone Number</label>
                <input 
                  type="text" 
                  required 
                  value={createPhone} 
                  onChange={(e) => setCreatePhone(e.target.value)} 
                  placeholder="e.g. 0771234567"
                  style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Username</label>
                  <input 
                    type="text" 
                    required 
                    value={createUsername} 
                    onChange={(e) => setCreateUsername(e.target.value)} 
                    placeholder="e.g. johndoe"
                    style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Password</label>
                  <input 
                    type="password" 
                    required 
                    value={createPassword} 
                    onChange={(e) => setCreatePassword(e.target.value)} 
                    placeholder="••••••••"
                    style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {createRole === 'parent' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Relationship</label>
                      <select 
                        value={createRelationship} 
                        onChange={(e) => setCreateRelationship(e.target.value as any)}
                        style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                      >
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="guardian">Guardian</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Link to Student</label>
                      <select 
                        value={createChildId} 
                        onChange={(e) => setCreateChildId(parseInt(e.target.value))}
                        style={{ width: '100%', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px' }}
                      >
                        {children.map(c => (
                          <option key={c.id} value={c.id}>{c.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
