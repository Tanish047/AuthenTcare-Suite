import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPage } from '../src/services/webCrawler.js';

test('crawler fetches example.com', async () => {
  const r = await fetchPage('https://example.com');
  assert.match(r.title, /Example Domain/i);
  assert.ok(r.text?.length > 0);
  assert.ok(Array.isArray(r.links));
});
