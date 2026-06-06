import { TypewriterText } from '@/components/ui/TypewriterText';

const TERMINAL_LINES: Array<{ prompt: boolean; text: string }> = [
  { prompt: true, text: 'whoami' },
  { prompt: false, text: 'asmit_desai  # security engineering student' },
  { prompt: true, text: 'cat focus.txt' },
  { prompt: false, text: 'SOC engineering  ·  threat detection' },
  { prompt: false, text: 'incident response  ·  detection engineering' },
  { prompt: true, text: 'ls tools/' },
  { prompt: false, text: 'wazuh  velociraptor  misp  burpsuite  wireshark' },
  { prompt: true, text: 'git log --oneline -3' },
  { prompt: false, text: '3f2a1c8 built detection pipeline @ SecPod' },
  { prompt: false, text: 'a9d4e2f wrote DNS exfil detection rule' },
  { prompt: false, text: 'c1b3f9a authored CTF web challenge' },
];

const STATS = [
  { value: '2', label: 'CTFs co-organised' },
  { value: '1', label: 'Internship' },
  { value: '∞', label: 'Learning' },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center py-20">
      {/* ambient green orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.035) 0%, transparent 65%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        {/* left: text */}
        <div className="flex flex-col justify-center gap-6">
          {/* status badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/5 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#22c55e]">
              Open to opportunities
            </span>
          </div>

          {/* name + typewriter */}
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#ededed] sm:text-5xl">
              Asmit Desai
            </h1>
            <p className="mt-2 text-lg text-[#a1a1a1]">
              <TypewriterText />
            </p>
          </div>

          {/* bio */}
          <p className="max-w-sm text-sm leading-relaxed text-[#a1a1a1]">
            Building detection pipelines and breaking things in CTFs.
            This site is where I document the work.
          </p>

          {/* CTAs */}
          <div className="flex gap-3">
            <a
              href="/projects"
              className="rounded-lg border border-[#22c55e] px-4 py-2 font-[family-name:var(--font-mono)] text-sm text-[#22c55e] transition-all hover:bg-[#22c55e]/10"
            >
              View Projects
            </a>
            <a
              href="/writeups/thm"
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 font-[family-name:var(--font-mono)] text-sm text-[#a1a1a1] transition-all hover:border-[#3a3a3a] hover:text-[#ededed]"
            >
              Read Writeups
            </a>
          </div>

          {/* stats */}
          <div className="flex gap-8 border-t border-[#1a1a1a] pt-6">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-semibold text-[#ededed]">{value}</p>
                <p className="font-[family-name:var(--font-mono)] text-xs text-[#525252]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* right: terminal */}
        <div className="hidden items-center lg:flex">
          <div className="group relative w-full">
            {/* green aura — fades in when the cursor hovers the terminal */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-24 rounded-[3rem] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(ellipse closest-side, rgba(34,197,94,0.5) 0%, rgba(34,197,94,0.25) 45%, rgba(34,197,94,0.08) 75%, transparent 100%)',
              }}
            />
            <div
              className="relative w-full rounded-xl border border-[#22c55e]/15 bg-[#0d0d0d] p-6 font-[family-name:var(--font-mono)] text-sm transition-colors duration-300 group-hover:border-[#22c55e]/40"
              style={{ boxShadow: '0 0 48px rgba(34,197,94,0.07)' }}
            >
            {/* title bar dots */}
            <div className="mb-5 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 text-[11px] text-[#525252]">~/asmit — zsh</span>
            </div>

            {/* output lines */}
            <div className="space-y-1.5">
              {TERMINAL_LINES.map((line, i) =>
                line.prompt ? (
                  <div key={i} className="flex gap-2">
                    <span className="select-none text-[#22c55e]">❯</span>
                    <span className="text-[#ededed]">{line.text}</span>
                  </div>
                ) : (
                  <div key={i} className="pl-5 text-[#a1a1a1]">{line.text}</div>
                ),
              )}
              {/* blinking cursor */}
              <div className="flex gap-2">
                <span className="select-none text-[#22c55e]">❯</span>
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#22c55e]" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
