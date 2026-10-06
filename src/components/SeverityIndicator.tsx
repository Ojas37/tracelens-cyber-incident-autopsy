import React from 'react';
import { motion } from 'framer-motion';
import type { Incident } from '../types/index';
import { getSeverityColor, getSeverityBg, SeverityBadge } from '../utils/helpers';
import { Server, User, Calendar, Activity } from 'lucide-react';

interface SeverityIndicatorProps {
  incident: Incident;
}

const SeverityMeter: React.FC<{ severity: string }> = ({ severity }) => {
  const levels = [
    { label: 'LOW', color: '#22c55e', active: true },
    { label: 'MED', color: '#eab308', active: severity !== 'low' },
    { label: 'HIGH', color: '#f97316', active: severity === 'high' || severity === 'critical' },
    { label: 'CRIT', color: '#ef4444', active: severity === 'critical' },
  ];

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '32px' }}>
      {levels.map((level, i) => (
        <div key={level.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: level.active ? 1 : 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{
              width: '12px',
              height: `${(i + 1) * 6 + 6}px`,
              background: level.active ? level.color : '#1a3a5c',
              borderRadius: '2px',
              transformOrigin: 'bottom',
              boxShadow: level.active ? `0 0 8px ${level.color}60` : 'none',
              opacity: level.active ? 1 : 0.3,
            }}
          />
          <span style={{ fontSize: '7px', color: level.active ? level.color : '#3d6a96', letterSpacing: '0.05em', fontFamily: 'JetBrains Mono, monospace' }}>
            {level.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({ incident }) => {
  const color = getSeverityColor(incident.severity);
  const bg = getSeverityBg(incident.severity);

  return (
    <div style={{
      background: 'rgba(7,22,40,0.95)',
      borderBottom: '1px solid #1a3a5c',
      padding: '14px 20px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '10px',
              color: '#3d6a96',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.06em',
            }}>
              {incident.id}
            </span>
            <SeverityBadge severity={incident.severity} />
            <span style={{
              fontSize: '9px',
              color: '#7aa3cc',
              background: 'rgba(122,163,204,0.08)',
              border: '1px solid rgba(122,163,204,0.2)',
              padding: '1px 6px',
              borderRadius: '3px',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}>
              {incident.status.toUpperCase()}
            </span>
          </div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#e2eeff',
            lineHeight: 1.3,
            marginBottom: '4px',
          }}>
            {incident.title}
          </h1>
          <p style={{ fontSize: '12px', color: '#7aa3cc', lineHeight: 1.5, maxWidth: '700px' }}>
            {incident.description}
          </p>
        </div>

        {/* Severity meter */}
        <div style={{
          marginLeft: '20px',
          background: bg,
          border: `1px solid ${color}30`,
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          minWidth: '90px',
        }}>
          <SeverityMeter severity={incident.severity} />
          <span style={{
            fontSize: '8px',
            color,
            letterSpacing: '0.12em',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
          }}>
            THREAT LEVEL
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {[
          { icon: <User size={11} color="#3d6a96" />, label: 'Analyst', value: incident.analyst },
          { icon: <Calendar size={11} color="#3d6a96" />, label: 'Date', value: incident.date },
          { icon: <Activity size={11} color="#3d6a96" />, label: 'Events', value: `${incident.timeline.length} events` },
          { icon: <Server size={11} color="#3d6a96" />, label: 'Systems', value: `${incident.affectedSystems.length} affected` },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {item.icon}
            <span style={{ fontSize: '10px', color: '#3d6a96' }}>{item.label}:</span>
            <span style={{ fontSize: '10px', color: '#7aa3cc', fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
          </div>
        ))}

        {/* Affected systems */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Server size={11} color="#3d6a96" />
          {incident.affectedSystems.map((sys) => (
            <span key={sys} style={{
              fontSize: '9px',
              color: '#06b6d4',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.2)',
              padding: '1px 7px',
              borderRadius: '3px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {sys}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeverityIndicator;
