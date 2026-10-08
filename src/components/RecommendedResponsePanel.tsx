import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Incident } from '../types/index';
import { AlertTriangle, Clock, TrendingUp, CheckCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface RecommendedResponsePanelProps {
  incident: Incident;
}

interface ResponseSection {
  key: 'immediate' | 'shortTerm' | 'longTerm';
  label: string;
  icon: React.ReactNode;
  color: string;
  items: string[];
}

const RecommendedResponsePanel: React.FC<RecommendedResponsePanelProps> = ({ incident }) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<string | null>('immediate');

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sections: ResponseSection[] = [
    {
      key: 'immediate',
      label: 'IMMEDIATE (0-1h)',
      icon: <Zap size={11} color="#ef4444" />,
      color: '#ef4444',
      items: incident.response.immediate,
    },
    {
      key: 'shortTerm',
      label: 'SHORT-TERM (1-24h)',
      icon: <Clock size={11} color="#f97316" />,
      color: '#f97316',
      items: incident.response.shortTerm,
    },
    {
      key: 'longTerm',
      label: 'LONG-TERM (1-30d)',
      icon: <TrendingUp size={11} color="#3b82f6" />,
      color: '#3b82f6',
      items: incident.response.longTerm,
    },
  ];

  const allItems = sections.flatMap((s) => s.items.map((_, i) => `${s.key}-${i}`));
  const completedCount = allItems.filter((k) => completedItems.has(k)).length;
  const progressPct = Math.round((completedCount / allItems.length) * 100);

  return (
    <div style={{
      background: '#0c121d',
      border: '1px solid #1b2638',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #1b2638',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(17, 26, 41, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px', height: '20px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={11} color="#ef4444" />
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#cbd5e1',
            letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            RESPONSE PLAYBOOK
          </span>
        </div>
        <span style={{
          fontSize: '10px',
          color: progressPct === 100 ? '#22c55e' : '#38bdf8',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
        }}>
          {completedCount}/{allItems.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '8px 14px 0', borderBottom: '1px solid #1b2638' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>REMEDIATION PROGRESS</span>
          <span style={{ fontSize: '9px', color: progressPct === 100 ? '#22c55e' : '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            {progressPct}%
          </span>
        </div>
        <div style={{
          height: '4px',
          background: '#111a29',
          borderRadius: '2px',
          marginBottom: '8px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{
              height: '100%',
              borderRadius: '2px',
              background: progressPct === 100 ? '#22c55e' : '#38bdf8',
            }}
          />
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: '8px' }}>
        {sections.map((section) => {
          const isOpen = expandedSection === section.key;
          const sectionCompleted = section.items.filter((_, i) => completedItems.has(`${section.key}-${i}`)).length;

          return (
            <div key={section.key} style={{ marginBottom: '6px' }}>
              <motion.div
                onClick={() => setExpandedSection(isOpen ? null : section.key)}
                whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border: `1px solid ${isOpen ? '#2d3f59' : '#1b2638'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {section.icon}
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: section.color,
                    letterSpacing: '0.08em',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {section.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {sectionCompleted}/{section.items.length}
                  </span>
                  {isOpen ? <ChevronUp size={11} color="#64748b" /> : <ChevronDown size={11} color="#64748b" />}
                </div>
              </motion.div>

              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {section.items.map((item, i) => {
                    const key = `${section.key}-${i}`;
                    const done = completedItems.has(key);
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ x: 2 }}
                        onClick={() => toggleItem(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          background: done ? 'rgba(34,197,94,0.06)' : '#111a29',
                          border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : '#1b2638'}`,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: '14px', height: '14px',
                          borderRadius: '3px',
                          border: `1.5px solid ${done ? '#22c55e' : '#334155'}`,
                          background: done ? '#22c55e' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '1px',
                          transition: 'all 0.15s',
                        }}>
                          {done && <CheckCircle size={9} color="#fff" />}
                        </div>
                        <span style={{
                          fontSize: '11px',
                          color: done ? '#64748b' : '#cbd5e1',
                          lineHeight: 1.45,
                          textDecoration: done ? 'line-through' : 'none',
                          transition: 'all 0.15s',
                        }}>
                          {item}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedResponsePanel;
