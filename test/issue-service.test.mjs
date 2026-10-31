import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeIssue} from '../src/backend/issue-service.mjs';

const issue = (key = 'DEV-42') => ({key, fields:{summary:'Example issue',description:{
  type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'AC-1: Explain the failure'}]}]
}}});
const response = (json = issue(), status = 200) => ({ok:status >= 200 && status < 300,
  status, json:async () => json});

test('returns a read-only analysis from user-scoped response', async () => {
  let called = 0;
  const result = await analyzeIssue({issueKey:'DEV-42'}, async key => {
    called += 1;
    assert.equal(key, 'DEV-42');
    return response();
  });
  assert.equal(called,1);
  assert.equal(result.key,'DEV-42');
  assert.equal(result.criteria.length,1);
  assert.equal(result.criteria[0].verified,false);
});
test('rejects malformed issue keys before any network request', async () => {
  for (const key of [undefined, 17, '', 'DEV-0', 'DEV-1/../../user', 'DEV-1?fields=all', 'å-1']) {
    let called = 0;
    await assert.rejects(analyzeIssue({issueKey:key}, async () => {called++; return response();}), /Invalid Jira issue key/);
    assert.equal(called,0);
  }
});
test('denies unauthorized and missing issues without leaking data', async () => {
  for (const status of [401,403,404]) {
    await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => response(null,status)),
      /unavailable or access was denied/);
  }
});
test('handles upstream failure and invalid/empty responses', async () => {
  await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => response(null,500)), /Jira request failed/);
  await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => null), /Invalid Jira response/);
  await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => ({ok:true,json:async () => null})), /Invalid Jira issue payload/);
  await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => ({ok:true,json:async () => {throw Error('invalid JSON');}})), /Invalid Jira response JSON/);
});
test('refuses a different issue returned by a proxy', async () => {
  await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => response(issue('SECRET-3'))),
    /different issue/);
});
test('rejects nonsensical structure and accepts case-equivalent key', async () => {
  await assert.rejects(analyzeIssue({issueKey:'DEV-42'}, async () => response({key:'DEV-42',fields:[]})),
    /Invalid Jira issue payload/);
  const result=await analyzeIssue({issueKey:'dev-42'}, async () => response());
  assert.equal(result.key,'DEV-42');
});
