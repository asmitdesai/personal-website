import Link from 'next/link';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { DotGrid } from '@/components/ui/DotGrid';
import { Reveal } from '@/components/ui/Reveal';
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from '@/components/ui/buttonStyles';
import { HeroTerminal } from './HeroTerminal';

const STATS = [
  { value: '2', label: 'CTFs co-organised' },
  { value: '1', label: 'Internship' },
  { value: '∞', label: 'Learning' },
];

const STEP = 0.06;

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden py-20 lg:min-h-screen">
      <DotGrid variant="hero" />

      <div className="relative mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col justify-center gap-6">
          <Reveal>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-[11px] text-accent">Open to opportunities</span>
            </div>
          </Reveal>

          <Reveal delay={STEP}>
            <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Asmit Desai</h1>
            <p className="mt-2 text-lg text-fg-2">
              <TypewriterText />
            </p>
          </Reveal>

          <Reveal delay={STEP * 2}>
            <p className="max-w-sm text-sm leading-relaxed text-fg-2">
              Building detection pipelines and breaking things in CTFs.
              This site is where I document the work.
            </p>
          </Reveal>

          <Reveal delay={STEP * 3}>
            <div className="flex gap-3">
              <Link href="/projects" className={BUTTON_PRIMARY}>View Projects</Link>
              <Link href="/writeups/thm" className={BUTTON_OUTLINE}>Read Writeups</Link>
            </div>
          </Reveal>

          <Reveal delay={STEP * 4}>
            <div className="flex gap-8 border-t border-border pt-6">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-semibold tracking-tight text-fg">{value}</p>
                  <p className="font-mono text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="hidden items-center lg:flex">
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}
