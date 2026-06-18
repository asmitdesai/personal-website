/**
 * Seeds production Turso DB with the canonical post content.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-prod.ts
 *
 * Get values with:
 *   turso db show personal-website --url
 *   turso db tokens create personal-website
 */
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { posts, tags, postTags } from '../src/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('Error: TURSO_DATABASE_URL is not set');
  process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client);

async function seed() {
  console.log('Clearing existing data in Turso...');
  await db.delete(postTags);
  await db.delete(posts);
  await db.delete(tags);

  console.log('Seeding Turso...');

  const tagData = [
    { name: 'forensics', slug: 'forensics' },
    { name: 'linux', slug: 'linux' },
    { name: 'python', slug: 'python' },
    { name: 'detection-engineering', slug: 'detection-engineering' },
    { name: 'incident-response', slug: 'incident-response' },
    { name: 'security-tools', slug: 'security-tools' },
  ];

  for (const tag of tagData) {
    await db.insert(tags).values(tag).onConflictDoNothing();
  }

  const now = new Date().toISOString();

  const postData = [
    {
      slug: 'ubuntils',
      title: 'Building ubuntils: A Forensic Triage Tool for Live Ubuntu Systems',
      type: 'project' as const,
      excerpt:
        'A forensic triage tool that covers the most common Linux persistence vectors, correlates log activity into a timeline, and outputs exactly what to investigate — no external agent, no database, no internet connection.',
      tags: JSON.stringify([
        'forensics',
        'linux',
        'python',
        'detection-engineering',
        'incident-response',
        'security-tools',
      ]),
      github_url: 'https://github.com/asmitdesai/ubuntils',
      body: `# Building ubuntils: A Forensic Triage Tool for Live Ubuntu Systems

When you suspect a Linux system is compromised, the first thirty minutes are a blur of the same ten commands. Check running processes. Look for weird cron jobs. Grep for \`LD_PRELOAD\`. Scan \`authorized_keys\`. Audit sudoers. Each step is manual, context-switching, and error-prone — and that's before you're under any real pressure.

I built ubuntils because I kept noticing the gap. The existing options don't fill it cleanly: \`lynis\` is a hardening auditor that generates noise on a hot system, \`rkhunter\` is signature-based and blind to novel persistence, and forensic suites like Volatility target memory images, not a live shell. The gap is a tool that runs *right now*, covers the most common persistence vectors, correlates log activity into a timeline, and tells you exactly what to look at — no external agent, no database, no internet connection.

---

## The architecture

ubuntils runs in four sequential stages, each cleanly separated:

**Collection** — Eight collectors run concurrently using a thread pool and gather forensic artifacts from \`/proc\`, cron tables, systemd units, SSH keys, sudoers files, and environment definitions. Concurrency here matters: I/O-bound reads across multiple paths would serialize badly without it. The stage takes roughly 2.5 seconds on a typical system.

**Detection** — A rule engine runs all eight detection rules over the collected artifacts and produces a ranked findings list. Rules are pure functions: they take a snapshot of collected data and return findings, with no side effects. This made them trivially testable in isolation.

**Timeline** — A timeline builder reads syslog, journald, and auditd in parallel and correlates events chronologically. It deduplicates across sources and produces a single ordered stream. This adds about 0.3 seconds.

**Output** — Results appear in an interactive four-tab TUI (default) or as structured JSON on stdout (\`--json\`). Both output modes share the same underlying data model — the TUI just renders it.

One principle I held throughout: no network calls, no data leaving the system. A triage tool that phones home during an active incident is a liability.

---

## Detection rules

Nine rules cover the highest-signal persistence vectors:

- **CRON_TMP_PATH / CRON_ROOT_EXEC** — \`/tmp\`, \`/var/tmp\`, and \`/dev/shm\` are world-writable. A cron job pointing there means a payload can be swapped between invocations without touching any persistent path. A user crontab invoking \`sudo\` or a root-owned interpreter means someone has arranged for privileged code execution on a schedule without needing persistent sudo access — and it survives password changes.
- **LD_PRELOAD_INJECT** — \`LD_PRELOAD\` causes the dynamic linker to load a library before all others, allowing arbitrary function interception in any dynamically-linked binary. A value pointing outside \`/lib\`, \`/usr/lib\`, \`/lib64\`, \`/usr/lib64\` is a near-certain userspace rootkit indicator.
- **USER_UID_ZERO** — Only \`root\` should hold UID 0. A second account mapped to UID 0 grants full superuser rights without altering root's credentials and survives a root password reset. Near-zero false-positive rate.
- **PROCESS_MASQUERADE** — Naming a malicious binary after a known system process (\`sshd\`, \`python3\`, \`bash\`) is a basic technique to avoid detection in \`ps\` output. The rule cross-references the process name from \`/proc/<pid>/status\` against the resolved exe path from \`/proc/<pid>/exe\`.
- **SUSPICIOUS_SYSTEMD_TIMER** — Systemd timers are more persistent and less visible to most responders than cron jobs. A timer whose service unit executes from a temp directory or a user-owned path is a strong indicator of attacker-created persistence.
- **SSH_UNAUTHORIZED_KEY** — A newly added SSH key grants persistent remote access independent of passwords. The 7-day mtime window catches recent additions while avoiding noise from initial provisioning on older systems.
- **SUDOERS_NOPASSWD** — Password-free sudo for a human user account (UID ≥ 1000 with a login shell) is a privilege escalation vector that survives the removal of other persistence. Legitimate \`NOPASSWD\` grants are almost always for service accounts with no login shell — that's the discriminating condition.
- **SHELL_RC_MODIFICATION** — Shell init files execute on every user login, making them a reliable persistence vector. This is intentionally flag-only: the tool tells you what changed recently, but deciding whether it's malicious requires reading the content.

---

## The TUI

The default output mode is a full-terminal interactive TUI built with Textual. It has two screens: a live scan progress screen while collectors run (per-collector ✓/✗ with a spinner), and a four-tab results screen (Summary / Findings / Timeline / Stats) that renders automatically when detection completes.

The most interesting engineering here was the in-TUI remediation flow. For findings with automated remediation available, you press \`R\` to get a confirmation modal, \`Y\` to confirm, and the remediator runs in a background thread so the TUI stays responsive. When it completes, the finding row updates to \`[fixed]\` inline, with the backup path and exact rollback command displayed in the detail pane.

Getting threading right inside Textual required using \`call_from_thread\` to post updates back to the main event loop — Textual's widget mutations aren't thread-safe from a worker thread. That took a few hours to debug properly.

---

## Remediation safeguards

Five rules have automated remediation. Every remediator follows the same pattern regardless of how it's triggered (TUI or CLI):

1. Detect if the artifact path is a symlink — refuse if so. This prevents root from writing through an attacker-controlled symlink to an arbitrary path.
2. Create a timestamped backup at \`/var/backups/ubuntils/YYYYMMDD_HHMMSS/\` with mode \`0700\` before touching anything.
3. Validate current state (for sudoers: \`visudo -cf\`).
4. Apply the minimum possible change — cron entries removed line by line, \`LD_PRELOAD\` lines commented out rather than deleted, sudoers entries validated with \`visudo -cf\` before and after.
5. Verify the result.

The sudoers remediator has one additional guard: it refuses to proceed if removing the entry would leave the system with no sudo rules at all. A tool that locks you out of your own system during an incident is worse than the finding it was trying to fix.

---

## What I learned building it

**Concurrency is worth the complexity early.** I initially wrote the collectors serially. Moving them to a thread pool cut collection time by more than half with maybe 30 lines of refactoring. The lesson: profile before assuming I/O-bound code is fast enough.

**Pure functions make detection rules testable almost for free.** Because each rule takes collected data as input and returns findings as output — no filesystem reads, no subprocess calls — the entire detection layer has 100% coverage with straightforward unit tests. The collectors and remediators, which touch the real system, needed more careful mocking, but the rules themselves were easy.

**Safety defaults compound.** The symlink guard, the pre-change backup, the \`visudo -cf\` validation, the "no sudo rules remaining" check — individually, each is a small thing. Together they mean the remediation path is trustworthy enough to run during an actual incident, not just in a demo. I kept asking: what's the worst case if this goes wrong? Each answer led to another safeguard.

**The README is part of the tool.** Writing the "why each rule exists" section forced me to think more carefully about the detection logic than I had before. If I couldn't articulate why a rule fires and what the attacker behavior behind it is, that was a signal the rule wasn't well-scoped.

---

## What's missing

The tool covers the most common persistence vectors well, but there are meaningful gaps.

**Detection is local and static.** Rules fire on artifact state — what's present on the system right now. There's no behavioral analysis: a process that *has* made outbound connections to a suspicious host won't surface unless it also happens to masquerade as a system binary or run from \`/tmp\`. That's a deliberate scope decision (keep it fast, keep it offline), but it means ubuntils is a first-pass triage tool, not a replacement for network-layer visibility.

**The timeline is correlation, not causation.** The timeline builder pulls syslog, journald, and auditd into a single chronological view. It shows you *what happened when*, but it doesn't connect a finding to a timeline event automatically — that join is still manual. For something like \`SSH_UNAUTHORIZED_KEY\`, you can scroll the timeline and find the SSH session yourself, but the tool doesn't surface it for you.

**Three rules are flag-only by design.** \`SUSPICIOUS_SYSTEMD_TIMER\`, \`PROCESS_MASQUERADE\`, and \`SHELL_RC_MODIFICATION\` have no automated remediation. Systemd unit removal and process termination require human judgment about what's legitimate; shell RC content needs to be read before acting. The right call was to flag and explain, not to auto-remove. But it does mean a responder still needs to act manually on these.

**No multi-host support.** Right now ubuntils runs on one system at a time and outputs a self-contained JSON report. If you're triaging a cluster or a set of VMs, you're running it manually on each one and diffing reports by hand. There's no aggregation layer.

**Hash lookups require network.** The v1.5.0 roadmap includes VirusTotal lookups for suspicious process executables. That's useful context, but it breaks the "no network calls" principle for anyone who wants it. The plan is to make it strictly opt-in.

---

## What's next

**v1.5.0** focuses on enrichment and extensibility:

- **VirusTotal hash lookups** — opt-in, off by default. For processes flagged by \`PROCESS_MASQUERADE\`, look up the executable hash against VT and attach the result to the finding. Useful when you want a quick second opinion on whether a binary is known-malicious without leaving the tool.
- **MISP IOC export** — findings that contain network IOCs or file hashes will be exportable in MISP format for feeding into threat intel pipelines.
- **Custom detection rules via YAML** — right now you can suppress findings (allowlist), but you can't add your own. v1.5 will let you define new rules in a YAML schema: match on artifact type, path pattern, and content regex, assign a severity and title. Useful for org-specific indicators that don't belong in the default ruleset.

**v2.0.0** is the bigger architectural jump:

- **Web dashboard for multi-host triage** — a lightweight local server that aggregates JSON reports from multiple hosts and presents a unified findings view. The per-host JSON output format was designed with this in mind: consistent schema, tamper-evident SHA-256, hostname and timestamp in \`scan_metadata\`.
- **Wazuh integration** — forward findings as Wazuh alerts so they show up alongside the rest of your SIEM data without needing a separate workflow.
- **macOS support** — the collection layer is Ubuntu-specific right now (systemd, \`/proc\`, Ubuntu paths). macOS uses launchd instead of systemd, \`/proc\` doesn't exist, and crontab paths differ. It's a meaningful port, not a one-liner, but the detection and remediation layers are already OS-agnostic.

The v2.0 web dashboard is the feature I'm most interested in building. Running triage on a single host and reading a terminal is fine for one system; doing it across ten requires a different interface entirely. The groundwork is already there in the JSON schema — it's mostly a question of building the aggregation and UI layer on top.

---

The project is on GitHub at [asmitdesai/ubuntils](https://github.com/asmitdesai/ubuntils). 240 tests at 90% coverage, MIT licensed, runs on Ubuntu 20.04/22.04/24.04 (amd64 and arm64). Install with \`pipx install -e .\` and run \`sudo ubuntils scan\`.`,
      published: 1,
      published_at: now,
      updated_at: now,
    },
  ];

  for (const post of postData) {
    await db.insert(posts).values(post).onConflictDoNothing();
  }

  console.log('Done. 1 published post inserted into Turso.');
  await client.close();
}

seed().catch(console.error);
