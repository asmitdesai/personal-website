import type { Metadata } from 'next';
import { getThmStats, THM_USERNAME } from '@/lib/thm';
import { personJsonLd } from '@/lib/seo';
import { PageHeader } from '@/components/ui/PageHeader';
import { ReticleCard } from '@/components/ui/ReticleCard';
import { Reveal } from '@/components/ui/Reveal';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BUTTON_ACCENT_OUTLINE, BUTTON_OUTLINE } from '@/components/ui/buttonStyles';

export const metadata: Metadata = {
  title: 'About',
};

// Refresh THM stats hourly.
export const revalidate = 3600;

const SKILLS = [
  {
    category: 'SIEM & Detection',
    items: ['Wazuh', 'MISP', 'Shuffle', 'VirusTotal', 'Sigma Rules'],
  },
  {
    category: 'Forensics & Response',
    items: ['Velociraptor', 'Wireshark', 'Volatility', 'tcpdump'],
  },
  {
    category: 'Offensive / CTF',
    items: ['Burp Suite', 'Nmap', 'Metasploit', 'SQLmap', 'Ghidra'],
  },
  {
    category: 'Dev & Infra',
    items: ['Python', 'TypeScript', 'Docker', 'Git', 'Linux'],
  },
];

export default async function AboutPage() {
  const thm = await getThmStats();

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd() }} />
      <PageHeader eyebrow="about" title="About" subtitle="Security engineering student · SOC & detection engineering" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <Reveal>
          <div className="space-y-4 text-sm leading-relaxed text-fg-2">
            <p>
              I&apos;m Asmit Desai, a security engineering student at PES University,
              Bengaluru pursuing a BTech in Computer Science. My focus is SOC
              engineering, threat detection, and incident response.
            </p>
            <p>
              During my internship at <span className="text-fg">SecPod Technologies</span>,
              I built a detection and enrichment pipeline integrating Wazuh, MISP,
              VirusTotal, Velociraptor, and Shuffle — processing alerts end-to-end from
              collection to enriched IOC correlation.
            </p>
            <p>
              I play CTFs actively and have authored challenges in web exploitation,
              binary reverse engineering, SQL injection, DNS exfiltration, and network
              forensics. As a Technical Member of the PES University Cybersecurity Club,
              I&apos;ve co-organised two CTF competitions.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://github.com/asmitdesai" target="_blank" rel="noopener noreferrer" className={BUTTON_OUTLINE}>GitHub ↗</a>
            <a href="https://www.linkedin.com/in/asmit-desai-858668230/" target="_blank" rel="noopener noreferrer" className={BUTTON_OUTLINE}>LinkedIn ↗</a>
            <a href="https://tryhackme.com/p/asmitdesai02" target="_blank" rel="noopener noreferrer" className={BUTTON_ACCENT_OUTLINE}>TryHackMe ↗</a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <a
            href={`https://tryhackme.com/p/${THM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl"
          >
            <ReticleCard surface="terminal">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted">TryHackMe</p>
                <span className="font-mono text-[11px] text-accent">@{THM_USERNAME} ↗</span>
              </div>
              {thm.rank !== null || thm.points !== null ? (
                <div className="mt-4 flex gap-8">
                  <div>
                    <p className="font-mono text-2xl font-semibold text-fg">
                      {thm.rank !== null ? `#${thm.rank.toLocaleString()}` : '—'}
                    </p>
                    <p className="font-mono text-[11px] text-muted">Global rank</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-semibold text-fg">
                      {thm.points !== null ? thm.points.toLocaleString() : '—'}
                    </p>
                    <p className="font-mono text-[11px] text-muted">Points</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted">Stats unavailable right now.</p>
              )}
            </ReticleCard>
          </a>
        </Reveal>
      </div>

      <section data-skills className="mt-16">
        <SectionLabel>Skills &amp; Tools</SectionLabel>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SKILLS.map(({ category, items }, i) => (
            <Reveal key={category} delay={i * 0.06}>
              <ReticleCard className="h-full">
                <p className="mb-3 font-mono text-[11px] text-accent">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg-2"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </ReticleCard>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
