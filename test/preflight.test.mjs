import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspect} from '../scripts/preflight.mjs';

function withMock(callback, appId='00000000-0000-0000-0000-000000000000', installed=false) {
  const folder = mkdtempSync(join(tmpdir(), 'forge-readiness-'));
  try {
    writeFileSync(join(folder, 'manifest.yml'), `modules:\n  jira:issuePanel:\n    - key: specguard\n      resource: main\n      render: native\n      title: SpecGuard\n      icon: https://developer.atlassian.com/platform/forge/images/icons/issue-panel-icon.svg\n  function:\n    - key: resolver\n      handler: backend/index.handler\napp:\n  id: ari:cloud:ecosystem::app/${appId}\npermissions:\n  scopes:\n    - read:jira-work\n`);
    writeFileSync(join(folder,'package.json'), JSON.stringify({private:true,type:'module',scripts:{test:'node --test'}}));
    for (const path of ['src/frontend/index.jsx', 'src/backend/index.js','src/backend/issue-service.mjs','src/core/analyze.mjs']) {
      mkdirSync(join(folder,path,'..'),{recursive:true});
      writeFileSync(join(folder,path),'');
    }
    if (installed) {
      mkdirSync(join(folder,'node_modules/@forge/react'),{recursive:true});
      writeFileSync(join(folder,'node_modules/@forge/react/package.json'),'{}');
    }
    return callback(folder);
  } finally {rmSync(folder,{recursive:true,force:true});}
}

test('placeholder app ID and missing dependencies block deploy readiness', () => {
  withMock(folder => {
    const r = inspect(folder);
    assert.equal(r.can_attempt_forge_deploy,false);
    assert.equal(r.submitted_to_devpost,false);
    assert.equal(r.actually_deployed,false);
    assert.equal(r.checks.filter(x=>!x.pass).length, 2);
  });
});
test('structurally configured app can attempt deployment, but is never called deployed', () => {
  withMock(folder => {
    const r = inspect(folder);
    assert.equal(r.can_attempt_forge_deploy,true);
    assert.equal(r.actually_deployed,false);
    assert.equal(r.submitted_to_devpost,false);
  },'93fe72ba-f7ea-43d8-b1c7-e4c3915be908',true);
});
test('unauthorized write scope fails permission gate', () => {
  withMock(folder => {
    const file=join(folder,'manifest.yml');
    writeFileSync(file, readFileSync(file,'utf8') + '    - write:jira-work\n');
    assert.equal(inspect(folder).checks.find(x=>x.name==='minimum Jira read-only permission').pass,false);
  });
});

test('invalid handler path is rejected even when file exists', () => {
  withMock(folder => {
    const path=join(folder,'manifest.yml');
    writeFileSync(path,readFileSync(path,'utf8').replace('handler: backend/index.handler','handler: src/backend/index.handler'));
    assert.equal(inspect(folder).checks.find(x=>x.name==='resolver declared').pass,false);
  },'93fe72ba-f7ea-43d8-b1c7-e4c3915be908',true);
});
test('missing issue panel icon is rejected before forge lint', () => {
  withMock(folder => {
    const path=join(folder,'manifest.yml');
    writeFileSync(path,readFileSync(path,'utf8').replace(/^      icon:.*\n/m,''));
    assert.equal(inspect(folder).checks.find(x=>x.name==='manifest issuePanel UI Kit').pass,false);
  },'93fe72ba-f7ea-43d8-b1c7-e4c3915be908',true);
});
