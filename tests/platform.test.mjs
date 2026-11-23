import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');
const html = readFileSync(resolve(publicDir, 'index.html'), 'utf8');
const app = readFileSync(resolve(publicDir, 'assets/app.js'), 'utf8');
const cli = resolve(publicDir, 'downloads/nexo.mjs');

test('All local assets, downloads and clipboard targets exist', () => {
  for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (path.startsWith('#')) continue;
    assert.ok(!/^https?:/.test(path), 'The demo must work without external resources');
    assert.ok(existsSync(resolve(publicDir, path)), `Missing resource ${path}`);
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
  for (const [, target] of html.matchAll(/data-copy-target="([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing copy target ${target}`);
    assert.ok(html.includes(`<code id="${target}">node nexo.mjs `));
  }
});

test('CLI version, diagnosis, demo, help and unknown-command behavior', () => {
  const commands = [
    ['--version', 'nexo 0.1.0', 0],
    ['doctor', process.platform, 0],
    ['demo', 'No se han creado archivos.', 0],
    ['--help', 'Uso: node nexo.mjs', 0],
    ['unknown', 'Comando desconocido', 1],
  ];
  for (const [command, expected, status] of commands) {
    const output = [];
    const runtime = { argv: ['node', cli, command], versions: { node: process.versions.node }, platform: process.platform, arch: process.arch, exitCode: 0 };
    vm.runInNewContext(readFileSync(cli, 'utf8'), {
      process: runtime,
      console: { log: (...parts) => output.push(parts.join(' ')), error: (...parts) => output.push(parts.join(' ')) },
    });
    assert.equal(runtime.exitCode, status, command);
    assert.ok(output.join('\n').includes(expected), command);
  }
});

function clipboardHarness({ text = 'node nexo.mjs doctor', hidden = false, reject = false } = {}) {
  const writes = [], notifications = [], selections = [];
  const target = { textContent: text, getClientRects: () => hidden ? [] : [{}] };
  const label = { textContent: 'Copiar' };
  const button = { dataset: { copyTarget: 'command-doctor' }, disabled: false };
  const context = {
    document: { getElementById: () => target, createRange: () => ({ selectNodeContents: node => selections.push(node) }) },
    navigator: { clipboard: { writeText: async value => { if (reject) throw new Error('Denied'); writes.push(value); } } },
    window: { getSelection: () => ({ removeAllRanges() {}, addRange() {} }) },
    $: () => label,
    toast: text => notifications.push(text),
    setTimeout() {},
  };
  const source = app.slice(app.indexOf('async function copyCommand('), app.indexOf('\nconst examples ='));
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.copyCommand = copyCommand;`, context);
  return { run: () => context.copyCommand(button), writes, notifications, selections, button, target };
}

test('Clipboard receives exactly the visible text on every click', async () => {
  const harness = clipboardHarness();
  await harness.run(); await harness.run();
  assert.deepEqual(harness.writes, ['node nexo.mjs doctor', 'node nexo.mjs doctor']);
  harness.target.textContent = 'node nexo.mjs --version';
  await harness.run();
  assert.equal(harness.writes.at(-1), harness.target.textContent);
  assert.equal(harness.button.disabled, false);
});

test('Hidden code cannot be copied', async () => {
  const harness = clipboardHarness({ hidden: true });
  await harness.run();
  assert.deepEqual(harness.writes, []);
});

test('Clipboard denial selects the same visible command for manual copying', async () => {
  const harness = clipboardHarness({ reject: true });
  await harness.run();
  assert.deepEqual(harness.writes, []);
  assert.equal(harness.selections[0], harness.target);
  assert.match(harness.notifications[0], /Ctrl\+C/);
  assert.equal(harness.button.disabled, false);
});
