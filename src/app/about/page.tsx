import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Asmit Desai',
};

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

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        {/* bio */}
        <div>
          <h1 className="mb-6 text-3xl font-semibold text-[#ededed]">About</h1>

          <div className="space-y-4 text-sm leading-relaxed text-[#a1a1a1]">
            <p>
              I&apos;m Asmit Desai, a security engineering student at PES University,
              Bengaluru pursuing a BTech in Computer Science. My focus is SOC
              engineering, threat detection, and incident response.
            </p>
            <p>
              During my internship at <span className="text-[#ededed]">SecPod Technologies</span>,
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

          <div className="mt-8 flex gap-4">
            <a href="https://github.com/asmitdesai" target="_blank" rel="noopener noreferrer" className="rounded border border-[#1a1a1a] px-4 py-2 font-[family-name:var(--font-mono)] text-sm text-[#a1a1a1] transition-all hover:border-[#2a2a2a] hover:text-[#ededed]">GitHub ↗</a>
            <a href="https://linkedin.com/in/asmit-desai-858668230/" target="_blank" rel="noopener noreferrer" className="rounded border border-[#1a1a1a] px-4 py-2 font-[family-name:var(--font-mono)] text-sm text-[#a1a1a1] transition-all hover:border-[#2a2a2a] hover:text-[#ededed]">LinkedIn ↗</a>
            <a href="https://tryhackme.com/p/asmitdesai02" target="_blank" rel="noopener noreferrer" className="rounded border border-[#22c55e]/30 px-4 py-2 font-[family-name:var(--font-mono)] text-sm text-[#22c55e] transition-all hover:border-[#22c55e] hover:bg-[#22c55e]/5">TryHackMe ↗</a>
          </div>
        </div>

        {/* skills grid */}
        <div>
          <h2 className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[#525252]">
            Skills & Tools
          </h2>
          <div className="space-y-6">
            {SKILLS.map(({ category, items }) => (
              <div key={category}>
                <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] text-[#525252]">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded border border-[#1a1a1a] bg-[#0f0f0f] px-2 py-1 font-[family-name:var(--font-mono)] text-xs text-[#a1a1a1]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* THM stats placeholder — wired in Phase 2 */}
          <div className="mt-8 rounded-xl border border-dashed border-[#2a2a2a] p-5">
            <p className="font-[family-name:var(--font-mono)] text-[11px] text-[#525252]">
              TRYHACKME STATS
            </p>
            <p className="mt-2 text-xs text-[#525252]">Live stats coming in Phase 2.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
