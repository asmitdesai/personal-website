import { mkdirSync } from 'node:fs';
import { chromium, type Page } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const OUT = 'test-results/ui';

type ViewportName = 'desktop' | 'mobile';
type MotionMode = 'full' | 'reduced';

const VIEWPORTS: Record<ViewportName, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const ROUTES = [
  '/',
  '/about',
  '/projects',
  '/projects/ubuntils',
  '/writeups/thm',
  '/writeups/security',
  '/writeups/security/alert-fatigue-rule-writing-not-headcount',
  '/tags/detection-engineering',
  '/preview/ubuntils',
];

interface Check {
  path: string;
  selector: string;
  why: string;
  state?: 'attached' | 'visible' | 'hidden' | 'detached';
  viewport?: ViewportName;
  motion?: MotionMode;
}

interface HookContext {
  path: string;
  viewport: ViewportName;
  motion: MotionMode;
}

type PageHook = (page: Page, ctx: HookContext) => Promise<string | null>;

// Feature checks — later tasks append entries here.
const CHECKS: Check[] = [
  { path: '/projects', selector: 'article.reticle .reticle-bracket', state: 'attached', why: 'post cards use ReticleCard' },
  { path: '/writeups/security', selector: 'article.reticle', why: 'security list renders reticle cards' },
  { path: '/projects/ubuntils', selector: 'nav a[aria-current="page"][href="/projects"]', why: 'Projects is active inside a project page' },
  { path: '/writeups/security', selector: 'nav a[aria-current="page"][href="/writeups/security"]', why: 'Security is active on its list' },
  { path: '/', selector: 'nav a[aria-current="page"]', state: 'detached', why: 'no section is active on home' },
  { path: '/', selector: 'footer >> text=all systems nominal', why: 'footer status line' },
  { path: '/', selector: '[data-terminal] >> text="// simulated"', viewport: 'desktop', why: 'terminal is labelled as simulated' },
  { path: '/', selector: '[data-feed-line]', viewport: 'desktop', motion: 'full', why: 'intro finishes and the feed starts streaming' },
  { path: '/', selector: '[data-feed-line]', viewport: 'desktop', motion: 'reduced', why: 'reduced motion shows a static feed snapshot immediately' },
  { path: '/', selector: '[data-terminal]', viewport: 'mobile', state: 'hidden', why: 'terminal hidden below lg' },
  { path: '/', selector: 'section.isolate .dot-grid--hero', state: 'attached', why: 'hero uses the dot grid backdrop' },
  { path: '/', selector: 'text=Featured', why: 'first post is rendered as the featured card' },
  { path: '/', selector: 'aside a[href="/about"] >> text=More about me', why: 'sidebar about blurb links to /about' },
  { path: '/projects', selector: '[data-page-header] >> text="// projects"', why: 'list page header eyebrow' },
  { path: '/writeups/security', selector: '[data-page-header] .dot-grid--header', state: 'attached', why: 'header dot grid' },
  { path: '/writeups/thm', selector: '[data-empty-state]', why: 'empty THM list shows EmptyState (local DB has none)' },
  { path: '/writeups/thm', selector: '[data-page-header] >> text=00 entries', why: 'empty count renders' },
  { path: '/tags/detection-engineering', selector: '[data-page-header] >> text=#detection-engineering', why: 'tag header title' },
  { path: '/projects/ubuntils', selector: '[data-post-header] a[href="/projects"] >> text=back to projects', why: 'breadcrumb back link' },
  { path: '/writeups/security/alert-fatigue-rule-writing-not-headcount', selector: '.reading-progress', state: 'attached', motion: 'full', why: 'progress bar mounted' },
  { path: '/writeups/security/alert-fatigue-rule-writing-not-headcount', selector: '.reading-progress', state: 'hidden', motion: 'reduced', why: 'progress bar hidden under reduced motion' },
  { path: '/preview/ubuntils', selector: '[data-post-header]', why: 'preview uses the shared header' },
  { path: '/writeups/security/alert-fatigue-rule-writing-not-headcount', selector: '.code-block-bar', why: 'code blocks show the language bar (this post has fenced code)' },
];

// Behavioural checks — return an error message, or null when fine.
async function lastFeedId(page: Page): Promise<string | null> {
  return page.evaluate(
    `(() => { const l = document.querySelectorAll('[data-feed-line]'); return l.length ? l[l.length - 1].getAttribute('data-feed-id') : null; })()`,
  ) as Promise<string | null>;
}

const HOOKS: PageHook[] = [
  // Feed must advance while visible (full motion) and freeze while scrolled away.
  async (page, { path, viewport, motion }) => {
    if (path !== '/' || viewport !== 'desktop') return null;
    const before = await lastFeedId(page);
    await page.waitForTimeout(3200);
    const after = await lastFeedId(page);
    if (motion === 'reduced') return before === after ? null : 'reduced-motion feed should be static';
    if (before === after) return 'feed did not advance while visible';
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await page.waitForTimeout(300);
    const hiddenStart = await lastFeedId(page);
    await page.waitForTimeout(3200);
    const hiddenEnd = await lastFeedId(page);
    await page.evaluate('window.scrollTo(0, 0)');
    return hiddenStart === hiddenEnd ? null : 'feed kept streaming while off-screen';
  },
];

// Kept as a string so tsx's keepNames helpers never leak into the browser.
const INSPECT = `(() => {
  const overflow = document.documentElement.scrollWidth > window.innerWidth;
  const hidden = Array.from(document.querySelectorAll('body *'))
    .filter((el) => {
      if (el.closest('[aria-hidden="true"], .copy-button, script, style, noscript')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).opacity === '0';
    })
    .slice(0, 5)
    .map((el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''));
  return { overflow, hidden };
})()`;

async function sweep(page: Page) {
  const height = (await page.evaluate('document.documentElement.scrollHeight')) as number;
  const step = Math.round(((await page.evaluate('window.innerHeight')) as number) * 0.6);
  for (let y = 0; y <= height; y += step) {
    await page.evaluate(`window.scrollTo(0, ${y})`);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
  await page.evaluate('window.scrollTo(0, 0)');
  await page.waitForTimeout(300);
}

function shotName(path: string): string {
  return path === '/' ? 'home' : path.slice(1).replace(/\//g, '_');
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const failures: string[] = [];

  for (const motion of ['full', 'reduced'] as const) {
    for (const viewport of Object.keys(VIEWPORTS) as ViewportName[]) {
      const context = await browser.newContext({
        viewport: VIEWPORTS[viewport],
        reducedMotion: motion === 'reduced' ? 'reduce' : 'no-preference',
      });
      for (const path of ROUTES) {
        const label = `${motion}/${viewport} ${path}`;
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text());
        });
        page.on('pageerror', (e) => errors.push(e.message));

        const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
        if (!res || res.status() >= 400) failures.push(`${label}: HTTP ${res?.status() ?? 'no response'}`);

        const checks = CHECKS.filter(
          (c) => c.path === path && (!c.viewport || c.viewport === viewport) && (!c.motion || c.motion === motion),
        );
        for (const c of checks) {
          const state = c.state ?? 'visible';
          try {
            await page.locator(c.selector).first().waitFor({ state, timeout: 10_000 });
          } catch {
            failures.push(`${label}: expected ${c.selector} to be ${state} — ${c.why}`);
          }
        }
        for (const hook of HOOKS) {
          const err = await hook(page, { path, viewport, motion });
          if (err) failures.push(`${label}: ${err}`);
        }

        await sweep(page);
        const { overflow, hidden } = (await page.evaluate(INSPECT)) as { overflow: boolean; hidden: string[] };
        if (overflow) failures.push(`${label}: horizontal scroll`);
        if (hidden.length) failures.push(`${label}: invisible content: ${hidden.join(', ')}`);
        if (errors.length) failures.push(`${label}: console errors: ${errors.slice(0, 3).join(' | ')}`);

        await page.screenshot({ path: `${OUT}/${motion}-${viewport}-${shotName(path)}.png`, fullPage: true });
        await page.close();
      }
      await context.close();
    }
  }

  await browser.close();
  if (failures.length) {
    console.error(`\n✖ ${failures.length} UI check(s) failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`✔ UI verification passed (${ROUTES.length} routes × 2 viewports × 2 motion modes)`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
