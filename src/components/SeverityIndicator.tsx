import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Incident } from '../types/index';
import {
  calculateIncidentSeverity,
  getSeverityScoreColor,
} from '../engine/severityScoring';
import {
  Server,
  User,
  Calendar,
  Activity,
  ShieldAlert,
  ChevronDown,
  Info,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface SeverityIndicatorProps {
  incident: Incident;
}

/**
 * Animated Circular Gauge for 0–100 Threat Score
 */
const AnimatedScoreGauge: React.FC<{ score: number; color: string; label: string }> = ({
  score,
  color,
  label,
}) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track background */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="#131d2e"
          strokeWidth="4"
          fill="transparent"
        />
        {/* Animated value arc */}
        <motion.circle
          cx="30"
          cy="30"
          r={radius}
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 4px ${color}60)`,
          }}
        />
      </svg>
      {/* Center text score */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        <motion.span
          key={score}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            fontSize: '14px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#ffffff',
          }}
        >
          {score}
        </motion.span>
        <span
          style={{
            fontSize: '7px',
            color,
            fontWeight: 700,
            letterSpacing: '0.06em',
            marginTop: '1px',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

/**
 * Animated 4-Tier Severity Level Bars
 */
const AnimatedSeverityTiers: React.FC<{ severity: string }> = ({ severity }) => {
  const tiers = [
    { key: 'low', label: 'LOW', color: '#10b981', active: true },
    {
      key: 'medium',
      label: 'MED',
      color: '#eab308',
      active: severity === 'medium' || severity === 'high' || severity === 'critical',
    },
    {
      key: 'high',
      label: 'HIGH',
      color: '#f97316',
      active: severity === 'high' || severity === 'critical',
    },
    {
      key: 'critical',
      label: 'CRIT',
      color: '#ef4444',
      active: severity === 'critical',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '32px' }}>
      {tiers.map((t, idx) => {
        const isCurrent = t.key === severity;
        return (
          <div
            key={t.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: t.active ? `${(idx + 1) * 5 + 6}px` : '4px',
                opacity: t.active ? 1 : 0.2,
              }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              style={{
                width: '10px',
                background: t.active ? t.color : '#1e293b',
                borderRadius: '2px',
                boxShadow: isCurrent ? `0 0 8px ${t.color}` : 'none',
              }}
            />
            <span
              style={{
                fontSize: '7px',
                fontWeight: isCurrent ? 700 : 500,
                color: t.active ? t.color : '#475569',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({ incident }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Dynamic severity scoring from our dedicated TypeScript engine
  const scoreResult = calculateIncidentSeverity(incident.timeline, incident.severity);
  const scoreToken = getSeverityScoreColor(scoreResult.score);

  return (
    <div
      style={{
        background: '#0a0f18',
        borderBottom: '1px solid #1a2638',
        padding: '10px 18px',
        position: 'relative',
      }}
    >
      {/* Top Main Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Incident Metadata & Title */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span
              style={{
                fontSize: '9px',
                color: '#60a5fa',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.04em',
                background: '#101c2e',
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid #1e3a5f',
                fontWeight: 600,
              }}
            >
              {incident.id}
            </span>

            {/* Severity Pill */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 7px',
                borderRadius: '3px',
                background: scoreToken.bgColor,
                color: scoreToken.color,
                border: `1px solid ${scoreToken.borderColor}`,
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: scoreToken.color,
                }}
              />
              {scoreResult.severity} Threat Level
            </span>

            {/* Killchain Stage Counter */}
            <span
              style={{
                fontSize: '9px',
                color: '#38bdf8',
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.2)',
                padding: '2px 6px',
                borderRadius: '3px',
                fontFamily: 'JetBrains Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <ShieldAlert size={9} color="#38bdf8" />
              {scoreResult.stageCount}/{scoreResult.totalPossibleStages} Stages
            </span>

            <span
              style={{
                fontSize: '9px',
                color: '#94a3b8',
                background: '#121a28',
                border: '1px solid #1e293b',
                padding: '2px 6px',
                borderRadius: '3px',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              STATUS: {incident.status.toUpperCase()}
            </span>
          </div>

          <h1
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.25,
              margin: '2px 0',
            }}
          >
            {incident.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.35,
              maxWidth: '640px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {incident.description}
          </p>
        </div>

        {/* Right: Animated Scoring Panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#0d1522',
            border: `1px solid ${scoreToken.borderColor}50`,
            borderRadius: '8px',
            padding: '6px 12px',
          }}
        >
          {/* Animated Gauge */}
          <AnimatedScoreGauge
            score={scoreResult.score}
            color={scoreToken.color}
            label={scoreToken.label}
          />

          {/* Level Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <AnimatedSeverityTiers severity={scoreResult.severity} />
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                fontSize: '9px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '1px 3px',
              }}
            >
              <Info size={9} />
              {showDetails ? 'Hide' : 'Factors'}
              <ChevronDown
                size={9}
                style={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Score Factors & Killchain Breakdown Drawer */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: 'hidden',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #1a2638',
            }}
          >
            <div
              style={{
                background: '#060a12',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Flame size={12} color={scoreToken.color} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#f1f5f9' }}>
                    Severity Scoring Rationale & Killchain Factors
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#94a3b8',
                  }}
                >
                  Killchain Coverage: <strong>{scoreResult.killchainCoveragePercent}%</strong>
                </span>
              </div>

              <div style={{ fontSize: '10px', color: '#93c5fd', lineHeight: 1.35 }}>
                {scoreResult.summary}
              </div>

              {/* Detected factors chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {scoreResult.criticalFactors.map((factor, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '9px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fca5a5',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle size={8} color="#ef4444" />
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', alignItems: 'center' }}>
        {[
          { icon: <User size={10} color="#64748b" />, label: 'Analyst', value: incident.analyst },
          { icon: <Calendar size={10} color="#64748b" />, label: 'Date', value: incident.date },
          { icon: <Activity size={10} color="#64748b" />, label: 'Events', value: `${incident.timeline.length} telemetry records` },
          { icon: <Server size={10} color="#64748b" />, label: 'Impacted Hosts', value: `${incident.affectedSystems.length} systems` },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {item.icon}
            <span style={{ fontSize: '9px', color: '#64748b' }}>{item.label}:</span>
            <span style={{ fontSize: '9px', color: '#cbd5e1', fontFamily: 'JetBrains Mono, monospace' }}>
              {item.value}
            </span>
          </div>
        ))}

        {/* Affected systems pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {incident.affectedSystems.map((sys) => (
            <span
              key={sys}
              style={{
                fontSize: '8px',
                color: '#38bdf8',
                background: '#0c1a2d',
                border: '1px solid #1e3a5f',
                padding: '1px 5px',
                borderRadius: '3px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {sys}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeverityIndicator;
