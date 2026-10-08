import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, User, ChevronRight, Wifi, Search, Activity, Sparkles, Mic, Trophy } from 'lucide-react';
import type { Incident } from '../types/index';
import { getSeverityColor, formatDate, SeverityBadge } from '../utils/helpers';
import ScenarioSelector from './ScenarioSelector';

interface IncidentNavPanelProps {
  incidents: Incident[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenAnalyzer?: () => void;
  onOpenSpeak?: () => void;
  onOpenInvestigation?: () => void;
}

const statusConfig = {
  open: { color: '#ef4444', label: 'OPEN' },
  investigating: { color: '#f97316', label: 'INVESTIGATING' },
  contained: { color: '#eab308', label: 'CONTAINED' },
  resolved: { color: '#22c55e', label: 'RESOLVED' },
};

const IncidentCard: React.FC<{
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
}> = ({ incident, isSelected, onClick }) => {
  const sColor = getSeverityColor(incident.severity);
  const status = statusConfig[incident.status];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      style={{
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: '6px',
        marginBottom: '6px',
        border: `1px solid ${isSelected ? sColor : '#1b2638'}`,
        background: isSelected
          ? 'rgba(255, 255, 255, 0.03)'
          : '#111a29',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
      }}
    >
      {isSelected && (
        <motion.div
          layoutId="selection-bar"
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: '3px',
            background: sColor,
            borderRadius: '2px 0 0 2px',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <span style={{
          fontSize: '9px',
          color: '#64748b',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>
          {incident.id}
        </span>
        <SeverityBadge severity={incident.severity} size="sm" />
      </div>

      <div style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', lineHeight: 1.35 }}>
        {incident.title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} color="#64748b" />
          <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
            {formatDate(incident.date)}
          </span>
        </div>
        <span style={{
          fontSize: '8px',
          color: status.color,
          background: `${status.color}15`,
          border: `1px solid ${status.color}30`,
          padding: '1px 5px',
          borderRadius: '3px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
        <User size={9} color="#64748b" />
        <span style={{ fontSize: '9px', color: '#64748b' }}>{incident.analyst}</span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <ChevronRight size={13} color={sColor} />
        </motion.div>
      )}
    </motion.div>
  );
};

const IncidentNavPanel: React.FC<IncidentNavPanelProps> = ({
  incidents,
  selectedId,
  onSelect,
  onOpenAnalyzer,
  onOpenSpeak,
  onOpenInvestigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = incidents.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const openCount = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;

  return (
    <div
      style={{
        width: '280px',
        minWidth: '280px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c121d',
        borderRight: '1px solid #1b2638',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid #1b2638' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'rgba(56, 189, 248, 0.1)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}>
            <Shield size={16} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
              TraceLens
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
              SOC INCIDENT PLATFORM
            </div>
          </div>
        </div>

        {/* Action Buttons: Investigation Mode, Speak Incident & Detection Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
          {onOpenInvestigation && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenInvestigation}
              style={{
                width: '100%',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Trophy size={13} color="#f59e0b" />
              Investigation Mode (Triage)
            </motion.button>
          )}

          {onOpenSpeak && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenSpeak}
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#fca5a5',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Mic size={13} color="#ef4444" />
              Speak Incident (Voice)
            </motion.button>
          )}

          {onOpenAnalyzer && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAnalyzer}
              style={{
                width: '100%',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={13} color="#38bdf8" />
              Analyze Incident Text
            </motion.button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <div style={{
            flex: 1,
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '5px',
            padding: '5px 6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: '8px', color: '#ef4444', opacity: 0.8, letterSpacing: '0.08em', fontWeight: 600 }}>CRITICAL</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(249,115,22,0.06)',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: '5px',
            padding: '5px 6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f97316', fontFamily: 'JetBrains Mono, monospace' }}>
              {openCount}
            </div>
            <div style={{ fontSize: '8px', color: '#f97316', opacity: 0.8, letterSpacing: '0.08em', fontWeight: 600 }}>ACTIVE</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(56,189,248,0.06)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '5px',
            padding: '5px 6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
              {incidents.length}
            </div>
            <div style={{ fontSize: '8px', color: '#38bdf8', opacity: 0.8, letterSpacing: '0.08em', fontWeight: 600 }}>TOTAL</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={12} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#111a29',
              border: '1px solid #1b2638',
              borderRadius: '5px',
              padding: '6px 10px 6px 28px',
              color: '#f8fafc',
              fontSize: '11px',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Incident list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {/* Instant Demo Scenario Quick Switcher */}
        <ScenarioSelector
          incidents={incidents}
          selectedId={selectedId}
          onSelectScenario={onSelect}
        />

        <div style={{
          fontSize: '9px',
          color: '#64748b',
          letterSpacing: '0.1em',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <Activity size={10} color="#64748b" />
          INCIDENTS ({filtered.length})
        </div>
        <AnimatePresence>
          {filtered.map((incident) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <IncidentCard
                incident={incident}
                isSelected={incident.id === selectedId}
                onClick={() => onSelect(incident.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid #1b2638',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(17, 26, 41, 0.3)',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s infinite' }} />
        <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', fontWeight: 600 }}>
          ANALYST ACTIVE
        </span>
        <Wifi size={10} color="#22c55e" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );
};

export default IncidentNavPanel;
