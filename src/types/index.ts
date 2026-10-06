// Shared TypeScript types for TraceLens

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type AttackStage =
  | 'reconnaissance'
  | 'initial_access'
  | 'execution'
  | 'persistence'
  | 'privilege_escalation'
  | 'lateral_movement'
  | 'exfiltration'
  | 'impact';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  stage: AttackStage;
  severity: Severity;
  source: string;
  mitre: string;
  indicators: string[];
}

export interface IncidentResponse {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

export interface Education {
  title: string;
  explanation: string;
  references: string[];
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  date: string;
  analyst: string;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  affectedSystems: string[];
  timeline: TimelineEvent[];
  response: IncidentResponse;
  education: Education;
}
