import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Terminal,
  Database,
  Layers,
  Award,
  Zap,
  X,
  PlusCircle,
} from 'lucide-react';
import {
  INVESTIGATION_SCENARIOS,
  getInvestigatorRank,
  type EvidenceVerdict,
} from '../engine/investigationGame';
import type { Incident, TimelineEvent } from '../types/index';
import { INCIDENTS } from '../data/incidents';

interface InvestigationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIncident: (incident: Incident) => void;
}

export const InvestigationModeModal: React.FC<InvestigationModeModalProps> = ({
  isOpen,
  onClose,
  onLoadIncident,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastVerdict, setLastVerdict] = useState<EvidenceVerdict | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const scenario = INVESTIGATION_SCENARIOS[selectedScenarioIndex];
  const currentEvidence = scenario.evidenceItems[currentIndex];
  const maxPossibleScore = scenario.evidenceItems.length * 100;

  const handleClassify = (verdict: EvidenceVerdict) => {
    if (showFeedback || isCompleted) return;

    const isCorrect = verdict === currentEvidence.expectedVerdict;
    // Award full points for correct, 40 points for cautious suspicious on malicious, 0 for wrong
    let points = 0;
    if (isCorrect) {
      points = currentEvidence.points;
      setStreak((prev) => prev + 1);
    } else if (verdict === 'suspicious' && currentEvidence.expectedVerdict === 'malicious') {
      points = 40;
      setStreak(0);
    } else {
      points = 0;
      setStreak(0);
    }

    setTotalScore((prev) => prev + points);
    setLastVerdict(verdict);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setLastVerdict(null);

    if (currentIndex + 1 < scenario.evidenceItems.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setShowFeedback(false);
    setLastVerdict(null);
    setIsCompleted(false);
  };

  const handleSwitchScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setShowFeedback(false);
    setLastVerdict(null);
    setIsCompleted(false);
  };

  // Reconstruct timeline events from malicious/suspicious items
  const reconstructedEvents: TimelineEvent[] = scenario.evidenceItems
    .filter((e) => e.expectedVerdict === 'malicious')
    .map((e, i) => ({
      id: `recon-${e.id}-${i}`,
      timestamp: e.timestamp,
      title: e.title,
      description: e.explanation,
      stage: e.attackStage || 'execution',
      severity: e.severity || 'high',
      source: e.source,
      mitre: e.mitre || 'T1059',
      indicators: e.indicators,
    }));

  const handleLoadDiscoveredChain = () => {
    const baseIncident =
      INCIDENTS.find((i) => i.id === scenario.targetIncidentId) || INCIDENTS[0];

    const discoveredIncident: Incident = {
      ...baseIncident,
      id: `INC-DISCOVERED-${Date.now().toString().slice(-4)}`,
      title: `Reconstructed Attack Chain: ${scenario.title}`,
      description: `Forensically validated attack chain reconstructed via interactive Investigation Mode. Final Analyst Score: ${totalScore}/${maxPossibleScore} (${Math.round((totalScore / maxPossibleScore) * 100)}% accuracy).`,
      timeline: reconstructedEvents,
      status: 'investigating',
    };

    onLoadIncident(discoveredIncident);
    onClose();
  };

  const rankInfo = getInvestigatorRank(totalScore, maxPossibleScore);
  const progressPct = Math.round(((currentIndex + (showFeedback ? 1 : 0)) / scenario.evidenceItems.length) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 8, 20, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 120,
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
          maxWidth: '1020px',
          maxHeight: '92vh',
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
            padding: '14px 20px',
            borderBottom: '1px solid #1a3a5c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(7,22,40,1) 0%, rgba(13,37,66,0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                  Interactive Investigation & Triage Mode
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  LIVE TRIAGE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Classify incoming telemetry artifacts as Benign, Suspicious, or Malicious to reconstruct the attack timeline.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Score & Streak counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: 'rgba(10,31,58,0.8)',
                  border: '1px solid #1a3a5c',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={13} color="#f59e0b" />
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Score:</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>
                  {totalScore}
                </span>
              </div>

              {streak > 1 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid #ef4444',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#fca5a5',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  🔥 {streak}X STREAK
                </motion.div>
              )}
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
        </div>

        {/* Scenario Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: 'rgba(4, 13, 26, 0.6)',
            borderBottom: '1px solid #1a3a5c',
          }}
        >
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Investigation Case:
          </span>
          {INVESTIGATION_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => handleSwitchScenario(idx)}
              style={{
                background: idx === selectedScenarioIndex ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: idx === selectedScenarioIndex ? '1px solid #3b82f6' : '1px solid #1a3a5c',
                borderRadius: '6px',
                color: idx === selectedScenarioIndex ? '#93c5fd' : '#94a3b8',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: idx === selectedScenarioIndex ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {idx + 1}. {sc.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{ height: '3px', width: '100%', background: '#0d2545' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: 'linear-gradient(to right, #3b82f6, #f59e0b)',
            }}
          />
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {!isCompleted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Evidence Card */}
              <div
                style={{
                  background: 'rgba(7, 22, 40, 0.85)',
                  border: '1px solid #1a3a5c',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Evidence meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#60a5fa',
                        background: 'rgba(59,130,246,0.15)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      EVIDENCE {currentIndex + 1} OF {scenario.evidenceItems.length}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#06b6d4',
                        background: 'rgba(6,182,212,0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {currentEvidence.artifactType}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentEvidence.timestamp}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Database size={11} />
                      <strong style={{ color: '#94a3b8' }}>{currentEvidence.source}</strong>
                    </div>
                  </div>
                </div>

                {/* Evidence Title & Context */}
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
                    {currentEvidence.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                    {currentEvidence.context}
                  </p>
                </div>

                {/* Raw Telemetry Box */}
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Terminal size={11} color="#60a5fa" />
                    Captured Forensic Payload / Alert Data
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      background: '#030a14',
                      border: '1px solid #1a3a5c',
                      borderRadius: '6px',
                      padding: '12px',
                      color: '#a5f3fc',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {currentEvidence.rawPayload}
                  </pre>
                </div>

                {/* Extracted Indicators */}
                {currentEvidence.indicators.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Observable IoCs:</span>
                    {currentEvidence.indicators.map((ioc, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '9px',
                          fontFamily: 'JetBrains Mono, monospace',
                          background: 'rgba(15, 23, 42, 0.7)',
                          color: '#38bdf8',
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

              {/* Decision Area / Feedback */}
              <AnimatePresence mode="wait">
                {!showFeedback ? (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2eeff' }}>
                      How do you classify this forensic evidence item?
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%', maxWidth: '750px' }}>
                      {/* Benign Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleClassify('benign')}
                        style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1.5px solid #22c55e',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(34, 197, 94, 0.15)',
                        }}
                      >
                        <CheckCircle2 size={24} color="#22c55e" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>
                          🟢 Benign
                        </span>
                        <span style={{ fontSize: '9px', color: '#86efac', textAlign: 'center' }}>
                          Normal OS or legitimate administrative activity
                        </span>
                      </motion.button>

                      {/* Suspicious Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleClassify('suspicious')}
                        style={{
                          background: 'rgba(234, 179, 8, 0.1)',
                          border: '1.5px solid #eab308',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(234, 179, 8, 0.15)',
                        }}
                      >
                        <AlertTriangle size={24} color="#eab308" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#facc15' }}>
                          🟡 Suspicious
                        </span>
                        <span style={{ fontSize: '9px', color: '#fde047', textAlign: 'center' }}>
                          Anomalous event requiring active monitoring
                        </span>
                      </motion.button>

                      {/* Malicious Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleClassify('malicious')}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1.5px solid #ef4444',
                          borderRadius: '8px',
                          padding: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <XCircle size={24} color="#ef4444" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>
                          🔴 Malicious
                        </span>
                        <span style={{ fontSize: '9px', color: '#fca5a5', textAlign: 'center' }}>
                          Hostile indicator or MITRE ATT&CK technique
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    style={{
                      background:
                        lastVerdict === currentEvidence.expectedVerdict
                          ? 'rgba(34, 197, 94, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                      border:
                        lastVerdict === currentEvidence.expectedVerdict
                          ? '1px solid #22c55e'
                          : '1px solid #ef4444',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lastVerdict === currentEvidence.expectedVerdict ? (
                          <>
                            <CheckCircle2 size={20} color="#22c55e" />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80' }}>
                              CORRECT CLASSIFICATION (+{currentEvidence.points} XP)
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle size={20} color="#ef4444" />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#f87171' }}>
                              INCORRECT · EXPECTED: {currentEvidence.expectedVerdict.toUpperCase()}
                            </span>
                          </>
                        )}
                      </div>

                      {currentEvidence.mitre && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'JetBrains Mono, monospace',
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#93c5fd',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          MITRE {currentEvidence.mitre}: {currentEvidence.mitreName}
                        </span>
                      )}
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: '#e2eeff', lineHeight: 1.55 }}>
                      {currentEvidence.explanation}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNext}
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px',
                          color: '#ffffff',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {currentIndex + 1 < scenario.evidenceItems.length ? (
                          <>
                            Next Evidence Item <ArrowRight size={13} />
                          </>
                        ) : (
                          <>
                            Reveal Attack Chain <Sparkles size={13} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Final Attack Chain Reveal View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score & Rank banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(10,31,58,0.9) 0%, rgba(4,13,26,0.95) 100%)',
                  border: '1px solid #1a3a5c',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${rankInfo.badgeColor}20`,
                      border: `1.5px solid ${rankInfo.badgeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={28} color={rankInfo.badgeColor} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Investigation Verdict & Rank
                    </span>
                    <h3 style={{ margin: '2px 0 2px 0', fontSize: '17px', fontWeight: 800, color: '#f1f5f9' }}>
                      {rankInfo.rank}
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: rankInfo.badgeColor }}>
                      {rankInfo.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>
                      {totalScore}/{maxPossibleScore}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>TOTAL SCORE</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.round((totalScore / maxPossibleScore) * 100)}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>TRIAGE ACCURACY</div>
                  </div>
                </div>
              </div>

              {/* Reconstructed Attack Chain */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Layers size={14} color="#60a5fa" />
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#e2eeff', letterSpacing: '0.04em' }}>
                    REVEALED ATTACK KILLCHAIN ({reconstructedEvents.length} CORRELATED EVENTS)
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reconstructedEvents.map((ev, i) => (
                    <div
                      key={ev.id}
                      style={{
                        background: 'rgba(7, 22, 40, 0.7)',
                        border: '1px solid #1a3a5c',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                              {ev.title}
                            </span>
                            <span
                              style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                color: '#f97316',
                                background: 'rgba(249, 115, 22, 0.15)',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                fontFamily: 'JetBrains Mono, monospace',
                              }}
                            >
                              {ev.stage.replace('_', ' ')}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.45 }}>
                            {ev.description}
                          </p>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}
                      >
                        {ev.mitre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #1a3a5c',
            background: 'rgba(7, 22, 40, 0.98)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {isCompleted ? (
            <>
              <button
                onClick={handleRestart}
                style={{
                  background: 'transparent',
                  border: '1px solid #1a3a5c',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  padding: '8px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={13} /> Try Another Case
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadDiscoveredChain}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: '1px solid #34d399',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
              >
                <PlusCircle size={14} /> Load Discovered Attack Chain into Workspace
              </motion.button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Item {currentIndex + 1} of {scenario.evidenceItems.length} in progress
              </span>

              <button
                onClick={handleRestart}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Reset Progress
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InvestigationModeModal;
