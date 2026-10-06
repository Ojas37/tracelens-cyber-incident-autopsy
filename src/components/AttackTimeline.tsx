import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { TimelineEvent } from '../types/index';
import {
  getSeverityColor,
  getSeverityBg,
  getStageColor,
  getStageLabel,
  formatTimestamp,
  SeverityBadge,
} from '../utils/helpers';
import {
  Clock,
  Tag,
  Database,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface AttackTimelineProps {
  events: TimelineEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

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
      variants={itemVariants}
      style={{ display: 'flex', gap: '0px', position: 'relative' }}
    >
      {/* Timeline spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '38px', flexShrink: 0 }}>
        {/* Step Node */}
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.92 }}
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
            boxShadow: isSelected ? `0 0 16px ${sColor}80` : `0 0 8px ${sColor}30`,
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: isSelected ? '#fff' : sColor,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {index + 1}
          </span>
        </motion.div>

        {/* Connecting line between stages */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            style={{
              width: '2px',
              flex: 1,
              minHeight: '28px',
              background: `linear-gradient(to bottom, ${sColor}70, #1a3a5c40)`,
              margin: '3px 0',
              transformOrigin: 'top',
            }}
          />
        )}
      </div>

      {/* Event Content Card */}
      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '14px', paddingLeft: '12px', minWidth: 0 }}>
        <motion.div
          whileHover={{ borderColor: `${sColor}70`, y: -1 }}
          onClick={onClick}
          style={{
            background: isSelected
              ? `linear-gradient(135deg, ${sBg}, rgba(8, 25, 48, 0.95))`
              : 'rgba(8, 24, 44, 0.65)',
            border: `1px solid ${isSelected ? sColor + '70' : '#1a3a5c'}`,
            borderRadius: '8px',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isSelected ? `0 4px 20px -5px ${sColor}40` : 'none',
          }}
        >
          {/* Header Row: Timestamp · Stage Badge · MITRE ID · Severity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Timestamp */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <Clock size={11} color="#60a5fa" />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#93c5fd',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                  }}
                >
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>

              {/* Attack Stage Badge */}
              <span
                style={{
                  fontSize: '9px',
                  color: stageColor,
                  background: `${stageColor}15`,
                  border: `1px solid ${stageColor}35`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                }}
              >
                {getStageLabel(event.stage)}
              </span>

              {/* MITRE ATT&CK Technique */}
              <span
                style={{
                  fontSize: '9px',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                {event.mitre}
              </span>
            </div>

            {/* Severity Pill */}
            <SeverityBadge severity={event.severity} size="sm" />
          </div>

          {/* Event Title */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: '6px',
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </div>

          {/* Short Explanation / Description */}
          <div
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.55,
              marginBottom: '10px',
            }}
          >
            {event.description}
          </div>

          {/* Indicators Overview (Always Visible chips for quick threat context) */}
          {event.indicators && event.indicators.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
              {event.indicators.slice(0, 3).map((ioc, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(6, 182, 212, 0.08)',
                    color: '#67e8f9',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Terminal size={9} color="#06b6d4" />
                  {ioc}
                </span>
              ))}
              {event.indicators.length > 3 && (
                <span
                  style={{
                    fontSize: '9px',
                    color: '#64748b',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  +{event.indicators.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Expandable Deep Forensic Details */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    borderTop: '1px solid #1a3a5c',
                    paddingTop: '10px',
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: '#64748b',
                      letterSpacing: '0.1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    <Database size={10} color="#06b6d4" />
                    All Extracted Telemetry Indicators ({event.indicators?.length || 0})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {event.indicators.map((ioc, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          background: 'rgba(4, 13, 26, 0.7)',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          borderRadius: '4px',
                        }}
                      >
                        <div
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: '#06b6d4',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#a5f3fc',
                            fontFamily: 'JetBrains Mono, monospace',
                            wordBreak: 'break-all',
                          }}
                        >
                          {ioc}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Forensic Source and MITRE Link */}
                  <div
                    style={{
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      color: '#64748b',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={10} color="#3b82f6" />
                      <span>Telemetry Source:</span>
                      <strong style={{ color: '#93c5fd', fontFamily: 'JetBrains Mono, monospace' }}>
                        {event.source}
                      </strong>
                    </div>

                    <a
                      href={`https://attack.mitre.org/techniques/${event.mitre.replace('.', '/')}/`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        textDecoration: 'none',
                      }}
                    >
                      MITRE ATT&CK Spec <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand / Collapse Indicator */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            {isSelected ? (
              <ChevronDown size={14} color="#60a5fa" />
            ) : (
              <ChevronRight size={14} color="#64748b" />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const AttackTimeline: React.FC<AttackTimelineProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  // Ensure events are strictly sorted in chronological sequence
  const chronologicalEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      {/* Timeline Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          borderBottom: '1px solid #1a3a5c',
          paddingBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="#3b82f6" />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#e2eeff',
              letterSpacing: '0.06em',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            CHRONOLOGICAL ATTACK TIMELINE
          </span>
          <span
            style={{
              fontSize: '10px',
              color: '#60a5fa',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
            }}
          >
            {chronologicalEvents.length} Sequential Events
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={12} color="#64748b" />
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
            Click event for forensic telemetry
          </span>
        </div>
      </div>

      {/* Sequential Animated Timeline Container */}
      <motion.div
        key={chronologicalEvents.map((e) => e.id).join('-')}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {chronologicalEvents.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            isSelected={selectedEventId === event.id}
            isLast={index === chronologicalEvents.length - 1}
            onClick={() => onSelectEvent(event.id === selectedEventId ? '' : event.id)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default AttackTimeline;
