#!/usr/bin/env node
/** Offline *static* Forge readiness check; does not call Atlassian or submit an entry. */
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve, join} from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function inspect(root) {
  const manifest = readFileSync(join(root, 'manifest.yml'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const checks = [
    {name:'manifest issuePanel UI Kit', pass: /jira:issuePanel:/.test(manifest) && /render:\s*native/.test(manifest) && /resource:\s*main/.test(manifest) && /icon:\s*\S+/.test(manifest)},
    {name:'resolver declared', pass: /handler:\s*backend\/index\.handler/.test(manifest)},
    {name:'minimum Jira read-only permission', pass: /-\s*read:jira-work/.test(manifest) && !/-\s*write:jira-work/.test(manifest)},
    {name:'registered Forge app ID', pass: /id:\s*ari:cloud:ecosystem::app\/[0-9a-f]{8}-[0-9a-f-]{27,36}/i.test(manifest) && !/00000000-0000-0000-0000-000000000000/.test(manifest)},
    {name:'installed dependency bundle', pass: existsSync(join(root, 'node_modules', '@forge', 'react', 'package.json'))},
    {name:'main source files exist', pass: ['src/frontend/index.jsx','src/backend/index.js','src/backend/issue-service.mjs','src/core/analyze.mjs'].every(x => existsSync(join(root, x)))},
    {name:'app metadata present', pass: pkg.private === true && pkg.type === 'module' && Boolean(pkg.scripts?.test)}
  ];
  return {project:'SpecGuard', mode:'offline/static', checks,
    can_attempt_forge_deploy: checks.every(x=>x.pass),
    actually_deployed:false,
    submitted_to_devpost:false,
    external_requirements:[
      'Atlassian account and Jira developer site with app permissions',
      'Forge authentication, app registration and actual deployment/install verification',
      'Distribution set to Sharing and a working judge installation link',
      'Public working video and actual Devpost contest submission'
    ]};
}

export function main(argv = process.argv.slice(2), root = ROOT) {
  const report = inspect(root);
  if (argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const item of report.checks) console.log(`${item.pass ? 'PASS' : 'BLOCK'}: ${item.name}`);
    console.log('External deployment and competition submission: NOT VERIFIED');
  }
  return argv.includes('--strict') && !report.can_attempt_forge_deploy ? 2 : 0;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
