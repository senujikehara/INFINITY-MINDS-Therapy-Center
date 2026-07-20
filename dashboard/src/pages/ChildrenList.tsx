import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import type { ChildHealthInfo } from '../context/SimulatorContext';
import { ShieldAlert, Heart, Plus, Edit2, Check, X } from 'lucide-react';

export const ChildrenList: React.FC = () => {
  const { 
    currentUser, 
    children, 
    sensitiveData, 
    healthInfo, 
    parentLinks, 
    registerChild, 
    updateHealth,
    toggleChildStatus,
    updateChildDetails,
    sessions,
    attendanceRecords,
    therapyTypes
  } = useSimulator();

  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const [detailsTab, setDetailsTab] = useState<'identity' | 'medical' | 'profile' | 'family' | 'consent' | 'attendance' | 'documents'>('medical');

  // Edit states for other tabs
  const [editingFamily, setEditingFamily] = useState(false);
  const [familyEditData, setFamilyEditData] = useState<any>({});

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [identityEditData, setIdentityEditData] = useState<any>({});

  const [editingConsent, setEditingConsent] = useState(false);
  const [consentEditData, setConsentEditData] = useState<any>({});


  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Registration form state
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({
    full_name: '',
    dob: '',
    gender: 'male' as const,
    enrollment_date: new Date().toISOString().split('T')[0],
    branch_id: 1,
    therapy_type_id: 1,
    ic_number: '',
    guardian_ic: '',
    home_address: '',
    allergies: '',
    medical_conditions: '',
    special_needs: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    consent_pics_parents: true,
    consent_pics_social_media: false,
    consent_celebrations: true,
    consent_food: true,
    father_name: '',
    father_phone: '',
    father_occupation: '',
    mother_name: '',
    mother_phone: '',
    mother_occupation: '',
    siblings_details: '',
    primary_caregiver: '',
    formal_diagnosis: false,
    formal_diagnosis_details: '',
    other_medical_conditions: false,
    other_medical_conditions_details: '',
    food_allergies: false,
    food_allergies_details: '',
    past_schools: '',
    interests: [] as string[],
    other_interests: '',
    challenges: [] as string[],
    challenges_other: '',
    challenges_triggers: '',
    challenges_comments: '',
    is_toilet_trained: true,
    can_feed_self: true,
    can_dress_self: true,
    can_request_things: true,
    can_understand_instructions: true,
    session_type: '1:1 Early Intervention Program',
    sessions_per_week: 3,
    focus_areas: [] as string[],
    focus_areas_other: '',
    id_document_paths: [] as string[]
  });

  // Health edit form state
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthEditData, setHealthEditData] = useState<Partial<ChildHealthInfo>>({});

  // 1. Role-based child filter
  const getVisibleChildren = () => {
    if (currentUser.role === 'parent') {
      const myLinks = parentLinks.filter(l => l.parent_user_id === currentUser.id);
      return children.filter(c => myLinks.some(l => l.child_id === c.id));
    }
    return children;
  };

  const visibleChildren = getVisibleChildren();

  // Audit triggers for viewing sensitive data
  const handleViewSensitive = (childId: number) => {
    setActiveChildId(childId);
    setDetailsTab('identity');
    setEditingHealth(false);
    setEditingFamily(false);
    setEditingIdentity(false);
    setEditingConsent(false);

    const child = children.find(c => c.id === childId);
    if (child) {
      setFamilyEditData({
        father_name: child.father_name || '',
        father_phone: child.father_phone || '',
        father_occupation: child.father_occupation || '',
        mother_name: child.mother_name || '',
        mother_phone: child.mother_phone || '',
        mother_occupation: child.mother_occupation || '',
        siblings_details: child.siblings_details || '',
        primary_caregiver: child.primary_caregiver || 'Parents',
      });
      setConsentEditData({
        consent_pics_parents: child.consent_pics_parents,
        consent_pics_social_media: child.consent_pics_social_media,
        consent_celebrations: child.consent_celebrations,
        consent_food: child.consent_food,
      });
    }
    const health = healthInfo.find(h => h.child_id === childId);
    if (health) {
      setHealthEditData(health);
    }
    const sData = sensitiveData.find(s => s.child_id === childId);
    if (sData) {
      setIdentityEditData({
        ic_number: sData.ic_number || '',
        guardian_ic: sData.guardian_ic || '',
        home_address: sData.home_address || '',
      });
    }
  };

  const handleViewHealth = (childId: number) => {
    setActiveChildId(childId);
    setDetailsTab('medical');
    setEditingHealth(false);
    setEditingFamily(false);
    setEditingIdentity(false);
    setEditingConsent(false);
    
    const child = children.find(c => c.id === childId);
    if (child) {
      setFamilyEditData({
        father_name: child.father_name || '',
        father_phone: child.father_phone || '',
        father_occupation: child.father_occupation || '',
        mother_name: child.mother_name || '',
        mother_phone: child.mother_phone || '',
        mother_occupation: child.mother_occupation || '',
        siblings_details: child.siblings_details || '',
        primary_caregiver: child.primary_caregiver || 'Parents',
      });
      setConsentEditData({
        consent_pics_parents: child.consent_pics_parents,
        consent_pics_social_media: child.consent_pics_social_media,
        consent_celebrations: child.consent_celebrations,
        consent_food: child.consent_food,
      });
    }
    const health = healthInfo.find(h => h.child_id === childId);
    if (health) {
      setHealthEditData(health);
    }
    const sData = sensitiveData.find(s => s.child_id === childId);
    if (sData) {
      setIdentityEditData({
        ic_number: sData.ic_number || '',
        guardian_ic: sData.guardian_ic || '',
        home_address: sData.home_address || '',
      });
    }
  };

  const handleSaveHealth = (childId: number) => {
    updateHealth(childId, healthEditData);
    setEditingHealth(false);
  };

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    registerChild(regData);
    setShowRegForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset form
    setRegData({
      full_name: '',
      dob: '',
      gender: 'male',
      enrollment_date: new Date().toISOString().split('T')[0],
      branch_id: 1,
      therapy_type_id: 1,
      ic_number: '',
      guardian_ic: '',
      home_address: '',
      allergies: '',
      medical_conditions: '',
      special_needs: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      consent_pics_parents: true,
      consent_pics_social_media: false,
      consent_celebrations: true,
      consent_food: true,
      father_name: '',
      father_phone: '',
      father_occupation: '',
      mother_name: '',
      mother_phone: '',
      mother_occupation: '',
      siblings_details: '',
      primary_caregiver: '',
      formal_diagnosis: false,
      formal_diagnosis_details: '',
      other_medical_conditions: false,
      other_medical_conditions_details: '',
      food_allergies: false,
      food_allergies_details: '',
      past_schools: '',
      interests: [],
      other_interests: '',
      challenges: [],
      challenges_other: '',
      challenges_triggers: '',
      challenges_comments: '',
      is_toilet_trained: true,
      can_feed_self: true,
      can_dress_self: true,
      can_request_things: true,
      can_understand_instructions: true,
      session_type: '1:1 Early Intervention Program',
      sessions_per_week: 3,
      focus_areas: [],
      focus_areas_other: '',
      id_document_paths: []
    });
  };

  const canManageSensitive = currentUser.role === 'super_admin' || currentUser.role === 'admin';
  const canEditHealth = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  return (
    <>
      <div className="animate-fade-in" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '30px' 
      }}>
      
      {/* Left Pane - Children Directory */}
      {activeChildId === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Enrolled Students</h3>
          
          {canManageSensitive && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowRegForm(true)}
              style={{ padding: '8px 14px' }}
            >
              <Plus size={16} /> Register Child
            </button>
          )}
        </div>

        {/* Children Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visibleChildren.map(c => {
            const isActive = activeChildId === c.id;
            return (
              <div 
                key={c.id} 
                className="glass-panel" 
                style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                  background: isActive ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-surface)'
                }}
              >
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>{c.full_name}</h4>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>DOB: {c.dob}</span>
                    <span>•</span>
                    <span>Gender: {c.gender}</span>
                    <span>•</span>
                    <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>{c.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {canManageSensitive ? (
                    <button 
                      onClick={() => handleViewHealth(c.id)}
                      className="btn btn-secondary" 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: 0 
                      }}
                      title="Edit Student Info"
                    >
                      <Edit2 size={16} color="var(--color-primary)" />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleViewHealth(c.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Heart size={14} color="var(--color-success)" /> Health Record
                      </button>

                      <button 
                        disabled
                        title="Only Admins are authorized to view IC documents"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', opacity: 0.3, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ShieldAlert size={14} /> Identity Data
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
      )}

      {/* Right Pane - Details Drawer */}
      {activeChildId !== null && (
        <div style={{ width: '100%' }}>
          <button 
            type="button"
            onClick={() => setActiveChildId(null)} 
            className="btn btn-secondary" 
            style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
          >
            ← Back to Students List
          </button>
          <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            {/* Child Header Card */}
            {(() => {
              const child = children.find(c => c.id === activeChildId);
              if (!child) return null;
              return (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {child.full_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{child.full_name}</h4>
                        <span style={{
                          padding: '2px 8px',
                          fontSize: '10px',
                          borderRadius: '12px',
                          background: child.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: child.status === 'active' ? '#10B981' : '#EF4444',
                          border: child.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          fontWeight: '600'
                        }}>
                          ● {child.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>DOB: {child.dob} • Gender: {child.gender}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {['super_admin', 'admin'].includes(currentUser.role) && (
                      <button 
                        onClick={() => toggleChildStatus(child.id)}
                        className={`btn ${child.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                      >
                        {child.status === 'active' ? 'Deactivate Student' : 'Activate Student'}
                      </button>
                    )}
                    <button 
                      onClick={() => setActiveChildId(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%'
                      }}
                      title="Close details"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '16px', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { id: 'medical', label: 'Medical' },
                { id: 'family', label: 'Family', disabled: currentUser.role === 'trainer' },
                { id: 'identity', label: 'Identity', disabled: !canManageSensitive },
                { id: 'consent', label: 'Consent', disabled: currentUser.role === 'trainer' },
                { id: 'attendance', label: 'Attendance', disabled: currentUser.role === 'super_admin' || !canManageSensitive },
                { id: 'documents', label: 'Documents' }
              ].map(t => {
                if (t.disabled) return null;
                const isActive = detailsTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (t.id === 'identity' && activeChildId !== null) {
                        handleViewSensitive(activeChildId);
                      } else {
                        setDetailsTab(t.id as any);
                      }
                    }}
                    style={{
                      background: isActive ? 'var(--color-primary)' : 'transparent',
                      border: 'none',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: isActive ? 'bold' : 'normal',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: MEDICAL */}
            {detailsTab === 'medical' && (() => {
              const child = children.find(c => c.id === activeChildId);
              const health = healthInfo.find(h => h.child_id === activeChildId);
              if (!child) return null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Medical & Background Details</h5>
                    {canEditHealth && !editingHealth && (
                      <button 
                        onClick={() => {
                          setHealthEditData(health || {
                            child_id: child.id,
                            allergies: '',
                            medical_conditions: '',
                            special_needs: '',
                            emergency_contact_name: '',
                            emergency_contact_phone: '',
                            notes: ''
                          });
                          setEditingHealth(true);
                        }}
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', gap: '4px' }}
                      >
                        <Edit2 size={11} /> Edit Medical
                      </button>
                    )}
                  </div>

                  {editingHealth ? (
                    // Health edit form
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Allergies</label>
                        <input 
                          type="text" 
                          value={healthEditData.allergies || ''} 
                          onChange={e => setHealthEditData({...healthEditData, allergies: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Medical Conditions</label>
                        <input 
                          type="text" 
                          value={healthEditData.medical_conditions || ''} 
                          onChange={e => setHealthEditData({...healthEditData, medical_conditions: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Special Needs</label>
                        <textarea 
                          rows={3}
                          value={healthEditData.special_needs || ''} 
                          onChange={e => setHealthEditData({...healthEditData, special_needs: e.target.value})} 
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Emergency Contact Name</label>
                          <input 
                            type="text" 
                            value={healthEditData.emergency_contact_name || ''} 
                            onChange={e => setHealthEditData({...healthEditData, emergency_contact_name: e.target.value})} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Emergency Phone</label>
                          <input 
                            type="text" 
                            value={healthEditData.emergency_contact_phone || ''} 
                            onChange={e => setHealthEditData({...healthEditData, emergency_contact_phone: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={() => setEditingHealth(false)}>Cancel</button>
                        <button className="btn btn-success" onClick={() => handleSaveHealth(activeChildId)}>
                          <Check size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Read display
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Allergies</span>
                        <span style={{ fontSize: '13px', color: child.food_allergies ? 'var(--color-danger)' : 'var(--text-primary)', fontWeight: '600' }}>
                          {child.food_allergies ? `Yes: ${child.food_allergies_details}` : (health?.allergies || 'No known allergies')}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Formal Diagnosis</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {child.formal_diagnosis ? `Yes: ${child.formal_diagnosis_details}` : 'No formal diagnosis'}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Other Medical Conditions</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {child.other_medical_conditions ? `Yes: ${child.other_medical_conditions_details}` : (health?.medical_conditions || 'None')}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Special Needs & Accommodations</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                          {health?.special_needs || 'No custom special needs registered.'}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Learning Centers & Schooling History</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                          {child.past_schools || 'No schooling history registered.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB CONTENT: FAMILY */}
            {detailsTab === 'family' && (() => {
              const child = children.find(c => c.id === activeChildId);
              if (!child) return null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Family & Caregiver Support</h5>
                    {canEditHealth && !editingFamily && (
                      <button 
                        onClick={() => setEditingFamily(true)}
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', gap: '4px' }}
                      >
                        <Edit2 size={11} /> Edit Family
                      </button>
                    )}
                  </div>
                  
                  {editingFamily ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Father's Details</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Father's Name</label>
                            <input type="text" value={familyEditData.father_name || ''} onChange={e => setFamilyEditData({...familyEditData, father_name: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Father's Phone</label>
                            <input type="text" value={familyEditData.father_phone || ''} onChange={e => setFamilyEditData({...familyEditData, father_phone: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Father's Occupation</label>
                            <input type="text" value={familyEditData.father_occupation || ''} onChange={e => setFamilyEditData({...familyEditData, father_occupation: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Mother's Details</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Mother's Name</label>
                            <input type="text" value={familyEditData.mother_name || ''} onChange={e => setFamilyEditData({...familyEditData, mother_name: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Mother's Phone</label>
                            <input type="text" value={familyEditData.mother_phone || ''} onChange={e => setFamilyEditData({...familyEditData, mother_phone: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Mother's Occupation</label>
                            <input type="text" value={familyEditData.mother_occupation || ''} onChange={e => setFamilyEditData({...familyEditData, mother_occupation: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sibling Details</label>
                        <input type="text" value={familyEditData.siblings_details || ''} onChange={e => setFamilyEditData({...familyEditData, siblings_details: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Primary Caregiver</label>
                        <input type="text" value={familyEditData.primary_caregiver || ''} onChange={e => setFamilyEditData({...familyEditData, primary_caregiver: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={() => setEditingFamily(false)}>Cancel</button>
                        <button className="btn btn-success" onClick={() => {
                          updateChildDetails(activeChildId, familyEditData);
                          setEditingFamily(false);
                        }}>
                          <Check size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Father details */}
                      <div style={{ padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Father's Details</span>
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div><strong>Name:</strong> {child.father_name || 'N/A'}</div>
                          <div><strong>Phone:</strong> {child.father_phone || 'N/A'}</div>
                          <div><strong>Occupation:</strong> {child.father_occupation || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Mother details */}
                      <div style={{ padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Mother's Details</span>
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div><strong>Name:</strong> {child.mother_name || 'N/A'}</div>
                          <div><strong>Phone:</strong> {child.mother_phone || 'N/A'}</div>
                          <div><strong>Occupation:</strong> {child.mother_occupation || 'N/A'}</div>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Sibling Details</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{child.siblings_details || 'No siblings registered.'}</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Primary Caregiver at Home</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{child.primary_caregiver || 'Parents'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB CONTENT: IDENTITY */}
            {detailsTab === 'identity' && (() => {
              const data = sensitiveData.find(s => s.child_id === activeChildId);
              if (!data) return <p>No data found.</p>;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert color="var(--color-danger)" size={16} />
                      Identity Card Details
                    </h5>
                    {canEditHealth && !editingIdentity && (
                      <button 
                        onClick={() => setEditingIdentity(true)}
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', gap: '4px' }}
                      >
                        <Edit2 size={11} /> Edit Identity
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--color-danger)', margin: '0 0 10px 0', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                    [AUDITED ROOT ACCESS - VIEW LOGGED IN AUDIT LOGS]
                  </p>

                  {editingIdentity ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>IC No / Birth Certificate</label>
                        <input type="text" value={identityEditData.ic_number || ''} onChange={e => setIdentityEditData({...identityEditData, ic_number: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Guardian IC</label>
                        <input type="text" value={identityEditData.guardian_ic || ''} onChange={e => setIdentityEditData({...identityEditData, guardian_ic: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Registered Address</label>
                        <input type="text" value={identityEditData.home_address || ''} onChange={e => setIdentityEditData({...identityEditData, home_address: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '13px' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={() => setEditingIdentity(false)}>Cancel</button>
                        <button className="btn btn-success" onClick={() => {
                          updateChildDetails(activeChildId, {}, identityEditData);
                          setEditingIdentity(false);
                        }}>
                          <Check size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>National Identity Card (IC) No / Birth Certificate</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', letterSpacing: '0.05em' }}>{data.ic_number}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Guardian National Identity Card (IC)</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', letterSpacing: '0.05em' }}>{data.guardian_ic}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Registered Home Address</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{data.home_address}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB CONTENT: CONSENT */}
            {detailsTab === 'consent' && (() => {
              const child = children.find(c => c.id === activeChildId);
              if (!child) return null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Consent Agreement Records</h5>
                    {canEditHealth && !editingConsent && (
                      <button 
                        onClick={() => setEditingConsent(true)}
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', gap: '4px' }}
                      >
                        <Edit2 size={11} /> Edit Consent
                      </button>
                    )}
                  </div>
                  
                  {editingConsent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Celebration Group Photos:</span>
                        <input type="checkbox" checked={consentEditData.consent_pics_parents} onChange={e => setConsentEditData({...consentEditData, consent_pics_parents: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Social Media Sharing:</span>
                        <input type="checkbox" checked={consentEditData.consent_pics_social_media} onChange={e => setConsentEditData({...consentEditData, consent_pics_social_media: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Participate in Celebrations:</span>
                        <input type="checkbox" checked={consentEditData.consent_celebrations} onChange={e => setConsentEditData({...consentEditData, consent_celebrations: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Consume Center Food:</span>
                        <input type="checkbox" checked={consentEditData.consent_food} onChange={e => setConsentEditData({...consentEditData, consent_food: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={() => setEditingConsent(false)}>Cancel</button>
                        <button className="btn btn-success" onClick={() => {
                          updateChildDetails(activeChildId, consentEditData);
                          setEditingConsent(false);
                        }}>
                          <Check size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)', maxWidth: '75%' }}>Celebration Group Photos:</span>
                        <span style={{ fontWeight: '700', color: child.consent_pics_parents ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {child.consent_pics_parents ? 'GRANTED' : 'DENIED'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)', maxWidth: '75%' }}>Social Media Sharing:</span>
                        <span style={{ fontWeight: '700', color: child.consent_pics_social_media ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {child.consent_pics_social_media ? 'GRANTED' : 'DENIED'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)', maxWidth: '75%' }}>Participate in Celebrations:</span>
                        <span style={{ fontWeight: '700', color: child.consent_celebrations ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {child.consent_celebrations ? 'GRANTED' : 'DENIED'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)', maxWidth: '75%' }}>Consume Center Food:</span>
                        <span style={{ fontWeight: '700', color: child.consent_food ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {child.consent_food ? 'GRANTED' : 'DENIED'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB CONTENT: ATTENDANCE */}
            {detailsTab === 'attendance' && (() => {
              const childSessions = sessions.filter(s => s.child_id === activeChildId);
              const getTherapyName = (id: number) => therapyTypes.find(t => t.id === id)?.name || 'General Therapy';

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Attendance Log History</h5>
                  
                  {childSessions.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No sessions scheduled for this student.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                      {childSessions.map(s => {
                        const record = attendanceRecords.find(r => r.session_id === s.id);
                        let status: 'completed' | 'checked_in' | 'absent' | 'scheduled' = 'scheduled';
                        if (record) {
                          if (record.check_out_time) {
                            status = 'completed';
                          } else if (record.check_in_time) {
                            status = 'checked_in';
                          }
                        } else {
                          const today = new Date().toISOString().split('T')[0];
                          if (s.session_date < today) {
                            status = 'absent';
                          }
                        }

                        const statusColors = {
                          completed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
                          checked_in: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
                          absent: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
                          scheduled: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' }
                        };

                        const sc = statusColors[status];

                        return (
                          <div 
                            key={s.id} 
                            style={{ 
                              padding: '12px', 
                              borderRadius: '8px', 
                              border: '1px solid var(--border-glass)', 
                              background: 'var(--bg-surface-hover)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>
                                {s.session_date} ({s.start_time} - {s.end_time})
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                Program: {getTherapyName(s.therapy_type_id)}
                              </div>
                              {record?.notes && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                  Note: {record.notes}
                                </div>
                              )}
                            </div>
                            <span 
                              style={{ 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '10px', 
                                fontWeight: 'bold', 
                                background: sc.bg, 
                                color: sc.text,
                                textTransform: 'uppercase'
                              }}
                            >
                              {status === 'checked_in' ? 'Checked In' : status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB CONTENT: DOCUMENTS */}
            {detailsTab === 'documents' && (() => {
              const child = children.find(c => c.id === activeChildId);
              const sens = sensitiveData.find(s => s.child_id === activeChildId);
              if (!child) return null;
              
              const docs = [
                { name: 'Application Form.pdf', path: sens?.application_form_path || '/uploads/app_doc.pdf', type: 'Application Document' },
                { name: 'Birth Certificate / Identity Document', path: sens?.id_document_paths?.[0] || '/uploads/doc_id_cert.jpg', type: 'Identity Document' }
              ];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Registered Student Documents</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {docs.map((doc, idx) => (
                      <div key={idx} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-glass)',
                        background: 'var(--bg-surface-hover)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{doc.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Type: {doc.type}</div>
                        </div>
                        <button
                          className="btn btn-secondary"
                          onClick={() => window.open(doc.path, '_blank')}
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                        >
                          Open & View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>

    {/* Modal-style registration overlay - Placed at root level to prevent parent transform clipping */}
    {showRegForm && (
      <div className="modal-dialog" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'block',
        overflowY: 'auto',
        zIndex: 99999,
        padding: '40px 24px'
      }}>
        <div className="glass-panel animate-scale-up modal-card" style={{
          width: '100%',
          maxWidth: '650px',
          margin: '0 auto',
          background: 'var(--bg-surface-solid)',
          padding: '28px',
          borderRadius: '12px',
          border: '1.5px solid var(--border-accent)',
          boxShadow: 'var(--shadow-2xl)'
        }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Register New Child Application Form</h3>
          
          <form onSubmit={handleCreateChild} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* SECTION 1: CHILD & FAMILY DETAILS */}
            <div style={{ border: '1px solid rgba(139,92,246,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(139,92,246,0.01)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, paddingBottom: '6px', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                1. Child & Family Details
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Child Full Name</label>
                  <input type="text" required value={regData.full_name} onChange={e => setRegData({...regData, full_name: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                  <input type="date" required value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Gender</label>
                  <select value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value as any})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Therapy Category</label>
                  <select value={regData.therapy_type_id} onChange={e => setRegData({...regData, therapy_type_id: parseInt(e.target.value)})}>
                    <option value={1}>Speech Therapy</option>
                    <option value={2}>Occupational Therapy</option>
                    <option value={3}>ABA Therapy</option>
                  </select>
                </div>
              </div>

              {/* Sensitive fields (IC, Address) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Child IC / Birth Certificate No.</label>
                  <input type="text" required value={regData.ic_number} onChange={e => setRegData({...regData, ic_number: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Guardian IC / ID No.</label>
                  <input type="text" required value={regData.guardian_ic} onChange={e => setRegData({...regData, guardian_ic: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Home Address</label>
                <input type="text" required value={regData.home_address} onChange={e => setRegData({...regData, home_address: e.target.value})} />
              </div>

              {/* Parents details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Father's Details</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input type="text" placeholder="Name" value={regData.father_name} onChange={e => setRegData({...regData, father_name: e.target.value})} />
                    <input type="text" placeholder="Phone" value={regData.father_phone} onChange={e => setRegData({...regData, father_phone: e.target.value})} />
                    <input type="text" placeholder="Occupation" value={regData.father_occupation} onChange={e => setRegData({...regData, father_occupation: e.target.value})} />
                  </div>
                </div>
                <div style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Mother's Details</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input type="text" placeholder="Name" value={regData.mother_name} onChange={e => setRegData({...regData, mother_name: e.target.value})} />
                    <input type="text" placeholder="Phone" value={regData.mother_phone} onChange={e => setRegData({...regData, mother_phone: e.target.value})} />
                    <input type="text" placeholder="Occupation" value={regData.mother_occupation} onChange={e => setRegData({...regData, mother_occupation: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sibling(s) & Age(s)</label>
                  <input type="text" placeholder="e.g. 1 Brother (Age 5)" value={regData.siblings_details} onChange={e => setRegData({...regData, siblings_details: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Primary Caregiver at Home</label>
                  <input type="text" placeholder="e.g. Helper, Grandparents" value={regData.primary_caregiver} onChange={e => setRegData({...regData, primary_caregiver: e.target.value})} />
                </div>
              </div>
            </div>

            {/* SECTION 2: MEDICAL & BACKGROUND */}
            <div style={{ border: '1px solid rgba(16,185,129,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.01)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, paddingBottom: '6px', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                2. Medical & Background Information
              </h4>

              {/* Diagnosis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="formal_diagnosis" 
                    checked={regData.formal_diagnosis} 
                    onChange={e => setRegData({...regData, formal_diagnosis: e.target.checked})}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="formal_diagnosis" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>Does the child have a formal diagnosis?</label>
                </div>
                <input 
                  type="text" 
                  placeholder="If Yes, please state the diagnosis..." 
                  value={regData.formal_diagnosis_details} 
                  onChange={e => {
                    const val = e.target.value;
                    setRegData({
                      ...regData, 
                      formal_diagnosis_details: val,
                      formal_diagnosis: val.trim() !== ''
                    });
                  }} 
                />
              </div>

              {/* Other conditions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="other_medical_conditions" 
                    checked={regData.other_medical_conditions} 
                    onChange={e => setRegData({...regData, other_medical_conditions: e.target.checked})}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="other_medical_conditions" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>Other medical conditions? (e.g. Epilepsy, asthma)</label>
                </div>
                <input 
                  type="text" 
                  placeholder="If Yes, please state the conditions..." 
                  value={regData.other_medical_conditions_details} 
                  onChange={e => {
                    const val = e.target.value;
                    setRegData({
                      ...regData, 
                      other_medical_conditions_details: val,
                      other_medical_conditions: val.trim() !== ''
                    });
                  }} 
                />
              </div>

              {/* Food allergies */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="food_allergies" 
                    checked={regData.food_allergies} 
                    onChange={e => setRegData({...regData, food_allergies: e.target.checked})}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="food_allergies" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>Food allergies or restrictions?</label>
                </div>
                <input 
                  type="text" 
                  placeholder="If Yes, please state food allergies / restrictions..." 
                  value={regData.food_allergies_details} 
                  onChange={e => {
                    const val = e.target.value;
                    setRegData({
                      ...regData, 
                      food_allergies_details: val,
                      food_allergies: val.trim() !== ''
                    });
                  }} 
                />
              </div>

              {/* Emergency info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Emergency Contact Name</label>
                  <input type="text" required value={regData.emergency_contact_name} onChange={e => setRegData({...regData, emergency_contact_name: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Emergency Phone</label>
                  <input type="text" required value={regData.emergency_contact_phone} onChange={e => setRegData({...regData, emergency_contact_phone: e.target.value})} />
                </div>
              </div>

              {/* Past schools */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Current & Past Learning Centers / Schools</label>
                <textarea rows={2} placeholder="e.g. School A (Programme X), School B (Programme Y)" value={regData.past_schools} onChange={e => setRegData({...regData, past_schools: e.target.value})} />
              </div>
            </div>





            {/* Consent Agreement Details */}
            <div style={{ border: '1px solid rgba(245,158,11,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.02)' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--color-warning)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Consent Agreement Details
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="consent_pics_parents" 
                    checked={regData.consent_pics_parents} 
                    onChange={e => setRegData({...regData, consent_pics_parents: e.target.checked})}
                    style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent_pics_parents" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I consent my kid to have their pictures shared only among the parents at IMDC for group photos during celebrations, events, etc. (Not sharing on any personal social media).
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="consent_pics_social_media" 
                    checked={regData.consent_pics_social_media} 
                    onChange={e => setRegData({...regData, consent_pics_social_media: e.target.checked})}
                    style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent_pics_social_media" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I consent my kid to have their pictures shared for IMDC social media use.
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="consent_celebrations" 
                    checked={regData.consent_celebrations} 
                    onChange={e => setRegData({...regData, consent_celebrations: e.target.checked})}
                    style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent_celebrations" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I consent my kid to participate in celebrations held at IMDC including learning about different cultures.
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="consent_food" 
                    checked={regData.consent_food} 
                    onChange={e => setRegData({...regData, consent_food: e.target.checked})}
                    style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent_food" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I consent my kid to consume food provided or brought during celebrations (e.g. birthdays, celebrations) at the centre, where applicable.
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRegForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Enrollment</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};
