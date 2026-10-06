import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Clock, User, ChevronRight, Wifi, Search, Activity } from 'lucide-react';
import { Incident, Severity } from '../data/incidents';
import { getSeverityColor, getSeverityBg, formatDate, SeverityBadge } from '../utils/helpers';

interface IncidentNavPanelProps {
  incidents: Incident[];
  selectedId: string;
  onSelect: (id: string) => void;
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
  const sBg = getSeverityBg(incident.severity);
  const status = statusConfig[incident.status];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
      style={{
        cursor: 'pointer',
        padding: '12px 14px',
        borderRadius: '8px',
        marginBottom: '6px',
        border: `1px solid ${isSelected ? sColor + '60' : '#1a3a5c'}`,
        background: isSelected
          ? `linear-gradient(135deg, ${sBg}, rgba(10,31,58,0.9))`
          : 'rgba(10, 31, 58, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {isSelected && (
        <motion.div
          layoutId="selection-bar"
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: '3px',
            background: `linear-gradient(to bottom, ${sColor}, ${sColor}60)`,
            borderRadius: '4px 0 0 4px',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <span style={{
          fontSize: '9px',
          color: '#3d6a96',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.05em',
        }}>
          {incident.id}
        </span>
        <SeverityBadge severity={incident.severity} size="sm" />
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2eeff', marginBottom: '4px', lineHeight: 1.4 }}>
        {incident.title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} color="#3d6a96" />
          <span style={{ fontSize: '10px', color: '#3d6a96', fontFamily: 'JetBrains Mono, monospace' }}>
            {formatDate(incident.date)}
          </span>
        </div>
        <span style={{
          fontSize: '9px',
          color: status.color,
          background: `${status.color}15`,
          border: `1px solid ${status.color}30`,
          padding: '1px 6px',
          borderRadius: '3px',
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
        <User size={9} color="#3d6a96" />
        <span style={{ fontSize: '10px', color: '#3d6a96' }}>{incident.analyst}</span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <ChevronRight size={14} color={sColor} />
        </motion.div>
      )}
    </motion.div>
  );
};

const IncidentNavPanel: React.FC<IncidentNavPanelProps> = ({ incidents, selectedId, onSelect }) => {
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
        background: 'rgba(7, 22, 40, 0.95)',
        borderRight: '1px solid #1a3a5c',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1a3a5c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #1e4d7b, #0a1f3a)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #1e4d7b',
          }}>
            <Shield size={16} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2eeff', letterSpacing: '0.02em' }}>
              TraceLens
            </div>
            <div style={{ fontSize: '9px', color: '#3d6a96', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>
              SOC INCIDENT PLATFORM
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            flex: 1,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: '9px', color: '#ef4444', opacity: 0.7, letterSpacing: '0.08em' }}>CRITICAL</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f97316', fontFamily: 'JetBrains Mono, monospace' }}>
              {openCount}
            </div>
            <div style={{ fontSize: '9px', color: '#f97316', opacity: 0.7, letterSpacing: '0.08em' }}>ACTIVE</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>
              {incidents.length}
            </div>
            <div style={{ fontSize: '9px', color: '#3b82f6', opacity: 0.7, letterSpacing: '0.08em' }}>TOTAL</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={12} color="#3d6a96" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(10,31,58,0.6)',
              border: '1px solid #1a3a5c',
              borderRadius: '6px',
              padding: '7px 10px 7px 28px',
              color: '#e2eeff',
              fontSize: '11px',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Incident list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        <div style={{
          fontSize: '9px',
          color: '#3d6a96',
          letterSpacing: '0.1em',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Activity size={9} color="#3d6a96" />
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
        padding: '10px 14px',
        borderTop: '1px solid #1a3a5c',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s infinite' }} />
        <span style={{ fontSize: '9px', color: '#3d6a96', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
          ANALYST ONLINE
        </span>
        <Wifi size={9} color="#22c55e" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );
};

export default IncidentNavPanel;
