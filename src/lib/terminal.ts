export type Severity = 'low' | 'medium' | 'critical' | 'intel';

export interface IntroStep {
  command: string;
  output: string[];
}

export interface AlertEvent {
  level: string;
  severity: Severity;
  message: string;
}

export interface FeedLine extends AlertEvent {
  id: number;
  time: string;
}

export const INTRO: IntroStep[] = [
  { command: 'whoami', output: ['asmit_desai # security engineering student'] },
  {
    command: 'cat focus.txt',
    output: ['SOC engineering · threat detection', 'incident response · detection engineering'],
  },
  { command: 'ls tools/', output: ['wazuh  velociraptor  misp  burpsuite'] },
];

// Illustrative events only — this is a simulated feed, not real telemetry.
export const ALERTS: AlertEvent[] = [
  { level: 'lvl 3', severity: 'low', message: 'sshd: authentication success · web-01' },
  { level: 'lvl 7', severity: 'medium', message: 'multiple failed logins · 10.0.4.12' },
  { level: 'hunt', severity: 'low', message: 'velociraptor: Windows.Detection.Autoruns done' },
  { level: 'lvl 12', severity: 'critical', message: 'DNS exfil pattern · TXT burst from WS-114' },
  { level: 'misp', severity: 'intel', message: 'IOC match enriched · VT 41/72' },
  { level: 'lvl 8', severity: 'medium', message: 'new service installed · WIN-DC01' },
  { level: 'soar', severity: 'low', message: 'shuffle: triage playbook ok · case #2291' },
  { level: 'lvl 10', severity: 'critical', message: 'encoded powershell spawned by winword.exe' },
  { level: 'lvl 5', severity: 'low', message: 'fim: /etc/sudoers checksum changed' },
  { level: 'misp', severity: 'intel', message: 'domain on blocklist · abuse.ch feed' },
];

export const FEED_MAX_LINES = 9;
export const FEED_INTERVAL_MS = 1500;

export function formatTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function appendLine<T>(lines: readonly T[], line: T, max: number): T[] {
  const next = [...lines, line];
  return next.length > max ? next.slice(next.length - max) : next;
}

export function alertAt(index: number): AlertEvent {
  const n = ALERTS.length;
  return ALERTS[((index % n) + n) % n];
}

export function makeFeedLine(index: number, at: Date): FeedLine {
  return { ...alertAt(index), id: index, time: formatTime(at) };
}

export function snapshotFeed(count: number, end: Date): FeedLine[] {
  return Array.from({ length: count }, (_, i) =>
    makeFeedLine(i, new Date(end.getTime() - (count - 1 - i) * FEED_INTERVAL_MS)),
  );
}
