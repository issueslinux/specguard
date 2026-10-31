import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, copyFileSync, writeFileSync, chmodSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/deploy_to_jira.sh');

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'specguard-secure-cli-'));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'bin'));
  copyFileSync(SCRIPT, join(root, 'scripts', 'deploy_to_jira.sh'));
  writeFileSync(join(root, 'manifest.yml'),
    'app:\n  id: ari:cloud:ecosystem::app/00000000-0000-0000-0000-000000000000\n');
  const npm = join(root, 'bin', 'npm');
  const stub = [
    '#!/usr/bin/env bash',
    'set -e',
    'if [[ -n "${FORGE_API_TOKEN:-}" || -n "${FORGE_TOKEN:-}" ]]; then echo "npm:LEAK" >> "$MOCK_LOG"; else echo "npm:CLEAN" >> "$MOCK_LOG"; fi',
    'if [[ "${1:-}" == install && "${2:-}" == --prefix ]]; then',
    '  mkdir -p .forge-tools/node_modules/.bin',
    "  printf '%s\\n' '#!/usr/bin/env bash' 'if [[ -n " +
      "\"${FORGE_API_TOKEN:-}\" ]]; then echo \"forge:$*:TOKEN\" >> \"$MOCK_LOG\"; else echo \"forge:$*:NO_TOKEN\" >> \"$MOCK_LOG\"; exit 5; fi' 'exit 0' > .forge-tools/node_modules/.bin/forge",
    '  chmod +x .forge-tools/node_modules/.bin/forge',
    'fi',
    'exit 0'
  ].join('\n') + '\n';
  writeFileSync(npm, stub);
  chmodSync(npm, 0o755);
  return {root, log: join(root, 'events.txt')};
}

function run(f, mode) {
  return spawnSync('bash', [join(f.root, 'scripts', 'deploy_to_jira.sh'), mode], {
    encoding: 'utf8', timeout: 15000,
    env: {...process.env, FORGE_EMAIL: 'issueslinux@gmail.com',
      FORGE_API_TOKEN: 'FAKE_SECRET_FOR_TEST_ONLY',
      FORGE_TOKEN: 'PREEXISTING_EXPORTED_VAR',
      MOCK_LOG: f.log, PATH: join(f.root, 'bin') + ':' + process.env.PATH}
  });
}

test('token is passed to Forge only, never to npm install or test subprocesses', () => {
  const f=fixture();
  try {
    const result=run(f, '--deploy');
    assert.equal(result.status, 0, result.stderr + '\n' + result.stdout);
    const log=readFileSync(f.log, 'utf8');
    assert.match(log, /npm:CLEAN/);
    assert.doesNotMatch(log, /npm:LEAK|forge:.*NO_TOKEN/);
    assert.match(log, /forge:register SpecGuard:TOKEN/);
    assert.match(log, /forge:deploy -e development:TOKEN/);
    assert.match(log, /forge:install -e development -s issueslinux.atlassian.net -p jira --confirm-scopes:TOKEN/);
    assert.doesNotMatch(log + result.stdout + result.stderr, /FAKE_SECRET_FOR_TEST_ONLY/);
  } finally { rmSync(f.root, {recursive:true, force:true}); }
});

test('verify-only does not expose even a preconfigured Forge token to npm', () => {
  const f=fixture();
  try {
    const result=run(f, '--verify-only');
    assert.equal(result.status, 0, result.stderr + '\n' + result.stdout);
    const log=readFileSync(f.log, 'utf8');
    assert.match(log, /npm:CLEAN/);
    assert.doesNotMatch(log, /LEAK|FAKE_SECRET_FOR_TEST_ONLY/);
  } finally { rmSync(f.root, {recursive:true, force:true}); }
});
