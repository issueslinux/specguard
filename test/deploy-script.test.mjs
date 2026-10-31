import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/deploy_to_jira.sh');
const exec = (args, env = {}) => spawnSync('bash', [SCRIPT, ...args], {
  encoding: 'utf8',
  env: {...process.env, FORGE_EMAIL: 'issueslinux@gmail.com', FORGE_API_TOKEN: '', ...env}
});

test('Forge deployment script parses as Bash', () => {
  const r = spawnSync('bash', ['-n', SCRIPT], {encoding:'utf8'});
  assert.equal(r.status, 0, r.stderr);
});

test('does not register/deploy anything without a scoped token', () => {
  const r = exec(['--deploy']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /FORGE_API_TOKEN/);
  assert.doesNotMatch(r.stdout + r.stderr, /npm install|forge register|forge deploy/);
});

test('rejects unexpected Forge identity before any network call', () => {
  const r = exec(['--deploy'], {FORGE_EMAIL: 'someone@example.org', FORGE_API_TOKEN:'dummy-not-real'});
  assert.equal(r.status, 2);
  assert.match(r.stderr, /unexpected Forge account/);
  assert.doesNotMatch(r.stdout + r.stderr, /dummy-not-real/);
});

test('requires an explicit deployment mode', () => {
  const r = exec(['--wrong']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Usage/);
});
