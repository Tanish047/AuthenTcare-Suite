import { test } from 'node:test';
import assert from 'node:assert';
import { fetchPageContent } from '../src/services/webCrawler.js';

test('fetchPageContent should throw error for invalid URL', async () => {
  await assert.rejects(
    async () => {
      await fetchPageContent('');
    },
    {
      message: 'URL is required',
    }
  );

  console.log('✓ Invalid URL test passed');
});

test('fetchPageContent should throw error for non-existent URL', async () => {
  await assert.rejects(
    async () => {
      await fetchPageContent('https://this-domain-definitely-does-not-exist-12345.com');
    },
    {
      name: 'FetchError',
    }
  );

  console.log('✓ Non-existent URL test passed');
});

test('fetchPageContent should return structured data for valid URL', async () => {
  // Using a reliable test URL
  const result = await fetchPageContent('https://httpbin.org/html');

  assert.ok(typeof result === 'object', 'Result should be an object');
  assert.ok(typeof result.title === 'string', 'Result should have title string');
  assert.ok(typeof result.description === 'string', 'Result should have description string');
  assert.ok(typeof result.text === 'string', 'Result should have text string');
  assert.ok(result.text.length <= 1500, 'Text should be truncated to 1500 characters');

  console.log('✓ Valid URL test passed');
});

test('fetchPageContent should handle pages without description meta tag', async () => {
  // Test with a simple HTML page that might not have description
  const result = await fetchPageContent('https://httpbin.org/html');

  assert.ok(typeof result.description === 'string', 'Description should be a string even if empty');

  console.log('✓ Missing description test passed');
});
