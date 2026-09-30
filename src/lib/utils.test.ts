import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isActivePath, typeLabel } from './utils';

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
