import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Radio,
  Zap,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { useSpeechRecognition } from '../utils/useSpeechRecognition';
import { analyzeIncidentText } from '../engine/detectionEngine';
import { calculateIncidentSeverity } from '../engine/severityScoring';
import type { Incident, IncidentResponse, Education } from '../types/index';

interface SpeakIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIncident: (incident: Incident) => void;
}

const VOICE_PROMPT_PRESETS = [
  {
    title: 'Phishing & PowerShell Beacon',
    phrase:
      'We received a spear phishing email with a malicious macro attachment named Q1_Invoice.xlsm. The macro spawned PowerShell with an encoded command to download a Cobalt Strike beacon from 185.220.101.5 on port 8080.',
  },
  {
    title: 'Credential Theft & Lateral Movement',
    phrase:
      'Endpoint alert triggered on Domain Controller. Attacker ran mimikatz sekurlsa logonpasswords to dump LSASS memory and obtained Administrator NTLM hashes. They used Pass the Hash to move laterally to server FS-PROD-01.',
  },
  {
    title: 'Ransomware Destruction & Exfiltration',
    phrase:
      'High volume data exfiltration detected with 80 gigabytes compressed in 7z archive and uploaded to mega.nz. LockBit ransomware executed, deleting shadow copies with vssadmin delete shadows and demanding 50 BTC.',
  },
  {
    title: 'Brute Force & Cloud Storage Sync',
    phrase:
      'Over 500 failed SSH login attempts detected against external VPN gateway. Following credential stuffing bypass, rclone script transferred sensitive databases to external cloud endpoint pastebin.com.',
  },
];

/**
 * Builds context-aware Recommended Response Playbook from detected threat categories
 */
function generateContextualResponse(categories: string[]): IncidentResponse {
  const immediate: string[] = ['Isolate affected host(s) from local network immediately'];
  const shortTerm: string[] = ['Collect forensic memory dump and triage disk artifacts'];
  const longTerm: string[] = ['Review threat hunting telemetry across enterprise SIEM'];

  if (categories.includes('phishing')) {
    immediate.push('Purge malicious email subject from all user inboxes across Exchange/M365');
    immediate.push('Block sender domain and IP at secure email gateway');
    shortTerm.push('Audit web proxy logs for any user clicks on malicious URLs');
    longTerm.push('Conduct simulated phishing campaign and employee awareness refresher');
  }

  if (categories.includes('credential_theft')) {
    immediate.push('Force global password reset and invalidate active Kerberos TGT / session tokens');
    immediate.push('Disable compromised domain admin and service accounts');
    shortTerm.push('Audit Active Directory event ID 4624/4625 for unauthorized logins');
    longTerm.push('Implement Credential Guard and Privileged Access Workstations (PAWs)');
  }

  if (categories.includes('powershell_execution')) {
    immediate.push('Terminate malicious PowerShell parent/child process trees');
    shortTerm.push('Enable PowerShell Script Block Logging (Event ID 4104) and Constrained Language Mode');
    longTerm.push('Deploy AppLocker / WDAC application whitelisting policies');
  }

  if (categories.includes('suspicious_connection')) {
    immediate.push('Null-route C2 IP addresses and sinkhole malicious domains at perimeter firewalls');
    shortTerm.push('Inspect perimeter firewall logs for beaconing intervals and DNS tunneling');
    longTerm.push('Deploy automated EDR network containment and TLS interception');
  }

  if (categories.includes('data_exfiltration')) {
    immediate.push('Sever active outbound TLS/HTTPS connections to cloud storage services');
    immediate.push('Revoke cloud storage API keys and OAuth tokens');
    shortTerm.push('Calculate scope of exfiltrated data records for compliance/regulatory notification');
    longTerm.push('Enforce Data Loss Prevention (DLP) endpoint egress restrictions');
  }

  if (categories.includes('ransomware')) {
    immediate.push('Emergency network shutdown of file shares and backup SANs');
    immediate.push('Preserve ransomware note and sample binary for decryptor verification');
    shortTerm.push('Verify integrity of immutable air-gapped backups before recovery');
    longTerm.push('Implement multi-factor authentication for all backup storage administrative consoles');
  }

  return {
    immediate: [...new Set(immediate)].slice(0, 4),
    shortTerm: [...new Set(shortTerm)].slice(0, 4),
    longTerm: [...new Set(longTerm)].slice(0, 4),
  };
}

export const SpeakIncidentModal: React.FC<SpeakIncidentModalProps> = ({
  isOpen,
  onClose,
  onLoadIncident,
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
  } = useSpeechRecognition();

  const [isProcessing, setIsProcessing] = useState(false);

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
    }
  }, [isOpen, isListening, stopListening]);

  if (!isOpen) return null;

  const currentText = (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim();

  // Real-time preview of detection results
  const previewDetection = currentText ? analyzeIncidentText(currentText) : null;
  const previewScore = previewDetection
    ? calculateIncidentSeverity(previewDetection.events, previewDetection.overallSeverity)
    : null;

  const handleAnalyzeAndLoad = () => {
    if (!currentText) return;
    if (isListening) stopListening();

    setIsProcessing(true);

    setTimeout(() => {
      const detection = analyzeIncidentText(currentText);
      const severityResult = calculateIncidentSeverity(detection.events, detection.overallSeverity);
      const responses = generateContextualResponse(detection.threatCategories);

      const education: Education = {
        title: `Verbal Telemetry Analysis: ${detection.threatCategories.map((c) => c.replace('_', ' ').toUpperCase()).join(' · ') || 'MULTI-STAGE THREAT'}`,
        explanation: detection.summary,
        references: detection.matches.map((m) => m.rule.mitreUrl).filter(Boolean),
      };

      const newIncident: Incident = {
        id: `INC-VOICE-${Date.now().toString().slice(-4)}`,
        title: detection.matches[0]?.rule.name || 'Verbal Incident Telemetry Report',
        description: currentText,
        severity: severityResult.severity,
        date: new Date().toISOString(),
        analyst: 'SOC Voice Telemetry (Web Speech API)',
        status: 'investigating',
        affectedSystems: ['Primary Workstation', 'Domain Perimeter'],
        timeline: detection.events,
        response: responses,
        education,
      };

      onLoadIncident(newIncident);
      setIsProcessing(false);
      onClose();
    }, 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 8, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.22 }}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: '#071628',
          border: '1px solid #1a3a5c',
          borderRadius: '14px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(59, 130, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1a3a5c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(7,22,40,1) 0%, rgba(13,37,66,0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isListening
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(59, 130, 246, 0.15)',
                border: isListening
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isListening ? (
                <Radio className="animate-pulse" size={20} color="#ef4444" />
              ) : (
                <Mic size={20} color="#60a5fa" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
                  Speak Incident Telemetry
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: !isSupported
                      ? 'rgba(234, 179, 8, 0.2)'
                      : isListening
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(59, 130, 246, 0.2)',
                    color: !isSupported
                      ? '#fde047'
                      : isListening
                      ? '#fca5a5'
                      : '#93c5fd',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: !isSupported
                      ? '1px solid #eab308'
                      : isListening
                      ? '1px solid #ef4444'
                      : '1px solid #3b82f6',
                    fontWeight: 600,
                  }}
                >
                  {!isSupported
                    ? 'Speech API Unavailable · Use Presets'
                    : isListening
                    ? '🔴 LISTENING LIVE'
                    : 'Web Speech API Ready'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Describe an attack verbally — speech will be transcribed, parsed by the detection engine, and updated across the dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #1a3a5c',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* Microphone Central Action Area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'linear-gradient(180deg, rgba(10,31,58,0.5) 0%, rgba(4,13,26,0.8) 100%)',
              border: '1px solid #1a3a5c',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Audio Wave Visualizer Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '40px', marginBottom: '18px' }}>
              {[12, 24, 36, 18, 28, 40, 30, 16, 32, 22, 14].map((h, i) => (
                <motion.div
                  key={i}
                  animate={
                    isListening
                      ? {
                          height: [8, h, 8],
                          opacity: [0.5, 1, 0.5],
                        }
                      : { height: 6, opacity: 0.25 }
                  }
                  transition={{
                    duration: 0.6 + (i % 3) * 0.2,
                    repeat: isListening ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '4px',
                    borderRadius: '3px',
                    background: isListening
                      ? 'linear-gradient(to top, #ef4444, #f97316)'
                      : '#3b82f6',
                  }}
                />
              ))}
            </div>

            {/* Big Mic Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: isListening
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: isListening ? '3px solid #fca5a5' : '3px solid #60a5fa',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening
                  ? '0 0 25px rgba(239, 68, 68, 0.6)'
                  : '0 0 25px rgba(37, 99, 235, 0.4)',
                marginBottom: '12px',
              }}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </motion.button>

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isListening ? '#fca5a5' : '#e2eeff',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {isListening ? 'Click to Stop Speaking' : 'Click Microphone to Start Speaking'}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Speak naturally about attacker tools, commands, IP addresses, or actions.
            </span>

            {error && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={13} color="#ef4444" />
                {error}
              </div>
            )}
          </div>

          {/* Quick Speech Presets (1-click simulation if no mic available) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Speech Prompts (Click to Test)
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Simulate verbal dictation</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {VOICE_PROMPT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualTranscript(preset.phrase)}
                  style={{
                    background: 'rgba(10, 31, 58, 0.6)',
                    border: '1px solid #1a3a5c',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a3a5c')}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#60a5fa', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Volume2 size={11} color="#60a5fa" />
                    {preset.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{preset.phrase}"
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Transcription Box */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={12} color="#60a5fa" />
                Live Transcribed Incident Text
              </label>
              {currentText && (
                <button
                  onClick={resetTranscript}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <RotateCcw size={10} /> Reset
                </button>
              )}
            </div>

            <div
              style={{
                minHeight: '90px',
                maxHeight: '130px',
                overflowY: 'auto',
                background: '#040d1a',
                border: '1px solid #1a3a5c',
                borderRadius: '8px',
                padding: '12px',
                color: currentText ? '#f1f5f9' : '#64748b',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.5,
              }}
            >
              {currentText || 'Spoken text will appear here in real time as you talk...'}
              {isListening && (
                <span className="animate-pulse" style={{ color: '#ef4444', marginLeft: '4px' }}>
                  |
                </span>
              )}
            </div>
          </div>

          {/* Real-time Threat Correlation Preview (if text exists) */}
          {previewDetection && previewDetection.events.length > 0 && previewScore && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(7, 22, 40, 0.9)',
                border: '1px solid #1e3a5f',
                borderRadius: '8px',
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} color="#60a5fa" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2eeff' }}>
                    Live Engine Correlation ({previewDetection.events.length} Events Detected)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                  }}
                >
                  Score: {previewScore.score}/100 · {previewScore.severity}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {previewDetection.events.map((ev, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '10px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {ev.stage.toUpperCase()}: {ev.title} ({ev.mitre})
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #1a3a5c',
            background: 'rgba(7, 22, 40, 0.98)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {currentText
              ? 'Ready to update attack timeline, severity scoring, evidence, and response.'
              : 'Dictate an incident or select a sample prompt above.'}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyzeAndLoad}
            disabled={!currentText || isProcessing}
            style={{
              background: currentText
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(10, 31, 58, 0.6)',
              border: currentText ? '1px solid #34d399' : '1px solid #1a3a5c',
              borderRadius: '8px',
              color: currentText ? '#ffffff' : '#64748b',
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: currentText && !isProcessing ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: currentText ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            {isProcessing ? (
              <>
                <RotateCcw className="animate-spin" size={14} /> Correlating Investigation...
              </>
            ) : (
              <>
                <Zap size={14} /> Analyze & Update Investigation Dashboard
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SpeakIncidentModal;
