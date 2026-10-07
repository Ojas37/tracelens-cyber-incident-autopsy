import type { AttackStage, Severity } from '../types/index';

export type EvidenceVerdict = 'benign' | 'suspicious' | 'malicious';

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  artifactType: 'Process Execution' | 'Network Connection' | 'Authentication' | 'File System' | 'Registry' | 'Memory';
  rawPayload: string;
  context: string;
  indicators: string[];
  expectedVerdict: EvidenceVerdict;
  attackStage?: AttackStage;
  severity?: Severity;
  mitre?: string;
  mitreName?: string;
  explanation: string;
  points: number;
}

export interface InvestigationScenario {
  id: string;
  title: string;
  description: string;
  targetIncidentId: string;
  totalItems: number;
  evidenceItems: EvidenceItem[];
}

export const INVESTIGATION_SCENARIOS: InvestigationScenario[] = [
  {
    id: 'inv-phish-cred',
    title: 'Operation Velvet Harvest: Credential Infiltration',
    description:
      'A barrage of telemetry was captured across the finance subnet. Review incoming alerts and classify each artifact to uncover the attacker’s killchain before domain compromise occurs.',
    targetIncidentId: 'INC-2024-001',
    totalItems: 6,
    evidenceItems: [
      {
        id: 'ev-101',
        title: 'Inbound Email with Excel Attachment',
        source: 'Email Security Gateway',
        timestamp: '2024-03-15 08:12:00 UTC',
        artifactType: 'Network Connection',
        rawPayload: `From: finance-update@corp-payroll[.]net\nTo: cfo-office@enterprise.com\nSubject: URGENT: Q1 Executive Comp Summary\nAttachment: Q1_Executive_Comp.xlsm (VBA Macro Hash: a3f2...d9c1)`,
        context: 'Received from an external lookalike domain that was registered 48 hours ago.',
        indicators: ['finance-update@corp-payroll[.]net', 'Q1_Executive_Comp.xlsm', 'VBA Macro embedded'],
        expectedVerdict: 'malicious',
        attackStage: 'initial_access',
        severity: 'high',
        mitre: 'T1566.001',
        mitreName: 'Spearphishing Attachment',
        explanation:
          'Malicious: Lookalike domain delivering a macro-enabled spreadsheet designed to exploit local VBA interpreters.',
        points: 100,
      },
      {
        id: 'ev-102',
        title: 'Automated Routine Antivirus Definition Sync',
        source: 'Windows Defender Update',
        timestamp: '2024-03-15 08:18:00 UTC',
        artifactType: 'Process Execution',
        rawPayload: `Process: MpCmdRun.exe -SignatureUpdate\nPID: 1140 (Parent: services.exe)\nOutbound: definitionupdates.microsoft.com:443\nResult: Definitions updated successfully to v1.398.112.0`,
        context: 'Standard daily signature update cycle triggered by system schedule.',
        indicators: ['MpCmdRun.exe', 'definitionupdates.microsoft.com'],
        expectedVerdict: 'benign',
        explanation: 'Benign: Normal Windows Defender security intelligence update over authentic Microsoft infrastructure.',
        points: 100,
      },
      {
        id: 'ev-103',
        title: 'Hidden Obfuscated PowerShell Command',
        source: 'EDR Process Telemetry',
        timestamp: '2024-03-15 08:27:00 UTC',
        artifactType: 'Process Execution',
        rawPayload: `Process: powershell.exe -w hidden -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AA==\nParent: EXCEL.EXE (PID 3412)\nConnected to: 185.220.101.47:443`,
        context: 'Excel spawned PowerShell with encoded base64 parameters establishing outbound TLS connection.',
        indicators: ['powershell.exe -enc', 'Parent: EXCEL.EXE', '185.220.101.47:443'],
        expectedVerdict: 'malicious',
        attackStage: 'execution',
        severity: 'critical',
        mitre: 'T1059.001',
        mitreName: 'PowerShell Command Execution',
        explanation:
          'Malicious: Living-off-the-land execution where Excel spawns an obfuscated PowerShell dropper to deploy a Cobalt Strike beacon.',
        points: 100,
      },
      {
        id: 'ev-104',
        title: 'IT Helpdesk Remote Screen Assist Session',
        source: 'TeamViewer Service',
        timestamp: '2024-03-15 08:50:00 UTC',
        artifactType: 'Network Connection',
        rawPayload: `Process: TeamViewer_Service.exe\nUser: it-support-admin\nDuration: 4 minutes (Ticket #HD-8912)\nDestination: 10.0.1.15 -> 10.0.2.40`,
        context: 'Internal subnet session matching an approved ticket for printer driver configuration.',
        indicators: ['TeamViewer_Service.exe', 'Ticket #HD-8912'],
        expectedVerdict: 'suspicious',
        explanation:
          'Suspicious: While associated with a ticket, remote admin tools must be closely monitored during ongoing triage for masquerading.',
        points: 100,
      },
      {
        id: 'ev-105',
        title: 'LSASS Process Memory Dump Invocation',
        source: 'EDR Credential Guard Alert',
        timestamp: '2024-03-15 09:15:00 UTC',
        artifactType: 'Memory',
        rawPayload: `Alert: OpenProcess token requested with PROCESS_VM_READ\nTarget: lsass.exe (PID 672)\nCaller: svchost_helper.exe (mimikatz injected in memory)\nCommand: sekurlsa::logonpasswords`,
        context: 'Unsigned binary attempted to read memory space of the Windows Local Security Authority subsystem.',
        indicators: ['sekurlsa::logonpasswords', 'OpenProcess(LSASS)', 'Extracted NTLM hash for Administrator'],
        expectedVerdict: 'malicious',
        attackStage: 'privilege_escalation',
        severity: 'critical',
        mitre: 'T1003.001',
        mitreName: 'LSASS Memory Credential Dumping',
        explanation:
          'Malicious: Mimikatz credential dumping to harvest plaintext passwords and NTLM hashes for domain administrative privilege escalation.',
        points: 100,
      },
      {
        id: 'ev-106',
        title: 'NTLM Pass-the-Hash SMB Authentication',
        source: 'Domain Controller Event 4624',
        timestamp: '2024-03-15 10:02:00 UTC',
        artifactType: 'Authentication',
        rawPayload: `Event ID: 4624 (Logon Type 3 - Network)\nTarget: \\\\CORP-DC-01\\ADMIN$\nUser: Administrator\nAuth Package: NTLM V2 (No Kerberos Pre-Auth)\nWorkstation: FINANCE-WS-042`,
        context: 'Logon from compromised finance workstation to primary Domain Controller without Kerberos ticket generation.',
        indicators: ['\\\\CORP-DC-01\\ADMIN$', 'Auth: NTLM Pass-the-Hash', 'Service: RemoteAdminSvc'],
        expectedVerdict: 'malicious',
        attackStage: 'lateral_movement',
        severity: 'critical',
        mitre: 'T1550.002',
        mitreName: 'Use Alternate Authentication Material: Pass the Hash',
        explanation:
          'Malicious: Stolen NTLM hash used to pivot laterally onto Domain Controller and create administrative services.',
        points: 100,
      },
    ],
  },
  {
    id: 'inv-ransom-wipe',
    title: 'Operation Dark Vault: Ransomware Pre-Deploy',
    description:
      'Perimeter alarms and backup storage alerts are firing simultaneously. Classify incoming forensic events to halt the ransomware encryption wave before shadow copies are deleted.',
    targetIncidentId: 'INC-2024-002',
    totalItems: 5,
    evidenceItems: [
      {
        id: 'ev-201',
        title: 'VPN Automated Password Spray Burst',
        source: 'VPN Access Gateway',
        timestamp: '2024-04-02 02:14:00 UTC',
        artifactType: 'Authentication',
        rawPayload: `Source IP: 91.108.4.12 (TOR Exit Node)\nFailed Attempts: 847 failed attempts in 6 minutes\nSuccessful Auth: jsmith@enterprise.com (Credential Stuffing Leak match)`,
        context: 'Mass distributed authentication spray against public VPN gateway from an anonymized TOR exit node.',
        indicators: ['847 failed attempts', '91.108.4.12', 'jsmith@enterprise.com'],
        expectedVerdict: 'malicious',
        attackStage: 'initial_access',
        severity: 'high',
        mitre: 'T1110.004',
        mitreName: 'Credential Stuffing',
        explanation: 'Malicious: Automated credential stuffing using stolen breach dumps to gain unauthorized network foothold.',
        points: 100,
      },
      {
        id: 'ev-202',
        title: 'Nightly Database Index Rebuild Script',
        source: 'SQL Server Agent',
        timestamp: '2024-04-02 02:30:00 UTC',
        artifactType: 'Process Execution',
        rawPayload: `Job: DB_Maintenance_Reindex\nExecuted by: NT SERVICE\\MSSQLSERVER\nTarget: PROD_CUSTOMERS_DB\nDuration: 12 minutes (Completed with 0 errors)`,
        context: 'Scheduled weekly database re-indexing script executed by local service account.',
        indicators: ['DB_Maintenance_Reindex', 'MSSQLSERVER'],
        expectedVerdict: 'benign',
        explanation: 'Benign: Standard automated database maintenance job running under expected service credentials.',
        points: 100,
      },
      {
        id: 'ev-203',
        title: 'Active Directory Enumeration via ADFind',
        source: 'Active Directory Audit',
        timestamp: '2024-04-02 02:45:00 UTC',
        artifactType: 'Process Execution',
        rawPayload: `Command: adfind.exe -f (objectCategory=computer) -b dc=corp,dc=internal\nQueried Objects: 2,400 Domain Computers\nOutput File: %TEMP%\\ad_dump.txt`,
        context: 'Unprivileged workstation executing automated LDAP crawler querying all enterprise assets and domain trusts.',
        indicators: ['adfind.exe', '2,400 AD objects queried', 'ad_dump.txt'],
        expectedVerdict: 'malicious',
        attackStage: 'reconnaissance',
        severity: 'medium',
        mitre: 'T1087.002',
        mitreName: 'Domain Account & Host Enumeration',
        explanation: 'Malicious: Reconnaissance tooling used by ransomware operators to identify high-value backup targets and hypervisors.',
        points: 100,
      },
      {
        id: 'ev-204',
        title: 'Antivirus Real-Time Monitoring Disabled',
        source: 'EDR Tamper Protection Event',
        timestamp: '2024-04-02 03:30:00 UTC',
        artifactType: 'Process Execution',
        rawPayload: `Command: Set-MpPreference -DisableRealtimeMonitoring $true\nCommand: wevtutil cl Security\nCaller: cmd.exe -> powershell.exe (Elevated)`,
        context: 'Administrative commands executed to shut off endpoint antivirus protection and clear event logs.',
        indicators: ['Set-MpPreference -DisableRealtimeMonitoring $true', 'wevtutil cl Security'],
        expectedVerdict: 'malicious',
        attackStage: 'execution',
        severity: 'critical',
        mitre: 'T1562.001',
        mitreName: 'Disable or Modify Security Tools',
        explanation: 'Malicious: Defense evasion commands designed to blind security analysts before ransomware execution.',
        points: 100,
      },
      {
        id: 'ev-205',
        title: 'Volume Shadow Copies & Catalog Backups Deleted',
        source: 'Storage Audit Log',
        timestamp: '2024-04-02 04:10:00 UTC',
        artifactType: 'Process Execution',
        rawPayload: `Command: vssadmin delete shadows /all /quiet\nCommand: wbadmin delete catalog -quiet\nCommand: bcdedit /set {default} recoveryenabled No\nShadow Copies Left: 0`,
        context: 'Destructive deletion of all local restore points and recovery options across file servers.',
        indicators: ['vssadmin delete shadows /all /quiet', 'wbadmin delete catalog -quiet', 'Shadow copies: 0'],
        expectedVerdict: 'malicious',
        attackStage: 'impact',
        severity: 'critical',
        mitre: 'T1490',
        mitreName: 'Inhibit System Recovery',
        explanation:
          'Malicious: Hallmark ransomware pre-cursor technique eliminating all local recovery mechanisms before launching payload encryption.',
        points: 100,
      },
    ],
  },
];

/**
 * Calculates user rank based on investigation score
 */
export function getInvestigatorRank(score: number, maxScore: number): {
  rank: string;
  badgeColor: string;
  description: string;
} {
  const percentage = Math.round((score / maxScore) * 100);
  if (percentage >= 90) {
    return {
      rank: 'Lead Incident Commander (Tier 3)',
      badgeColor: '#10b981',
      description: 'Flawless triage. High precision threat hunting with zero false negatives.',
    };
  }
  if (percentage >= 70) {
    return {
      rank: 'Senior SOC Analyst (Tier 2)',
      badgeColor: '#3b82f6',
      description: 'Solid threat analysis. Successfully identified primary killchain stages.',
    };
  }
  if (percentage >= 50) {
    return {
      rank: 'Junior SOC Investigator (Tier 1)',
      badgeColor: '#f59e0b',
      description: 'Good intuition, but missed or misclassified secondary evasion artifacts.',
    };
  }
  return {
    rank: 'Apprentice SOC Trainee',
    badgeColor: '#ef4444',
    description: 'Requires further threat intelligence and telemetry correlation training.',
  };
}
