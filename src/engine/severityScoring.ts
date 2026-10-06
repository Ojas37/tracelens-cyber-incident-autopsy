/**
 * TraceLens Incident Severity Scoring Engine
 * ──────────────────────────────────────────
 * Calculates incident severity dynamically based on:
 *   1. Distinct attack stages detected across the MITRE ATT&CK killchain.
 *   2. Stage criticality weights (Impact & Exfiltration heavily weighted).
 *   3. Killchain progression (multi-stage traversal penalties).
 *   4. Event frequency and individual event severity ratings.
 *
 * Maps output to Low, Medium, High, and Critical with 0–100 numerical threat score.
 */

import type { AttackStage, Severity, TimelineEvent } from '../types/index';

export interface StageScoreBreakdown {
  stage: AttackStage;
  label: string;
  weight: number;
  eventCount: number;
  isHighImpact: boolean;
}

export interface SeverityScoreResult {
  score: number; // 0 - 100
  severity: Severity; // 'low' | 'medium' | 'high' | 'critical'
  stageCount: number;
  totalPossibleStages: number;
  detectedStages: AttackStage[];
  stageBreakdowns: StageScoreBreakdown[];
  criticalFactors: string[];
  killchainCoveragePercent: number; // 0 - 100
  summary: string;
}

// Stage weights according to security impact
export const STAGE_WEIGHTS: Record<AttackStage, { weight: number; label: string; highImpact: boolean }> = {
  reconnaissance: { weight: 5, label: 'Reconnaissance', highImpact: false },
  initial_access: { weight: 12, label: 'Initial Access', highImpact: false },
  execution: { weight: 16, label: 'Execution', highImpact: false },
  persistence: { weight: 18, label: 'Persistence', highImpact: false },
  privilege_escalation: { weight: 22, label: 'Privilege Escalation', highImpact: true },
  lateral_movement: { weight: 26, label: 'Lateral Movement', highImpact: true },
  exfiltration: { weight: 32, label: 'Data Exfiltration', highImpact: true },
  impact: { weight: 38, label: 'Impact & Destruction', highImpact: true },
};

const ALL_STAGES = Object.keys(STAGE_WEIGHTS) as AttackStage[];

/**
 * Calculates dynamic severity score and tier based on detected attack stages & timeline events.
 */
export function calculateIncidentSeverity(
  timeline: TimelineEvent[],
  fallbackSeverity?: Severity
): SeverityScoreResult {
  if (!timeline || timeline.length === 0) {
    const defaultSev = fallbackSeverity || 'low';
    return {
      score: defaultSev === 'critical' ? 90 : defaultSev === 'high' ? 70 : defaultSev === 'medium' ? 45 : 15,
      severity: defaultSev,
      stageCount: 0,
      totalPossibleStages: ALL_STAGES.length,
      detectedStages: [],
      stageBreakdowns: [],
      criticalFactors: ['No events recorded in telemetry stream'],
      killchainCoveragePercent: 0,
      summary: 'Baseline rating applied; awaiting investigation events.',
    };
  }

  // Count events per stage
  const stageCounts = new Map<AttackStage, number>();
  let criticalEventCount = 0;
  let highEventCount = 0;

  timeline.forEach((event) => {
    stageCounts.set(event.stage, (stageCounts.get(event.stage) || 0) + 1);
    if (event.severity === 'critical') criticalEventCount++;
    if (event.severity === 'high') highEventCount++;
  });

  const detectedStages = ALL_STAGES.filter((stage) => (stageCounts.get(stage) || 0) > 0);
  const criticalFactors: string[] = [];

  // 1. Base score from stage weights
  let rawScore = 0;
  detectedStages.forEach((stage) => {
    const config = STAGE_WEIGHTS[stage];
    rawScore += config.weight;
  });

  // 2. Multi-stage killchain penalty (attacker progressing through killchain)
  const stageCount = detectedStages.length;
  if (stageCount >= 6) {
    rawScore += 24;
    criticalFactors.push(`Comprehensive Killchain Progression (${stageCount}/8 stages)`);
  } else if (stageCount >= 4) {
    rawScore += 16;
    criticalFactors.push(`Advanced Multi-Stage Traversal (${stageCount}/8 stages)`);
  } else if (stageCount >= 2) {
    rawScore += 8;
    criticalFactors.push(`Active Multi-Stage Operation (${stageCount}/8 stages)`);
  }

  // 3. High-impact stage amplifiers
  const hasImpact = stageCounts.has('impact');
  const hasExfil = stageCounts.has('exfiltration');
  const hasPrivEsc = stageCounts.has('privilege_escalation');
  const hasLateral = stageCounts.has('lateral_movement');

  if (hasImpact) {
    rawScore += 20;
    criticalFactors.push('Active System Impact / Ransomware / Sabotage');
  }
  if (hasExfil) {
    rawScore += 16;
    criticalFactors.push('Confirmed Sensitive Data Exfiltration');
  }
  if (hasLateral && hasPrivEsc) {
    rawScore += 12;
    criticalFactors.push('Privilege Escalation combined with Lateral Movement');
  }

  // 4. Event volume & critical event weighting
  if (criticalEventCount > 0) {
    rawScore += Math.min(criticalEventCount * 5, 15);
    criticalFactors.push(`${criticalEventCount} Critical-rated telemetry event${criticalEventCount > 1 ? 's' : ''}`);
  }
  if (highEventCount > 0) {
    rawScore += Math.min(highEventCount * 2, 8);
  }

  // Normalize final score to 0–100
  const finalScore = Math.min(Math.max(Math.round(rawScore), 5), 100);

  // Determine categorical severity
  let severity: Severity = 'low';
  if (finalScore >= 80 || hasImpact || (hasExfil && (hasPrivEsc || hasLateral))) {
    severity = 'critical';
  } else if (finalScore >= 55 || hasExfil || hasPrivEsc || hasLateral) {
    severity = 'high';
  } else if (finalScore >= 30 || stageCount >= 2) {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  // Build stage breakdown list
  const stageBreakdowns: StageScoreBreakdown[] = ALL_STAGES.map((st) => ({
    stage: st,
    label: STAGE_WEIGHTS[st].label,
    weight: STAGE_WEIGHTS[st].weight,
    eventCount: stageCounts.get(st) || 0,
    isHighImpact: STAGE_WEIGHTS[st].highImpact,
  }));

  const killchainCoveragePercent = Math.round((detectedStages.length / ALL_STAGES.length) * 100);

  // Generate summary
  let summary = '';
  if (severity === 'critical') {
    summary = `CRITICAL THREAT (Score: ${finalScore}/100) — Detected ${detectedStages.length} killchain stages with severe operational impact or exfiltration. Immediate containment mandatory.`;
  } else if (severity === 'high') {
    summary = `HIGH THREAT (Score: ${finalScore}/100) — Detected ${detectedStages.length} killchain stages showing active lateral progression or privilege escalation. Urgent action required.`;
  } else if (severity === 'medium') {
    summary = `ELEVATED RISK (Score: ${finalScore}/100) — Detected ${detectedStages.length} early/execution stages. Threat contained to initial perimeter boundaries.`;
  } else {
    summary = `LOW / INFORMATIONAL (Score: ${finalScore}/100) — Minimal attack surface detected (${detectedStages.length} stage). Standard monitoring recommended.`;
  }

  return {
    score: finalScore,
    severity,
    stageCount,
    totalPossibleStages: ALL_STAGES.length,
    detectedStages,
    stageBreakdowns,
    criticalFactors: criticalFactors.length > 0 ? criticalFactors : ['Single isolated trigger'],
    killchainCoveragePercent,
    summary,
  };
}

/**
 * Returns UI color tokens for a given severity score
 */
export function getSeverityScoreColor(score: number): {
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  label: string;
} {
  if (score >= 80) {
    return {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: '#dc2626',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      label: 'CRITICAL',
    };
  }
  if (score >= 55) {
    return {
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: '#ea580c',
      glowColor: 'rgba(249, 115, 22, 0.4)',
      label: 'HIGH',
    };
  }
  if (score >= 30) {
    return {
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.15)',
      borderColor: '#ca8a04',
      glowColor: 'rgba(234, 179, 8, 0.4)',
      label: 'MEDIUM',
    };
  }
  return {
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#16a34a',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    label: 'LOW',
  };
}
