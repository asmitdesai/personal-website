import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backLink, codeLanguage, formatCount, isActivePath, scrollProgress, typeLabel } from './utils';

test('typeLabel maps known post types to display labels', () => {
  assert.equal(typeLabel('project'), 'Project');
  assert.equal(typeLabel('thm'), 'TryHackMe');
  assert.equal(typeLabel('security'), 'Security');
});

test('typeLabel falls back to the raw type for unknown values', () => {
  assert.equal(typeLabel('mystery'), 'mystery');
});

test('isActivePath matches the section root and its children', () => {
  assert.equal(isActivePath('/projects', '/projects'), true);
  assert.equal(isActivePath('/projects/ubuntils', '/projects'), true);
  assert.equal(isActivePath('/writeups/thm/some-room', '/writeups/thm'), true);
});

test('isActivePath does not match siblings or prefixes of other words', () => {
  assert.equal(isActivePath('/writeups/security', '/writeups/thm'), false);
  assert.equal(isActivePath('/projects-archive', '/projects'), false);
  assert.equal(isActivePath('/', '/about'), false);
});

test('formatCount zero-pads and pluralises', () => {
  assert.equal(formatCount(0), '00 entries');
  assert.equal(formatCount(1), '01 entry');
  assert.equal(formatCount(4), '04 entries');
  assert.equal(formatCount(123), '123 entries');
});

test('backLink points each post type at its list page', () => {
  assert.deepEqual(backLink('project'), { href: '/projects', label: 'projects' });
  assert.deepEqual(backLink('thm'), { href: '/writeups/thm', label: 'tryhackme' });
  assert.deepEqual(backLink('security'), { href: '/writeups/security', label: 'security' });
  assert.deepEqual(backLink('unknown'), { href: '/', label: 'home' });
});

test('codeLanguage extracts the language-* class', () => {
  assert.equal(codeLanguage('hljs language-bash'), 'bash');
  assert.equal(codeLanguage('language-python hljs'), 'python');
  assert.equal(codeLanguage('hljs'), null);
  assert.equal(codeLanguage(undefined), null);
});

test('scrollProgress is clamped to 0..1 and full for unscrollable pages', () => {
  assert.equal(scrollProgress(0, 2000, 1000), 0);
  assert.equal(scrollProgress(500, 2000, 1000), 0.5);
  assert.equal(scrollProgress(1500, 2000, 1000), 1);
  assert.equal(scrollProgress(-50, 2000, 1000), 0);
  assert.equal(scrollProgress(0, 800, 1000), 1);
});
