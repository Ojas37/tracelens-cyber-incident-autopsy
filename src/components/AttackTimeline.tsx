import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineEvent } from '../types/index';
import {
  getSeverityColor,
  getSeverityBg,
  getStageColor,
  getStageLabel,
  formatTimestamp,
  SeverityBadge,
} from '../utils/helpers';
import { Clock, Tag, Database, ExternalLink, ChevronDown, ChevronRight, Shield } from 'lucide-react';

interface AttackTimelineProps {
  events: TimelineEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const EventCard: React.FC<{
  event: TimelineEvent;
  index: number;
  isSelected: boolean;
  isLast: boolean;
  onClick: () => void;
}> = ({ event, index, isSelected, isLast, onClick }) => {
  const sColor = getSeverityColor(event.severity);
  const sBg = getSeverityBg(event.severity);
  const stageColor = getStageColor(event.stage);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      style={{ display: 'flex', gap: '0px', position: 'relative' }}
    >
      {/* Timeline spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36px', flexShrink: 0 }}>
        {/* Node */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          onClick={onClick}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isSelected ? sColor : sBg,
            border: `2px solid ${sColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1,
            boxShadow: isSelected ? `0 0 16px ${sColor}60` : `0 0 6px ${sColor}30`,
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: isSelected ? '#fff' : sColor,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {index + 1}
          </span>
        </motion.div>

        {/* Connecting line */}
        {!isLast && (
          <div style={{
            width: '2px',
            flex: 1,
            minHeight: '20px',
            background: `linear-gradient(to bottom, ${sColor}60, #1a3a5c30)`,
            margin: '2px 0',
          }} />
        )}
      </div>

      {/* Event content */}
      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '12px', paddingLeft: '10px' }}>
        <motion.div
          whileHover={{ borderColor: `${sColor}60` }}
          onClick={onClick}
          style={{
            background: isSelected
              ? `linear-gradient(135deg, ${sBg}, rgba(10,31,58,0.95))`
              : 'rgba(10,31,58,0.5)',
            border: `1px solid ${isSelected ? sColor + '50' : '#1a3a5c'}`,
            borderRadius: '8px',
            padding: '12px 14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={10} color="#3d6a96" />
                <span style={{
                  fontSize: '10px',
                  color: '#7aa3cc',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500,
                }}>
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              <span style={{
                fontSize: '9px',
                color: stageColor,
                background: `${stageColor}12`,
                border: `1px solid ${stageColor}30`,
                padding: '1px 7px',
                borderRadius: '3px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {getStageLabel(event.stage)}
              </span>
              <span style={{
                fontSize: '9px',
                color: '#3b82f6',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                padding: '1px 7px',
                borderRadius: '3px',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {event.mitre}
              </span>
            </div>
            <SeverityBadge severity={event.severity} size="sm" />
          </div>

          {/* Title */}
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2eeff', marginBottom: '5px' }}>
            {event.title}
          </div>

          {/* Description */}
          <div style={{ fontSize: '11px', color: '#7aa3cc', lineHeight: 1.55, marginBottom: '8px' }}>
            {event.description}
          </div>

          {/* Indicators */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  borderTop: '1px solid #1a3a5c',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}>
                  <div style={{
                    fontSize: '9px',
                    color: '#3d6a96',
                    letterSpacing: '0.1em',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Database size={9} color="#3d6a96" />
                    INDICATORS OF COMPROMISE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {event.indicators.map((ioc, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        background: 'rgba(6,182,212,0.06)',
                        border: '1px solid rgba(6,182,212,0.15)',
                        borderRadius: '4px',
                      }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#06b6d4', flexShrink: 0 }} />
                        <span style={{
                          fontSize: '10px',
                          color: '#06b6d4',
                          fontFamily: 'JetBrains Mono, monospace',
                          wordBreak: 'break-all',
                        }}>
                          {ioc}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={9} color="#3d6a96" />
                    <span style={{ fontSize: '9px', color: '#3d6a96' }}>Source:</span>
                    <span style={{ fontSize: '9px', color: '#7aa3cc', fontFamily: 'JetBrains Mono, monospace' }}>{event.source}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand hint */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            {isSelected
              ? <ChevronDown size={12} color="#3d6a96" />
              : <ChevronRight size={12} color="#3d6a96" />}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const AttackTimeline: React.FC<AttackTimelineProps> = ({ events, selectedEventId, onSelectEvent }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <Shield size={14} color="#3b82f6" />
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#7aa3cc',
          letterSpacing: '0.08em',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          ATTACK TIMELINE
        </span>
        <span style={{
          fontSize: '9px',
          color: '#3b82f6',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          padding: '1px 6px',
          borderRadius: '3px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {events.length} EVENTS
        </span>
      </div>

      <div>
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            isSelected={selectedEventId === event.id}
            isLast={index === events.length - 1}
            onClick={() => onSelectEvent(event.id === selectedEventId ? '' : event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AttackTimeline;
