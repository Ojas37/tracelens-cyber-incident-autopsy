import React from 'react';
import type { Severity, AttackStage } from '../types/index';

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
  }
}

export function getSeverityBg(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'rgba(239,68,68,0.12)';
    case 'high': return 'rgba(249,115,22,0.12)';
    case 'medium': return 'rgba(234,179,8,0.12)';
    case 'low': return 'rgba(34,197,94,0.12)';
  }
}

export function getSeverityLabel(severity: Severity): string {
  return severity.toUpperCase();
}

export function getStageColor(stage: AttackStage): string {
  const colors: Record<AttackStage, string> = {
    reconnaissance: '#8b5cf6',
    initial_access: '#f97316',
    execution: '#ef4444',
    persistence: '#ec4899',
    privilege_escalation: '#dc2626',
    lateral_movement: '#f59e0b',
    exfiltration: '#06b6d4',
    impact: '#ef4444',
  };
  return colors[stage];
}

export function getStageLabel(stage: AttackStage): string {
  const labels: Record<AttackStage, string> = {
    reconnaissance: 'Reconnaissance',
    initial_access: 'Initial Access',
    execution: 'Execution',
    persistence: 'Persistence',
    privilege_escalation: 'Privilege Escalation',
    lateral_movement: 'Lateral Movement',
    exfiltration: 'Exfiltration',
    impact: 'Impact',
  };
  return labels[stage];
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const SeverityBadge: React.FC<{ severity: Severity; size?: 'sm' | 'md' }> = ({
  severity,
  size = 'md',
}) => {
  const color = getSeverityColor(severity);
  const bg = getSeverityBg(severity);
  const padding = size === 'sm' ? '2px 6px' : '3px 10px';
  const fontSize = size === 'sm' ? '9px' : '10px';

  return (
    <span
      style={{
        color,
        background: bg,
        border: `1px solid ${color}40`,
        padding,
        borderRadius: '4px',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.08em',
        fontFamily: 'JetBrains Mono, monospace',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? '5px' : '6px',
          height: size === 'sm' ? '5px' : '6px',
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          ...(severity === 'critical' ? { animation: 'critical-pulse 1.5s ease-in-out infinite' } : {}),
        }}
      />
      {getSeverityLabel(severity)}
    </span>
  );
};
