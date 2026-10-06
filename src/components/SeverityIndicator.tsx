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
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track background */}
        <circle
          cx="35"
          cy="35"
          r={radius}
          stroke="#102a45"
          strokeWidth="5"
          fill="transparent"
        />
        {/* Animated value arc */}
        <motion.circle
          cx="35"
          cy="35"
          r={radius}
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 6px ${color}80)`,
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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: '15px',
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
            letterSpacing: '0.08em',
            marginTop: '2px',
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
    { key: 'low', label: 'LOW', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', active: true },
    {
      key: 'medium',
      label: 'MED',
      color: '#eab308',
      bg: 'rgba(234,179,8,0.15)',
      active: severity === 'medium' || severity === 'high' || severity === 'critical',
    },
    {
      key: 'high',
      label: 'HIGH',
      color: '#f97316',
      bg: 'rgba(249,115,22,0.15)',
      active: severity === 'high' || severity === 'critical',
    },
    {
      key: 'critical',
      label: 'CRIT',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.15)',
      active: severity === 'critical',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '38px' }}>
      {tiers.map((t, idx) => {
        const isCurrent = t.key === severity;
        return (
          <div
            key={t.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: t.active ? `${(idx + 1) * 7 + 8}px` : '6px',
                opacity: t.active ? 1 : 0.25,
              }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              style={{
                width: '14px',
                background: t.active
                  ? `linear-gradient(to top, ${t.color}, ${t.color}dd)`
                  : '#1a3a5c',
                borderRadius: '3px',
                boxShadow: isCurrent ? `0 0 12px ${t.color}` : 'none',
                position: 'relative',
              }}
            >
              {isCurrent && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: `0 0 6px ${t.color}`,
                  }}
                />
              )}
            </motion.div>
            <span
              style={{
                fontSize: '8px',
                fontWeight: isCurrent ? 700 : 500,
                color: t.active ? t.color : '#3d6a96',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.04em',
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
        background: 'linear-gradient(180deg, rgba(7,22,40,0.98) 0%, rgba(5,17,31,0.95) 100%)',
        borderBottom: '1px solid #1a3a5c',
        padding: '12px 20px',
        position: 'relative',
      }}
    >
      {/* Top Main Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Incident Metadata & Title */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '10px',
                color: '#60a5fa',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.06em',
                background: 'rgba(59,130,246,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              {incident.id}
            </span>

            {/* Animated Pulsing Severity Pill */}
            <motion.span
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '2px 8px',
                borderRadius: '4px',
                background: scoreToken.bgColor,
                color: scoreToken.color,
                border: `1px solid ${scoreToken.borderColor}`,
                boxShadow: `0 0 10px ${scoreToken.glowColor}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: scoreToken.color,
                  boxShadow: `0 0 6px ${scoreToken.color}`,
                }}
              />
              {scoreResult.severity} Severity
            </motion.span>

            {/* Killchain Stage Counter */}
            <span
              style={{
                fontSize: '9px',
                color: '#38bdf8',
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.25)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldAlert size={10} color="#38bdf8" />
              {scoreResult.stageCount}/{scoreResult.totalPossibleStages} Stages
            </span>

            <span
              style={{
                fontSize: '9px',
                color: '#7aa3cc',
                background: 'rgba(122,163,204,0.08)',
                border: '1px solid rgba(122,163,204,0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              {incident.status.toUpperCase()}
            </span>
          </div>

          <h1
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#e2eeff',
              lineHeight: 1.3,
              margin: '3px 0 3px 0',
            }}
          >
            {incident.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '680px',
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
            gap: '14px',
            background: 'rgba(10,31,58,0.7)',
            border: `1px solid ${scoreToken.borderColor}60`,
            borderRadius: '10px',
            padding: '8px 14px',
            boxShadow: `0 4px 20px -5px ${scoreToken.glowColor}`,
          }}
        >
          {/* Animated Gauge */}
          <AnimatedScoreGauge
            score={scoreResult.score}
            color={scoreToken.color}
            label={scoreToken.label}
          />

          {/* Level Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
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
                padding: '2px 4px',
              }}
            >
              <Info size={10} />
              {showDetails ? 'Hide Factors' : 'Score Factors'}
              <ChevronDown
                size={10}
                style={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
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
            transition={{ duration: 0.25 }}
            style={{
              overflow: 'hidden',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #1a3a5c',
            }}
          >
            <div
              style={{
                background: '#040d1a',
                border: '1px solid #1e3a5f',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={13} color={scoreToken.color} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9' }}>
                    Severity Scoring Formula & Multi-Stage Risk Breakdown
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#94a3b8',
                  }}
                >
                  Killchain Coverage: <strong>{scoreResult.killchainCoveragePercent}%</strong>
                </span>
              </div>

              {/* Summary */}
              <div style={{ fontSize: '11px', color: '#93c5fd', lineHeight: 1.4 }}>
                {scoreResult.summary}
              </div>

              {/* Detected factors chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                {scoreResult.criticalFactors.map((factor, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '9px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle size={9} color="#ef4444" />
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px', alignItems: 'center' }}>
        {[
          { icon: <User size={11} color="#3d6a96" />, label: 'Analyst', value: incident.analyst },
          { icon: <Calendar size={11} color="#3d6a96" />, label: 'Date', value: incident.date },
          { icon: <Activity size={11} color="#3d6a96" />, label: 'Telemetry', value: `${incident.timeline.length} events` },
          { icon: <Server size={11} color="#3d6a96" />, label: 'Impacted Hosts', value: `${incident.affectedSystems.length} systems` },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {item.icon}
            <span style={{ fontSize: '10px', color: '#3d6a96' }}>{item.label}:</span>
            <span style={{ fontSize: '10px', color: '#7aa3cc', fontFamily: 'JetBrains Mono, monospace' }}>
              {item.value}
            </span>
          </div>
        ))}

        {/* Affected systems pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {incident.affectedSystems.map((sys) => (
            <span
              key={sys}
              style={{
                fontSize: '9px',
                color: '#06b6d4',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
                padding: '1px 7px',
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
