export type { Severity, AttackStage, TimelineEvent, IncidentResponse, Education, Incident } from '../types/index';
import type { Incident } from '../types/index';

export const INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'APT29 Credential Harvesting Campaign',
    description:
      'Sophisticated spear-phishing campaign targeting finance department. Attacker established persistent access through malicious macro-enabled documents and harvested domain credentials.',
    severity: 'critical',
    date: '2024-03-15',
    analyst: 'Sarah Chen',
    status: 'investigating',
    affectedSystems: ['FINANCE-PC-042', 'CORP-DC-01', 'MAIL-SRV-03'],
    timeline: [
      {
        id: 'e1',
        timestamp: '2024-03-15T08:12:00Z',
        title: 'Spear-Phishing Email Received',
        description:
          'Finance director received a highly targeted email impersonating the CFO, containing a malicious Excel attachment with embedded macro (Equation Editor exploit).',
        stage: 'initial_access',
        severity: 'high',
        source: 'Email Gateway',
        mitre: 'T1566.001',
        indicators: ['invoice_Q1_2024.xlsm', 'sender: no-reply@finance-corp[.]net', 'SHA256: a3f2...d9c1'],
      },
      {
        id: 'e2',
        timestamp: '2024-03-15T08:27:00Z',
        title: 'Macro Execution & Dropper Deployed',
        description:
          'User enabled macros; VBA macro executed PowerShell command to download a stageless Cobalt Strike beacon from a C2 server masquerading as a CDN endpoint.',
        stage: 'execution',
        severity: 'critical',
        source: 'EDR',
        mitre: 'T1059.001',
        indicators: ['powershell.exe -enc JABj...', 'C2: 185.220.101[.]47:443', 'beacon.dll loaded in memory'],
      },
      {
        id: 'e3',
        timestamp: '2024-03-15T08:31:00Z',
        title: 'Scheduled Task Persistence',
        description:
          'Attacker created a scheduled task named "WindowsUpdateHelper" running every 15 minutes to maintain persistence and survive reboots.',
        stage: 'persistence',
        severity: 'high',
        source: 'EDR',
        mitre: 'T1053.005',
        indicators: ['Task: WindowsUpdateHelper', 'Action: %APPDATA%\\update.exe', 'Trigger: Every 15 minutes'],
      },
      {
        id: 'e4',
        timestamp: '2024-03-15T09:15:00Z',
        title: 'Credential Dumping via LSASS',
        description:
          'Mimikatz executed in memory using process hollowing. LSASS process memory was accessed to extract plaintext credentials for 3 domain accounts.',
        stage: 'privilege_escalation',
        severity: 'critical',
        source: 'EDR',
        mitre: 'T1003.001',
        indicators: ['sekurlsa::logonpasswords', 'OpenProcess(LSASS)', '3 domain creds harvested'],
      },
      {
        id: 'e5',
        timestamp: '2024-03-15T10:02:00Z',
        title: 'Lateral Movement via Pass-the-Hash',
        description:
          'Using harvested NTLM hash, attacker authenticated to Domain Controller CORP-DC-01 and installed a remote access tool.',
        stage: 'lateral_movement',
        severity: 'critical',
        source: 'Network IDS',
        mitre: 'T1550.002',
        indicators: ['NTLM auth from FINANCE-PC-042 to CORP-DC-01', 'SMB session: admin$', 'psexec-like service created'],
      },
      {
        id: 'e6',
        timestamp: '2024-03-15T11:44:00Z',
        title: 'Sensitive Data Staged for Exfiltration',
        description:
          'Attacker enumerated and compressed financial records, employee PII, and strategic documents into encrypted archive.',
        stage: 'exfiltration',
        severity: 'critical',
        source: 'DLP',
        mitre: 'T1560.001',
        indicators: ['7zip archive: data_backup.7z (2.3GB)', 'Files: Q1_financials, employee_db, roadmap_2024', 'Encrypted with custom key'],
      },
    ],
    response: {
      immediate: [
        'Isolate FINANCE-PC-042 from network immediately',
        'Block C2 IP 185.220.101[.]47 at perimeter firewall',
        'Reset credentials for all 3 compromised domain accounts',
        'Revoke active sessions and Kerberos tickets (purge krbtgt)',
        'Preserve forensic image of affected systems before remediation',
      ],
      shortTerm: [
        'Conduct full memory forensics on FINANCE-PC-042 and CORP-DC-01',
        'Audit all scheduled tasks created in the last 30 days',
        'Review all privileged account authentication logs',
        'Block macro execution for Office documents from external sources',
        'Deploy Credential Guard on all Domain Controllers',
      ],
      longTerm: [
        'Implement phishing-resistant MFA (FIDO2) for all privileged accounts',
        'Deploy EDR with memory protection and LSASS credential guard',
        'Conduct purple team exercise simulating this attack chain',
        'Review and harden email gateway policies with sandbox detonation',
        'Implement network segmentation between finance and IT infrastructure',
      ],
    },
    education: {
      title: 'Understanding APT Credential Harvesting',
      explanation:
        'This attack demonstrates a classic APT kill chain. The attacker began with spear-phishing (T1566.001) — a highly targeted email that leverages social engineering. Once code execution was achieved via macros (T1059.001), a Command & Control (C2) beacon was established. Persistence (T1053.005) ensures access survives reboots. Credential dumping via LSASS (T1003.001) is a hallmark technique that extracts plaintext passwords from Windows memory. Pass-the-Hash (T1550.002) allows authentication without knowing the actual password. The final stage involves staging and encrypting data for exfiltration (T1560.001). This attack chain is consistent with APT29 (Cozy Bear) TTPs.',
      references: [
        'MITRE ATT&CK: T1566.001 – Spearphishing Attachment',
        'MITRE ATT&CK: T1003.001 – OS Credential Dumping: LSASS Memory',
        'CISA Advisory: AA22-320A – Iranian Government-Sponsored APT Actors',
        'Microsoft Security: Detecting and preventing LSASS credential dumping',
      ],
    },
  },
  {
    id: 'INC-2024-002',
    title: 'Ransomware Pre-Deployment Activity',
    description:
      'BlackCat/ALPHV ransomware affiliate detected in pre-deployment phase. Network-wide reconnaissance and domain enumeration observed prior to encryption.',
    severity: 'critical',
    date: '2024-04-02',
    analyst: 'Marcus Webb',
    status: 'contained',
    affectedSystems: ['PROD-SRV-01', 'BACKUP-NAS-01', 'AD-DC-02'],
    timeline: [
      {
        id: 'e1',
        timestamp: '2024-04-02T02:14:00Z',
        title: 'VPN Brute Force – Valid Account Compromised',
        description:
          'Credential stuffing attack against VPN portal. 847 failed attempts before successful login with leaked credentials from previous breach.',
        stage: 'initial_access',
        severity: 'high',
        source: 'VPN Logs',
        mitre: 'T1078',
        indicators: ['847 failed VPN logins', 'Source: 91.108.4[.]0/22 (TOR exit)', 'Successful auth: jsmith@corp.com'],
      },
      {
        id: 'e2',
        timestamp: '2024-04-02T02:45:00Z',
        title: 'Network Reconnaissance with ADFind',
        description:
          'ADFind.exe executed to enumerate Active Directory objects, domain trusts, and identify high-value targets.',
        stage: 'reconnaissance',
        severity: 'medium',
        source: 'SIEM',
        mitre: 'T1018',
        indicators: ['adfind.exe -f objectclass=computer', 'Domain trust enumeration', '2,400 AD objects queried'],
      },
      {
        id: 'e3',
        timestamp: '2024-04-02T03:30:00Z',
        title: 'RDP Lateral Movement to Production Server',
        description:
          'Attacker pivoted to PROD-SRV-01 using RDP with stolen credentials. Disabled Windows Defender and event log clearing observed.',
        stage: 'lateral_movement',
        severity: 'critical',
        source: 'EDR',
        mitre: 'T1021.001',
        indicators: ['RDP to PROD-SRV-01 from VPN client', 'Set-MpPreference -DisableRealtimeMonitoring $true', 'wevtutil cl Security'],
      },
      {
        id: 'e4',
        timestamp: '2024-04-02T04:10:00Z',
        title: 'Backup Infrastructure Targeted',
        description:
          'Attacker accessed backup NAS and attempted to delete shadow copies and backup sets to prevent recovery.',
        stage: 'impact',
        severity: 'critical',
        source: 'NAS Audit',
        mitre: 'T1490',
        indicators: ['vssadmin delete shadows /all /quiet', 'Backup deletion attempt on BACKUP-NAS-01', 'Volume shadow copies: 0 remaining'],
      },
    ],
    response: {
      immediate: [
        'Terminate active VPN session for jsmith@corp.com',
        'Enable geo-blocking on VPN portal for high-risk regions',
        'Force password reset for all accounts matching breach database',
        'Take BACKUP-NAS-01 offline and assess backup integrity',
        'Activate Incident Response retainer – escalate to IR team',
      ],
      shortTerm: [
        'Implement VPN MFA immediately for all users',
        'Review all accounts against HaveIBeenPwned database',
        'Deploy honeypot accounts to detect credential reuse',
        'Enable tamper protection on EDR across all endpoints',
        'Implement 3-2-1 backup rule with offline/air-gapped copies',
      ],
      longTerm: [
        'Deploy Zero Trust Network Access (ZTNA) replacing legacy VPN',
        'Implement privileged access workstations (PAWs) for admins',
        'Conduct tabletop ransomware simulation exercise',
        'Deploy UEBA to detect anomalous login patterns',
        'Establish immutable backup solution with offline copies',
      ],
    },
    education: {
      title: 'Ransomware Pre-Deployment TTPs',
      explanation:
        'Modern ransomware attacks are rarely opportunistic — they follow a structured playbook. This incident shows the pre-deployment phase: attackers gain initial access via valid credentials (T1078) from credential stuffing using breach databases. After establishing foothold, they enumerate the environment with tools like ADFind (T1018) to identify high-value targets. RDP (T1021.001) is the most common lateral movement technique in ransomware cases. Critically, attackers target backups FIRST (T1490) — their goal is to eliminate recovery options before deploying ransomware. Early detection at any stage of this chain can prevent catastrophic data loss.',
      references: [
        'CISA: #StopRansomware – BlackCat/ALPHV Advisory',
        'MITRE ATT&CK: T1078 – Valid Accounts',
        'FBI Flash: BlackCat Ransomware Indicators of Compromise',
        'CIS Controls: Backup and Recovery Best Practices',
      ],
    },
  },
  {
    id: 'INC-2024-003',
    title: 'Insider Threat – Data Exfiltration',
    description:
      'Departing employee transferred 40GB of proprietary source code and customer data to personal cloud storage before resignation.',
    severity: 'high',
    date: '2024-05-20',
    analyst: 'Priya Nair',
    status: 'resolved',
    affectedSystems: ['DEV-WS-017', 'GITLAB-SRV', 'SHAREPOINT'],
    timeline: [
      {
        id: 'e1',
        timestamp: '2024-05-18T19:30:00Z',
        title: 'After-Hours Access to Source Repositories',
        description:
          'Employee accessed GitLab repositories at 7:30 PM, outside normal working hours. Mass clone of 23 private repositories observed.',
        stage: 'reconnaissance',
        severity: 'medium',
        source: 'GitLab Audit',
        mitre: 'T1213',
        indicators: ['23 repos cloned', 'After-hours access: 19:30 local', 'User: dev.miller@corp.com', '8.2GB downloaded'],
      },
      {
        id: 'e2',
        timestamp: '2024-05-19T22:15:00Z',
        title: 'Mass SharePoint Document Download',
        description:
          'Employee downloaded customer contracts, pricing models, and roadmap documents from SharePoint. DLP alert triggered but not actioned.',
        stage: 'exfiltration',
        severity: 'high',
        source: 'DLP / SharePoint',
        mitre: 'T1039',
        indicators: ['487 documents downloaded', 'Categories: Contracts, Pricing, Roadmap', 'DLP alert #DLP-4821 (unactioned)'],
      },
      {
        id: 'e3',
        timestamp: '2024-05-20T08:44:00Z',
        title: 'Upload to Personal Google Drive',
        description:
          'Browser telemetry shows 40GB upload to personal Google Drive account. CASB policy bypass via personal browser profile.',
        stage: 'exfiltration',
        severity: 'critical',
        source: 'CASB / Proxy',
        mitre: 'T1567.002',
        indicators: ['Upload to drive.google.com: 40.3GB', 'Personal account: miller.personal@gmail.com', 'CASB bypass via Chrome personal profile'],
      },
    ],
    response: {
      immediate: [
        'Revoke all access credentials immediately',
        'Preserve forensic evidence – do not wipe device',
        'Engage Legal and HR for insider threat protocol',
        'Issue legal hold notice and preserve all logs',
        'Contact Google via legal process for data preservation',
      ],
      shortTerm: [
        'Conduct full forensic examination of DEV-WS-017',
        'Review DLP alert backlog for missed warnings',
        'Audit all departing employee access in the last 90 days',
        'Implement off-boarding checklist with access revocation day-1',
        'Enable CASB enforcement for all cloud storage platforms',
      ],
      longTerm: [
        'Deploy UEBA with insider threat behavioral baselines',
        'Implement Data Loss Prevention (DLP) with mandatory review SLA',
        'Enforce CASB policies across all browsers including personal profiles',
        'Classify and label all sensitive data with Microsoft Purview',
        'Conduct annual insider threat awareness training',
      ],
    },
    education: {
      title: 'Insider Threat Detection & Response',
      explanation:
        'Insider threats are among the most damaging and hardest-to-detect security incidents. This case illustrates a malicious insider using legitimate access to steal intellectual property. Key indicators include after-hours access to sensitive repositories (T1213), mass data collection (T1039), and cloud exfiltration (T1567.002). The critical failure point was an unactioned DLP alert — a common problem in organizations with alert fatigue. Effective insider threat programs combine User and Entity Behavior Analytics (UEBA) with strict off-boarding procedures and data classification. The earlier detection occurs in the timeline, the less damage results.',
      references: [
        'CISA: Insider Threat Mitigation Guide',
        'MITRE ATT&CK: T1567.002 – Exfiltration to Cloud Storage',
        'NIST SP 800-53: Access Control and Audit Logging',
        'Carnegie Mellon CERT: Common Sense Guide to Mitigating Insider Threats',
      ],
    },
  },
];
