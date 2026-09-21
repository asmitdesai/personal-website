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
    { name: 'threat-intel', slug: 'threat-intel' },
    { name: 'ransomware', slug: 'ransomware' },
    { name: 'social-engineering', slug: 'social-engineering' },
  ];

  for (const tag of tagData) {
    await db.insert(tags).values(tag).onConflictDoNothing();
  }

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
      published_at: '2026-06-13T06:05:05.081Z',
      updated_at: '2026-06-13T06:05:05.081Z',
    },
    {
      slug: '2026-dbir-ai-social-engineering-detection-engineering',
      title: "The 2026 DBIR Says AI Isn't Reinventing Attacks Yet — And That's the Whole Point",
      type: 'security' as const,
      excerpt:
        'Notes from reading all 121 pages of the Verizon 2026 Data Breach Investigations Report, a few months into a SOC internship — vulnerability exploitation overtaking credential abuse, AI scaling known ATT&CK techniques rather than inventing new ones, and what that actually changes about the detection rules you write.',
      tags: JSON.stringify([
        'detection-engineering',
        'threat-intel',
        'ransomware',
        'social-engineering',
      ]),
      github_url: null,
      body: `# The 2026 DBIR Says AI Isn't Reinventing Attacks Yet — And That's the Whole Point

*Notes from the Verizon Data Breach Investigations Report, read from a few months into a SOC/detection engineering internship*

I sat down and read through the entire 2026 Verizon DBIR this week instead of just skimming the highlights on LinkedIn, and I wanted to write about it properly while it's still fresh. Most of the takes I've seen floating around are either "AI changes everything" or "AI changes nothing," and the actual report, once you get past the executive summary, is more careful and more interesting than either of those framings.

I should be upfront about where I'm reading this from. I'm not a decade into this field — I'm a final-year student a few months into an internship where I spend my time tuning Wazuh rules, building log pipelines, and putting together SIEM dashboards. So I'm not going to pretend this report reads like a performance review of some large security program I run. It reads more like a checklist against the small, specific things I actually touch day to day: does this alert fire, does it fire on the right thing, and would I actually see it in time.

I also want to be honest about why I bothered reading the full 121 pages instead of the executive summary, since that's usually where most people, myself included on a busier week, would stop. The DBIR's summary section is genuinely well-written and hits the key numbers accurately, but it necessarily strips out the reasoning behind each finding, the caveats the report's own authors attach to their more uncertain estimates, and the individual pattern-level breakdowns that show whether a headline statistic is being driven by one dominant category or spread evenly across several. A stat like "31% of breaches now start with vulnerability exploitation" reads very differently once you've also seen that a meaningful chunk of that access gets resold by initial access brokers who specifically hunt for years-old, still-unpatched CVEs, or that one ransomware group alone was responsible for compromising over a hundred organizations through a single Oracle zero-day in a matter of weeks. The summary gives you the "what." Reading the whole thing gives you a much better sense of the "how" and, more usefully for someone doing this kind of work, where the actual gaps in visibility tend to sit.

I went through the report section by section rather than just the "key findings" summary at the front, because I wanted to see whether the individual patterns (System Intrusion, Social Engineering, Basic Web Application Attacks, Miscellaneous Errors, Privilege Misuse, Denial of Service) told a consistent story once you got into the weeds, or whether the headline stats were doing more narrative work than the underlying data supported. Mostly, they held up, and where the report itself was uncertain about something — like the exact scale of the North Korean IT worker problem, or why ransomware payments keep declining — it said so directly rather than presenting a rough estimate as a hard number. That kind of stated uncertainty is worth noting on its own, since it's not always common in industry reporting, and it made me trust the numbers that were stated with confidence a little more by comparison. This is the longer version of what I posted on LinkedIn — that post covered maybe a third of what's actually in here.

## Vulnerability exploitation is now the #1 way in — and remediation is losing ground

The DBIR's headline stat: exploitation of vulnerabilities has overtaken credential abuse as the most common initial access vector, at 31% of breaches this year versus 13% for credential abuse. That's a real shift in the data, not just a framing choice. Last year credential abuse was still comparable to exploitation, and now there's real daylight between them.

What stood out more to me is what's happening underneath that number. Of the vulnerabilities sitting in CISA's Known Exploited Vulnerabilities (KEV) catalog — meaning these are actively being exploited in the wild, not hypothetical — only 26% were fully remediated by organizations in 2025. That's down from 38% the year before. Median time to fully patch one stretched from 32 days to 43. And the typical organization had roughly 50% more critical vulnerabilities to work through this year than last. So it's not just that patching is slower; there's also simply more of it to do, which compounds the problem rather than sitting alongside it independently.

There's a second data point buried later in the report that I think belongs right next to this one: credential leakage events. The DBIR tracked how long a credential leak sits around before it eventually feeds into a ransomware attack, and found that small organizations experience a median of seven credential leak events over a year, while larger organizations see around twenty. Not every leaked credential turns into a breach, but it's an easy entry point that can sit unused or get resold to someone else entirely — including Initial Access Brokers (IABs), who specialize in selling already-compromised access to other criminal groups, effectively acting as a wholesale layer that sits between the initial compromise and the eventual ransomware deployment.

Roughly 44% of the access types IABs were observed selling were VPN credentials, with remote desktop protocols (RDP, RDPweb, VNC) close behind. And notably, some of that access traced back to vulnerabilities like ProxyShell and ProxyLogon that had already been publicly disclosed for two to three years — which says something uncomfortable about how long unpatched, known issues stay useful to attackers after the initial news cycle around them has faded. A CVE doesn't stop being valuable to an attacker just because it's old news to the security community; it stops being valuable once the specific organization holding the vulnerable system finally patches it, and apparently that can take years in the long tail.

I don't think the core problem here is a tooling gap — pretty much everyone has a scanner running somewhere. It looks more like a prioritization problem, and from where I sit, that's actually a detection engineering problem too, not just a patch management one. Vulnerability data and SIEM alerting tend to live in separate systems that barely talk to each other. Your vulnerability management team knows which assets are exposed; your SOC knows which assets are generating alerts; and unless someone has deliberately built a bridge between those two data sets, neither side has the full picture. If your detection stack doesn't know which of your internet-facing assets map to something in the KEV catalog, you can't weight alerts against real exploitability, and you end up treating a scan hit on a low-value dev box the same as one on something actually exposed and actively targeted.

In practice, closing that gap doesn't have to be exotic. It could be as simple as ingesting a KEV feed into the same pipeline your SIEM already pulls asset and vulnerability data from, and tagging alerts against internet-facing, KEV-listed assets differently in triage — nothing that requires new tooling, just correlating two data sources that usually sit in separate tabs, maintained by separate teams, and looked at on separate schedules. The DBIR's data suggests that gap is exactly where a meaningful chunk of this year's breaches happened: not because the vulnerability was unknown, but because the organization didn't act on the knowledge fast enough, and nothing in their monitoring stack was surfacing that specific gap as urgent.

## System Intrusion is still the single biggest pattern, and ransomware is why

It's easy to get pulled toward the newer, more novel-sounding findings in a report like this — AI, ClickFix, shadow AI — and skip past the pattern that's been quietly dominating the data for years running. System Intrusion has been the DBIR's top breach pattern since 2022, and this year it accounts for 60% of all breaches in the dataset. That's not a plurality among several close contenders; it's a clear majority.

The pattern is defined by determined external actors combining malware (and other software) with hacking techniques to compromise well-guarded data, rather than a single opportunistic action. Within System Intrusion breaches, Ransomware shows up in 77% of cases, and it's fair to say Ransomware has been the primary engine driving this pattern's growth over the last several years. Actors are financially motivated in 88% of these breaches, with the remaining 12% tied to espionage. The initial access vectors within this pattern show close to an even split between the Use of stolen credentials and Exploit vulnerabilities, both sitting around 39%, with VPN access staying fairly steady at around 16%.

What I found genuinely useful, from a "what would I actually build" standpoint, is the action-variety breakdown within this pattern. Beyond the credential and exploitation vectors, the report highlights a meaningful shift toward attackers targeting Web applications and Desktop sharing software more than in previous years, alongside more general lateral movement techniques like network scanning and the use of password dumping tools to extract credentials from already-compromised systems. None of these are novel techniques in the ATT&CK sense — they're bread-and-butter post-compromise activity. But the report's framing of them as a "cross-section of what defenders are up against" is a good reminder that a lot of detection value doesn't come from catching the initial exploit, it comes from catching the second and third step: the scan, the credential dump, the lateral movement into a system that shouldn't be talking to the one that was just compromised. If your rule set is entirely front-loaded toward initial access and thin on lateral movement and credential-dumping behavior, System Intrusion breaches are exactly the category where that gap shows up.

## Basic Web Application Attacks: unglamorous, still effective, slowly declining

If System Intrusion is the "movie-style heist" end of the DBIR's pattern spectrum, Basic Web Application Attacks sit at the opposite end — closer to "they left the door open" than to a coordinated multi-stage campaign. The pattern is driven overwhelmingly by stolen credentials and unpatched vulnerabilities, and while it's low in sophistication almost by definition, the report is clear that it's still highly effective, frequently leading to credential theft, internal data exposure, and further compromise once an attacker is in.

Use of stolen credentials remains the dominant action in this pattern, continuing what the report describes as its own historic run — the same story, year after year. How attackers actually obtain those credentials is often unclear from the data itself; they could come from phishing, from infostealer malware, or from credentials exposed in an entirely unrelated prior breach and later packaged and resold. However they're acquired, they get put to work here. There was also a rise in the Exploit vulnerability action within this pattern this year, tied to several large-scale vulnerability events, reinforcing the same theme running through the vulnerability exploitation section above: unpatched, known issues remain a reliable way in, whether the resulting breach counts as a "complex" System Intrusion or a "simple" Basic Web Application Attack.

One genuinely encouraging data point buried in this section: Basic Web Application Attacks have been trending downward over time in favor of the more complex System Intrusion pattern. The report offers two possible readings of that shift, and doesn't fully commit to either — it could mean defenders are successfully raising the bar on the easy stuff, forcing attackers to work harder for the same outcome, or it could mean attackers are simply getting better at leveraging whatever initial access they get, however they got it, into something more elaborate than a smash-and-grab. Realistically it's probably some mix of both, but either reading points toward the same practical takeaway: credential hygiene (rotation, monitoring for exposed credentials, cutting down on standing access) still closes off a real category of attacks, even if it isn't sufficient against the more determined, multi-stage ones categorized separately as System Intrusion.

## Ransomware and third-party exposure keep compounding each other

Ransomware showed up in 48% of all breaches this year, up from 44% the year before — the trend line keeps climbing even as the economics around it shift underneath it. Interestingly, 69% of ransomware victims in the dataset didn't pay, and the median ransom actually paid continued a downward trend, landing at $139,875 compared to $150,000 the year before.

That's a genuinely interesting tension: ransomware attacks are more frequent, but they seem to be getting somewhat less profitable per incident, at least among reported cases. The report actually goes further than I expected here and offers its own explanation, rather than leaving it purely to reader interpretation: it describes a ransomware market in decline, albeit a slow one, marked by rampant commoditization and a growing number of actors scrambling to scale their operations to cover shrinking margins. Encouragingly, the report attributes at least part of that margin compression not just to competition among threat actor groups themselves, but to genuinely improved defensive posture and resilience on the victim side — meaning the drop in payments may actually be a measurable signal that defensive investment is working, rather than purely a market or criminal-economics phenomenon happening independently of anything defenders are doing. When the DBIR team cross-referenced actor-disclosed ransomware attacks against known crypto-wallet payment data to estimate how many alleged victims actually pay, the median came out to roughly 9% of publicized victims per ransomware group — a lot of criminal effort, by the report's own framing, for a fairly small conversion rate.

That framing comes with a caveat worth keeping in mind: the report notes a growing disconnect between what's publicly reported as a ransomware attack and what actually occurred, partly because threat actor groups have taken to reusing old breaches, reposting breaches claimed by other criminal groups, or fabricating victims outright to inflate their own notoriety within the criminal ecosystem. Attribution and victim-counting in ransomware reporting is messier than the clean percentages suggest, which is worth remembering before treating any single ransomware statistic as more precise than it actually is. What the report does state plainly, separate from that caveat, is that trying to pin down a single consistent pattern across ransomware groups is genuinely difficult in its own right, since individual threat actor groups rebrand and rotate toolsets frequently enough that attribution becomes a moving target on its own.

One concrete example the report walks through helps ground all of this in something more specific than aggregate statistics: in late summer 2025, a well-known ransomware gang — the same group behind the 2023 MOVEit exploitation — shifted its focus to a zero-day vulnerability in Oracle's E-Business Suite, ultimately compromising more than 100 organizations and subjecting them to extortion, with a heavy concentration of victims in the Education sector specifically. It's a useful reminder that "vulnerability exploitation as the top initial access vector" isn't an abstract statistical trend happening somewhere else; it's the same handful of capable, well-resourced ransomware groups repeatedly finding and weaponizing high-impact zero-days against widely deployed enterprise software, then working through as many victims as they can before the vulnerability gets patched broadly enough to close the window.

Third-party involvement is the other half of this story, and it's growing just as fast, if not faster. Breaches involving a third party jumped 60% year over year, reaching 48% of all breaches — meaning close to half of all breaches now touch a vendor, partner, or supplier's infrastructure somewhere in the chain. The report includes a survival analysis specifically on third-party cloud MFA exposure, and the remediation numbers there are rough: only 23% of third-party organizations fully remediated missing or improperly secured multifactor authentication on their cloud accounts, though 50% of findings did get resolved within a month, which is at least a reasonable baseline. Weak passwords and permission misconfigurations fared far worse — the median time to resolve half of those findings stretched to almost eight months.

That combination — ransomware still climbing, third-party exposure climbing even faster, and MFA or permission fixes taking months when they get fixed at all — is the part of the report I keep coming back to. It's not really an "attackers got smarter" story. It's a story about basic access hygiene issues sitting unresolved for long enough that ransomware operators, or the initial access brokers who sell to them, eventually find them. From a detection standpoint, that also means a meaningful chunk of your actual risk surface lives somewhere your own SIEM has zero visibility into, because the exposure sits on a vendor's cloud tenant, not your network, and unless that vendor is sharing logs or alerting data with you, that gap simply doesn't show up as a data source you can write a rule against. You can tune your own environment perfectly and still inherit risk you can't see coming from a supplier's misconfigured cloud account.

## AI is scaling known attacks, not inventing new ones — but that's not the same as "we're fine"

Before getting into the AI numbers specifically, it's worth grounding them in who's actually doing the attacking in the first place, because the report's broader actor breakdown sets useful context. External actors remain responsible for the overwhelming majority of breaches, which is unsurprising once you consider there will always be more people outside an organization than inside it. Financial gain remains the dominant motive among cybercriminals by a wide margin, with espionage as a distant but real second, often tied to state-affiliated groups working to fund or advance broader national programs. Internal actors account for roughly 12% of breaches overall, split between honest mistakes and deliberate misuse, and when it's deliberate, End-users make up about 75% of internal actors involved, with System Administrators at 19% — a smaller share, but one that carries outsized risk given the level of access those accounts typically hold.

That context matters for the AI section specifically because of one story the report references directly: what it describes as the first documented case of a largely AI-executed, state-sponsored espionage campaign, publicly disclosed by Anthropic in a separate report. That's a meaningfully different claim than "attackers are experimenting with AI tools," and it's part of why the DBIR team decided this was the year to dig into the question properly rather than continue treating AI-assisted attacks as an interesting but unmeasured curiosity, which had been their stance in previous editions of the report.

This was the section I was most curious about going in, mostly because I expected either hype or dismissal and got neither. Verizon partnered with Anthropic on this part of the report, using enforcement data from Anthropic's Safeguards team to look at how threat actors are actually using LLMs, based on real detected misuse rather than speculation about theoretical capability. The underlying dataset covered 793 unique threat actors observed between March 2025 and February 2026, every one of whom had already received enforcement action from Anthropic's Safeguards team for violating acceptable use policy, with enough behavioral data attached to actually analyze what they'd been doing. Their activity spanned malware development, capability building, and tasking, and Anthropic mapped that behavior against the MITRE ATT&CK framework, which is what let the DBIR team correlate AI misuse directly against the same framework defenders already use to structure detection content — rather than treating "AI-assisted attacks" as a separate, incomparable category floating outside the frameworks most SOCs already operate against.

A few numbers stood out. The median threat actor in that dataset sought AI assistance across roughly 15 distinct MITRE ATT&CK techniques, with some pushing into 40 to 50 techniques across a single campaign. When the DBIR team then measured how "rare" those AI-assisted techniques were — using the number of known existing malware examples per technique as a rough proxy for rarity — the median technique already had about 55 known tools implementing it. Under 2.5% of the AI-assisted activity touched anything that counted as genuinely rare or undocumented, meaning it had one or fewer known malware examples associated with it.

The report's read on this, which I largely agree with, is that AI's impact right now looks mostly operational: it's helping attackers automate and scale techniques that already show up in existing detection frameworks, not opening up attack surfaces defenders can't see or haven't already mapped. That's a genuinely useful data point if you write detection logic for a living — it means ATT&CK-mapped rules aren't suddenly obsolete, and the technique-level detection work most SOCs have already invested in still has a job to do.

But I don't think that finding means "we're safe," and I don't want to overstate it in either direction. AI doesn't need to invent a new technique to make a defender's week meaningfully worse. If an attacker can iterate through variations of a known technique faster, or run more attempts at scale, or lower the skill bar enough that people who previously couldn't have pulled off a given technique now can, that's still more workload and more noise for a detection team to sort through — even if every individual technique is one your rules already cover on paper. What's changing isn't the "what," it's the speed. And "we'll write a rule for that next sprint" gets a lot less comfortable when the thing you're writing a rule for might already be a variant by the time it ships, because the attacker iterated past the version you were detecting for while your change request was still sitting in a backlog.

There's a smaller, almost throwaway line elsewhere in the report, in the section on Denial of Service, noting that generative and agentic AI can potentially bring both automation and disruption to markets and supply chains, and that as far as bandwidth considerations and intellectual property protection go, that disruption may already be underway. It's not a heavily quantified claim, more of an observation, but it fits the same overall shape as the ATT&CK findings: AI showing up as an amplifier on existing categories of risk rather than as a wholly separate threat category of its own.

## Social engineering has moved off email, and that's a detection problem too

The human element showed up in 62% of all breaches this year, a slight increase from 60% the year before — so despite everything getting more automated on the attacker side, the person clicking, answering the phone, or approving the request is still very much in the loop, and arguably still the most reliable entry point attackers have. Social Engineering was the third most common breach pattern overall, at 16% of all breaches. Within that, phishing held steady at 16% of breaches (measured as a vector rather than a pattern), while pretexting — the slower con where the attacker builds a plausible relationship or scenario before asking for anything — climbed to 6% of all breaches and has become a notably more common initial access vector specifically into ransomware and extortion attacks.

Email phishing simulations in the report still show a median click rate of about 1.4%. Phone-centric social engineering — vishing, SMS, other mobile-first vectors — is converting around 40% higher than that, based on the (admittedly smaller) sample of simulated non-email campaigns the report includes. A lot of this plays out over an actual phone call or through a fake help-desk request over something like Microsoft Teams or a remote-support tool such as Quick Assist, rather than a suspicious link sitting in an inbox waiting to be reported by an alert user.

The example that stuck with me most, from a "how would I even catch this" angle, is ClickFix: a malicious page presents itself as a CAPTCHA, but instead of a checkbox, it walks the user through copying a command and pasting it into their own terminal. What makes this hard is that the user is doing the final execution step themselves, often using a legitimate interpreter or built-in system tool, and there may be no traditional malware delivered until very late in the chain. A lot of signature-based detection is built around the assumption that "this file or this process is bad." ClickFix doesn't really give you that clean of a signal — the useful indicator is more likely to be behavioral: an unusual sequence of copy-paste-into-terminal activity followed by an outbound connection, correlated across a few weaker data points rather than one clean indicator of compromise. That's a harder thing to build and a harder thing to tune without generating a lot of false positives, which is exactly the kind of tradeoff I've been learning to navigate while tuning rules myself. A detection that's technically correct on paper is still useless in practice if it doesn't have enough surrounding context to be actionable by whoever's triaging the alert at 3 a.m.

## Privilege Misuse and the insider threat problem, in proportion

I went into the Privilege Misuse section expecting insider threat to be a bigger slice of the pie than it turned out to be, and the actual numbers are worth stating plainly because they push back a little against how insider risk sometimes gets discussed. Misuse breaches have actually declined over the past two years after peaking at nearly 8% of breaches in the 2024 report; this year they account for just under 4% of breaches, less than half that peak. For comparison, Miscellaneous Errors — simple mistakes, not malice — represents nearly 9% of breaches this year, more than double the Misuse figure. Organizations generally face far more risk from external actors than from their own employees acting maliciously, and the report is fairly direct about that: your own people are typically much more likely to lose an asset or make an honest mistake than to intentionally abuse their access.

That said, when Misuse breaches do happen, the report notes their impact is rarely trivial, and the "who" behind them is worth knowing. In most cases (54%), it's an average end-user, but Developers and System Administrators show up too — which is concerning given how much privileged access those account types typically carry. One newer trend the report flags is an increase in breaches motivated by convenience rather than outright malice: an employee emailing company data to a personal account so they can keep working from home, technically violating data-handling policy without meaning any harm by it.

There's also a genuinely unusual sidebar in this section about coercion of high-risk employees, sourced from a DLP and behavioral-analytics contributor's dataset of nearly 270,000 enterprise work computers. Roughly 1 in 500 employees accessed high-risk, workplace-inappropriate material on an enterprise device, and the report notes that the existence of this kind of compromising material has historically been associated with a higher susceptibility to external coercion — the kind of insider risk consideration that's long been standard in military and intelligence contexts, and one the report suggests is worth factoring into insider risk programs more broadly given the documented rise in state-sponsored targeting of the private sector. It's a small section, but it's a good reminder that "insider threat" isn't only about malicious intent from day one; it's sometimes about legitimate access becoming externally leverageable after the fact.

## Denial of Service is quieter than ransomware headlines, but not shrinking

DDoS doesn't get the same attention as ransomware or AI-assisted attacks in most coverage of this report, but the underlying numbers are worth a look if only because the shape of the threat is changing even where the headline volume isn't. The median breached entity dealt with 17 distinct DDoS attacks over the course of the year. Finance, Professional Services, and Manufacturing remain the most consistently targeted industries, a pattern that's held since 2022, even as sectors like Government and Public Sector, which saw a spike likely tied to hacktivism in the 2025 report, settled back down toward their historical baseline this year.

The median attack size has fluctuated between 4.2 and 6 Gbps over the last few years, with half of all attacks lasting under nine minutes — modest by most measures. But at the extreme end of the distribution, the picture looks different: the largest attacks observed this year grew 198% in bits per second and 156% in packets per second compared to last year's maximums. The report is careful to note these are outliers rather than the norm, but the growth in ceiling capability suggests attackers are continuing to build capacity even if the typical attack profile looks similar to previous years.

One thing I hadn't seen broken out this clearly before is the report's analysis of DDoS attack rhythm. Victim organizations were split into three categories based on the timing between attacks: 2% experienced periodic, relatively predictable attacks; 40% experienced attacks in bursts; and 57% experienced attacks at seemingly random intervals. Organizations in the "bursty" category faced a median of about one day between attacks and roughly 17 distinct attacks over the year, while the "random" category saw closer to 14 days between events and about six attacks total. Bursty-pattern victims were also more likely to face a wider variety of attack types — at least 10 distinct types for half of them, compared to seven for the other groups. None of this changes the fundamental DDoS mitigation playbook, but it's a useful reminder that "we get DDoS'd sometimes" isn't a single risk profile — a bursty, high-frequency target and a rarely-hit, random target have genuinely different operational postures to plan around.

## Miscellaneous Errors: still boring, still one of the top three patterns

It would be easy to skip past the Miscellaneous Errors pattern entirely, since "someone made a mistake" is a far less compelling story than ransomware or AI-assisted attacks. But the numbers say it belongs in the conversation: errors represent nearly 9% of breaches this year, slightly more often than last year, and it remains one of the top three patterns in the dataset alongside System Intrusion and Social Engineering. Every breach in this pattern involves an internal actor by definition, and personal data is compromised in 98% of these cases, which is a meaningfully higher rate than most other patterns.

Misdelivery, Misconfiguration, and Loss were the three most common error types this year, with Publishing errors close behind, having moved up from fourth place last year. Misdelivery happens when data is sent to the wrong recipient, which sounds almost too simple to cause real damage until you consider how often it happens in both physical form (large mailings) and electronic form (the wrong attachment, the wrong distribution list), and how rarely organizations have a technical control in place to intercept that kind of mistake before it becomes a disclosed breach rather than a near-miss.

Misconfiguration is the one I find more interesting from a detection standpoint, because unlike Misdelivery, it's not purely a human-judgment problem — it's a data store deployed to the internet without the access controls that should have been applied to it, and the report notes these are most commonly discovered by outside security researchers, who then try to notify whoever owns the exposed data if they can figure out who that is. The uncomfortable follow-on question the report raises, and doesn't have a clean answer for, is how often the same exposed data gets found by someone with far less civic intent before a researcher stumbles onto it and reports it responsibly. Misconfiguration staying near the top of this pattern year over year, despite how well-understood the risk is, suggests this is less a knowledge problem than a process one — the kind of thing that continuous, automated scanning of externally-exposed assets is specifically meant to catch before it becomes public knowledge instead of after.

Publishing errors round out the top few, occurring when private data is mistakenly placed on a public-facing server and typically discovered only once a search engine indexes it and someone finds their own information while searching their own name — which is about as unpleasant a way to discover a data exposure as there is, both for the person affected and for whoever has to explain how it happened.

## A quick look at how this varies by region

The report breaks results down by four macro-regions — APAC, EMEA, LAC (Latin America and Caribbean), and NA (Northern America) — and while the overall shape of the story (System Intrusion on top, financial motive dominant, external actors doing most of the damage) holds across all four, the specific mix shifts in ways that are worth knowing if your organization operates across more than one of them.

APAC stands out the most. System Intrusion accounts for 60% of breaches there, still roughly three times the share of the next closest pattern, even after dropping from an unusually high 89% the year before. Hacking is involved in 83% of APAC breaches and Malware in 71%, both noticeably higher than the overall dataset's 64% and 63% — a combination the report attributes partly to contributor mix and partly to a genuinely higher volume of espionage-related activity in the region, since state-affiliated actors are responsible for 36% of APAC breaches, more than in any other region measured. Secrets show up as the compromised data type in 28% of APAC breaches, more than double the 13% seen in the overall dataset, which lines up with that espionage signal. The report also references the July 2025 breach affecting Qantas, where a group known as Scattered Lapsus$ Hunters stole the personal data of more than five million customers through a third-party platform and issued extortion demands, later releasing the data when the ransom wasn't paid — one of Australia's largest breaches since 2022, and a fairly direct illustration of the third-party exposure problem showing up at scale in a single, high-profile incident rather than as an abstract statistic.

EMEA leans more heavily toward Social Engineering and Miscellaneous Errors alongside System Intrusion, with those three patterns together covering 92% of breaches in the region. Misdelivery leads the error category there at 50%, and Loss shows up notably higher than the overall dataset at 19% versus a smaller share elsewhere. LAC and NA both track fairly close to the global averages, with System Intrusion, Social Engineering, and Basic Web Application Attacks as the leading patterns in both regions, and financially motivated external actors responsible for the overwhelming majority of breaches in each.

None of this changes the core argument of the report, but it's a useful sanity check if you're building detection content for an organization with a presence in more than one of these regions: the baseline threat model genuinely does shift by geography, not just in volume but in which pattern is doing the heavy lifting, and a rule set tuned entirely against North American or European breach patterns may be underweighting espionage-driven System Intrusion activity if it's meant to cover an APAC environment as well.

## Shadow AI and DLP: a visibility problem more than a malice problem

The report finds 67% of users are accessing AI platforms through non-corporate accounts on corporate devices, and that unauthorized AI usage is now the third most common non-malicious insider action showing up in DLP telemetry — a fourfold increase from the year before. Source code was the most common data type found heading toward those unauthorized tools, by a large margin, followed by images and other structured data, with a smaller but real slice (3.2% of related DLP events) involving research and technical documentation.

I don't think the takeaway here is "AI usage is inherently malicious" — most of that traffic is almost certainly people trying to get their work done faster, not trying to leak anything. The actual problem is that most organizations don't have clear visibility into which AI tools are sanctioned, what's leaving through them, or how to tell productivity from risk in that traffic. That's a governance and DLP-tuning problem before it's a detection problem in the traditional sense, but it's one that eventually lands back on whoever's watching the logs, because "unusual outbound traffic to an unapproved SaaS endpoint" is exactly the kind of signal a SIEM is well positioned to catch, if someone's bothered to define what "unapproved" actually means in that environment and keep the list current.

## The North Korean IT worker problem

This section of the report was the one I found most unexpectedly interesting, mostly because it's a threat vector that doesn't fit neatly into "external attacker breaches a network" or "insider misuses legitimate access" — it's both, depending on how you look at it. Throughout 2025, the report documents a systematic pattern of IT workers (ITWs) from the Democratic People's Republic of Korea using stolen identities to land legitimate remote jobs across a wide range of industries, operating out of regionally hosted "laptop farms" run by local accomplices, which let them pass interviews and perform the actual work without ever needing a physical presence in the country they claimed to be based in.

Some of these workers reportedly went well beyond simply collecting a paycheck quietly; organizations were surprised to discover that some of their top-performing new hires had misrepresented their identities entirely. Given U.S. government advisories and law enforcement filings connecting these operations to the North Korean government, that's a serious compliance and insider-risk concern even before you get to the question of whether ITWs facilitate further access for state-sponsored groups — a possibility the report raises but says it couldn't substantiate with sufficient data this year.

Historically, ITWs targeted remote programming and data engineering roles, since those positions are the most straightforward to pass a technical interview for. More recently, as hiring markets have shifted and awareness of this specific threat has grown, the report notes ITWs pivoting toward human resources and marketing roles instead, and other researchers cited in the report have observed a further pivot toward AI-focused job postings, tracking wherever the highest-paying remote roles currently are. Frontend development, blockchain and Web3 roles, and full-stack engineering topped the list of specific job specifications targeted in 2025.

On scale: precise numbers are hard to pin down since companies aren't required to disclose that they accidentally hired a North Korean IT worker, but the report's own back-of-the-napkin analysis, based on an estimated 15,000 possible stolen identities in circulation and a typical ITW operating three to five identities at a time, suggests the actual number of active fraudulent workers could be in the low thousands — with the report itself flagging that this estimate carries considerable uncertainty. The recommended mitigations are mostly about closing gaps in hiring process rather than technical detection: additional scrutiny of resumes and backgrounds, verifying identity through multiple touchpoints during hiring rather than a single check, and making sure insider threat and security awareness training actually covers this specific pattern rather than assuming insider risk only means a disgruntled existing employee.

## Where I landed

The DBIR's own framing this year is "refinement, not revolution," and having gone through the whole thing rather than just the summary, I think that's basically right — but I'd put it slightly differently from where I sit. AI isn't replacing the fundamentals of security. It's making a weak implementation of those fundamentals harder to get away with. Attackers moving through mostly-known techniques faster than before, ransomware and third-party exposure compounding each other while MFA gaps sit unresolved for months, ClickFix-style attacks that make the user part of the execution chain rather than the target of a payload, and even something as unusual as fraudulent remote hires from a nation-state actor — none of these are stories about attackers discovering something defenders have never seen before. They're stories about known categories of risk getting more efficient, more scaled, or more overlooked, at a moment when the fundamentals matter more, not less.

Patch prioritization tied to real exploitation data. Awareness training that covers more than just email. Actual visibility into third parties, unsanctioned tools, and lateral movement inside your own environment, not just the initial point of entry. None of that is optional anymore, if it ever was. It's the thing that decides whether you have time to react before the gap between "known technique" and "exploited technique" closes further than it already has.

If I had to boil the whole report down to a short list of things worth actually building rather than just reading about, it would look something like this: correlate vulnerability and asset data directly into SIEM alert priority, so a KEV-listed exposure on an internet-facing asset doesn't sit in the same triage queue as a low-severity finding on an internal dev box. Extend detection logic past the initial access vector and into the post-compromise behaviors — lateral movement, credential dumping, unusual RDP or web application activity — since that's where System Intrusion breaches, the single largest pattern in the entire dataset, actually spend most of their time. Build behavioral correlation rules for social engineering patterns like ClickFix that don't rely on a single clean indicator of compromise, because a lot of the newer attack chains are specifically designed to avoid producing one. And treat third-party and shadow AI visibility as a real gap to close rather than an accepted blind spot, since roughly half of this year's breaches touched a vendor somewhere in the chain, and most organizations still can't say with confidence what's actually leaving through their employees' AI tool of choice on any given day.

None of that is a complete security program, and I wouldn't pretend it is from where I sit. But it's a fairly direct translation of what this report is actually saying into the kind of work I recognize: the queries, correlations, and rule logic that either exist in a SIEM or don't. I keep coming back to the same question whenever I'm looking at a Wazuh rule I've written or tuned: does this actually hold up against what attackers are doing right now, or is it technically correct against a threat model that's already a year out of date? The 2026 DBIR is, if nothing else, a fairly comprehensive answer to what that current threat model actually looks like — attackers moving faster through mostly-known techniques, exploiting the gap between "documented" and "remediated," and increasingly finding the people, processes, and third parties around a system easier to work with than the system itself. Reading the whole thing end to end was worth the time it took, and I'd genuinely recommend the same to anyone doing this kind of work, rather than relying on someone else's summary of the highlights, mine included.

*Source: Verizon 2026 Data Breach Investigations Report*`,
      published: 1,
      published_at: '2026-08-21T00:00:00.000Z',
      updated_at: '2026-08-21T00:00:00.000Z',
    },
    {
      slug: 'alert-fatigue-rule-writing-not-headcount',
      title: 'Alert Fatigue Is a Rule-Writing Problem, Not a Headcount Problem',
      type: 'security' as const,
      excerpt:
        'Most "too many alerts" complaints are actually "we wrote rules against events instead of behavior" complaints. Tuning one Sigma rule across three passes, from a string match anyone could evade to a correlation that actually costs an attacker something.',
      tags: JSON.stringify(['detection-engineering', 'incident-response', 'security-tools']),
      github_url: null,
      body: `# Alert Fatigue Is a Rule-Writing Problem, Not a Headcount Problem

I keep running into the same complaint whenever detection engineering comes up in conversation, whether it's a CTF debrief, a security subreddit thread, or someone venting about their SOC job: too many alerts, not enough people to look at them. The fixes people reach for are almost always organizational — hire more analysts, buy a SOAR platform, bolt on an AI layer to pre-triage the queue. Those can all help at the margins. But I don't think any of them touch the actual defect, which sits further upstream: a lot of alert fatigue is caused by rules that were written against *events* instead of *behavior*, and nobody went back to fix them once the false-positive rate became obvious.

I want to walk through what that distinction actually looks like in a real rule, because it's easy to state as a principle and much less obvious how to apply it until you've tuned something across a few passes and watched where it breaks.

## The version that's too broad to survive a week

Say you want to catch encoded PowerShell execution — a well-known technique for hiding a payload from casual log review, since the actual command only reveals itself after you base64-decode it. The first draft of a rule for this, and honestly the version I would have written a year ago before I'd thought hard about any of this, looks something like:

\`\`\`yaml
title: Encoded PowerShell Execution
status: experimental
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\powershell.exe'
    CommandLine|contains: '-enc'
  condition: selection
level: medium
\`\`\`

This will absolutely fire. It'll also fire constantly, because \`-enc\` shows up all over completely mundane automation — Group Policy startup scripts, RMM tooling, backup jobs, whatever homegrown PowerShell one-liner IT wrote three years ago and never documented. A rule this wide doesn't get you meaningfully closer to catching an attacker. It gets you an analyst who, after the third night of clearing sixty false positives on the same alert title, quietly stops actually reading it before closing it. At that point the rule is technically "in coverage" and functionally useless, which might be worse than not having it, because it's occupying a slot that looks solved on a dashboard somewhere.

## Narrowing the string, still fragile

The obvious next move is to tighten the match — require a few flags together, filter out the parent processes you know are noisy:

\`\`\`yaml
detection:
  selection:
    Image|endswith: '\\powershell.exe'
    CommandLine|contains|all:
      - '-enc'
      - '-w'
      - 'hidden'
  filter:
    ParentImage|endswith:
      - '\\services.exe'
      - '\\explorer.exe'
  condition: selection and not filter
level: medium
\`\`\`

Volume drops. But this version has a specific, kind of embarrassing weakness once you sit with it: it's matching a string shape, not a behavior. Anyone who's read a handful of the same detection write-ups I have knows encoded-PowerShell-plus-hidden-window is a documented pattern, and defeating this exact rule takes nothing more than knowing what string the defender is grepping for — split the flags across an environment variable, use \`-EncodedCommand\` instead of \`-enc\`, launch through a renamed copy of the binary. None of that is real tradecraft. It's just typing the same thing slightly differently. A rule that a moderately alert adversary can invalidate by renaming a flag was never really detecting the technique in the first place — it was detecting one specific spelling of it.

The thing both of these versions have in common is that they treat "PowerShell launched with an encoding flag" as the interesting moment, full stop. But that moment, taken alone, is genuinely ambiguous. Plenty of legitimate scripts do exactly this. The part that actually separates an attacker from a scheduled task isn't the launch — it's what happens in the seconds right after.

## What changes when you correlate instead of match

The third pass doesn't try to out-narrow the string any further. It changes the question the rule is asking, from "did PowerShell launch with encoding flags" to "did PowerShell launch with encoding flags and then do something a legitimate encoded script almost never does immediately afterward":

\`\`\`yaml
title: Encoded PowerShell Followed by Network Connection or LSASS Access
status: stable
logsource:
  category: process_creation
  product: windows
detection:
  launch:
    Image|endswith: '\\powershell.exe'
    CommandLine|re: '-[eE](nc(oded?)?(C(ommand)?)?)?\\s'
  followed_by:
    - EventID: 3    # network connection, correlated by process GUID within 30s
    - EventID: 10   # process access targeting lsass.exe
  filter_main:
    ParentImage|endswith:
      - '\\services.exe'
      - '\\ManagementAgentHost.exe'
  condition: launch and followed_by and not filter_main
level: high
\`\`\`

The string match on \`-enc\` is actually looser here on purpose, to catch truncated flag forms someone might use to dodge exact matching — but it no longer has to carry the whole rule by itself. The part that matters is the correlation window. Legitimate automation encodes commands for all kinds of unremarkable reasons — dodging quoting hell in a scheduled task, packaging something for a remote session — but it essentially never does that and then, within thirty seconds, opens a handle into LSASS or reaches out over the network. That combination costs an attacker something real to fake. They'd have to either skip credential access entirely or deliberately stall past the correlation window, and both of those are actual constraints on how they operate, not a one-character flag rename.

This is the shape of the fix in general, past just PowerShell: a rule that fires on a single event, no matter how specific the string it's matching, is describing what a tool invocation looks like. A rule that fires on a sequence is describing what someone is actually trying to accomplish. The second kind takes real work to build — you need a baseline period to figure out what "immediately after" and "almost never" mean for a specific environment, and you need a data source, like Sysmon's Event ID 10 with LSASS filtering, that's itself noisy enough to need its own separate tuning. But it's the version that's still standing after contact with someone who reads the same detection write-ups the defenders do.

## Why the easy version keeps winning anyway

If layered correlation is obviously the better approach, it's worth asking honestly why so much production rule content still looks like the first draft. I don't run a SOC, so take this as an outside read rather than a war story, but a few reasons seem to hold up whenever I look at how rule sets actually get built.

Writing the narrow version is genuinely more work per rule. A single-event rule ships in twenty minutes. A correlated one needs someone to sit with the false-positive rate for a week or two before calling it stable, and that sitting-with-it phase is unglamorous and doesn't show up anywhere as a line item — it's the first thing that gets cut when a deadline is close.

Coverage metrics reward breadth over fidelity almost by construction. If what gets measured is "how many ATT&CK techniques have a rule," the incentive is to ship one broad rule per technique and move to the next box, rather than iterate the same rule three times to bring its false-positive rate down. The checkbox looks identical either way, even though only one version of it is actually usable at three in the morning.

And nobody really owns the tuning backlog the way someone owns writing new rules. A new rule has a clear author and a clear "done." Going back to fix a rule that's already shipped and already generating noise is maintenance, and maintenance competes for time against whatever's newest and most visible on someone's plate. Rule sets tend to only grow in one direction — more rules, rarely revisited ones — until the noise forces a reckoning, usually well after analysts have already learned to skim past that alert title out of habit.

## The part that actually costs something

That last bit is the failure mode that makes this a rule-writing problem rather than a staffing one, and it's worth being specific about it instead of leaving it abstract. An analyst who's been burned by a noisy rule doesn't file a formal exception — they just get faster at recognizing the title and closing it without really reading it. That's a completely reasonable response to bad signal. It's also exactly the condition under which a real instance of that technique gets waved through in the same three seconds as everything else with that name. The rule is still "in coverage" on paper. It isn't protecting anything, because the human step in the loop has already learned to route around it.

Adding a second analyst to the rotation doesn't fix that. It just means two people are now pattern-matching past the same noisy alert instead of one, which is redistribution, not reduction. The fix has to happen in the rule itself, before it ever reaches a human — otherwise the noise just finds a new place to sit.

I don't think this makes writing good detections a solved problem, or even mostly a technical one — half of what I described above is really about incentives and who's accountable for going back and fixing something that already shipped. But the technical half is at least something I can practice on my own: the next time I write a rule, ask whether it fires on a moment or on a sequence, and whether the change that would evade it is a real operational constraint or just a rename.`,
      published: 1,
      published_at: '2026-09-21T00:00:00.000Z',
      updated_at: '2026-09-21T00:00:00.000Z',
    },
  ];

  for (const post of postData) {
    await db.insert(posts).values(post).onConflictDoNothing();
  }

  console.log('Done. 3 published posts inserted into Turso.');
  await client.close();
}

seed().catch(console.error);
