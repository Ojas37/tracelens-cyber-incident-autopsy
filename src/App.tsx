import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INCIDENTS } from './data/incidents';
import IncidentNavPanel from './components/IncidentNavPanel';
import SeverityIndicator from './components/SeverityIndicator';
import AttackStageVisualization from './components/AttackStageVisualization';
import AttackTimeline from './components/AttackTimeline';
import EducationPanel from './components/EducationPanel';
import RecommendedResponsePanel from './components/RecommendedResponsePanel';
import { Menu, X, Layout } from 'lucide-react';

function App() {
  const [selectedIncidentId, setSelectedIncidentId] = useState(INCIDENTS[0].id);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selectedIncident = INCIDENTS.find((i) => i.id === selectedIncidentId) || INCIDENTS[0];

  const handleIncidentSelect = (id: string) => {
    setSelectedIncidentId(id);
    setSelectedEventId(null);
    setMobileNavOpen(false);
  };

  return (
    <div
      className="scanline-bg"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* === DESKTOP NAV (always visible on lg+) === */}
      <div style={{ display: 'none' }} className="hidden lg:flex" />
      <div
        className="nav-panel"
        style={{
          flexShrink: 0,
          height: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <IncidentNavPanel
          incidents={INCIDENTS}
          selectedId={selectedIncidentId}
          onSelect={handleIncidentSelect}
        />
      </div>

      {/* === MOBILE NAV OVERLAY === */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                zIndex: 40, display: 'block',
              }}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                zIndex: 50, display: 'block',
              }}
            >
              <IncidentNavPanel
                incidents={INCIDENTS}
                selectedId={selectedIncidentId}
                onSelect={handleIncidentSelect}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === MAIN CONTENT === */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderBottom: '1px solid #1a3a5c',
          background: 'rgba(7,22,40,0.98)',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileNavOpen ? <X size={16} color="#3b82f6" /> : <Menu size={16} color="#3b82f6" />}
          </motion.button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layout size={14} color="#3b82f6" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2eeff', letterSpacing: '0.04em' }}>
              TraceLens
            </span>
            <span style={{ fontSize: '9px', color: '#3d6a96', fontFamily: 'JetBrains Mono, monospace' }}>
              / {selectedIncident.id}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIncidentId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Severity indicator header */}
            <SeverityIndicator incident={selectedIncident} />

            {/* Attack stage visualization */}
            <AttackStageVisualization
              events={selectedIncident.timeline}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
            />

            {/* Main content area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Central timeline */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRight: '1px solid #1a3a5c',
              }}>
                <AttackTimeline
                  events={selectedIncident.timeline}
                  selectedEventId={selectedEventId}
                  onSelectEvent={setSelectedEventId}
                />
              </div>

              {/* Right sidebar */}
              <div style={{
                width: '320px',
                minWidth: '280px',
                maxWidth: '360px',
                flexShrink: 0,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                background: 'rgba(4,13,26,0.5)',
              }}>
                <EducationPanel incident={selectedIncident} />
                <RecommendedResponsePanel incident={selectedIncident} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
