import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Incident } from '../types/index';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Lightbulb, Link } from 'lucide-react';

interface EducationPanelProps {
  incident: Incident;
}

const EducationPanel: React.FC<EducationPanelProps> = ({ incident }) => {
  const [expanded, setExpanded] = useState(true);
  const { education } = incident;

  return (
    <div
      style={{
        background: '#0b111a',
        border: '1px solid #1b2638',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '10px',
      }}
    >
      {/* Header */}
      <motion.div
        onClick={() => setExpanded(!expanded)}
        whileHover={{ background: '#101826' }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid #1b2638' : 'none',
          transition: 'background 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={10} color="#a78bfa" />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.06em',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            THREAT INTELLIGENCE & MITRE SPECS
          </span>
        </div>
        {expanded ? <ChevronUp size={12} color="#64748b" /> : <ChevronDown size={12} color="#64748b" />}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ padding: '10px 12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Lightbulb size={11} color="#a78bfa" />
            {education.title}
          </div>

          <p
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.5,
              marginBottom: '10px',
            }}
          >
            {education.explanation}
          </p>

          {/* References */}
          <div>
            <div
              style={{
                fontSize: '9px',
                color: '#64748b',
                letterSpacing: '0.06em',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <Link size={9} color="#64748b" />
              THREAT INTELLIGENCE CITATIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {education.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.startsWith('http') ? ref : `https://attack.mitre.org/`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    background: '#070c14',
                    border: '1px solid #162436',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.background = '#0e1624';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#162436';
                    e.currentTarget.style.background = '#070c14';
                  }}
                >
                  <ExternalLink size={9} color="#60a5fa" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: '#93c5fd', lineHeight: 1.35, wordBreak: 'break-all' }}>
                    {ref}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EducationPanel;
