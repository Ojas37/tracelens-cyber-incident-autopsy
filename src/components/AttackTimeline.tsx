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
  onSelectEvent: (id: string | null) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
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
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.94 }}
          onClick={onClick}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: isSelected ? sColor : '#0f1724',
            border: `2px solid ${sColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1,
            boxShadow: isSelected ? `0 0 12px ${sColor}70` : `0 0 4px ${sColor}30`,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: isSelected ? '#ffffff' : sColor,
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
            transition={{ duration: 0.35, delay: index * 0.05 }}
            style={{
              width: '2px',
              flex: 1,
              minHeight: '24px',
              background: isSelected ? `linear-gradient(to bottom, ${sColor}, #1e293b)` : '#1e293b',
              margin: '2px 0',
              transformOrigin: 'top',
            }}
          />
        )}
      </div>

      {/* Event Content Card */}
      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '10px', paddingLeft: '10px', minWidth: 0 }}>
        <motion.div
          whileHover={{ borderColor: `${sColor}80` }}
          onClick={onClick}
          style={{
            background: isSelected
              ? `linear-gradient(135deg, ${sBg}, #0e1624)`
              : '#0b111a',
            border: `1px solid ${isSelected ? sColor : '#1b2638'}`,
            borderRadius: '7px',
            padding: '12px 15px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isSelected ? `0 2px 15px -4px ${sColor}30` : 'none',
          }}
        >
          {/* Header Row: Timestamp · Stage Badge · MITRE ID · Severity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Timestamp */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#070c14',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  border: '1px solid #1a2638',
                }}
              >
                <Clock size={10} color="#60a5fa" />
                <span
                  style={{
                    fontSize: '10px',
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
                  background: `${stageColor}12`,
                  border: `1px solid ${stageColor}30`,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
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
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
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
              fontSize: '13px',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '4px',
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </div>

          {/* Short Explanation / Description */}
          <div
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.5,
              marginBottom: '8px',
            }}
          >
            {event.description}
          </div>

          {/* Indicators Overview (Always Visible chips) */}
          {event.indicators && event.indicators.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
              {event.indicators.slice(0, 3).map((ioc, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '9px',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: '#070c14',
                    color: '#67e8f9',
                    border: '1px solid #172a3e',
                    padding: '2px 7px',
                    borderRadius: '3px',
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
                    fontSize: '8px',
                    color: '#64748b',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: '#070c14',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  +{event.indicators.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Expandable Forensic Telemetry */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    borderTop: '1px solid #1a2638',
                    paddingTop: '8px',
                    marginTop: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: '#64748b',
                      letterSpacing: '0.08em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    <Database size={9} color="#06b6d4" />
                    All Telemetry Indicators ({event.indicators?.length || 0})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {event.indicators.map((ioc, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          background: '#050910',
                          border: '1px solid #162436',
                          borderRadius: '3px',
                        }}
                      >
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#06b6d4',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '10px',
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
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '9px',
                      color: '#64748b',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Tag size={9} color="#3b82f6" />
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
                        gap: '2px',
                        textDecoration: 'none',
                      }}
                    >
                      MITRE ATT&CK <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand / Collapse Indicator */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            {isSelected ? (
              <ChevronDown size={12} color="#60a5fa" />
            ) : (
              <ChevronRight size={12} color="#64748b" />
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
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 18px',
        background: '#070b12',
      }}
    >
      {/* Timeline Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          borderBottom: '1px solid #1b2638',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="#60a5fa" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '0.06em',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            ATTACK TIMELINE & INDICATORS
          </span>
          <span
            style={{
              fontSize: '9px',
              color: '#60a5fa',
              background: '#0f172a',
              border: '1px solid #1e3a5f',
              padding: '1px 6px',
              borderRadius: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
            }}
          >
            {chronologicalEvents.length} Sequential Events
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={11} color="#64748b" />
          <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
            Click event for forensic payload
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
            onClick={() => onSelectEvent(event.id === selectedEventId ? null : event.id)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default AttackTimeline;
