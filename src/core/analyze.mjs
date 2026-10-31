/* SpecGuard rules. Pure and auditable: identifies specification and evidence references;
   it cannot infer that a test passed or that a ticket is safe to release. */
const MAX_TEXT = 25000;
const MAX_CRITERIA = 40;

export function adfToText(node) {
  if (typeof node === 'string') return node.slice(0, MAX_TEXT);
  if (node === null || typeof node !== 'object') return '';
  const result = [];
  let size = 0;
  function walk(n, depth = 0) {
    if (depth > 50 || size >= MAX_TEXT) return;
    if (Array.isArray(n)) { for (const child of n) walk(child, depth + 1); return; }
    if (!n || typeof n !== 'object') return;
    if (n.type === 'text' && typeof n.text === 'string') { const token = n.text.slice(0, MAX_TEXT - size); result.push(token); size += token.length; return; }
    if (n.type === 'hardBreak') { result.push('\n'); size++; return; }
    const block = ['paragraph','heading','listItem','codeBlock','blockquote','tableRow'].includes(n.type);
    if (Array.isArray(n.content)) walk(n.content, depth + 1);
    if (block) { result.push('\n'); size++; }
  }
  walk(node);
  return result.join('').slice(0, MAX_TEXT);
}

function normalize(raw) {
  return String(raw).replace(/\s+/g, ' ').trim().slice(0, 500);
}

export function extractCriteria(text) {
  if (typeof text !== 'string') return [];
  const lines = text.slice(0, MAX_TEXT).split(/\r?\n/);
  const found = [];
  let inSection = false;
  for (const line of lines) {
    const clean = line.trim();
    if (/^#{0,5}\s*(acceptance criteria|definition of done|kryteria akceptacji)\s*:?\s*$/i.test(clean)) {
      inSection = true; continue;
    }
    if (inSection && (/^#{1,6}\s+\S/.test(clean) || /^(?:Expected behavior|Reproduction|Steps to reproduce|Evidence|Notes|Technical details)\s*:/i.test(clean) || (/^[A-Z][A-Z /]{4,}:$/.test(clean) && !/criteria|done/i.test(clean)))) {
      inSection = false;
    }
    let text = null;
    let match = /^(?:[-*]\s*)?\[([ xX])\]\s+(.+)$/.exec(clean);
    if (match) text = match[2];
    match = /^(?:[-*]\s*)?(?:AC[-\s]?[0-9]{1,3})\s*[:.)-]\s*(.+)$/i.exec(clean);
    if (!text && match) text = match[1];
    match = /^(?:[-*]|\d+[.)])\s+(.+)$/.exec(clean);
    if (!text && match && inSection) text = match[1];
    match = /^(?:Given\s+.+\s+When\s+.+\s+Then\s+.+)$/i.exec(clean);
    if (!text && match) text = match[0];
    if (text && normalize(text).length >= 5) found.push(normalize(text));
    if (found.length >= MAX_CRITERIA) break;
  }
  const seen = new Set();
  return found.filter(c => { const key = c.toLocaleLowerCase('en'); if (seen.has(key)) return false; seen.add(key); return true; });
}

const LINK = /https?:\/\/[^\s<>)"']+/g;
export function evidenceLinks(text) {
  const matches = String(text).slice(0,MAX_TEXT).match(LINK) || [];
  const seen = new Set();
  return matches.filter(link => { const url = link.replace(/[.,;!?]+$/, '');
    if (!/^https:\/\//.test(url)) return false;
    if (seen.has(url)) return false; seen.add(url); return true;
  }).map(url => url.replace(/[.,;!?]+$/, '')).slice(0, 20);
}

export function analyze(issue) {
  const summary = normalize(issue?.fields?.summary ?? '');
  const desc = adfToText(issue?.fields?.description ?? '');
  const criteria = extractCriteria(desc);
  const missing = [];
  if (!criteria.length) missing.push('Acceptance criteria are not specified in a structured, testable form.');
  if (!/expected(?:\s+behavior|\s+result)?\s*:/i.test(desc) && !/Then\s+[^\n]+/i.test(desc))
    missing.push('Expected behavior is not explicitly described.');
  if (!/(reproduction|steps to reproduce|action performed|how to reproduce)\s*:/i.test(desc) && !/Given\s+[^\n]+/i.test(desc))
    missing.push('Reproduction or verification steps are not explicit.');
  const links = evidenceLinks(desc);
  const references = links.filter(x=>/github\.com\/.+\/(?:pull|actions|issues)\/\d+|\/(?:test|test-run|report|artifacts?)\b/i.test(x));
  if (!references.length && !/\b(?:test\s+(?:command|plan)|evidence|proof)\s*:/i.test(desc))
    missing.push('No explicit test or evidence reference was found.');
  const coverage = 4 - missing.length;
  return {
    key: typeof issue?.key === 'string' ? issue.key : '',
    summary,
    criteria: criteria.map((criterion, i) => ({ id: `AC-${String(i + 1).padStart(2,'0')}`, text: criterion, verified: false })),
    completeness: { present: coverage, total: 4, missing },
    evidenceReferences: references,
    externalLinks: links,
    disclaimer: 'Specification completeness only. No tests were executed; no acceptance criterion was verified.'
  };
}
