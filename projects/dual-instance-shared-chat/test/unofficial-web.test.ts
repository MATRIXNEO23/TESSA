import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', 'unofficial-web');

const read = (name: string) =>
  readFileSync(join(root, name), 'utf8');

test('unofficial web bridge targets normal ChatGPT tabs without API permissions', () => {
  const manifest = JSON.parse(read('manifest.json')) as {
    manifest_version: number;
    permissions: string[];
    host_permissions: string[];
    content_scripts: Array<{ matches: string[] }>;
  };

  assert.equal(manifest.manifest_version, 3);
  assert.ok(manifest.permissions.includes('tabs'));
  assert.ok(manifest.permissions.includes('storage'));
  assert.deepEqual(manifest.host_permissions, ['https://chatgpt.com/*']);
  assert.deepEqual(
    manifest.content_scripts[0]?.matches,
    ['https://chatgpt.com/*'],
  );

  const all = [
    read('manifest.json'),
    read('background.js'),
    read('dashboard.html'),
    read('dashboard.js'),
    read('content.js'),
  ].join('\n');

  assert.doesNotMatch(all, /api\.openai\.com/i);
  assert.doesNotMatch(all, /OPENAI_API_KEY/);
});

test('dashboard exposes Tessa, GPTina and Entrambe routing', () => {
  const html = read('dashboard.html');
  const js = read('dashboard.js');

  assert.match(html, />Tessa</);
  assert.match(html, />GPTina</);
  assert.match(html, /value="both"/);
  assert.match(html, /Entrambe/);

  assert.match(js, /\['tessa', 'gptina'\]/);
  assert.match(js, /dual-chat:send/);
  assert.match(js, /dual-chat:update/);
});

test('content bridge has composer and assistant selector fallbacks', () => {
  const content = read('content.js');

  assert.match(content, /#prompt-textarea/);
  assert.match(content, /data-message-author-role="assistant"/);
  assert.match(content, /data-testid="send-button"/);
  assert.match(content, /dual-chat:ping/);
  assert.match(content, /dual-chat:error/);
});
