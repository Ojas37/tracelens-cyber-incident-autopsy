import React from 'react';
import { motion } from 'framer-motion';
import { AttackStage, TimelineEvent } from '../data/incidents';
import { getStageColor, getStageLabel } from '../utils/helpers';

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
  initial_access: 'INIT ACC',
  execution: 'EXEC',
  persistence: 'PERSIST',
  privilege_escalation: 'PRIV ESC',
  lateral_movement: 'LAT MOV',
  exfiltration: 'EXFIL',
  impact: 'IMPACT',
};

const AttackStageVisualization: React.FC<AttackStageVisualizationProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const activeStages = new Set(events.map((e) => e.stage));

  return (
    <div style={{
      background: 'rgba(4,13,26,0.8)',
      borderBottom: '1px solid #1a3a5c',
      padding: '10px 20px',
      overflowX: 'auto',
    }}>
      <div style={{ fontSize: '9px', color: '#3d6a96', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
        MITRE ATT&CK KILL CHAIN
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0px', minWidth: 'max-content' }}>
        {STAGES.map((stage, i) => {
          const isActive = activeStages.has(stage);
          const color = getStageColor(stage);
          const stageEvents = events.filter((e) => e.stage === stage);
          const hasSelected = stageEvents.some((e) => e.id === selectedEventId);

          return (
            <React.Fragment key={stage}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <motion.div
                  whileHover={isActive ? { scale: 1.05 } : {}}
                  onClick={() => isActive && stageEvents[0] && onSelectEvent(stageEvents[0].id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: isActive
                      ? hasSelected
                        ? `${color}25`
                        : `${color}12`
                      : 'rgba(10,31,58,0.3)',
                    border: `1px solid ${isActive ? (hasSelected ? color : `${color}40`) : '#1a3a5c'}`,
                    cursor: isActive ? 'pointer' : 'default',
                    position: 'relative',
                    minWidth: '70px',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        position: 'absolute',
                        top: '-2px', right: '-2px',
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                  )}
                  <div style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: isActive ? color : '#3d6a96',
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'nowrap',
                  }}>
                    {STAGE_SHORT[stage]}
                  </div>
                  {stageEvents.length > 0 && (
                    <div style={{
                      fontSize: '9px',
                      color: color,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600,
                    }}>
                      ×{stageEvents.length}
                    </div>
                  )}
                </motion.div>
              </div>

              {i < STAGES.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px' }}>
                  <div style={{
                    width: '16px',
                    height: '1px',
                    background: isActive && activeStages.has(STAGES[i + 1])
                      ? `linear-gradient(to right, ${color}, ${getStageColor(STAGES[i + 1])})`
                      : '#1a3a5c',
                  }} />
                  <div style={{
                    width: 0,
                    height: 0,
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: `5px solid ${isActive && activeStages.has(STAGES[i + 1]) ? getStageColor(STAGES[i + 1]) : '#1a3a5c'}`,
                  }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AttackStageVisualization;
