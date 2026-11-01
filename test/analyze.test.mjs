import test from 'node:test';
import assert from 'node:assert/strict';
import {adfToText, extractCriteria, analyze, evidenceLinks, classifyEvidenceUrl, markdownReport} from '../src/core/analyze.mjs';

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
  assert.match(adfToText(data), /## Acceptance Criteria\n- Implement tests\n/);
});
test('real ADF bullet items are criteria only within their own heading section', () => {
  const paragraph = text => ({type:'paragraph',content:[{type:'text',text}]});
  const heading = text => ({type:'heading',attrs:{level:2},content:[{type:'text',text}]});
  const bullets = (...texts) => ({type:'bulletList',content:texts.map(text => ({
    type:'listItem',content:[paragraph(text)]
  }))});
  const description = {type:'doc',version:1,content:[
    heading('Acceptance Criteria'),
    bullets('Keep the selector visible after a sync error', 'Reject unauthorized changes'),
    heading('Notes'),
    bullets('Internal notes must not appear as criteria'),
    heading('Reproduction'),
    bullets('A diagnostic action must not be treated as acceptance')
  ]};
  const flattened = adfToText(description);
  assert.match(flattened, /## Acceptance Criteria\n- Keep the selector/);
  assert.match(flattened, /## Notes\n- Internal notes/);
  const result = analyze({key:'SPEC-42',fields:{summary:'Demo',description}});
  assert.deepEqual(result.criteria.map(x => x.text), [
    'Keep the selector visible after a sync error',
    'Reject unauthorized changes'
  ]);
  assert.ok(result.criteria.every(x => x.verified === false));
});
test('acceptance forms with dedup and structured labels', () => {
  const text = ['Acceptance Criteria','- [ ] Show user login','- [x] Show user login','AC-2: Store audit events','1. Limit writes to owner','Other section','## Notes','- internal note'].join('\n');
  assert.deepEqual(extractCriteria(text), ['Show user login','Store audit events','Limit writes to owner']);
});
test('does not mark acceptance checks verified', () => {
  const r=analyze({key:'DEV-12',fields:{summary:'New feature',description:doc('Acceptance Criteria\n- [x] Has search\nExpected behavior: works\nReproduction: run tests\nEvidence: supplied')}});
  assert.equal(r.criteria.length,1);
  assert.equal(r.criteria[0].verified,false);
  assert.equal(r.completeness.present,3);
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
test('issue links are NOT test evidence',()=>{
  const r=analyze({key:'APP-1',fields:{summary:'Bug',description:doc('See https://github.com/a/b/issues/125 for original report.')}});
  assert.equal(r.evidenceReferences.length,0);
  assert.equal(r.completeness.present,0);
  assert.equal(r.criteria.length,0);
});
test('bounded pathological input and null fields',()=>{
  const r=analyze({fields:{description:'AC-1: '+ 'x'.repeat(100000)}});
  assert.ok(r.criteria[0].text.length<=500);
  assert.equal(analyze(null).criteria.length,0);
});

test('actual PR, CI and test-report links are only unverified references', () => {
  const desc=doc('Acceptance Criteria\n- [ ] Fix problem\nExpected behavior: works\nReproduction: open screen\n' +
    'https://github.com/a/b/pull/31 https://github.com/a/b/actions/runs/32 https://ci.example.org/test-reports/30/index.html');
  const r=analyze({key:'APP-5',fields:{summary:'Fix',description:desc}});
  assert.deepEqual(r.evidenceDetails.map(x=>x.kind), ['pull_request','ci_run','test_report']);
  assert.equal(r.completeness.present,4);
  assert.equal(r.criteria[0].verified,false);
});
test('spoofed GitHub host and incomplete evidence placeholders do not pass', () => {
  assert.equal(classifyEvidenceUrl('https://github.com.evil.test/a/b/pull/2'),null);
  assert.equal(classifyEvidenceUrl('https://github.com/a/b/issues/3'),null);
  const r=analyze({key:'APP-6',fields:{summary:'Bug',description:doc('Acceptance Criteria\n- [x] Show error\nExpected behavior: works\nReproduction: fails\nEvidence: TODO')}});
  assert.equal(r.completeness.present,3);
  assert.equal(r.evidenceReferences.length,0);
});
test('Markdown report never asserts verification and escapes issue title',()=>{
  const r=analyze({key:'APP-7',fields:{summary:'<script>fake</script>',description:doc('AC-1: Store records')}});
  const markdown=markdownReport(r);
  assert.match(markdown,/not verified/i);
  assert.doesNotMatch(markdown,/<script>/);
  assert.match(markdown,/- \[ \] AC-01: Store records/);
});

// The two live Jira demo tickets use rich-text headings; this fixture is a
// synthetic ADF representation of their published content, not a Jira API test.
test('SGD-1-style ADF headings count expected behavior and reproduction', () => {
  const paragraph = text => ({type:'paragraph',content:[{type:'text',text}]});
  const heading = text => ({type:'heading',attrs:{level:2},content:[{type:'text',text}]});
  const bullet = text => ({type:'listItem',content:[paragraph(text)]});
  const description = {type:'doc',content:[
    heading('Acceptance Criteria'),
    {type:'bulletList',content:[bullet('Show subsidiary selector after non-authentication failures'),
      bullet('Hide selector after rejected credentials')]},
    heading('Expected Behavior'), paragraph('Administrator can switch subsidiary after a sync failure.'),
    heading('Reproduction'), {type:'orderedList',content:[bullet('Connect mock integration'), bullet('Simulate failure')]},
    heading('Evidence'), paragraph('TODO: attach test report; not verified.')
  ]};
  const result = analyze({key:'SGD-1',fields:{summary:'Fictional demo',description}});
  assert.equal(result.criteria.length,2);
  assert.equal(result.completeness.present,3);
  assert.deepEqual(result.completeness.missing, ['No review, CI run or test-report reference was found.']);
  assert.ok(result.criteria.every(item => item.verified === false));
});

test('SGD-2-style incomplete prose does not fabricate sections or evidence', () => {
  const description = doc('The expected behavior is unclear and reproduction is not documented.\nEvidence: TODO.');
  const result = analyze({key:'SGD-2',fields:{summary:'Fictional demo',description}});
  assert.equal(result.completeness.present,0);
  assert.equal(result.criteria.length,0);
});

test('ADF labeled link marks preserve unverified review references', () => {
  const description = {type:'doc',content:[{type:'paragraph',content:[
    {type:'text',text:'Review PR',marks:[{type:'link',attrs:{href:'https://github.com/acme/app/pull/42'}}]},
    {type:'text',text:' and a report',marks:[{type:'link',attrs:{href:'https://ci.example.org/test-reports/9/index.html'}}]}
  ]}]};
  const result = analyze({key:'SGD-1',fields:{summary:'Demo',description}});
  assert.deepEqual(result.evidenceDetails.map(x => x.kind), ['pull_request','test_report']);
  assert.equal(result.completeness.present,1);
  assert.match(result.disclaimer, /No tests were executed/);
});

test('ADF unsafe link targets are not promoted to evidence', () => {
  const description = {type:'doc',content:[{type:'paragraph',content:[
    {type:'text',text:'Report',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}}]},
    {type:'text',text:' fake',marks:[{type:'link',attrs:{href:'https://github.com.evil.example/a/b/pull/1'}}]}
  ]}]};
  assert.deepEqual(analyze({fields:{description}}).evidenceReferences, []);
});
