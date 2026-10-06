import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Incident } from '../data/incidents';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Lightbulb, Link } from 'lucide-react';

interface EducationPanelProps {
  incident: Incident;
}

const EducationPanel: React.FC<EducationPanelProps> = ({ incident }) => {
  const [expanded, setExpanded] = useState(true);
  const { education } = incident;

  return (
    <div style={{
      background: 'rgba(7,22,40,0.95)',
      border: '1px solid #1a3a5c',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '12px',
    }}>
      {/* Header */}
      <motion.div
        onClick={() => setExpanded(!expanded)}
        whileHover={{ background: 'rgba(59,130,246,0.06)' }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid #1a3a5c' : 'none',
          transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BookOpen size={11} color="#8b5cf6" />
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#7aa3cc',
            letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            EDUCATION
          </span>
        </div>
        {expanded ? <ChevronUp size={12} color="#3d6a96" /> : <ChevronDown size={12} color="#3d6a96" />}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ padding: '12px 14px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#e2eeff',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Lightbulb size={11} color="#8b5cf6" />
            {education.title}
          </div>

          <p style={{
            fontSize: '11px',
            color: '#7aa3cc',
            lineHeight: 1.65,
            marginBottom: '12px',
          }}>
            {education.explanation}
          </p>

          {/* References */}
          <div>
            <div style={{
              fontSize: '9px',
              color: '#3d6a96',
              letterSpacing: '0.1em',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <Link size={9} color="#3d6a96" />
              REFERENCES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {education.references.map((ref, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 8px',
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={9} color="#8b5cf6" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: '#7aa3cc', lineHeight: 1.4 }}>{ref}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EducationPanel;
