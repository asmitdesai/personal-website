'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  FEED_INTERVAL_MS, FEED_MAX_LINES, INTRO,
  appendLine, makeFeedLine, snapshotFeed,
  type FeedLine, type Severity,
} from '@/lib/terminal';

type Phase = 'intro' | 'feed';
type Tab = 'whoami' | 'feed';
interface Progress { step: number; chars: number }

const TYPE_MS = 60;
const TYPE_JITTER_MS = 40;
const OUTPUT_PAUSE_MS = 280;
const FEED_SWITCH_MS = 700;
const FEED_PREFILL = 5;
const INTRO_DONE: Progress = { step: INTRO.length, chars: 0 };
// Fixed so the reduced-motion snapshot is pure and deterministic.
const STATIC_FEED = snapshotFeed(FEED_MAX_LINES, new Date(2026, 0, 1, 9, 41, 0));

const SEVERITY_CLASS: Record<Severity, string> = {
  low: 'text-muted',
  medium: 'text-[#eab308]',
  critical: 'text-[#ef4444]',
  intel: 'text-accent',
};

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'whoami', label: 'whoami' },
  { id: 'feed', label: 'tail -f alerts.log' },
];

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function subscribeVisibility(cb: () => void) {
  document.addEventListener('visibilitychange', cb);
  return () => document.removeEventListener('visibilitychange', cb);
}

function Cursor() {
  return <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />;
}

function Prompt({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="select-none text-accent">❯</span>
      {children}
    </div>
  );
}

function IntroLines({ progress }: { progress: Progress }) {
  const { step, chars } = progress;
  return (
    <>
      {INTRO.slice(0, Math.min(step + 1, INTRO.length)).map((s, i) => {
        const typed = i < step ? s.command : s.command.slice(0, chars);
        const done = i < step || chars > s.command.length;
        return (
          <div key={s.command}>
            <Prompt>
              <span className="text-fg">{typed}</span>
              {!done && <Cursor />}
            </Prompt>
            {done && s.output.map((line) => <div key={line} className="whitespace-pre pl-5 text-fg-2">{line}</div>)}
          </div>
        );
      })}
      {step >= INTRO.length && (
        <Prompt>
          <Cursor />
        </Prompt>
      )}
    </>
  );
}

function FeedLines({ lines }: { lines: FeedLine[] }) {
  return (
    <>
      {lines.map((l) => (
        <div key={l.id} data-feed-line data-feed-id={l.id} className="terminal-line-in shrink-0 truncate text-xs leading-5">
          <span className="text-muted">{l.time}</span>{' '}
          <span className={`whitespace-pre ${SEVERITY_CLASS[l.severity]}`}>{l.level.padEnd(6)}</span>{' '}
          <span className="text-fg-2">{l.message}</span>
        </div>
      ))}
    </>
  );
}

export function HeroTerminal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const nextAlert = useRef(FEED_PREFILL);
  const [phase, setPhase] = useState<Phase>('intro');
  const [tab, setTab] = useState<Tab>('feed');
  const [progress, setProgress] = useState<Progress>({ step: 0, chars: 0 });
  const [feed, setFeed] = useState<FeedLine[]>([]);
  const [inView, setInView] = useState(false);

  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
  const pageVisible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
  const running = inView && pageVisible && !reduced;

  // Pause everything while the terminal is off-screen (or display:none below lg).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Phase 1: type the intro, then switch to the feed.
  useEffect(() => {
    if (!running || phase !== 'intro') return;
    const { step, chars } = progress;
    if (step >= INTRO.length) {
      const t = setTimeout(() => {
        setFeed(snapshotFeed(FEED_PREFILL, new Date()));
        setPhase('feed');
      }, FEED_SWITCH_MS);
      return () => clearTimeout(t);
    }
    const len = INTRO[step].command.length;
    const delay = chars < len ? TYPE_MS + Math.random() * TYPE_JITTER_MS : OUTPUT_PAUSE_MS;
    const t = setTimeout(() => {
      setProgress(chars <= len ? { step, chars: chars + 1 } : { step: step + 1, chars: 0 });
    }, delay);
    return () => clearTimeout(t);
  }, [running, phase, progress]);

  // Phase 2: stream one simulated alert per interval while the feed tab is shown.
  useEffect(() => {
    if (!running || phase !== 'feed' || tab !== 'feed') return;
    const t = setInterval(() => {
      const index = nextAlert.current++;
      setFeed((lines) => appendLine(lines, makeFeedLine(index, new Date()), FEED_MAX_LINES));
    }, FEED_INTERVAL_MS);
    return () => clearInterval(t);
  }, [running, phase, tab]);

  const shownPhase: Phase = reduced ? 'feed' : phase;
  const shownProgress = reduced ? INTRO_DONE : progress;
  const shownFeed = reduced ? STATIC_FEED : feed;

  return (
    <div className="group relative w-full">
      <p className="sr-only">
        Illustrative terminal: whoami, focus areas and tools, followed by a simulated security alert feed.
      </p>
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
        ref={rootRef}
        data-terminal
        aria-hidden
        className="relative flex h-[340px] w-full flex-col overflow-hidden rounded-xl border border-accent/15 bg-terminal p-6 font-mono text-sm transition-colors duration-300 group-hover:border-accent/40"
        style={{ boxShadow: '0 0 48px rgba(34,197,94,0.07)' }}
      >
        <div className="mb-5 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-4 text-[11px] text-muted">~/asmit — zsh</span>
          <span className="ml-auto text-[11px] text-muted">{'// simulated'}</span>
        </div>

        {shownPhase === 'feed' && (
          <div className="-mt-1 mb-3 flex border-b border-border text-[11px]">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                tabIndex={-1}
                onClick={() => setTab(id)}
                className={`-mb-px border-b px-3 py-1 transition-colors ${
                  tab === id ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg-2'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* feed is bottom-anchored like `tail -f`: the oldest lines clip off the top */}
        <div
          className={`min-h-0 flex-1 overflow-hidden ${
            shownPhase === 'feed' && tab === 'feed' ? 'flex flex-col justify-end gap-1' : 'space-y-1.5'
          }`}
        >
          {shownPhase === 'feed' && tab === 'feed' ? (
            <FeedLines lines={shownFeed} />
          ) : (
            <IntroLines progress={shownPhase === 'feed' ? INTRO_DONE : shownProgress} />
          )}
        </div>
      </div>
    </div>
  );
}
