import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALERTS, FEED_INTERVAL_MS, FEED_MAX_LINES, INTRO,
  alertAt, appendLine, formatTime, makeFeedLine, snapshotFeed,
} from './terminal';

test('script data is non-empty and never repeats within one visible screen', () => {
  assert.ok(INTRO.length >= 3);
  assert.ok(ALERTS.length > FEED_MAX_LINES);
  for (const a of ALERTS) assert.ok(a.level.length <= 6, `level "${a.level}" fits the 6-char column`);
});

test('appendLine keeps only the newest `max` lines without mutating input', () => {
  const start = [1, 2, 3];
  const next = appendLine(start, 4, 3);
  assert.deepEqual(next, [2, 3, 4]);
  assert.deepEqual(start, [1, 2, 3]);
  assert.deepEqual(appendLine([], 1, 3), [1]);
});

test('alertAt wraps around the alert list', () => {
  assert.equal(alertAt(0), ALERTS[0]);
  assert.equal(alertAt(ALERTS.length), ALERTS[0]);
  assert.equal(alertAt(ALERTS.length * 3 + 2), ALERTS[2]);
});

test('formatTime renders zero-padded HH:MM:SS', () => {
  assert.equal(formatTime(new Date(2026, 0, 1, 9, 5, 7)), '09:05:07');
});

test('makeFeedLine combines the alert with id and time', () => {
  const line = makeFeedLine(1, new Date(2026, 0, 1, 23, 59, 58));
  assert.equal(line.id, 1);
  assert.equal(line.time, '23:59:58');
  assert.equal(line.message, ALERTS[1].message);
});

test('snapshotFeed returns `count` ascending lines ending at `end`', () => {
  const end = new Date(2026, 0, 1, 12, 0, 0);
  const lines = snapshotFeed(4, end);
  assert.deepEqual(lines.map((l) => l.id), [0, 1, 2, 3]);
  assert.equal(lines[3].time, '12:00:00');
  assert.equal(lines[0].time, formatTime(new Date(end.getTime() - 3 * FEED_INTERVAL_MS)));
  assert.equal(snapshotFeed(0, end).length, 0);
});
