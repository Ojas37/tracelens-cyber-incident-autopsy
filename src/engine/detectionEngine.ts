/**
 * TraceLens Detection Engine
 * ──────────────────────────
 * Analyzes free-form incident text against a rule library covering:
 *   Phishing · Credential Theft · PowerShell Execution
 *   Suspicious External Connections · Data Exfiltration · Ransomware
 *
 * Each matched rule produces a structured TimelineEvent with:
 *   - MITRE ATT&CK technique mapping
 *   - Attack stage classification
 *   - Severity rating
 *   - Extracted indicators of compromise (IoCs)
 *   - Confidence score (0–100)
 */

import type { TimelineEvent, AttackStage, Severity } from '../types/index';

// ─────────────────────────────────────────────────────────────
// Engine-specific types
// ─────────────────────────────────────────────────────────────

export type ThreatCategory =
  | 'phishing'
  | 'credential_theft'
  | 'powershell_execution'
  | 'suspicious_connection'
  | 'data_exfiltration'
  | 'ransomware'
  | 'lateral_movement'
  | 'persistence'
  | 'defense_evasion'
  | 'reconnaissance';

export interface DetectionRule {
  id: string;
  name: string;
  category: ThreatCategory;
  stage: AttackStage;
  severity: Severity;
  mitre: string;
  mitreUrl: string;
  description: string;
  /** Regex patterns matched against the full lowercased input text */
  patterns: RegExp[];
  /** Weight per match (1–3): how strongly each hit contributes to confidence */
  weight: number;
  /** Extracts IoC strings from the original text */
  extractIndicators: (text: string) => string[];
}

export interface RuleMatch {
  rule: DetectionRule;
  matchedPatterns: string[];
  extractedIndicators: string[];
  confidence: number; // 0–100
}

export interface DetectionResult {
  analyzedAt: string;
  inputLength: number;
  totalRulesChecked: number;
  matchCount: number;
  overallSeverity: Severity;
  overallConfidence: number; // 0–100
  threatCategories: ThreatCategory[];
  matches: RuleMatch[];
  events: TimelineEvent[];
  summary: string;
}

// ─────────────────────────────────────────────────────────────
// IoC extraction helpers
// ─────────────────────────────────────────────────────────────

/** Extract IPv4 addresses, including defanged [.] variants */
function extractIPs(text: string): string[] {
  const fanged = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g) || [];
  const defanged = text.match(/\b(?:\d{1,3}\[\.\]){3}\d{1,3}(?::\d+)?\b/g) || [];
  return [...new Set([...fanged, ...defanged])].slice(0, 5);
}

/** Extract domains/URLs, including defanged variants */
function extractDomains(text: string): string[] {
  const raw = text.match(/(?:https?:\/\/)?(?:[a-z0-9\-]+\.)+[a-z]{2,}(?:\/[^\s]*)?\b/gi) || [];
  const defanged = text.match(/(?:[a-z0-9\-]+\[\.\])+[a-z]{2,}/gi) || [];
  return [...new Set([...raw, ...defanged])].slice(0, 5);
}

/** Extract file hashes (MD5/SHA1/SHA256) */
function extractHashes(text: string): string[] {
  return (text.match(/\b[a-fA-F0-9]{32,64}\b/g) || []).slice(0, 3);
}

/** Extract suspicious filenames */
function extractFilenames(text: string): string[] {
  return (
    text.match(
      /\b[\w\-]{2,40}\.(exe|dll|ps1|bat|vbs|js|xlsm|docm|zip|7z|rar|lnk|hta|cmd|msi|iso|img)\b/gi
    ) || []
  ).slice(0, 5);
}

/** Extract email addresses */
function extractEmails(text: string): string[] {
  return (text.match(/\b[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}\b/gi) || []).slice(0, 3);
}

/** Extract Windows registry keys */
function extractRegistryKeys(text: string): string[] {
  return (text.match(/HK(?:EY_)?(?:LOCAL_MACHINE|CURRENT_USER|LM|CU)\\[^\s"']+/gi) || []).slice(0, 3);
}

/** Extract PowerShell / cmd snippets */
function extractCommandSnippets(text: string): string[] {
  const ps = text.match(/(?:powershell|cmd|bash|sh)\s+[^\n.]{5,80}/gi) || [];
  const enc = text.match(/-enc(?:odedcommand)?\s+[A-Za-z0-9+/=]{10,}/gi) || [];
  const invoke = text.match(/(?:invoke-expression|iex|start-process|downloadstring)\s*\([^\n)]{0,60}\)/gi) || [];
  return [...new Set([...ps, ...enc, ...invoke])].slice(0, 4);
}

/** Extract cloud storage URLs */
function extractCloudUrls(text: string): string[] {
  return (
    text.match(
      /(?:drive\.google\.com|dropbox\.com|onedrive\.live\.com|mega\.nz|wetransfer\.com|pastebin\.com)[^\s]*/gi
    ) || []
  ).slice(0, 3);
}

/** Extract user/account names */
function extractUsernames(text: string): string[] {
  return (
    text.match(
      /(?:user(?:name)?|account|login|logon|auth(?:entication)?)\s*[:=]\s*([^\s,;'"]{2,40})/gi
    ) || []
  ).slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// Rule Library
// ─────────────────────────────────────────────────────────────

const RULES: DetectionRule[] = [
  // ── PHISHING ────────────────────────────────────────────────
  {
    id: 'PHISH-001',
    name: 'Spear-Phishing Email with Malicious Attachment',
    category: 'phishing',
    stage: 'initial_access',
    severity: 'high',
    mitre: 'T1566.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1566/001/',
    description: 'A targeted email containing a malicious attachment was sent to a specific individual or group. Commonly delivers macro-enabled Office documents, PDFs with embedded scripts, or ISO/IMG files.',
    weight: 3,
    patterns: [
      /spear[\s-]?phish/i,
      /malicious\s+(?:email|attachment|document|excel|word|pdf)/i,
      /phishing\s+(?:email|campaign|attempt|attack)/i,
      /\b(?:xlsm|docm|xlsb|dotm)\b/i,
      /macro[\s-]?enabled\s+document/i,
      /sent\s+(?:a\s+)?(?:malicious|suspicious)\s+(?:email|message)/i,
      /email\s+(?:with|containing)\s+(?:an?\s+)?(?:attachment|link)/i,
      /(?:fake|spoofed?|impersonat)\w*\s+email/i,
      /business\s+email\s+compromise/i,
      /bec\s+attack/i,
    ],
    extractIndicators: (text) => [
      ...extractEmails(text),
      ...extractFilenames(text),
      ...extractDomains(text).filter((d) => d.includes('mail') || d.includes('smtp') || d.includes('@')),
    ],
  },
  {
    id: 'PHISH-002',
    name: 'Spear-Phishing via Link (Credential Harvesting Page)',
    category: 'phishing',
    stage: 'initial_access',
    severity: 'high',
    mitre: 'T1566.002',
    mitreUrl: 'https://attack.mitre.org/techniques/T1566/002/',
    description: 'Email or message contained a malicious hyperlink directing users to a fake login page or drive-by download site designed to harvest credentials or deliver malware.',
    weight: 2,
    patterns: [
      /phishing\s+(?:link|url|page|site)/i,
      /fake\s+(?:login|sign[\s-]?in|authentication)\s+page/i,
      /credential\s+harvest/i,
      /(?:clicked?|followed?)\s+(?:a\s+)?(?:malicious|suspicious)\s+link/i,
      /drive[\s-]?by\s+(?:download|exploit)/i,
      /watering\s+hole/i,
    ],
    extractIndicators: (text) => [...extractDomains(text), ...extractIPs(text)],
  },

  // ── CREDENTIAL THEFT ────────────────────────────────────────
  {
    id: 'CRED-001',
    name: 'LSASS Memory Credential Dumping',
    category: 'credential_theft',
    stage: 'privilege_escalation',
    severity: 'critical',
    mitre: 'T1003.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1003/001/',
    description: 'The attacker accessed the Local Security Authority Subsystem Service (LSASS) process memory to extract plaintext passwords, NTLM hashes, or Kerberos tickets.',
    weight: 3,
    patterns: [
      /lsass/i,
      /credential\s+dump/i,
      /mimikatz/i,
      /sekurlsa/i,
      /logonpasswords/i,
      /pass[\s-]?the[\s-]?hash/i,
      /pth\s+attack/i,
      /ntlm\s+hash/i,
      /kerberos\s+ticket/i,
      /golden\s+ticket/i,
      /silver\s+ticket/i,
      /procdump.*lsass/i,
      /task\s*manager.*lsass/i,
    ],
    extractIndicators: (text) => [
      ...extractHashes(text),
      ...extractCommandSnippets(text),
      ...extractFilenames(text).filter((f) => /mimikatz|procdump|lsass/i.test(f)),
    ],
  },
  {
    id: 'CRED-002',
    name: 'Credential Stuffing / Brute Force Attack',
    category: 'credential_theft',
    stage: 'initial_access',
    severity: 'high',
    mitre: 'T1110',
    mitreUrl: 'https://attack.mitre.org/techniques/T1110/',
    description: 'Automated login attempts using known credential pairs (stuffing) or systematic password guessing (brute force) against authentication endpoints.',
    weight: 2,
    patterns: [
      /credential\s+stuff/i,
      /brute\s+force/i,
      /password\s+spray/i,
      /multiple\s+(?:failed\s+)?(?:login|auth(?:entication)?|sign[\s-]?in)\s+attempt/i,
      /\d+\s+(?:failed\s+)?(?:login|auth|logon)\s+attempt/i,
      /account\s+lock(?:out)?/i,
      /dictionary\s+attack/i,
      /hydra|medusa|john\s+the\s+ripper|hashcat/i,
    ],
    extractIndicators: (text) => [
      ...extractIPs(text),
      ...extractUsernames(text),
      ...((text.match(/\d+\s+(?:failed|login|auth)\s+attempt\w*/gi) || []).slice(0, 3)),
    ],
  },
  {
    id: 'CRED-003',
    name: 'Kerberoasting / AS-REP Roasting',
    category: 'credential_theft',
    stage: 'privilege_escalation',
    severity: 'high',
    mitre: 'T1558.003',
    mitreUrl: 'https://attack.mitre.org/techniques/T1558/003/',
    description: 'Attacker requested service tickets for service accounts with SPNs (Kerberoasting) or targeted accounts without pre-authentication (AS-REP Roasting) to perform offline password cracking.',
    weight: 3,
    patterns: [
      /kerberoast/i,
      /as[\s-]?rep\s+roast/i,
      /service\s+principal\s+name|spn/i,
      /ticket\s+(?:grant(?:ing)?\s+ticket|tgt)/i,
      /rubeus|impacket.*kerberos/i,
      /offline\s+(?:password\s+)?crack/i,
    ],
    extractIndicators: (text) => [
      ...extractCommandSnippets(text),
      ...((text.match(/(?:Rubeus|Impacket|GetTGT|GetST)\S*/gi) || []).slice(0, 3)),
    ],
  },

  // ── POWERSHELL / SCRIPT EXECUTION ───────────────────────────
  {
    id: 'PS-001',
    name: 'Obfuscated PowerShell Execution',
    category: 'powershell_execution',
    stage: 'execution',
    severity: 'high',
    mitre: 'T1059.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1059/001/',
    description: 'PowerShell was used to execute commands, often with obfuscation techniques such as Base64 encoding, string concatenation, or bypass flags to evade detection.',
    weight: 3,
    patterns: [
      /powershell.*-enc(?:odedcommand)?/i,
      /powershell.*-nop(?:rofile)?/i,
      /powershell.*-exec(?:ution\s+policy)?\s+bypass/i,
      /powershell.*-w(?:indow\s+style)?\s+hidden/i,
      /iex\s*\(.*download/i,
      /invoke[\s-]expression/i,
      /\[system\.convert\]::frombase64string/i,
      /downloadstring\s*\(/i,
      /downloadfile\s*\(/i,
      /net\.webclient/i,
      /start[\s-]bitstransfer/i,
      /invoke[\s-]mimikatz/i,
    ],
    extractIndicators: (text) => [
      ...extractCommandSnippets(text),
      ...((text.match(/-enc(?:odedcommand)?\s+[A-Za-z0-9+/=]{8,}/gi) || []).slice(0, 2)),
      ...extractFilenames(text).filter((f) => /\.ps1$/i.test(f)),
    ],
  },
  {
    id: 'PS-002',
    name: 'Malicious Script Execution (VBScript / WScript / Batch)',
    category: 'powershell_execution',
    stage: 'execution',
    severity: 'high',
    mitre: 'T1059.005',
    mitreUrl: 'https://attack.mitre.org/techniques/T1059/005/',
    description: 'Legacy scripting engines (VBScript, JScript, WScript, CScript, cmd.exe) were used to execute malicious payloads, often delivered via Office macros or HTML applications (.hta).',
    weight: 2,
    patterns: [
      /vbscript|jscript/i,
      /wscript|cscript/i,
      /\.(vbs|hta|js|wsf)\b/i,
      /office\s+macro/i,
      /vba\s+macro/i,
      /macro\s+executed?/i,
      /enabled?\s+macro/i,
      /auto(?:open|exec|run)/i,
      /mshta\.exe/i,
      /regsvr32\s+\/s\s+\/u\s+\/i/i,
    ],
    extractIndicators: (text) => [
      ...extractFilenames(text).filter((f) => /\.(vbs|hta|js|wsf|bat|cmd)$/i.test(f)),
      ...extractCommandSnippets(text),
    ],
  },
  {
    id: 'PS-003',
    name: 'Living-off-the-Land Binaries (LOLBins)',
    category: 'powershell_execution',
    stage: 'execution',
    severity: 'medium',
    mitre: 'T1218',
    mitreUrl: 'https://attack.mitre.org/techniques/T1218/',
    description: 'Attacker leveraged legitimate Windows binaries (LOLBins) such as certutil, regsvr32, msiexec, or rundll32 to proxy execution of malicious payloads, bypassing application whitelisting.',
    weight: 2,
    patterns: [
      /certutil\s+(-decode|-urlcache|-encode)/i,
      /regsvr32\s+\/s/i,
      /msiexec\s+\/q/i,
      /rundll32\.exe/i,
      /installutil\.exe/i,
      /msbuild\.exe.*\.csproj/i,
      /wmic.*process.*call.*create/i,
      /bitsadmin.*\/transfer/i,
    ],
    extractIndicators: (text) => [
      ...extractCommandSnippets(text),
      ...extractFilenames(text).filter((f) =>
        /certutil|regsvr32|msiexec|rundll32|installutil|msbuild|bitsadmin/i.test(f)
      ),
      ...extractDomains(text),
    ],
  },

  // ── SUSPICIOUS EXTERNAL CONNECTIONS ─────────────────────────
  {
    id: 'C2-001',
    name: 'Command & Control Beacon (Cobalt Strike / Metasploit)',
    category: 'suspicious_connection',
    stage: 'execution',
    severity: 'critical',
    mitre: 'T1071.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1071/001/',
    description: 'Malware or implant established periodic callback to a Command & Control (C2) server using HTTP/HTTPS to receive instructions and exfiltrate data. Beaconing behaviour is often disguised as legitimate web traffic.',
    weight: 3,
    patterns: [
      /cobalt\s+strike/i,
      /c2\s+(?:server|beacon|callback|communication|infrastructure)/i,
      /command[\s-]and[\s-]control|c&c/i,
      /beacon(?:ing)?\s+(?:traffic|behavior|interval)/i,
      /metasploit|meterpreter/i,
      /reverse\s+(?:shell|tcp|http)/i,
      /call(?:back|home)\s+to/i,
      /sliver|brute\s+ratel|nighthawk/i,
      /empire\s+(?:framework|agent|stager)/i,
    ],
    extractIndicators: (text) => [
      ...extractIPs(text),
      ...extractDomains(text),
      ...((text.match(/(?:beacon|c2|callback|stager)[^\n.]{0,60}/gi) || []).slice(0, 3)),
    ],
  },
  {
    id: 'C2-002',
    name: 'DNS Tunneling / Covert C2 Channel',
    category: 'suspicious_connection',
    stage: 'execution',
    severity: 'high',
    mitre: 'T1071.004',
    mitreUrl: 'https://attack.mitre.org/techniques/T1071/004/',
    description: 'Data was encoded within DNS queries or responses to establish a covert communication channel, bypassing network controls that only inspect HTTP/HTTPS traffic.',
    weight: 3,
    patterns: [
      /dns\s+tunnel/i,
      /dns\s+(?:exfil|covert|c2|beacon)/i,
      /unusual\s+dns\s+(?:query|request|traffic)/i,
      /high[\s-]volume\s+dns/i,
      /iodine|dnscat|dns2tcp/i,
    ],
    extractIndicators: (text) => [
      ...extractDomains(text),
      ...((text.match(/dns\s+query[^\n.]{0,60}/gi) || []).slice(0, 3)),
    ],
  },
  {
    id: 'C2-003',
    name: 'Suspicious Outbound Connection to Known Malicious Infrastructure',
    category: 'suspicious_connection',
    stage: 'execution',
    severity: 'high',
    mitre: 'T1041',
    mitreUrl: 'https://attack.mitre.org/techniques/T1041/',
    description: 'A host established an outbound connection to an IP address or domain associated with known threat actor infrastructure, TOR exit nodes, or hosting providers commonly used for malicious purposes.',
    weight: 2,
    patterns: [
      /tor\s+(?:exit\s+node|network|browser)/i,
      /suspicious\s+(?:outbound|egress|connection|traffic)/i,
      /unusual\s+(?:outbound|egress|external)\s+(?:traffic|connection|communication)/i,
      /known\s+malicious\s+(?:ip|domain|infrastructure)/i,
      /threat\s+intel(?:ligence)?\s+(?:hit|match|flag)/i,
      /blocked\s+(?:by\s+)?(?:firewall|ids|ips|proxy)/i,
    ],
    extractIndicators: (text) => [...extractIPs(text), ...extractDomains(text)],
  },

  // ── DATA EXFILTRATION ────────────────────────────────────────
  {
    id: 'EXFIL-001',
    name: 'Data Exfiltration to Cloud Storage',
    category: 'data_exfiltration',
    stage: 'exfiltration',
    severity: 'critical',
    mitre: 'T1567.002',
    mitreUrl: 'https://attack.mitre.org/techniques/T1567/002/',
    description: 'Sensitive data was transferred to attacker-controlled or personal cloud storage services (Google Drive, Dropbox, OneDrive, MEGA, etc.), bypassing traditional DLP controls that focus on SMTP/FTP.',
    weight: 3,
    patterns: [
      /upload(?:ed)?\s+to\s+(?:google\s+drive|dropbox|onedrive|mega|s3|azure\s+blob)/i,
      /cloud\s+(?:storage|upload|exfil)/i,
      /(?:drive\.google\.com|dropbox\.com|onedrive\.live\.com|mega\.nz)/i,
      /data\s+(?:sent|upload|transfer)\s+to\s+(?:personal|external)/i,
      /dlp\s+(?:alert|violation|triggered)/i,
      /sensitive\s+data\s+(?:found|detected|upload|transfer)/i,
    ],
    extractIndicators: (text) => [
      ...extractCloudUrls(text),
      ...((text.match(/\d+(?:\.\d+)?\s*(?:gb|mb|kb|tb)\b/gi) || []).slice(0, 3)),
      ...extractFilenames(text).filter((f) => /\.(zip|7z|rar|tar|gz)$/i.test(f)),
    ],
  },
  {
    id: 'EXFIL-002',
    name: 'Data Staged and Compressed for Exfiltration',
    category: 'data_exfiltration',
    stage: 'exfiltration',
    severity: 'high',
    mitre: 'T1560.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1560/001/',
    description: 'Attacker collected, compressed, and/or encrypted data prior to exfiltration. Archive tools like 7-Zip, WinRAR, or custom scripts were used to package data for transfer.',
    weight: 2,
    patterns: [
      /(?:data\s+)?staged?\s+(?:for\s+exfil|and\s+compress)/i,
      /7zip|7-zip|winrar|winzip/i,
      /\.(7z|rar|zip|tar\.gz|tgz)\b/i,
      /compress(?:ed|ing)?\s+(?:archive|files?|data)/i,
      /encrypt(?:ed)?\s+archive/i,
      /(?:large\s+)?archive\s+(?:created|found|detected)/i,
      /bulk\s+(?:file\s+)?(?:download|copy|access)/i,
      /\d+\s*(?:file|document|record)s?\s+(?:copied|download|access)/i,
    ],
    extractIndicators: (text) => [
      ...extractFilenames(text).filter((f) => /\.(7z|rar|zip|tar|gz)$/i.test(f)),
      ...((text.match(/\d+(?:\.\d+)?\s*(?:gb|mb|kb)\b/gi) || []).slice(0, 3)),
    ],
  },
  {
    id: 'EXFIL-003',
    name: 'Sensitive Data Repository Access (Source Code / Credentials)',
    category: 'data_exfiltration',
    stage: 'exfiltration',
    severity: 'high',
    mitre: 'T1213',
    mitreUrl: 'https://attack.mitre.org/techniques/T1213/',
    description: 'Attacker accessed internal data repositories containing sensitive information such as source code, credentials, API keys, customer data, or intellectual property.',
    weight: 2,
    patterns: [
      /(?:git|gitlab|github|bitbucket|svn)\s+(?:repo|clone|access)/i,
      /source\s+code\s+(?:stolen|access|clone|download)/i,
      /sharepoint\s+(?:access|download|document)/i,
      /confluence\s+(?:access|dump|scrape)/i,
      /jira\s+data\s+access/i,
      /\d+\s+(?:repo|repositor|document)s?\s+(?:clone|access|download)/i,
      /internal\s+(?:wiki|knowledge\s+base|documentation)\s+access/i,
    ],
    extractIndicators: (text) => [
      ...((text.match(/\d+\s+(?:repo|repositor|document)s?\s+(?:clone|access|download)\w*/gi) || []).slice(0, 3)),
      ...extractDomains(text).filter((d) => /git|share|confluence/i.test(d)),
    ],
  },

  // ── RANSOMWARE ───────────────────────────────────────────────
  {
    id: 'RANSOM-001',
    name: 'Ransomware File Encryption',
    category: 'ransomware',
    stage: 'impact',
    severity: 'critical',
    mitre: 'T1486',
    mitreUrl: 'https://attack.mitre.org/techniques/T1486/',
    description: 'Ransomware encrypted user files on the local system and/or network shares, rendering them inaccessible. Encryption is typically asymmetric (RSA/ECC) with a unique per-victim key.',
    weight: 3,
    patterns: [
      /ransomware/i,
      /file(?:s)?\s+encrypted/i,
      /encrypted\s+(?:file|data|disk|drive)/i,
      /ransom\s+(?:note|demand|payment)/i,
      /decrypt(?:ion)?\s+key/i,
      /\.(locked|encrypted|enc|crypt|wannacry|locky|ryuk|conti|blackcat|lockbit)\b/i,
      /bitcoin\s+(?:wallet|address|ransom)/i,
      /pay\s+(?:the\s+)?ransom/i,
      /lockbit|blackcat|alphv|ryuk|conti|revil|darkside|maze\b/i,
    ],
    extractIndicators: (text) => [
      ...((text.match(/(?:LockBit|BlackCat|ALPHV|REvil|Conti|Ryuk|DarkSide|Maze)\S*/gi) || []).slice(0, 3)),
      ...((text.match(/\.[a-z]{4,12}\b/g) || []).filter((ext) =>
        /locked|encrypted|enc|crypt/i.test(ext)
      ).slice(0, 3)),
      ...((text.match(/bitcoin|btc|monero|xmr|wallet\s*(?:address)?[:\s]+[\w]{10,}/gi) || []).slice(0, 2)),
    ],
  },
  {
    id: 'RANSOM-002',
    name: 'Shadow Copy & Backup Deletion',
    category: 'ransomware',
    stage: 'impact',
    severity: 'critical',
    mitre: 'T1490',
    mitreUrl: 'https://attack.mitre.org/techniques/T1490/',
    description: 'Attacker deleted Windows Volume Shadow Copies and backup sets to prevent system recovery without paying the ransom. This is a standard step in modern ransomware pre-deployment.',
    weight: 3,
    patterns: [
      /vssadmin\s+delete\s+shadows/i,
      /shadow\s+cop(?:y|ies)\s+(?:deleted?|removed?|delet)/i,
      /backup(?:s)?\s+(?:deleted?|destroyed?|wipe|tamper)/i,
      /volume\s+shadow\s+(?:cop(?:y|ies)|service)/i,
      /wbadmin\s+delete/i,
      /bcdedit\s+\/set\s+.*recoveryenabled\s+no/i,
      /disable\s+(?:system\s+restore|recovery)/i,
      /prevent(?:ing)?\s+(?:recovery|restore)/i,
    ],
    extractIndicators: (text) => [
      ...extractCommandSnippets(text),
      ...((text.match(/vssadmin[^\n.]{0,80}/gi) || []).slice(0, 2)),
      ...((text.match(/wbadmin[^\n.]{0,80}/gi) || []).slice(0, 2)),
    ],
  },

  // ── LATERAL MOVEMENT ────────────────────────────────────────
  {
    id: 'LAT-001',
    name: 'Lateral Movement via RDP',
    category: 'lateral_movement',
    stage: 'lateral_movement',
    severity: 'high',
    mitre: 'T1021.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1021/001/',
    description: 'Attacker used Remote Desktop Protocol (RDP) to move laterally between systems after obtaining valid credentials. RDP provides full graphical interactive access to target systems.',
    weight: 2,
    patterns: [
      /rdp\s+(?:session|connection|access|lateral)/i,
      /remote\s+desktop\s+(?:protocol|connection|access)/i,
      /lateral\s+movement\s+(?:via|using|through)\s+rdp/i,
      /moved?\s+laterally/i,
      /pivoted?\s+(?:to|from)/i,
    ],
    extractIndicators: (text) => [
      ...extractIPs(text),
      ...extractUsernames(text),
    ],
  },
  {
    id: 'LAT-002',
    name: 'Pass-the-Hash / Pass-the-Ticket',
    category: 'lateral_movement',
    stage: 'lateral_movement',
    severity: 'critical',
    mitre: 'T1550.002',
    mitreUrl: 'https://attack.mitre.org/techniques/T1550/002/',
    description: 'Attacker used stolen NTLM hashes or Kerberos tickets to authenticate to remote systems without needing the plaintext password, enabling lateral movement across the domain.',
    weight: 3,
    patterns: [
      /pass[\s-]?the[\s-]?hash|pth\b/i,
      /pass[\s-]?the[\s-]?ticket|ptt\b/i,
      /ntlm\s+(?:relay|auth|hash)/i,
      /impacket.*smb/i,
      /psexec|smbexec|wmiexec/i,
    ],
    extractIndicators: (text) => [
      ...extractHashes(text),
      ...extractIPs(text),
      ...extractCommandSnippets(text),
    ],
  },

  // ── PERSISTENCE ─────────────────────────────────────────────
  {
    id: 'PERS-001',
    name: 'Scheduled Task / Cron Job Persistence',
    category: 'persistence',
    stage: 'persistence',
    severity: 'high',
    mitre: 'T1053.005',
    mitreUrl: 'https://attack.mitre.org/techniques/T1053/005/',
    description: 'Attacker created a scheduled task or cron job to maintain persistence, ensuring their payload executes automatically at defined intervals or system events.',
    weight: 2,
    patterns: [
      /scheduled\s+task/i,
      /schtasks\s+\/create/i,
      /cron\s*(?:job|tab)/i,
      /startup\s+(?:folder|item|entry)/i,
      /run\s+key/i,
      /registry\s+(?:run|autorun|persistence)/i,
    ],
    extractIndicators: (text) => [
      ...extractRegistryKeys(text),
      ...extractFilenames(text),
      ...((text.match(/(?:Task|schtasks)[^\n.]{0,80}/gi) || []).slice(0, 2)),
    ],
  },
  {
    id: 'PERS-002',
    name: 'Web Shell Deployed on Server',
    category: 'persistence',
    stage: 'persistence',
    severity: 'critical',
    mitre: 'T1505.003',
    mitreUrl: 'https://attack.mitre.org/techniques/T1505/003/',
    description: 'A web shell was uploaded to a web-accessible server, providing persistent, remote command execution capability that survives reboots and credential rotations.',
    weight: 3,
    patterns: [
      /web\s+shell/i,
      /webshell/i,
      /\.(?:php|aspx?|jsp|ashx)\s+(?:upload|backdoor|shell)/i,
      /uploaded?\s+(?:a\s+)?(?:malicious|backdoor)\s+(?:file|script|shell)/i,
      /china\s+chopper|b374k|r57|c99\s+shell/i,
    ],
    extractIndicators: (text) => [
      ...extractFilenames(text).filter((f) => /\.(php|aspx|jsp|ashx)$/i.test(f)),
      ...extractDomains(text),
      ...extractIPs(text),
    ],
  },

  // ── DEFENSE EVASION ─────────────────────────────────────────
  {
    id: 'DEF-001',
    name: 'Security Tool Tampering / AV Disabled',
    category: 'defense_evasion',
    stage: 'execution',
    severity: 'high',
    mitre: 'T1562.001',
    mitreUrl: 'https://attack.mitre.org/techniques/T1562/001/',
    description: 'Attacker disabled or tampered with security tools such as Windows Defender, EDR agents, firewall, or audit logging to avoid detection during the intrusion.',
    weight: 2,
    patterns: [
      /disable(?:d)?\s+(?:windows\s+defender|antivirus|av|edr|firewall)/i,
      /tamper(?:ed)?\s+(?:with\s+)?(?:security|edr|av|defender)/i,
      /set[\s-]?mppreference.*disable/i,
      /kill(?:ed)?\s+(?:defender|av|edr|security)\s+(?:process|service)/i,
      /event\s+log\s+(?:clear|wipe|tamper)/i,
      /wevtutil\s+cl/i,
      /clear[\s-]eventlog/i,
    ],
    extractIndicators: (text) => [
      ...extractCommandSnippets(text),
      ...((text.match(/(?:wevtutil|Set-MpPreference|netsh|sc\s+stop)[^\n.]{0,80}/gi) || []).slice(0, 3)),
    ],
  },

  // ── RECONNAISSANCE ───────────────────────────────────────────
  {
    id: 'RECON-001',
    name: 'Active Directory Enumeration',
    category: 'reconnaissance',
    stage: 'reconnaissance',
    severity: 'medium',
    mitre: 'T1018',
    mitreUrl: 'https://attack.mitre.org/techniques/T1018/',
    description: 'Attacker enumerated Active Directory objects including users, computers, groups, and domain trusts to map the environment and identify high-value targets.',
    weight: 2,
    patterns: [
      /active\s+directory\s+enum(?:eration)?/i,
      /adfind|bloodhound|sharphound/i,
      /ldap\s+(?:query|enum|scan)/i,
      /domain\s+(?:enum|recon|trust|controller)/i,
      /net\s+user\s+\/domain/i,
      /get[\s-]aduser|get[\s-]adcomputer/i,
      /objectclass\s*=\s*computer/i,
    ],
    extractIndicators: (text) => [
      ...((text.match(/(?:AdFind|BloodHound|SharpHound)\S*/gi) || []).slice(0, 3)),
      ...extractCommandSnippets(text),
    ],
  },
  {
    id: 'RECON-002',
    name: 'Network Scanning / Port Scanning',
    category: 'reconnaissance',
    stage: 'reconnaissance',
    severity: 'medium',
    mitre: 'T1046',
    mitreUrl: 'https://attack.mitre.org/techniques/T1046/',
    description: 'Network scanning tools were used to discover live hosts, open ports, and running services within the target environment.',
    weight: 2,
    patterns: [
      /nmap|masscan|zmap/i,
      /port\s+scan/i,
      /network\s+scan/i,
      /service\s+discover/i,
      /\d+\s+open\s+port/i,
      /ping\s+sweep/i,
      /host\s+discover/i,
    ],
    extractIndicators: (text) => [
      ...extractIPs(text),
      ...((text.match(/\d+\s+open\s+port\S*/gi) || []).slice(0, 3)),
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Confidence calculation
// ─────────────────────────────────────────────────────────────

function calculateConfidence(rule: DetectionRule, matchedPatterns: RegExp[], text: string): number {
  const baseScore = (matchedPatterns.length / rule.patterns.length) * 60;
  const weightBonus = Math.min(matchedPatterns.length * rule.weight * 5, 35);
  const iocBonus = rule.extractIndicators(text).length > 0 ? 5 : 0;
  return Math.min(Math.round(baseScore + weightBonus + iocBonus), 100);
}

// ─────────────────────────────────────────────────────────────
// Severity aggregation
// ─────────────────────────────────────────────────────────────

function aggregateSeverity(matches: RuleMatch[]): Severity {
  if (matches.some((m) => m.rule.severity === 'critical')) return 'critical';
  if (matches.some((m) => m.rule.severity === 'high')) return 'high';
  if (matches.some((m) => m.rule.severity === 'medium')) return 'medium';
  return 'low';
}

// ─────────────────────────────────────────────────────────────
// Summary generation
// ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ThreatCategory, string> = {
  phishing: 'phishing',
  credential_theft: 'credential theft',
  powershell_execution: 'script/PowerShell execution',
  suspicious_connection: 'C2/suspicious connections',
  data_exfiltration: 'data exfiltration',
  ransomware: 'ransomware activity',
  lateral_movement: 'lateral movement',
  persistence: 'persistence mechanisms',
  defense_evasion: 'defense evasion',
  reconnaissance: 'network/AD reconnaissance',
};

function generateSummary(matches: RuleMatch[], severity: Severity): string {
  if (matches.length === 0) {
    return 'No significant threat indicators detected in the provided text. Ensure the description contains sufficient technical detail.';
  }
  const cats = [...new Set(matches.map((m) => m.rule.category))].map(
    (c) => CATEGORY_LABELS[c]
  );
  const topMatch = [...matches].sort((a, b) => b.confidence - a.confidence)[0];
  return `Detected ${matches.length} indicator${matches.length > 1 ? 's' : ''} across ${cats.length} threat categor${cats.length > 1 ? 'ies' : 'y'} (${cats.join(', ')}). Overall severity: ${severity.toUpperCase()}. Highest confidence detection: "${topMatch.rule.name}" (${topMatch.confidence}% confidence, MITRE ${topMatch.rule.mitre}).`;
}

// ─────────────────────────────────────────────────────────────
// Main engine function
// ─────────────────────────────────────────────────────────────

export function analyzeIncidentText(rawText: string): DetectionResult {
  const text = rawText.trim();
  const timestamp = new Date().toISOString();

  const matches: RuleMatch[] = [];

  for (const rule of RULES) {
    const matchedPatterns = rule.patterns.filter((p) => p.test(text));
    if (matchedPatterns.length === 0) continue;

    const extractedIndicators = rule.extractIndicators(text).filter(Boolean);
    const confidence = calculateConfidence(rule, matchedPatterns, text);

    matches.push({
      rule,
      matchedPatterns: matchedPatterns.map((p) => p.toString()),
      extractedIndicators,
      confidence,
    });
  }

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);

  const overallSeverity = aggregateSeverity(matches);
  const overallConfidence =
    matches.length > 0
      ? Math.round(matches.reduce((s, m) => s + m.confidence, 0) / matches.length)
      : 0;

  const threatCategories = [...new Set(matches.map((m) => m.rule.category))];

  // Build events sorted by stage order
  const stageOrder: Record<AttackStage, number> = {
    reconnaissance: 0,
    initial_access: 1,
    execution: 2,
    persistence: 3,
    privilege_escalation: 4,
    lateral_movement: 5,
    exfiltration: 6,
    impact: 7,
  };

  const now = new Date();
  const events: TimelineEvent[] = matches
    .slice()
    .sort((a, b) => stageOrder[a.rule.stage] - stageOrder[b.rule.stage])
    .map((match, i) => {
      const eventTime = new Date(now.getTime() + i * 60000);
      return {
        id: `det-${match.rule.id}-${i}`,
        timestamp: eventTime.toISOString(),
        title: match.rule.name,
        description: match.rule.description,
        stage: match.rule.stage,
        severity: match.rule.severity,
        source: `Detection Engine · Rule ${match.rule.id}`,
        mitre: match.rule.mitre,
        indicators:
          match.extractedIndicators.length > 0
            ? match.extractedIndicators
            : [`${match.matchedPatterns.length} pattern${match.matchedPatterns.length > 1 ? 's' : ''} matched`, `Confidence: ${match.confidence}%`],
      };
    });

  return {
    analyzedAt: timestamp,
    inputLength: text.length,
    totalRulesChecked: RULES.length,
    matchCount: matches.length,
    overallSeverity,
    overallConfidence,
    threatCategories,
    matches,
    events,
    summary: generateSummary(matches, overallSeverity),
  };
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────

export { RULES };
export type { DetectionRule as Rule };

/** Quick utility: get all unique threat categories */
export function getAllCategories(): ThreatCategory[] {
  return [...new Set(RULES.map((r) => r.category))];
}

/** Get rules by category */
export function getRulesByCategory(category: ThreatCategory): DetectionRule[] {
  return RULES.filter((r) => r.category === category);
}
