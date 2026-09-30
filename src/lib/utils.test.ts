import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typeLabel } from './utils';

test('typeLabel maps known post types to display labels', () => {
  assert.equal(typeLabel('project'), 'Project');
  assert.equal(typeLabel('thm'), 'TryHackMe');
  assert.equal(typeLabel('security'), 'Security');
});

test('typeLabel falls back to the raw type for unknown values', () => {
  assert.equal(typeLabel('mystery'), 'mystery');
});
