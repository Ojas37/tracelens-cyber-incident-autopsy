import React from 'react';
import { motion } from 'framer-motion';
import type { AttackStage, TimelineEvent } from '../types/index';
import { getStageColor } from '../utils/helpers';
import { ShieldAlert } from 'lucide-react';

interface AttackStageVisualizationProps {
  events: TimelineEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const STAGES: AttackStage[] = [
  'reconnaissance',
  'initial_access',
  'execution',
  'persistence',
  'privilege_escalation',
  'lateral_movement',
  'exfiltration',
  'impact',
];

const STAGE_SHORT: Record<AttackStage, string> = {
  reconnaissance: 'RECON',
  initial_access: 'INITIAL ACCESS',
  execution: 'EXECUTION',
  persistence: 'PERSISTENCE',
  privilege_escalation: 'PRIV ESC',
  lateral_movement: 'LATERAL MOV',
  exfiltration: 'EXFILTRATION',
  impact: 'IMPACT',
};

const AttackStageVisualization: React.FC<AttackStageVisualizationProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const activeStages = new Set(events.map((e) => e.stage));

  return (
    <div
      style={{
        background: '#090e17',
        borderBottom: '1px solid #1b2638',
        padding: '8px 18px',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={12} color="#60a5fa" />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.08em',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            MITRE ATT&CK KILL CHAIN PIPELINE
          </span>
        </div>

        <span
          style={{
            fontSize: '9px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {activeStages.size}/8 STAGES ACTIVE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 'max-content' }}>
        {STAGES.map((stage, i) => {
          const isActive = activeStages.has(stage);
          const color = getStageColor(stage);
          const stageEvents = events.filter((e) => e.stage === stage);
          const hasSelected = stageEvents.some((e) => e.id === selectedEventId);

          return (
            <React.Fragment key={stage}>
              <motion.div
                whileHover={isActive ? { scale: 1.02, y: -1 } : {}}
                whileTap={isActive ? { scale: 0.98 } : {}}
                onClick={() => isActive && stageEvents[0] && onSelectEvent(stageEvents[0].id)}
                style={{
                  padding: '5px 9px',
                  borderRadius: '5px',
                  background: isActive
                    ? hasSelected
                      ? `${color}25`
                      : '#0f1724'
                    : '#080c14',
                  border: `1px solid ${
                    isActive ? (hasSelected ? color : `${color}50`) : '#172233'
                  }`,
                  cursor: isActive ? 'pointer' : 'default',
                  position: 'relative',
                  minWidth: '78px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: hasSelected ? `0 0 10px ${color}40` : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {isActive && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: color,
                      boxShadow: `0 0 5px ${color}`,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: isActive ? (hasSelected ? '#ffffff' : color) : '#475569',
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {STAGE_SHORT[stage]}
                </span>
                {stageEvents.length > 0 && (
                  <span
                    style={{
                      fontSize: '9px',
                      color: hasSelected ? '#ffffff' : color,
                      background: `${color}20`,
                      padding: '0 4px',
                      borderRadius: '3px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                    }}
                  >
                    {stageEvents.length}
                  </span>
                )}
              </motion.div>

              {i < STAGES.length - 1 && (
                <div
                  style={{
                    width: '8px',
                    height: '1px',
                    background: isActive && activeStages.has(STAGES[i + 1]) ? '#334155' : '#1b2638',
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AttackStageVisualization;
