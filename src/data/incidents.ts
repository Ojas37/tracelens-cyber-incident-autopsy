export type { Severity, AttackStage, TimelineEvent, IncidentResponse, Education, Incident } from '../types/index';
import type { Incident } from '../types/index';

export const INCIDENTS: Incident[] = [
  // ── DEMO SCENARIO 1: PHISHING & CREDENTIAL THEFT ──────────────
  {
    id: 'INC-2024-001',
    title: 'Phishing Credential Theft & LSASS Memory Dump',
    description:
      'Sophisticated spear-phishing campaign targeting finance personnel. Attacker deployed an obfuscated macro dropper, spawned a Cobalt Strike PowerShell beacon, harvested domain credentials from LSASS memory, and performed Pass-the-Hash lateral movement.',
    severity: 'critical',
    date: '2024-03-15',
    analyst: 'Sarah Chen (Lead IR)',
    status: 'investigating',
    affectedSystems: ['FINANCE-WS-042', 'CORP-DC-01', 'MAIL-GATEWAY-02'],
    timeline: [
      {
        id: 'e1',
        timestamp: '2024-03-15T08:12:00Z',
        title: 'Spear-Phishing Email with Malicious Macro Received',
        description:
          'Targeted email received from spoofed sender finance-update@corp-payroll[.]net containing malicious attachment Q1_Executive_Comp.xlsm.',
        stage: 'initial_access',
        severity: 'high',
        source: 'Email Security Gateway',
        mitre: 'T1566.001',
        indicators: [
          'Q1_Executive_Comp.xlsm',
          'sender: finance-update@corp-payroll[.]net',
          'SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        ],
      },
      {
        id: 'e2',
        timestamp: '2024-03-15T08:27:00Z',
        title: 'VBA Macro Spawns Obfuscated PowerShell Beacon',
        description:
          'User enabled macro content; embedded VBA executed hidden PowerShell command downloading a stageless Cobalt Strike beacon over TLS.',
        stage: 'execution',
        severity: 'critical',
        source: 'Host EDR Agent',
        mitre: 'T1059.001',
        indicators: [
          'powershell.exe -w hidden -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AA==',
          'C2 Endpoint: 185.220.101.47:443',
          'beacon.dll injected into memory space',
        ],
      },
      {
        id: 'e3',
        timestamp: '2024-03-15T08:35:00Z',
        title: 'Persistence Established via Registry Run Key',
        description:
          'Attacker authored persistent autostart entry in HKCU Run key to survive endpoint reboots and maintain persistent Command & Control.',
        stage: 'persistence',
        severity: 'high',
        source: 'EDR Registry Monitor',
        mitre: 'T1547.001',
        indicators: [
          'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WinUpdateHelper',
          'Target: %APPDATA%\\Roaming\\svchost_helper.exe',
        ],
      },
      {
        id: 'e4',
        timestamp: '2024-03-15T09:15:00Z',
        title: 'LSASS Memory Dumping with Mimikatz',
        description:
          'Attacker invoked sekurlsa::logonpasswords in memory. Accessed Local Security Authority process memory to extract plaintext domain credentials and NTLM hashes.',
        stage: 'privilege_escalation',
        severity: 'critical',
        source: 'EDR Credential Guard',
        mitre: 'T1003.001',
        indicators: [
          'Mimikatz sekurlsa::logonpasswords',
          'OpenProcess token: LSASS.exe (PID 672)',
          'Extracted NTLM hash: 8846f7eaee8fb117ad06bdd830b7586c (Administrator)',
        ],
      },
      {
        id: 'e5',
        timestamp: '2024-03-15T10:02:00Z',
        title: 'Pass-the-Hash Lateral Movement to Domain Controller',
        description:
          'Leveraging harvested Domain Admin NTLM hash, attacker authenticated to CORP-DC-01 via SMB Admin$ share and created a remote execution service.',
        stage: 'lateral_movement',
        severity: 'critical',
        source: 'Network IDS & Windows Security Event 4624',
        mitre: 'T1550.002',
        indicators: [
          'SMB Session: \\\\CORP-DC-01\\ADMIN$',
          'Auth Type: NTLM (Pass-the-Hash)',
          'Service Created: RemoteAdminSvc',
        ],
      },
    ],
    response: {
      immediate: [
        'Isolate FINANCE-WS-042 and CORP-DC-01 from production VLAN immediately',
        'Block C2 IP 185.220.101.47 and null-route domain corp-payroll[.]net at perimeter firewalls',
        'Force global password reset and invalidate all active Kerberos TGT tickets (purge krbtgt twice)',
        'Terminate active unauthorized SMB and WinRM sessions on Domain Controller',
      ],
      shortTerm: [
        'Perform volatile memory forensics on FINANCE-WS-042 and CORP-DC-01',
        'Audit Active Directory event logs for any rogue domain admins or shadow credentials',
        'Enforce Microsoft Credential Guard and LSA RunAsPPL across all workstations',
        'Deploy PowerShell Script Block Logging and Constrained Language Mode via Group Policy',
      ],
      longTerm: [
        'Mandate phishing-resistant FIDO2 hardware MFA keys for all corporate accounts',
        'Implement Privileged Access Workstations (PAWs) with tiered administrative architecture',
        'Enforce strict macro execution blocking for all Office documents from external email zones',
        'Deploy automated EDR endpoint isolation policies for unauthorized LSASS memory reads',
      ],
    },
    education: {
      title: 'MITRE Killchain: Spear-Phishing to Domain Credential Dump',
      explanation:
        'This attack demonstrates an end-to-end credential harvesting killchain. Starting from initial access via spear-phishing (T1566.001), the attacker executed an obfuscated PowerShell beacon (T1059.001) to establish C2. Persistence was secured through registry run keys (T1547.001). The critical tipping point occurred during privilege escalation: using LSASS memory dumping (T1003.001), the adversary harvested high-privilege NTLM hashes, enabling Pass-the-Hash lateral movement (T1550.002) directly to the domain controller without triggering password complexity alerts.',
      references: [
        'https://attack.mitre.org/techniques/T1566/001/',
        'https://attack.mitre.org/techniques/T1003/001/',
        'https://attack.mitre.org/techniques/T1550/002/',
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-320a',
      ],
    },
  },

  // ── DEMO SCENARIO 2: RANSOMWARE ATTACK ───────────────────────
  {
    id: 'INC-2024-002',
    title: 'Ransomware Attack & Volume Shadow Destruction',
    description:
      'BlackCat / ALPHV ransomware double-extortion intrusion. Initial intrusion gained via VPN brute force credential stuffing, followed by Active Directory enumeration, endpoint defense evasion, complete volume shadow copy wipe, and AES-256 data encryption.',
    severity: 'critical',
    date: '2024-04-02',
    analyst: 'Marcus Webb (Incident Commander)',
    status: 'contained',
    affectedSystems: ['PROD-DB-01', 'BACKUP-NAS-01', 'CORP-DC-02', 'APP-SERVER-04'],
    timeline: [
      {
        id: 'e1',
        timestamp: '2024-04-02T02:14:00Z',
        title: 'VPN Credential Stuffing & Authentication Bypass',
        description:
          'Automated credential stuffing attack against corporate VPN gateway. Over 840 failed logon events prior to successful authentication using leaked credential pair.',
        stage: 'initial_access',
        severity: 'high',
        source: 'VPN Access Gateway Logs',
        mitre: 'T1110.004',
        indicators: [
          '847 failed VPN auth attempts within 6 minutes',
          'Source IP: 91.108.4.12 (TOR Exit Node)',
          'Compromised account: jsmith@enterprise.com',
        ],
      },
      {
        id: 'e2',
        timestamp: '2024-04-02T02:45:00Z',
        title: 'Active Directory Domain Reconnaissance with ADFind',
        description:
          'Attacker queried Active Directory using automated lightweight LDAP tool ADFind to map all high-value server targets and backup storage nodes.',
        stage: 'reconnaissance',
        severity: 'medium',
        source: 'SIEM Active Directory Telemetry',
        mitre: 'T1087.002',
        indicators: [
          'adfind.exe -f (objectCategory=computer) -b dc=corp,dc=internal',
          'Queried 2,400 AD computer & user objects',
        ],
      },
      {
        id: 'e3',
        timestamp: '2024-04-02T03:30:00Z',
        title: 'Defense Evasion – Antivirus & Event Logs Disabled',
        description:
          'Attacker disabled real-time endpoint monitoring and cleared Windows security event logs via wevtutil to obscure malicious activity.',
        stage: 'execution',
        severity: 'critical',
        source: 'Host EDR Agent',
        mitre: 'T1562.001',
        indicators: [
          'Set-MpPreference -DisableRealtimeMonitoring $true',
          'wevtutil cl Security / wevtutil cl System',
          'Service stopped: WinDefend',
        ],
      },
      {
        id: 'e4',
        timestamp: '2024-04-02T04:10:00Z',
        title: 'Volume Shadow Copies & Backup Infrastructure Wiped',
        description:
          'Adversary issued administrative commands to delete all volume shadow copies and catalog backups to thwart recovery without paying ransom.',
        stage: 'impact',
        severity: 'critical',
        source: 'Storage Audit & PowerShell Log',
        mitre: 'T1490',
        indicators: [
          'vssadmin delete shadows /all /quiet',
          'wbadmin delete catalog -quiet',
          'bcdedit /set {default} recoveryenabled No',
          'Volume Shadow Copies Remaining: 0',
        ],
      },
      {
        id: 'e5',
        timestamp: '2024-04-02T04:22:00Z',
        title: 'BlackCat Ransomware Payload Encryption Deployed',
        description:
          'Ransomware binary executed across network file shares, appending .blackcat extension to all documents, databases, and VM disks, dropping README_RESTORE.txt ransom note.',
        stage: 'impact',
        severity: 'critical',
        source: 'Storage Audit & EDR Alert',
        mitre: 'T1486',
        indicators: [
          'Process: blackcat_encryptor.exe (SHA256: 4f9812a...)',
          'File Extension Appended: *.blackcat',
          'Ransom Note: README_RESTORE_FILES.txt (Demanding 50 BTC)',
        ],
      },
    ],
    response: {
      immediate: [
        'Sever network connectivity to backup NAS storage and affected virtualized hosts',
        'Terminate active VPN session for jsmith@enterprise.com and revoke VPN certificate',
        'Preserve ransom note README_RESTORE_FILES.txt and encrypted sample headers for threat intel indexing',
        'Verify integrity of offline immutable air-gapped backups before commencing restoration',
      ],
      shortTerm: [
        'Enforce mandatory multi-factor authentication (MFA) on all VPN and remote access portals',
        'Enable EDR Tamper Protection across all endpoints to prevent antivirus service termination',
        'Re-image all compromised production hosts from verified clean golden images',
        'Deploy honey-tokens and canary files on file shares to detect unauthorized bulk file modifications',
      ],
      longTerm: [
        'Transition enterprise network architecture to Zero Trust Network Access (ZTNA)',
        'Implement 3-2-1 backup strategy with immutable Write-Once-Read-Many (WORM) cloud repositories',
        'Conduct executive and technical tabletop ransomware disaster recovery drills bi-annually',
        'Establish 24/7 MDR threat hunting service with automated ransomware canary triggers',
      ],
    },
    education: {
      title: 'Ransomware Double-Extortion & Backup Sabotage',
      explanation:
        'Modern ransomware operations systematically eliminate recovery capabilities before encrypting data. This intrusion illustrates the full impact progression: initial access was obtained via credential stuffing (T1110.004), followed by AD reconnaissance (T1087.002) and defense evasion (T1562.001) where security tools and logs were neutralized. Crucially, the attacker targeted backup infrastructure FIRST using Inhibit System Recovery (T1490) via vssadmin and wbadmin to wipe shadow copies, rendering local rollbacks impossible before executing data encryption (T1486).',
      references: [
        'https://attack.mitre.org/techniques/T1490/',
        'https://attack.mitre.org/techniques/T1486/',
        'https://www.cisa.gov/stopransomware',
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-353a',
      ],
    },
  },

  // ── DEMO SCENARIO 3: INSIDER DATA EXFILTRATION ───────────────
  {
    id: 'INC-2024-003',
    title: 'Insider Threat – Proprietary Code & PII Exfiltration',
    description:
      'Malicious insider activity by departing senior engineer. Utilized legitimate privileged credentials to clone private source code repositories after hours, bulk-download customer PII databases from SharePoint, and exfiltrate compressed archives to personal cloud storage.',
    severity: 'high',
    date: '2024-05-20',
    analyst: 'Priya Nair (Forensic Analyst)',
    status: 'resolved',
    affectedSystems: ['DEV-WS-017', 'GITLAB-SRV-01', 'SHAREPOINT-ONLINE', 'CASB-GATEWAY'],
    timeline: [
      {
        id: 'e1',
        timestamp: '2024-05-18T19:30:00Z',
        title: 'After-Hours Mass Clone of Core Git Repositories',
        description:
          'Departing developer accessed internal GitLab instance at 19:30 UTC outside business hours, executing automated script to clone 28 proprietary core IP repositories.',
        stage: 'reconnaissance',
        severity: 'medium',
        source: 'GitLab Audit Logging',
        mitre: 'T1213.003',
        indicators: [
          '28 private Git repositories cloned within 12 minutes',
          'Volume: 8.4 GB source code & proprietary algorithms',
          'User: dev.miller@enterprise.com',
          'Timestamp: Non-working hours (Saturday 19:30 UTC)',
        ],
      },
      {
        id: 'e2',
        timestamp: '2024-05-19T22:15:00Z',
        title: 'Bulk Download of Customer Contracts & Pricing Models',
        description:
          'Employee queried SharePoint corporate drive, downloading 480 customer contracts, billing histories, and unreleased product roadmaps. DLP anomaly trigger generated.',
        stage: 'exfiltration',
        severity: 'high',
        source: 'Microsoft Purview DLP & SharePoint Audit',
        mitre: 'T1039',
        indicators: [
          '480 files downloaded from /Finance/Enterprise_Contracts/',
          'DLP Alert #DLP-4821: High-Volume Sensitive Data Download',
          'Categories: PII, Pricing Models, Legal Agreements',
        ],
      },
      {
        id: 'e3',
        timestamp: '2024-05-20T08:15:00Z',
        title: 'Data Encrypted & Staged in Password-Protected Archive',
        description:
          'Staged files and cloned repositories were aggregated into a 7-Zip encrypted archive named backup_vault_2024.7z to evade content inspection filters.',
        stage: 'exfiltration',
        severity: 'high',
        source: 'EDR File Integrity Monitor',
        mitre: 'T1560.001',
        indicators: [
          '7z.exe a -p***** backup_vault_2024.7z C:\\Users\\miller\\Staging\\*',
          'Archive Size: 41.2 GB',
          'Archive SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        ],
      },
      {
        id: 'e4',
        timestamp: '2024-05-20T08:44:00Z',
        title: 'Exfiltration via Personal Google Drive & Cloud Storage',
        description:
          'Browser telemetry recorded 41.2 GB data egress to personal Google Drive and Mega.nz accounts, circumventing standard CASB policy via unmanaged browser profile.',
        stage: 'exfiltration',
        severity: 'critical',
        source: 'CASB / Web Proxy Telemetry',
        mitre: 'T1567.002',
        indicators: [
          'Egress to drive.google.com and mega.nz: 41.2 GB uploaded',
          'Personal account: miller.personal@gmail.com',
          'CASB Alert: Unauthorized Cloud Storage Egress Volume',
        ],
      },
    ],
    response: {
      immediate: [
        'Immediately disable Active Directory account and revoke all OAuth / SSO tokens for dev.miller@enterprise.com',
        'Issue immediate Legal Hold notice and preserve DEV-WS-017 for forensic chain of custody',
        'Engage Corporate Legal and Human Resources pursuant to intellectual property theft protocol',
        'Submit formal legal data preservation request to Google and Mega.nz for target personal accounts',
      ],
      shortTerm: [
        'Conduct comprehensive bit-stream forensic acquisition of DEV-WS-017 hard drive and memory',
        'Review Data Loss Prevention (DLP) alert queues and audit all departing staff accounts in past 90 days',
        'Enforce strict CASB blocking on all unmanaged personal cloud storage endpoints on corporate network',
        'Implement immediate off-boarding checklist with same-day credential decommissioning',
      ],
      longTerm: [
        'Deploy User and Entity Behavior Analytics (UEBA) to baseline normal developer repository clone volumes',
        'Enforce USB endpoint mass storage write blocking and cloud egress DLP watermarking',
        'Classify all intellectual property repositories and sensitive financial documents using Microsoft Purview',
        'Conduct mandatory annual insider threat and trade secret compliance awareness training',
      ],
    },
    education: {
      title: 'Insider Threat Mechanics & Data Exfiltration Evasion',
      explanation:
        'Insider threats represent a unique security challenge because the actor already possesses legitimate credentials and authorized access. In this incident, the employee systematically harvested proprietary source code (T1213.003) and sensitive customer SharePoint documents (T1039). To evade perimeter DLP inspection, the actor encrypted the stolen data into an archive (T1560.001) before exfiltrating 41.2 GB to personal cloud storage (T1567.002). Effective mitigation requires behavior anomaly detection (UEBA) capable of flagging abnormal after-hours access and bulk egress volume.',
      references: [
        'https://attack.mitre.org/techniques/T1567/002/',
        'https://attack.mitre.org/techniques/T1560/001/',
        'https://www.cisa.gov/resources-tools/resources/insider-threat-mitigation-guide',
        'https://www.sei.cmu.edu/research-capabilities/all-work/display.cfm?customel_datapageid_4050=21208',
      ],
    },
  },
];
