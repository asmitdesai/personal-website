import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { posts, tags, postTags } from '../src/db/schema';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

async function seed() {
  console.log('Seeding local DB...');

  const tagData = [
    { name: 'wazuh', slug: 'wazuh' },
    { name: 'siem', slug: 'siem' },
    { name: 'velociraptor', slug: 'velociraptor' },
    { name: 'threat-hunting', slug: 'threat-hunting' },
    { name: 'misp', slug: 'misp' },
    { name: 'detection-engineering', slug: 'detection-engineering' },
    { name: 'dns-exfil', slug: 'dns-exfil' },
    { name: 'network-forensics', slug: 'network-forensics' },
    { name: 'web-exploitation', slug: 'web-exploitation' },
    { name: 'pentesting', slug: 'pentesting' },
    { name: 'tryhackme', slug: 'tryhackme' },
    { name: 'python', slug: 'python' },
    { name: 'typescript', slug: 'typescript' },
  ];

  for (const tag of tagData) {
    await db.insert(tags).values(tag).onConflictDoNothing();
  }

  const now = new Date().toISOString();

  const postData = [
    {
      slug: 'detection-enrichment-pipeline',
      title: 'Detection & Enrichment Pipeline',
      type: 'project' as const,
      excerpt:
        'Built at SecPod Technologies — integrates Wazuh, MISP, VirusTotal, Velociraptor, and Shuffle to process alerts end-to-end from collection to enriched IOC correlation.',
      tags: JSON.stringify(['wazuh', 'misp', 'detection-engineering', 'python']),
      body: `# Detection & Enrichment Pipeline

## Overview

This pipeline was built during my internship at SecPod Technologies to automate alert enrichment and triage.

## Architecture

\`\`\`
Wazuh → Shuffle → VirusTotal / MISP → Velociraptor → Enriched Alert
\`\`\`

## Components

- **Wazuh**: SIEM for log collection and alert generation
- **Shuffle**: SOAR orchestration layer
- **MISP**: Threat intelligence platform for IOC correlation
- **VirusTotal**: Hash and IP reputation lookups
- **Velociraptor**: Endpoint forensics and artifact collection

## Key Features

- Automated IOC extraction from Wazuh alerts
- MISP event creation for high-confidence detections
- VirusTotal enrichment for file hashes and IPs
- Velociraptor hunt triggering on critical alerts
`,
      github_url: 'https://github.com/asmitdesai/personal-website',
      published: 0,
      published_at: now,
      updated_at: now,
    },
    {
      slug: 'velociraptor-threat-hunting',
      title: 'Velociraptor Threat Hunting Query Library',
      type: 'project' as const,
      excerpt:
        'A curated collection of VQL queries for threat hunting common attack techniques — persistence, lateral movement, credential access.',
      tags: JSON.stringify(['velociraptor', 'threat-hunting', 'detection-engineering']),
      body: `# Velociraptor Threat Hunting Query Library

## Overview

VQL queries targeting MITRE ATT&CK techniques for rapid threat hunting across endpoints.

## Query Examples

### Persistence — Scheduled Tasks

\`\`\`vql
SELECT Name, Command, NextRunTime
FROM scheduled_tasks()
WHERE NextRunTime > now() - 86400
\`\`\`

### Credential Access — LSASS Reads

\`\`\`vql
SELECT Pid, Name, CommandLine
FROM pslist()
WHERE Name =~ "lsass"
\`\`\`
`,
      published: 0,
      published_at: now,
      updated_at: now,
    },
    {
      slug: 'thm-jr-penetration-tester-path',
      title: 'Jr Penetration Tester Path',
      type: 'thm' as const,
      excerpt:
        'Complete walkthrough of the TryHackMe Jr Penetration Tester learning path — covering recon, exploitation, post-exploitation, and reporting.',
      tags: JSON.stringify(['pentesting', 'web-exploitation', 'tryhackme']),
      body: `# Jr Penetration Tester Path

## Overview

My notes and walkthroughs for the TryHackMe Jr Penetration Tester path.

## Modules Covered

1. **Introduction to Pentesting** — methodology, scope, rules of engagement
2. **Introduction to Web Hacking** — OWASP Top 10, Burp Suite basics
3. **Burp Suite** — intercepting, repeating, intruder
4. **Network Security** — Nmap, protocols, enumeration
5. **Metasploit** — exploitation framework, meterpreter
6. **Privilege Escalation** — Linux and Windows privesc

## Key Takeaways

Always document everything. Scope creep is a risk. PoC first, report second.
`,
      published: 0,
      published_at: now,
      updated_at: now,
    },
    {
      slug: 'dns-exfiltration-detection',
      title: 'DNS Exfiltration — Detection & Defense',
      type: 'security' as const,
      excerpt:
        'Deep dive into DNS-based data exfiltration techniques, detection strategies with Wazuh/Zeek, and mitigation approaches.',
      tags: JSON.stringify(['dns-exfil', 'network-forensics', 'detection-engineering', 'wazuh']),
      body: `# DNS Exfiltration — Detection & Defense

## What is DNS Exfiltration?

Attackers encode data in DNS queries to bypass network controls:

\`\`\`
<base64-data>.attacker-domain.com  →  DNS query
\`\`\`

## Detection Signals

1. **High query rate** to a single domain
2. **Long subdomain labels** (>50 chars)
3. **High entropy** in query names
4. **Rare TLDs** not seen in baseline

## Wazuh Detection Rule

\`\`\`xml
<rule id="100010" level="12">
  <if_group>syslog</if_group>
  <match>dns query</match>
  <regex>\\b[A-Za-z0-9+/=]{50,}\\.</regex>
  <description>Possible DNS exfiltration — high entropy subdomain</description>
</rule>
\`\`\`
`,
      published: 0,
      published_at: now,
      updated_at: now,
    },
  ];

  for (const post of postData) {
    await db.insert(posts).values(post).onConflictDoNothing();
  }

  console.log('Done. 4 draft posts inserted.');
  console.log('Run: npx drizzle-kit studio  to browse them.');
}

seed().catch(console.error);

// suppress unused import warning — postTags is part of the schema export
void postTags;
