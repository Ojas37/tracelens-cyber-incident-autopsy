import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Skull, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import type { Incident } from '../types/index';

interface ScenarioSelectorProps {
  incidents: Incident[];
  selectedId: string;
  onSelectScenario: (id: string) => void;
  compact?: boolean;
}

interface DemoScenarioMeta {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  tag: string;
  accentColor: string;
  accentBg: string;
  description: string;
}

const DEMO_METAS: Record<string, DemoScenarioMeta> = {
  'INC-2024-001': {
    id: 'INC-2024-001',
    label: 'Phishing Credential Theft',
    shortLabel: 'Phishing Theft',
    icon: <Mail size={13} color="#f59e0b" />,
    tag: 'INITIAL ACCESS + LSASS',
    accentColor: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    description: 'Spear-phishing macro dropper, PowerShell beacon, and LSASS memory dumping.',
  },
  'INC-2024-002': {
    id: 'INC-2024-002',
    label: 'Ransomware Attack',
    shortLabel: 'Ransomware',
    icon: <Skull size={13} color="#ef4444" />,
    tag: 'VOLUME SHADOW WIPE',
    accentColor: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.15)',
    description: 'VPN brute force, Active Directory enumeration, and backup shadow copy wipe.',
  },
  'INC-2024-003': {
    id: 'INC-2024-003',
    label: 'Insider Data Exfiltration',
    shortLabel: 'Insider Exfil',
    icon: <ShieldAlert size={13} color="#06b6d4" />,
    tag: 'CLOUD STORAGE EGRESS',
    accentColor: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.15)',
    description: 'Off-hours repository cloning, SharePoint download, and personal cloud upload.',
  },
};

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  incidents,
  selectedId,
  onSelectScenario,
  compact = false,
}) => {
  // Get top 3 demo incidents
  const demoIncidents = incidents.slice(0, 3);

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(10, 31, 58, 0.7)',
          padding: '3px 4px',
          borderRadius: '8px',
          border: '1px solid #1a3a5c',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: '#64748b',
            fontWeight: 700,
            padding: '0 4px',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Sparkles size={10} color="#3b82f6" />
          DEMO:
        </span>
        {demoIncidents.map((incident) => {
          const meta = DEMO_METAS[incident.id] || {
            id: incident.id,
            label: incident.title,
            shortLabel: incident.title.slice(0, 14),
            icon: <Sparkles size={12} color="#60a5fa" />,
            tag: incident.severity.toUpperCase(),
            accentColor: '#3b82f6',
            accentBg: 'rgba(59, 130, 246, 0.15)',
            description: incident.description,
          };
          const isSelected = incident.id === selectedId;

          return (
            <motion.button
              key={incident.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectScenario(incident.id)}
              style={{
                background: isSelected ? meta.accentBg : 'transparent',
                border: isSelected ? `1px solid ${meta.accentColor}` : '1px solid transparent',
                borderRadius: '6px',
                padding: '4px 8px',
                color: isSelected ? '#ffffff' : '#94a3b8',
                fontSize: '10px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              {meta.icon}
              <span>{meta.shortLabel}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(7, 22, 40, 0.85)',
        border: '1px solid #1a3a5c',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: '#60a5fa',
            fontWeight: 700,
            letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={11} color="#60a5fa" />
          INSTANT DEMO SCENARIOS
        </span>
        <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
          1-Click Load
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {demoIncidents.map((incident, idx) => {
          const meta = DEMO_METAS[incident.id] || {
            id: incident.id,
            label: incident.title,
            shortLabel: incident.title.slice(0, 16),
            icon: <Sparkles size={12} color="#60a5fa" />,
            tag: incident.severity.toUpperCase(),
            accentColor: '#3b82f6',
            accentBg: 'rgba(59, 130, 246, 0.15)',
            description: incident.description,
          };
          const isSelected = incident.id === selectedId;

          return (
            <motion.div
              key={incident.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectScenario(incident.id)}
              style={{
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '6px',
                background: isSelected
                  ? `linear-gradient(135deg, ${meta.accentBg}, rgba(10,31,58,0.9))`
                  : 'rgba(10, 31, 58, 0.4)',
                border: `1px solid ${isSelected ? meta.accentColor : '#1a3a5c'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    background: meta.accentBg,
                    border: `1px solid ${meta.accentColor}50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isSelected ? '#ffffff' : '#e2e8f0',
                      }}
                    >
                      {idx + 1}. {meta.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: meta.accentColor,
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {meta.tag}
                  </span>
                </div>
              </div>

              {isSelected ? (
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    color: meta.accentColor,
                    background: meta.accentBg,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: `1px solid ${meta.accentColor}60`,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  ACTIVE
                </span>
              ) : (
                <ChevronRight size={12} color="#64748b" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioSelector;
