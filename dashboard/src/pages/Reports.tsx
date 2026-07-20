import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Mic, MicOff, Printer, FileText, Activity, ClipboardCheck, ArrowLeft, Download } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface ReportsProps {
  onViewPdf: (data: { type: 'progress' | 'behavior'; id: number }) => void;
}

export const Reports: React.FC<ReportsProps> = ({ onViewPdf }) => {
  const { 
    currentUser, 
    children, 
    progressReports, 
    behaviorReports, 
    addProgressReport, 
    addBehaviorReport,
    users,
    sessions,
    attendanceRecords,
    therapyTypes,
    reviewBehaviorReport,
    commentProgressReport
  } = useSimulator();

  const isStaff = ['super_admin', 'admin', 'principal', 'trainer'].includes(currentUser.role);

  const [activeForm, setActiveForm] = useState<'progress' | 'behavior'>('progress');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>(
    isStaff ? 'new' : 'history'
  );
  const [selectedHistoryCard, setSelectedHistoryCard] = useState<'progress' | 'behavior' | 'attendance'>('progress');
  const [historyChildFilter, setHistoryChildFilter] = useState<string>('all');

  // Review states
  const [selectedReviewCard, setSelectedReviewCard] = useState<'progress' | 'behavior'>('progress');
  const [selectedReviewReportId, setSelectedReviewReportId] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewVisibility, setReviewVisibility] = useState<'private' | 'public'>('public');
  const [reviewCategory, setReviewCategory] = useState<'pending' | 'completed'>('pending');


  // PDF Customization Modal States
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('Therapy Attendance Summary Report');
  const [pdfChildId, setPdfChildId] = useState('all');
  const [pdfTrainerId, setPdfTrainerId] = useState('all');
  const [pdfTherapyTypeId, setPdfTherapyTypeId] = useState('all');
  const [pdfStatus, setPdfStatus] = useState('all');
  const [pdfDateStart, setPdfDateStart] = useState('');
  const [pdfDateEnd, setPdfDateEnd] = useState('');
  const [pdfIncludeNotes, setPdfIncludeNotes] = useState(true);
  const [pdfIncludeStats, setPdfIncludeStats] = useState(true);
  const [pdfVisibility, setPdfVisibility] = useState('all');
  const [printPreviewData, setPrintPreviewData] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getTherapyName = (id: number) => therapyTypes.find(t => t.id === id)?.name || 'General Therapy';

  const getPrintData = () => {
    if (!printPreviewData) return [];
    
    if (printPreviewData.type === 'attendance') {
      const relevantSessions = sessions.filter(s => {
        if (currentUser.role === 'trainer') return s.trainer_id === currentUser.id;
        return true;
      });

      const resolved = relevantSessions.map(s => {
        const record = attendanceRecords.find(r => r.session_id === s.id);
        const childName = children.find(c => c.id === s.child_id)?.full_name || 'Unknown Child';
        const trainerName = users.find(u => u.id === s.trainer_id)?.name || 'Unknown Trainer';
        const therapyName = getTherapyName(s.therapy_type_id);
        
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

        return {
          session: s,
          record,
          childName,
          trainerName,
          therapyName,
          status
        };
      });

      const sorted = resolved.sort((a, b) => {
        const dateCompare = b.session.session_date.localeCompare(a.session.session_date);
        if (dateCompare !== 0) return dateCompare;
        return b.session.start_time.localeCompare(a.session.start_time);
      });

      return sorted.filter(row => {
        if (printPreviewData.startDate && row.session.session_date < printPreviewData.startDate) return false;
        if (printPreviewData.endDate && row.session.session_date > printPreviewData.endDate) return false;
        if (printPreviewData.childId !== 'all' && row.session.child_id !== parseInt(printPreviewData.childId)) return false;
        if (printPreviewData.trainerId !== 'all' && row.session.trainer_id !== parseInt(printPreviewData.trainerId)) return false;
        if (printPreviewData.therapyTypeId !== 'all' && row.session.therapy_type_id !== parseInt(printPreviewData.therapyTypeId)) return false;
        if (printPreviewData.status !== 'all' && row.status !== printPreviewData.status) return false;
        return true;
      });
    }

    if (printPreviewData.type === 'progress') {
      return visibleProgress.filter(row => {
        if (printPreviewData.startDate && row.report_date < printPreviewData.startDate) return false;
        if (printPreviewData.endDate && row.report_date > printPreviewData.endDate) return false;
        if (printPreviewData.childId !== 'all' && row.child_id !== parseInt(printPreviewData.childId)) return false;
        if (printPreviewData.trainerId !== 'all' && row.trainer_id !== parseInt(printPreviewData.trainerId)) return false;
        return true;
      }).sort((a, b) => b.report_date.localeCompare(a.report_date));
    }

    if (printPreviewData.type === 'behavior') {
      return visibleBehavior.filter(row => {
        if (printPreviewData.startDate && row.report_date < printPreviewData.startDate) return false;
        if (printPreviewData.endDate && row.report_date > printPreviewData.endDate) return false;
        if (printPreviewData.childId !== 'all' && row.child_id !== parseInt(printPreviewData.childId)) return false;
        if (printPreviewData.trainerId !== 'all' && row.trainer_id !== parseInt(printPreviewData.trainerId)) return false;
        if (printPreviewData.status !== 'all' && row.status !== printPreviewData.status) return false;
        if (printPreviewData.visibility !== 'all' && row.visibility !== printPreviewData.visibility) return false;
        return true;
      }).sort((a, b) => b.report_date.localeCompare(a.report_date));
    }

    return [];
  };

  const handleLaunchPrint = (e: React.FormEvent) => {
    e.preventDefault();
    setPrintPreviewData({
      type: selectedHistoryCard,
      title: reportTitle,
      startDate: pdfDateStart,
      endDate: pdfDateEnd,
      childId: pdfChildId,
      trainerId: pdfTrainerId,
      therapyTypeId: pdfTherapyTypeId,
      status: pdfStatus,
      visibility: pdfVisibility,
      includeNotes: pdfIncludeNotes,
      includeStats: pdfIncludeStats
    });
    setShowDownloadModal(false);
  };
  
  // Progress form states
  const [progChildId, setProgChildId] = useState(1);
  const [progNotes, setProgNotes] = useState('');
  const [progReportDate, setProgReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [progMediaLinks, setProgMediaLinks] = useState<string[]>([]);
  const [progUrlInput, setProgUrlInput] = useState('');
  const progFileRef = React.useRef<HTMLInputElement>(null);
  
  // Behavior form states
  const [behChildId, setBehChildId] = useState(1);
  const [behNature, setBehNature] = useState('');
  const [behTriggers, setBehTriggers] = useState('');
  const [behActions, setBehActions] = useState('');
  const [behFollowUp, setBehFollowUp] = useState('');
  const [behReportDate, setBehReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [behMediaLinks, setBehMediaLinks] = useState<string[]>([]);
  const [behUrlInput, setBehUrlInput] = useState('');
  const behFileRef = React.useRef<HTMLInputElement>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<'prog' | 'nature' | 'triggers' | 'actions' | 'followup' | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Web Speech API initialization using useRef to prevent re-instantiation on renders
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      recognitionRef.current = rec;
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore already stopped instances
        }
      }
    };
  }, []);

  const startVoiceTyping = (field: 'prog' | 'nature' | 'triggers' | 'actions' | 'followup') => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setIsListening(true);
    setActiveVoiceField(field);

    recognition.onresult = (event: any) => {
      let resultText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          resultText += event.results[i][0].transcript;
        }
      }
      
      if (resultText) {
        if (field === 'prog') setProgNotes(prev => prev + ' ' + resultText);
        if (field === 'nature') setBehNature(prev => prev + ' ' + resultText);
        if (field === 'triggers') setBehTriggers(prev => prev + ' ' + resultText);
        if (field === 'actions') setBehActions(prev => prev + ' ' + resultText);
        if (field === 'followup') setBehFollowUp(prev => prev + ' ' + resultText);
      }
    };

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err);
      stopVoiceTyping();
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveVoiceField(null);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed:", e);
    }
  };

  const stopVoiceTyping = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // ignore already stopped instances
      }
    }
    setIsListening(false);
    setActiveVoiceField(null);
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProgressReport({
      child_id: progChildId,
      report_date: progReportDate,
      notes: progNotes,
      media_links: progMediaLinks,
      visible_to_parent: true
    });
    setProgNotes('');
    setProgMediaLinks([]);
    setProgUrlInput('');
    if (progFileRef.current) progFileRef.current.value = '';
    setProgReportDate(new Date().toISOString().split('T')[0]);
  };

  const handleBehaviorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBehaviorReport({
      child_id: behChildId,
      report_date: behReportDate,
      nature_of_incident: behNature,
      triggers_causes: behTriggers,
      actions_taken: behActions,
      follow_up_observations: behFollowUp,
      media_links: behMediaLinks,
    });
    setBehNature('');
    setBehTriggers('');
    setBehActions('');
    setBehFollowUp('');
    setBehMediaLinks([]);
    setBehUrlInput('');
    if (behFileRef.current) behFileRef.current.value = '';
    setBehReportDate(new Date().toISOString().split('T')[0]);
  };

  const getChildName = (id: number) => children.find(c => c.id === id)?.full_name || 'Unknown';
  const getTrainerName = (id: number) => users.find(u => u.id === id)?.name || 'Staff';

  // Filter reports visible to current user
  const getVisibleProgressReports = () => {
    if (currentUser.role === 'parent') {
      return progressReports.filter(r => r.child_id === 1 && r.visible_to_parent);
    }
    return progressReports;
  };

  const getVisibleBehaviorReports = () => {
    if (currentUser.role === 'parent') {
      // Parents can ONLY view behavior reports that are authorized AND public
      return behaviorReports.filter(r => r.child_id === 1 && r.status === 'authorized' && r.visibility === 'public');
    }
    if (currentUser.role === 'trainer') {
      return behaviorReports.filter(r => r.trainer_id === currentUser.id);
    }
    return behaviorReports;
  };

  const visibleProgress = getVisibleProgressReports();
  const visibleBehavior = getVisibleBehaviorReports();

  // ─── RENDER PRINT PREVIEW SCREEN ───
  if (printPreviewData) {
    const printRows = getPrintData();
    const pTotal = printRows.length;
    const pCompleted = printRows.filter((r: any) => r.status === 'completed').length;
    const pActive = printRows.filter((r: any) => r.status === 'checked_in').length;
    const pAbsent = printRows.filter((r: any) => r.status === 'absent').length;
    const pRate = pTotal > 0 ? Math.round(((pCompleted + pActive) / pTotal) * 100) : 0;

    const handleDownloadPdf = () => {
      const element = document.querySelector('.print-canvas');
      if (!element) return;

      setIsDownloading(true);

      const opt = {
        margin:       10,
        filename:     `${printPreviewData?.title || 'Attendance_Report'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      const runHtml2Pdf = () => {
        const html2pdf = (window as any).html2pdf;
        html2pdf().set(opt).from(element).save().then(() => {
          setIsDownloading(false);
        }).catch((err: any) => {
          console.error(err);
          setIsDownloading(false);
        });
      };

      if ((window as any).html2pdf) {
        runHtml2Pdf();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = runHtml2Pdf;
        script.onerror = () => {
          setIsDownloading(false);
          alert('Failed to load PDF engine. Please check internet connection.');
        };
        document.body.appendChild(script);
      }
    };

    return (
      <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Print Buttons Header bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setPrintPreviewData(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to History
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleDownloadPdf} 
            disabled={isDownloading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isDownloading ? 0.7 : 1 }}
          >
            <Download size={16} /> {isDownloading ? 'Downloading PDF...' : 'Download Report PDF'}
          </button>
        </div>

        {/* Printable report sheet canvas wrapper */}
        <div className="print-canvas" style={{
          background: '#fff',
          color: '#1e293b',
          padding: '40px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          fontFamily: 'sans-serif',
          minHeight: '842px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Logo and company headers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={logoImg} style={{ width: '76px', height: '76px', objectFit: 'contain' }} alt="Infinity Minds Logo" />
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', margin: 0 }}>
                    INFINITY MINDS
                  </h1>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Therapy Center Management
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Petaling Jaya Main Branch</div>
                <div>Date Generated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Custom Report Headers */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', color: '#1e293b', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                {printPreviewData.title}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {printPreviewData.startDate && <span><strong>Start:</strong> {printPreviewData.startDate}</span>}
                {printPreviewData.endDate && <span><strong>End:</strong> {printPreviewData.endDate}</span>}
                {printPreviewData.childId !== 'all' && <span><strong>Student:</strong> {getChildName(parseInt(printPreviewData.childId))}</span>}
                {printPreviewData.trainerId !== 'all' && <span><strong>Trainer:</strong> {getTrainerName(parseInt(printPreviewData.trainerId))}</span>}
                {printPreviewData.type === 'attendance' && printPreviewData.therapyTypeId !== 'all' && <span><strong>Therapy:</strong> {getTherapyName(parseInt(printPreviewData.therapyTypeId))}</span>}
                {printPreviewData.status !== 'all' && <span style={{ textTransform: 'uppercase' }}><strong>Status:</strong> {printPreviewData.status}</span>}
                {printPreviewData.type === 'behavior' && printPreviewData.visibility !== 'all' && <span style={{ textTransform: 'uppercase' }}><strong>Visibility:</strong> {printPreviewData.visibility}</span>}
              </div>
            </div>

            {/* Custom Summary Stats Grid */}
            {printPreviewData.type === 'attendance' && printPreviewData.includeStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#fafafa' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Total Sessions</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>{pTotal}</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#fafafa' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Present Count</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>{pCompleted + pActive}</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#fafafa' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Absent Count</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>{pAbsent}</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#fafafa' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Attendance Rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{pRate}%</div>
                </div>
              </div>
            )}

            {/* Custom Content based on selected category type */}
            {printPreviewData.type === 'attendance' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Date & Time</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Student</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Therapy Program</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Trainer</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>In</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Out</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Status</th>
                    {printPreviewData.includeNotes && <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Notes</th>}
                  </tr>
                </thead>
                <tbody>
                  {printRows.map(({ session, record, childName, trainerName, therapyName, status }: any) => (
                    <tr key={session.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <strong>{session.session_date}</strong>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{session.start_time} - {session.end_time}</div>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#1e293b' }}>{childName}</td>
                      <td style={{ padding: '8px 10px' }}>{therapyName}</td>
                      <td style={{ padding: '8px 10px' }}>{trainerName}</td>
                      <td style={{ padding: '8px 10px' }}>{record?.check_in_time || '--:--'}</td>
                      <td style={{ padding: '8px 10px' }}>{record?.check_out_time || '--:--'}</td>
                      <td style={{ padding: '8px 10px', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '9px' }}>
                        {status === 'completed' && <span style={{ color: '#10b981' }}>Completed</span>}
                        {status === 'checked_in' && <span style={{ color: '#0ea5e9' }}>Active</span>}
                        {status === 'absent' && <span style={{ color: '#ef4444' }}>Absent</span>}
                        {status === 'scheduled' && <span style={{ color: '#f59e0b' }}>Scheduled</span>}
                      </td>
                      {printPreviewData.includeNotes && (
                        <td style={{ padding: '8px 10px', color: '#475569', fontSize: '10px' }}>
                          {record?.notes || '--'}
                        </td>
                      )}
                    </tr>
                  ))}
                  {printRows.length === 0 && (
                    <tr>
                      <td colSpan={printPreviewData.includeNotes ? 8 : 7} style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                        No matching records within this date range/selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {printPreviewData.type === 'progress' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Date</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Student</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Trainer</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Clinical Session Notes</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {printRows.map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}><strong>{r.report_date}</strong></td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#1e293b' }}>{getChildName(r.child_id)}</td>
                      <td style={{ padding: '8px 10px' }}>{getTrainerName(r.trainer_id)}</td>
                      <td style={{ padding: '8px 10px', color: '#475569', fontSize: '10px', maxWidth: '350px' }}>{r.notes}</td>
                      <td style={{ padding: '8px 10px', fontSize: '9px' }}>
                        {r.media_links && r.media_links.length > 0 ? (
                          r.media_links.map((link: string, idx: number) => (
                            <div key={idx} style={{ color: 'var(--color-primary)' }}>📎 {link.split('/').pop()}</div>
                          ))
                        ) : '--'}
                      </td>
                    </tr>
                  ))}
                  {printRows.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                        No progress reports found matching these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {printPreviewData.type === 'behavior' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Date</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Student</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Trainer</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Incident Details</th>
                    <th style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {printRows.map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}><strong>{r.report_date}</strong></td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#1e293b' }}>{getChildName(r.child_id)}</td>
                      <td style={{ padding: '8px 10px' }}>{getTrainerName(r.trainer_id)}</td>
                      <td style={{ padding: '8px 10px', color: '#475569', fontSize: '10px' }}>
                        <strong>Incident:</strong> {r.nature_of_incident}
                        {r.triggers_causes && <div><strong>Triggers:</strong> {r.triggers_causes}</div>}
                        {r.actions_taken && <div><strong>Actions:</strong> {r.actions_taken}</div>}
                        {r.follow_up_observations && <div><strong>Follow-up:</strong> {r.follow_up_observations}</div>}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase' }}>
                        <span style={{ color: r.status === 'authorized' ? '#10b981' : '#cbd5e1' }}>{r.status}</span>
                        <div style={{ fontSize: '8px', color: '#64748b' }}>{r.visibility}</div>
                      </td>
                    </tr>
                  ))}
                  {printRows.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                        No behavior reports found matching these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Printable Report Footer sign-off stamps */}
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#64748b' }}>
            <div>
              <div>System Authorized Digital PDF Printout</div>
              <div>Security Hash: SHA256/IMA/ATT/{new Date().getTime().toString(16).substring(4)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ height: '30px', borderBottom: '1px solid #94a3b8', width: '140px', marginBottom: '2px' }}></div>
              <div>Branch Director Stamp / Signature</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Navigation Tabs */}
      <div className="tab-header-row" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '2px' }}>
        {(currentUser.role === 'trainer') ? (
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'new' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'new' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            New Report
          </button>
        ) : (['super_admin', 'admin', 'principal'].includes(currentUser.role) && (
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'new' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'new' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Review Reports
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Report History
        </button>
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1 }}>
        {activeTab === 'new' && (currentUser.role === 'trainer') && (
          <div style={{ width: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setActiveForm('progress'); stopVoiceTyping(); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeForm === 'progress' ? '3px solid var(--color-primary)' : '3px solid transparent',
                    color: activeForm === 'progress' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Progress Report Form
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveForm('behavior'); stopVoiceTyping(); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeForm === 'behavior' ? '3px solid var(--color-primary)' : '3px solid transparent',
                    color: activeForm === 'behavior' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Behavior Observation Form
                </button>
              </div>

              {activeForm === 'progress' ? (
                // Progress Report
                <form onSubmit={handleProgressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Select Student</label>
                      <select value={progChildId} onChange={e => setProgChildId(parseInt(e.target.value))}>
                        {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Report Date</label>
                      <input 
                        type="date" 
                        required 
                        value={progReportDate} 
                        onChange={e => setProgReportDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Clinical Session Notes</label>
                      
                      {speechSupported ? (
                        <button
                          type="button"
                          onClick={() => isListening && activeVoiceField === 'prog' ? stopVoiceTyping() : startVoiceTyping('prog')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isListening && activeVoiceField === 'prog' ? 'var(--color-danger)' : 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isListening && activeVoiceField === 'prog' ? (
                            <><MicOff size={14} /> Stop Listening</>
                          ) : (
                            <><Mic size={14} /> Voice Type Notes</>
                          )}
                        </button>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mic not supported on browser</span>
                      )}
                    </div>

                    <textarea
                      rows={8}
                      required
                      placeholder={isListening && activeVoiceField === 'prog' ? "Listening... Speak clearly into your microphone..." : "Type progress observations..."}
                      value={progNotes}
                      onChange={e => setProgNotes(e.target.value)}
                    />
                  </div>

                  {/* Attachments Section */}
                  <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '16px', marginTop: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Attachments & Reference Links (Optional)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Upload Images, Videos, or Documents</span>
                        <input 
                          ref={progFileRef}
                          type="file" 
                          multiple 
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          onChange={e => {
                            const files = e.target.files;
                            if (files) {
                              const newLinks = [...progMediaLinks];
                              for (let i = 0; i < files.length; i++) {
                                newLinks.push(`/uploads/${files[i].name}`);
                              }
                              setProgMediaLinks(newLinks);
                            }
                          }}
                          style={{ fontSize: '12px', padding: '6px' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Add Web Link (e.g. Google Drive/Video URL)</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="text" 
                            placeholder="https://..." 
                            value={progUrlInput}
                            onChange={e => setProgUrlInput(e.target.value)}
                            style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                          />
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => {
                              if (progUrlInput.trim()) {
                                setProgMediaLinks([...progMediaLinks, progUrlInput.trim()]);
                                setProgUrlInput('');
                              }
                            }}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>

                    {progMediaLinks.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {progMediaLinks.map((link, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {link.split('/').pop()}
                            </span>
                            <button
                              type="button"
                              onClick={() => setProgMediaLinks(progMediaLinks.filter((_, i) => i !== idx))}
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0, fontWeight: 'bold', marginLeft: '4px' }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '14px' }}>Publish Progress Report</button>
                </form>
              ) : (
                // Behavior Report
                <form onSubmit={handleBehaviorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Select Student</label>
                      <select value={behChildId} onChange={e => setBehChildId(parseInt(e.target.value))}>
                        {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Report Date</label>
                      <input 
                        type="date" 
                        required 
                        value={behReportDate} 
                        onChange={e => setBehReportDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* 1. Nature of Incident */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>1) Nature of Incident</label>
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={() => isListening && activeVoiceField === 'nature' ? stopVoiceTyping() : startVoiceTyping('nature')}
                          style={{ background: 'none', border: 'none', color: isListening && activeVoiceField === 'nature' ? 'var(--color-danger)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isListening && activeVoiceField === 'nature' ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Voice Type</>}
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the nature of the behavioral incident..."
                      value={behNature}
                      onChange={e => setBehNature(e.target.value)}
                    />
                  </div>

                  {/* 2. Triggers/ Causes of Incident */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>2) Triggers / Causes of Incident</label>
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={() => isListening && activeVoiceField === 'triggers' ? stopVoiceTyping() : startVoiceTyping('triggers')}
                          style={{ background: 'none', border: 'none', color: isListening && activeVoiceField === 'triggers' ? 'var(--color-danger)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isListening && activeVoiceField === 'triggers' ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Voice Type</>}
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="What triggered or caused the incident?"
                      value={behTriggers}
                      onChange={e => setBehTriggers(e.target.value)}
                    />
                  </div>

                  {/* 3. Actions Taken */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>3) Actions Taken</label>
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={() => isListening && activeVoiceField === 'actions' ? stopVoiceTyping() : startVoiceTyping('actions')}
                          style={{ background: 'none', border: 'none', color: isListening && activeVoiceField === 'actions' ? 'var(--color-danger)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isListening && activeVoiceField === 'actions' ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Voice Type</>}
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="What immediate actions or de-escalation steps were taken?"
                      value={behActions}
                      onChange={e => setBehActions(e.target.value)}
                    />
                  </div>

                  {/* 4. Observations after Follow-up */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>4) Observations after Follow-up</label>
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={() => isListening && activeVoiceField === 'followup' ? stopVoiceTyping() : startVoiceTyping('followup')}
                          style={{ background: 'none', border: 'none', color: isListening && activeVoiceField === 'followup' ? 'var(--color-danger)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isListening && activeVoiceField === 'followup' ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Voice Type</>}
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe observations after follow-up steps were completed..."
                      value={behFollowUp}
                      onChange={e => setBehFollowUp(e.target.value)}
                    />
                  </div>

                  {/* Attachments Section */}
                  <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '16px', marginTop: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Attachments & Reference Links (Optional)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Upload Images, Videos, or Documents</span>
                        <input 
                          ref={behFileRef}
                          type="file" 
                          multiple 
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          onChange={e => {
                            const files = e.target.files;
                            if (files) {
                              const newLinks = [...behMediaLinks];
                              for (let i = 0; i < files.length; i++) {
                                newLinks.push(`/uploads/${files[i].name}`);
                              }
                              setBehMediaLinks(newLinks);
                            }
                          }}
                          style={{ fontSize: '12px', padding: '6px' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Add Web Link (e.g. Google Drive/Video URL)</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="text" 
                            placeholder="https://..." 
                            value={behUrlInput}
                            onChange={e => setBehUrlInput(e.target.value)}
                            style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                          />
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => {
                              if (behUrlInput.trim()) {
                                setBehMediaLinks([...behMediaLinks, behUrlInput.trim()]);
                                setBehUrlInput('');
                              }
                            }}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>

                    {behMediaLinks.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {behMediaLinks.map((link, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {link.split('/').pop()}
                            </span>
                            <button
                              type="button"
                              onClick={() => setBehMediaLinks(behMediaLinks.filter((_, i) => i !== idx))}
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0, fontWeight: 'bold', marginLeft: '4px' }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '14px', marginTop: '10px' }}>Submit for Principal Review</button>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && ['super_admin', 'admin', 'principal'].includes(currentUser.role) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            
            {/* Review Category Select Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '10px'
            }}>
              {/* 1. Progress Reports Card */}
              <div 
                onClick={() => { setSelectedReviewCard('progress'); setSelectedReviewReportId(null); }}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: selectedReviewCard === 'progress' ? '1.5px solid var(--color-primary)' : '1px solid var(--border-glass)',
                  background: selectedReviewCard === 'progress' ? 'rgba(139, 92, 246, 0.04)' : 'var(--bg-surface)',
                  opacity: selectedReviewCard === 'progress' ? 1 : 0.8,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Progress Reports</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{progressReports.length} reports logged</span>
                </div>
              </div>

              {/* 2. Behavior Reports Card */}
              <div 
                onClick={() => { setSelectedReviewCard('behavior'); setSelectedReviewReportId(null); }}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: selectedReviewCard === 'behavior' ? '1.5px solid var(--color-success)' : '1px solid var(--border-glass)',
                  background: selectedReviewCard === 'behavior' ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface)',
                  opacity: selectedReviewCard === 'behavior' ? 1 : 0.8,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Behavior Reports</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{behaviorReports.length} reports logged</span>
                </div>
              </div>
            </div>

            {/* Results Display Area */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              
              {selectedReviewCard === 'progress' ? (
                // ─── PROGRESS REPORTS COMMENT PORTAL ───
                selectedReviewReportId === null ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>Progress Reports Recommendations</h3>
                    
                    {progressReports.map(r => (
                      <div 
                        key={`rev-prog-${r.id}`} 
                        className="glass-panel" 
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '16px',
                          border: r.principal_comment ? '1px solid var(--border-glass)' : '1.5px solid var(--border-accent)',
                          background: 'var(--bg-surface-solid)'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '280px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                            <span className="badge badge-success" style={{ fontSize: '9px' }}>Directly Published</span>
                            {r.principal_comment && (
                              <span className="badge badge-accent" style={{ fontSize: '9px' }}>📝 Commented</span>
                            )}
                          </div>
                          <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '4px' }}>Student: {getChildName(r.child_id)}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '4px 0' }}>
                            <strong>Trainer:</strong> {getTrainerName(r.trainer_id)} | <strong>Date:</strong> {r.report_date}
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', fontStyle: 'italic' }}>
                            "{r.notes.length > 120 ? `${r.notes.substring(0, 120)}...` : r.notes}"
                          </p>
                          {r.principal_comment && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(139, 92, 246, 0.04)', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)', fontSize: '12px' }}>
                              <strong>Recommendation:</strong> {r.principal_comment}
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => {
                            setSelectedReviewReportId(r.id);
                            setReviewComment(r.principal_comment || '');
                          }}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '13px', height: 'fit-content' }}
                        >
                          {r.principal_comment ? 'Edit Comment' : 'Add Comment'}
                        </button>
                      </div>
                    ))}

                    {progressReports.length === 0 && (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No progress reports currently logged.
                      </div>
                    )}
                  </div>
                ) : (
                  (() => {
                    const rep = progressReports.find(r => r.id === selectedReviewReportId);
                    if (!rep) return null;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReviewReportId(null)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '13px', width: 'fit-content' }}
                        >
                          ← Back to Progress List
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '17px', margin: '0 0 4px 0' }}>Reviewing Progress Report for {getChildName(rep.child_id)}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted by Trainer {getTrainerName(rep.trainer_id)} on {rep.report_date}</span>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Clinical Session Notes:</strong>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', margin: 0, whiteSpace: 'pre-wrap' }}>{rep.notes}</p>
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            commentProgressReport(rep.id, reviewComment);
                            setSelectedReviewReportId(null);
                            setReviewComment('');
                          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                            <div>
                              <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Reviewer recommendations / feedback comments (Updates parent view instantly)</label>
                              <textarea 
                                required
                                placeholder="Add observations, home-plan actions, or feedback notes..." 
                                value={reviewComment} 
                                onChange={e => setReviewComment(e.target.value)}
                                style={{ minHeight: '80px', width: '100%', padding: '10px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSelectedReviewReportId(null)}
                                style={{ padding: '10px 20px' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: '10px 24px' }}
                              >
                                Save Comment
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    );
                  })()
                )
              ) : (
                // ─── BEHAVIOR REPORTS PORTAL (REQUIRE AUTHORIZATION) ───
                selectedReviewReportId === null ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Inner Pending/Completed Subtabs */}
                    <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                      <button
                        type="button"
                        className={`btn ${reviewCategory === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setReviewCategory('pending'); }}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        Pending Review ({behaviorReports.filter(r => !r.reviewed_by_ids?.includes(currentUser.id)).length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${reviewCategory === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setReviewCategory('completed'); }}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        Completed Review ({behaviorReports.filter(r => r.reviewed_by_ids?.includes(currentUser.id)).length})
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {reviewCategory === 'pending' ? (
                        behaviorReports.filter(r => !r.reviewed_by_ids?.includes(currentUser.id)).map(r => (
                          <div 
                            key={`rev-beh-${r.id}`} 
                            className="glass-panel" 
                            style={{
                              padding: '20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '16px',
                              border: '1.5px solid var(--border-accent)'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: '280px' }}>
                              <span className="badge badge-warning" style={{ fontSize: '9px', marginBottom: '8px' }}>Pending Authorization</span>
                              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '6px' }}>Student: {getChildName(r.child_id)}</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0' }}>
                                <strong>Trainer:</strong> {getTrainerName(r.trainer_id)} | <strong>Date:</strong> {r.report_date}
                              </p>
                              <p style={{ color: 'var(--text-primary)', fontSize: '13px', marginTop: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                                <strong>Incident:</strong> {r.nature_of_incident}
                              </p>
                            </div>

                            <button 
                              onClick={() => {
                                setSelectedReviewReportId(r.id);
                                setReviewComment(r.principal_comment || '');
                                setReviewVisibility(r.visibility || 'public');
                              }}
                              className="btn btn-primary"
                              style={{ padding: '10px 20px', fontSize: '13px', height: 'fit-content' }}
                            >
                              Review & Authorize
                            </button>
                          </div>
                        ))
                      ) : (
                        behaviorReports.filter(r => r.reviewed_by_ids?.includes(currentUser.id)).map(r => (
                          <div 
                            key={`rev-beh-${r.id}`} 
                            className="glass-panel" 
                            style={{
                              padding: '20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '16px',
                              border: '1px solid var(--border-glass)'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: '280px' }}>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                <span className={`badge badge-${r.status === 'authorized' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>
                                  {r.status === 'authorized' ? 'Authorized' : 'Rejected'}
                                </span>
                                <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                                  {r.visibility === 'public' ? 'Public (Visible to Parent)' : 'Internal Only'}
                                </span>
                              </div>
                              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>Student: {getChildName(r.child_id)}</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0' }}>
                                <strong>Trainer:</strong> {getTrainerName(r.trainer_id)} | <strong>Date:</strong> {r.report_date}
                              </p>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                                <div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Incident Nature</div>
                                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{r.nature_of_incident}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Reviewer Comment</div>
                                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: r.principal_comment ? 'normal' : 'italic' }}>
                                    {r.principal_comment || 'No review comments added.'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                setSelectedReviewReportId(r.id);
                                setReviewComment(r.principal_comment || '');
                                setReviewVisibility(r.visibility || 'public');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '8px 16px', fontSize: '13px', height: 'fit-content' }}
                            >
                              Edit Comment
                            </button>
                          </div>
                        ))
                      )}

                      {reviewCategory === 'pending' && behaviorReports.filter(r => !r.reviewed_by_ids?.includes(currentUser.id)).length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No behavior reports currently awaiting authorization review.
                        </div>
                      )}
                      {reviewCategory === 'completed' && behaviorReports.filter(r => r.reviewed_by_ids?.includes(currentUser.id)).length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No reviewed behavior reports found.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  (() => {
                    const rep = behaviorReports.find(r => r.id === selectedReviewReportId);
                    if (!rep) return null;
                    const isCompleted = rep.status !== 'pending_review';
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReviewReportId(null)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '13px', width: 'fit-content' }}
                        >
                          ← Back to Behavior List
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '17px', margin: '0 0 4px 0' }}>
                              {isCompleted ? 'Editing Review Details for' : 'Reviewing Behavior Report for'} {getChildName(rep.child_id)}
                            </h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted by Trainer {getTrainerName(rep.trainer_id)} on {rep.report_date}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                            <div>
                              <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nature of Incident:</strong>
                              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>{rep.nature_of_incident}</p>
                            </div>
                            {rep.triggers_causes && (
                              <div>
                                <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Triggers / Causes:</strong>
                                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>{rep.triggers_causes}</p>
                              </div>
                            )}
                            {rep.actions_taken && (
                              <div>
                                <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Actions Taken:</strong>
                                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>{rep.actions_taken}</p>
                              </div>
                            )}
                            {rep.follow_up_observations && (
                              <div>
                                <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Follow-up Observations:</strong>
                                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>{rep.follow_up_observations}</p>
                              </div>
                            )}
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (isCompleted) {
                              reviewBehaviorReport(rep.id, rep.status as 'authorized' | 'rejected', reviewComment, reviewVisibility);
                            } else {
                              reviewBehaviorReport(rep.id, 'authorized', reviewComment, reviewVisibility);
                            }
                            setSelectedReviewReportId(null);
                            setReviewComment('');
                          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                            <div>
                              <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Reviewer Comments / Recommendations (Saves to Parent View immediately)</label>
                              <textarea 
                                required
                                placeholder="Add observation notes or home action recommendations..." 
                                value={reviewComment} 
                                onChange={e => setReviewComment(e.target.value)}
                                style={{ minHeight: '80px', width: '100%', padding: '10px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Set Visibility Level</label>
                                <select 
                                  value={reviewVisibility} 
                                  onChange={e => setReviewVisibility(e.target.value as 'private' | 'public')}
                                  style={{ width: '100%', padding: '10px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                                >
                                  <option value="public">Public (Visible to Parent)</option>
                                  <option value="private">Private (Visible to Staff Only)</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                              {!rep.reviewed_by_ids?.includes(currentUser.id) && (
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    const targetStatus = rep.status === 'pending_review' ? 'authorized' : rep.status;
                                    reviewBehaviorReport(rep.id, targetStatus as 'authorized' | 'rejected', reviewComment || rep.principal_comment || '', reviewVisibility || rep.visibility);
                                    setSelectedReviewReportId(null);
                                    setReviewComment('');
                                  }}
                                  style={{ padding: '10px 20px', border: '1.5px solid var(--border-glass)' }}
                                >
                                  Acknowledge & Mark Reviewed
                                </button>
                              )}

                              {!isCompleted && (
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    reviewBehaviorReport(rep.id, 'rejected', reviewComment, reviewVisibility);
                                    setSelectedReviewReportId(null);
                                    setReviewComment('');
                                  }}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1.5px solid rgba(239, 68, 68, 0.25)', padding: '10px 20px' }}
                                >
                                  Reject Report
                                </button>
                              )}
                              <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: '10px 24px' }}
                              >
                                {isCompleted ? 'Save Changes' : 'Approve & Authorize'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    );
                  })()
                )
              )}
            </div>
          </div>
        )}


        {activeTab === 'history' && (() => {
          const isParent = currentUser.role === 'parent';
          const isTrainer = currentUser.role === 'trainer';
          const isAdmin = ['super_admin', 'admin', 'principal'].includes(currentUser.role);
          
          // Relevant sessions for attendance list
          const relevantSessions = sessions.filter(s => {
            if (isTrainer) return s.trainer_id === currentUser.id;
            return true;
          });

          // Resolve attendance status for sessions
          const attendanceRows = relevantSessions.map(s => {
            const record = attendanceRecords.find(r => r.session_id === s.id);
            const childName = children.find(c => c.id === s.child_id)?.full_name || 'Unknown Child';
            const trainerName = users.find(u => u.id === s.trainer_id)?.name || 'Unknown Trainer';
            const therapyName = therapyTypes.find(t => t.id === s.therapy_type_id)?.name || 'General Therapy';
            
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

            return {
              session: s,
              record,
              childName,
              trainerName,
              therapyName,
              status
            };
          });

          // Sort arrays desc
          const sortedProgress = [...visibleProgress]
            .filter(r => historyChildFilter === 'all' || r.child_id === parseInt(historyChildFilter))
            .sort((a, b) => b.report_date.localeCompare(a.report_date));
          const sortedBehavior = [...visibleBehavior]
            .filter(r => historyChildFilter === 'all' || r.child_id === parseInt(historyChildFilter))
            .sort((a, b) => b.report_date.localeCompare(a.report_date));
          const sortedAttendance = [...attendanceRows]
            .filter(r => historyChildFilter === 'all' || r.session.child_id === parseInt(historyChildFilter))
            .sort((a, b) => {
              const dateCompare = b.session.session_date.localeCompare(a.session.session_date);
              if (dateCompare !== 0) return dateCompare;
              return b.session.start_time.localeCompare(a.session.start_time);
            });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* History selection cards grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isParent ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '10px'
              }}>
                {/* 1. Progress report card */}
                <div 
                  onClick={() => setSelectedHistoryCard('progress')}
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    border: selectedHistoryCard === 'progress' ? '1.5px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    background: selectedHistoryCard === 'progress' ? 'rgba(139, 92, 246, 0.04)' : 'var(--bg-surface)',
                    opacity: selectedHistoryCard === 'progress' ? 1 : 0.8,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.12)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Progress Reports</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sortedProgress.length} reports logged</span>
                  </div>
                </div>

                {/* 2. Behavior observation card */}
                <div 
                  onClick={() => setSelectedHistoryCard('behavior')}
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    border: selectedHistoryCard === 'behavior' ? '1.5px solid var(--color-success)' : '1px solid var(--border-glass)',
                    background: selectedHistoryCard === 'behavior' ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface)',
                    opacity: selectedHistoryCard === 'behavior' ? 1 : 0.8,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Behavior Reports</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sortedBehavior.length} reports logged</span>
                  </div>
                </div>

                {/* 3. Attendance report card (hidden for parents) */}
                {!isParent && (
                  <div 
                    onClick={() => setSelectedHistoryCard('attendance')}
                    className="glass-panel"
                    style={{
                      padding: '18px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      border: selectedHistoryCard === 'attendance' ? '1.5px solid var(--color-warning)' : '1px solid var(--border-glass)',
                      background: selectedHistoryCard === 'attendance' ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-surface)',
                      opacity: selectedHistoryCard === 'attendance' ? 1 : 0.8,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--color-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Attendance Logs</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sortedAttendance.length} sessions logged</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Results Display Area */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                
                {/* Student Select Filter */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Filter by Student:</label>
                  <select 
                    value={historyChildFilter} 
                    onChange={e => setHistoryChildFilter(e.target.value)}
                    style={{ width: '220px', padding: '6px 12px', fontSize: '13px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}
                  >
                    <option value="all">All Students</option>
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
                
                {/* A. Progress Reports Table */}
                {selectedHistoryCard === 'progress' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isAdmin && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            setReportTitle('Therapy Progress Summary Report');
                            setPdfChildId('all');
                            setPdfTrainerId('all');
                            setPdfDateStart('');
                            setPdfDateEnd('');
                            setShowDownloadModal(true);
                          }} 
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                        >
                          <Download size={16} />
                          Download PDF Report
                        </button>
                      </div>
                    )}
                    
                    <div className="table-scroll-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Trainer</th>
                            <th>Clinical Session Notes</th>
                            <th>Attachments</th>
                            <th>Principal / Review Comments</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedProgress.map(r => (
                            <tr key={`prog-${r.id}`}>
                              <td><strong>{r.report_date}</strong></td>
                              <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{getChildName(r.child_id)}</td>
                              <td>{getTrainerName(r.trainer_id)}</td>
                              <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.notes}>
                                {r.notes}
                              </td>
                              <td>
                                {r.media_links && r.media_links.length > 0 ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {r.media_links.map((link, idx) => (
                                      <a key={idx} href={link} target="_blank" rel="noreferrer" className="badge badge-accent" style={{ fontSize: '9px', textDecoration: 'underline' }}>
                                        📎 {link.split('/').pop()}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>None</span>
                                )}
                              </td>
                              <td>
                                {r.principal_comment ? (
                                  <div style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)', maxWidth: '240px', lineHeight: '1.3' }}>
                                    <strong>Principal:</strong> {r.principal_comment}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>No comments yet</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  onClick={() => onViewPdf({ type: 'progress', id: r.id })}
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', gap: '4px', alignItems: 'center' }}
                                >
                                  <Printer size={12} /> Render PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                          {sortedProgress.length === 0 && (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                                No Progress Reports registered.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* B. Behavior Observation Reports Table */}
                {selectedHistoryCard === 'behavior' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isAdmin && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            setReportTitle('Behavior Observation Summary Report');
                            setPdfChildId('all');
                            setPdfTrainerId('all');
                            setPdfStatus('all');
                            setPdfVisibility('all');
                            setPdfDateStart('');
                            setPdfDateEnd('');
                            setShowDownloadModal(true);
                          }} 
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                        >
                          <Download size={16} />
                          Download PDF Report
                        </button>
                      </div>
                    )}
                    
                    <div className="table-scroll-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Trainer</th>
                            <th>Incident Nature</th>
                            <th>Status / Visibility</th>
                            <th>Principal / Review Comments</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedBehavior.map(r => (
                            <tr key={`beh-${r.id}`}>
                              <td><strong>{r.report_date}</strong></td>
                              <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{getChildName(r.child_id)}</td>
                              <td>{getTrainerName(r.trainer_id)}</td>
                              <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.nature_of_incident}>
                                {r.nature_of_incident}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <span className={`badge badge-${r.status === 'authorized' ? 'success' : r.status === 'pending_review' ? 'warning' : 'danger'}`}>
                                    {r.status}
                                  </span>
                                  <span className="badge badge-accent">
                                    {r.visibility}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {r.principal_comment ? (
                                  <div style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)', maxWidth: '240px', lineHeight: '1.3' }}>
                                    <strong>Principal:</strong> {r.principal_comment}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>No comments yet</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  onClick={() => onViewPdf({ type: 'behavior', id: r.id })}
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', gap: '4px', alignItems: 'center' }}
                                >
                                  <Printer size={12} /> Render PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                          {sortedBehavior.length === 0 && (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                                No Behavior Reports registered.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* C. Attendance logs table */}
                {selectedHistoryCard === 'attendance' && !isParent && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => {
                          setPdfDateStart(sessions.length > 0 ? sessions[sessions.length - 1].session_date : '');
                          setPdfDateEnd(new Date().toISOString().split('T')[0]);
                          setShowDownloadModal(true);
                        }} 
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                      >
                        <Download size={16} />
                        Download PDF Report
                      </button>
                    </div>
                    
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
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAttendance.map(({ session, record, childName, trainerName, therapyName, status }) => (
                            <tr key={session.id}>
                              <td>
                                <strong>{session.session_date}</strong>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{session.start_time} - {session.end_time}</div>
                              </td>
                              <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{childName}</td>
                              <td>
                                <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{therapyName}</span>
                              </td>
                              {isAdmin && <td>{trainerName}</td>}
                              <td>{record?.check_in_time ? <span className="badge badge-success">{record.check_in_time}</span> : '--:--'}</td>
                              <td>{record?.check_out_time ? <span className="badge badge-primary">{record.check_out_time}</span> : '--:--'}</td>
                              <td>
                                {status === 'completed' && <span className="badge badge-success">Completed</span>}
                                {status === 'checked_in' && <span className="badge badge-info">Checked In</span>}
                                {status === 'absent' && <span className="badge badge-danger">No-Show</span>}
                                {status === 'scheduled' && <span className="badge badge-warning">Scheduled</span>}
                              </td>
                              <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record?.notes}>
                                {record?.notes || '--'}
                              </td>
                            </tr>
                          ))}
                          {sortedAttendance.length === 0 && (
                            <tr>
                              <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                                No attendance records logged.
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
        })()}
      </div>

      {/* ─── PDF CUSTOMIZATION OPTIONS SIDE DRAWER ─── */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8, 12, 24, 0.75)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }} onClick={() => setShowDownloadModal(false)}>
          <div 
            className="glass-panel animate-scale-up" 
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '24px',
              background: 'var(--bg-surface-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  Customize PDF Report
                </h3>
                <button 
                  onClick={() => setShowDownloadModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleLaunchPrint} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Report Title Header</label>
                  <input 
                    type="text" 
                    required
                    value={reportTitle} 
                    onChange={e => setReportTitle(e.target.value)} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>From Date</label>
                    <input 
                      type="date" 
                      value={pdfDateStart} 
                      onChange={e => setPdfDateStart(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>To Date</label>
                    <input 
                      type="date" 
                      value={pdfDateEnd} 
                      onChange={e => setPdfDateEnd(e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Filter Student</label>
                    <select value={pdfChildId} onChange={e => setPdfChildId(e.target.value)}>
                      <option value="all">All Students</option>
                      {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Filter Trainer</label>
                    <select value={pdfTrainerId} onChange={e => setPdfTrainerId(e.target.value)}>
                      <option value="all">All Staff / Trainers</option>
                      {users.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {selectedHistoryCard === 'attendance' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Therapy Program</label>
                      <select value={pdfTherapyTypeId} onChange={e => setPdfTherapyTypeId(e.target.value)}>
                        <option value="all">All Programs</option>
                        {therapyTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Session Status</label>
                      <select value={pdfStatus} onChange={e => setPdfStatus(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="absent">Absent / No-Show</option>
                        <option value="scheduled">Scheduled / Pending</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedHistoryCard === 'behavior' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Incident Status</label>
                      <select value={pdfStatus} onChange={e => setPdfStatus(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="authorized">Authorized</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Visibility</label>
                      <select value={pdfVisibility} onChange={e => setPdfVisibility(e.target.value)}>
                        <option value="all">All Visibilities</option>
                        <option value="public">Public (Visible to Parents)</option>
                        <option value="internal">Internal Only</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedHistoryCard === 'attendance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        id="inc-notes"
                        checked={pdfIncludeNotes}
                        onChange={e => setPdfIncludeNotes(e.target.checked)}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      <label htmlFor="inc-notes" style={{ fontSize: '13px', cursor: 'pointer' }}>Include Attendance Notes Column</label>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        id="inc-stats"
                        checked={pdfIncludeStats}
                        onChange={e => setPdfIncludeStats(e.target.checked)}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      <label htmlFor="inc-stats" style={{ fontSize: '13px', cursor: 'pointer' }}>Include Summary Metrics boxes</label>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDownloadModal(false)} style={{ padding: '10px 20px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Generate PDF Preview</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
