import test from 'node:test';
import assert from 'node:assert/strict';
import {adfToText, extractCriteria, analyze, evidenceLinks} from '../src/core/analyze.mjs';

const doc = text => ({type:'doc',version:1,content: text.split('\n').map(line=>({type:'paragraph',content:[{type:'text',text:line}]}))});
test('ADF text extraction handles lists and nested blocks', () => {
  const data = {type:'doc',content:[
    {type:'heading',content:[{type:'text',text:'Acceptance Criteria'}]},
    {type:'bulletList',content:[
      {type:'listItem',content:[
        {type:'paragraph',content:[{type:'text',text:'Implement tests'}]}
      ]}
    ]}
  ]};
  assert.match(adfToText(data), /Acceptance Criteria\nImplement tests\n/);
});
test('acceptance forms with dedup and structured labels', () => {
  const text = ['Acceptance Criteria','- [ ] Show user login','- [x] Show user login','AC-2: Store audit events','1. Limit writes to owner','Other section','## Notes','- internal note'].join('\n');
  assert.deepEqual(extractCriteria(text), ['Show user login','Store audit events','Limit writes to owner']);
});
test('does not mark acceptance checks verified', () => {
  const r=analyze({key:'DEV-12',fields:{summary:'New feature',description:doc('Acceptance Criteria\n- [x] Has search\nExpected behavior: works\nReproduction: run tests\nEvidence: supplied')}});
  assert.equal(r.criteria.length,1);
  assert.equal(r.criteria[0].verified,false);
  assert.equal(r.completeness.present,4);
  assert.match(r.disclaimer,/No tests were executed/);
});
test('unstructured issue surfaces honest missing gaps', () => {
  const r = analyze({key:'APP-1',fields:{summary:'Broken',description:doc('App crashes sometimes.')}});
  assert.equal(r.completeness.present,0);
  assert.equal(r.completeness.missing.length,4);
});
test('links are deduplicated, plain http ignored', () => {
  assert.deepEqual(evidenceLinks('https://github.com/a/b/pull/1. https://github.com/a/b/pull/1 http://site.dev/a'), ['https://github.com/a/b/pull/1']);
});
test('issue links cited as unverified evidence references',()=>{
  const r=analyze({key:'APP-1',fields:{summary:'Bug',description:doc('See https://github.com/a/b/pull/125 for patch.')}});
  assert.equal(r.evidenceReferences.length,1);
  assert.equal(r.criteria.length,0);
});
test('bounded pathological input and null fields',()=>{
  const r=analyze({fields:{description:'AC-1: '+ 'x'.repeat(100000)}});
  assert.ok(r.criteria[0].text.length<=500);
  assert.equal(analyze(null).criteria.length,0);
});
