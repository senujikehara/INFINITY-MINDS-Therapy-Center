import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import type { ProgressReport, BehaviorReport } from '../context/SimulatorContext';
import logoImg from '../assets/logo.png';
import { ArrowLeft, Printer, FileWarning } from 'lucide-react';

interface PDFViewerProps {
  pdfData: { type: 'progress' | 'behavior'; id: number } | null;
  onBack: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfData, onBack }) => {
  const { progressReports, behaviorReports, children, therapyTypes } = useSimulator();

  if (!pdfData) return null;

  const getReportData = () => {
    if (pdfData.type === 'progress') {
      const report = progressReports.find(r => r.id === pdfData.id);
      const child = report ? children.find(c => c.id === report.child_id) : null;
      return { report, child };
    } else {
      const report = behaviorReports.find(r => r.id === pdfData.id);
      const child = report ? children.find(c => c.id === report.child_id) : null;
      return { report, child };
    }
  };

  const { report, child } = getReportData();

  if (!report || !child) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        Report data not found.
        <button className="btn btn-secondary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  const getTherapyName = (id: number) => therapyTypes.find(t => t.id === id)?.name || 'General';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to Reports
        </button>
        
        <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={16} /> Print PDF Document
        </button>
      </div>

      {/* Compliance Rule Alert */}
      <div className="glass-panel" style={{
        padding: '16px',
        borderLeft: '4px solid var(--color-success)',
        background: 'rgba(16, 185, 129, 0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <FileWarning size={20} color="var(--color-success)" />
        <div style={{ fontSize: '13px' }}>
          <strong>Section 6.2 Compliance Rule:</strong> The Trainer Name is structurally omitted from this PDF template rendering (enforced server-side) to protect identity parameters.
        </div>
      </div>

      {/* Print PDF Canvas Mockup */}
      <div style={{
        background: '#fff',
        color: '#1e293b',
        padding: '50px',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        fontFamily: 'sans-serif',
        minHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        
        {/* PDF Header */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '3px solid #8b5cf6',
            paddingBottom: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={logoImg} style={{ width: '42px', height: '42px', objectFit: 'contain' }} alt="Logo" />
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', margin: 0, fontFamily: 'var(--font-title)', lineHeight: '1.2' }}>
                  INFINITY MINDS
                </h1>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Therapy & Counseling Center
                </span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>
                {pdfData.type === 'progress' ? 'CLINICAL PROGRESS REPORT' : 'BEHAVIOR STATUS REPORT'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Document Ref: IM-{pdfData.type.toUpperCase()}-{report.id}
              </div>
            </div>
          </div>

          {/* Student Profile block */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '40px',
            background: '#f8fafc',
            padding: '16px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Child Name</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{child.full_name}</div>
              
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '10px' }}>Date of Birth</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{child.dob}</div>
            </div>
            
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Date of Report</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{report.report_date}</div>
              
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '10px' }}>Enrolled Therapy Category</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{getTherapyName(child.therapy_type_id)}</div>
            </div>
          </div>

          {/* Clinical Core Content */}
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
            {pdfData.type === 'progress' ? (
              // Progress Report Details
              <div>
                <h3 style={{ fontSize: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#1e293b', marginBottom: '12px' }}>
                  Session Clinical Notes
                </h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{(report as ProgressReport).notes}</p>
                
                {/* Principal/Admin recommendations for progress reports */}
                {(report as ProgressReport).principal_comment && (
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #8b5cf6', marginTop: '20px' }}>
                    <h3 style={{ fontSize: '14px', color: '#1e293b', marginTop: 0, marginBottom: '6px' }}>
                      Clinical Recommendations / Comments
                    </h3>
                    <p style={{ fontStyle: 'italic', margin: 0 }}>{(report as ProgressReport).principal_comment}</p>
                  </div>
                )}
              </div>
            ) : (
              // Behavior Report Details
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#1e293b', marginBottom: '8px' }}>
                    1. Nature of Incident
                  </h3>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#334155' }}>{(report as BehaviorReport).nature_of_incident}</p>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#1e293b', marginBottom: '8px' }}>
                    2. Triggers / Causes of Incident
                  </h3>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#334155' }}>{(report as BehaviorReport).triggers_causes}</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#1e293b', marginBottom: '8px' }}>
                    3. Actions Taken
                  </h3>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#334155' }}>{(report as BehaviorReport).actions_taken}</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#1e293b', marginBottom: '8px' }}>
                    4. Observations after Follow-up
                  </h3>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#334155' }}>{(report as BehaviorReport).follow_up_observations}</p>
                </div>

                {/* Principal comments */}
                {(report as BehaviorReport).principal_comment && (
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '14px', color: '#1e293b', marginTop: 0, marginBottom: '6px' }}>
                      Clinical Recommendations / Comments
                    </h3>
                    <p style={{ fontStyle: 'italic', margin: 0 }}>{(report as BehaviorReport).principal_comment}</p>
                  </div>
                )}
              </div>
            )}

            {/* Optional Attachments rendering */}
            {report.media_links && report.media_links.length > 0 && (
              <div style={{ marginTop: '30px', borderTop: '1.5px solid #e2e8f0', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', color: '#1e293b', marginTop: 0, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Attachments & Reference Links
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {report.media_links.map((link, lIdx) => (
                    <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>📎</span>
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'underline', fontWeight: '500' }}
                      >
                        {link.split('/').pop()}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PDF Footer with structural trainer name Omission */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          marginTop: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <div>
            <div>Colombo Main Branch, Sri Lanka</div>
            <div>Email: colombo@infinityminds.lk | Phone: +94 11 234 5678</div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ height: '35px', borderBottom: '1px solid #94a3b8', width: '150px', marginBottom: '4px' }}></div>
            <div>Authorized Sign-off Stamp</div>
            {/* IN COMPLIANCE WITH MATRIX - NO TRAINER NAME IS EVER RENDERED */}
            <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 'bold', marginTop: '4px' }}>
              TRAINER DETAILS CONCEALED
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
