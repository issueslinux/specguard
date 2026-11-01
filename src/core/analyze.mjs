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
    if (n.type === 'text' && typeof n.text === 'string') {
      // Jira's rich-text editor stores link targets in ADF marks. A label such
      // as "Test report" must not erase the URL needed for evidence triage.
      const href = n.marks?.find(mark => mark?.type === 'link' &&
        typeof mark.attrs?.href === 'string' && /^https:\/\//i.test(mark.attrs.href))?.attrs.href;
      const token = n.text + (href && !n.text.includes(href) ? ' ' + href : '');
      const bounded = token.slice(0, MAX_TEXT - size);
      result.push(bounded); size += bounded.length; return;
    }
    if (n.type === 'hardBreak') { result.push('\n'); size++; return; }
    const block = ['paragraph','heading','listItem','codeBlock','blockquote','tableRow'].includes(n.type);
    // Preserve ADF heading and list-item boundaries. Without these markers,
    // bare bullets are invisible to the acceptance-criteria parser and bullets
    // under a later heading can be mistaken for acceptance criteria.
    if (n.type === 'heading') {
      const level = Number.isInteger(n.attrs?.level) ? Math.max(1, Math.min(6, n.attrs.level)) : 2;
      const prefix = '#'.repeat(level) + ' ';
      result.push(prefix); size += prefix.length;
    } else if (n.type === 'listItem') {
      result.push('- '); size += 2;
    }
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
  const matches = String(text).slice(0, MAX_TEXT).match(LINK) || [];
  const seen = new Set();
  return matches.filter(link => {
    const url = link.replace(/[.,;!?]+$/, '');
    if (!/^https:\/\//.test(url)) return false;
    if (seen.has(url)) return false;
    seen.add(url); return true;
  }).map(url => url.replace(/[.,;!?]+$/, '')).slice(0, 20);
}

// A GitHub issue describes a problem; by itself it is NEVER test evidence.
// Even a matched PR or CI run is merely a reference, not proof of success.
export function classifyEvidenceUrl(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== 'https:') return null;
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;
  if (host === 'github.com') {
    if (/^\/[^/]+\/[^/]+\/pull\/[1-9][0-9]*\/?$/.test(path)) return 'pull_request';
    if (/^\/[^/]+\/[^/]+\/actions\/runs\/[1-9][0-9]*\/?$/.test(path)) return 'ci_run';
    return null;
  }
  if (/^([^.]+\.)*github\.com$/.test(host)) return null;
  // Generic results are only suggested for review, not marked as verified.
  if (/\/(?:test-results|test-runs|test-reports|reports|artifacts)\/[^/]+/i.test(path)) return 'test_report';
  return null;
}

export function markdownReport(result) {
  const safe = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/[\[\]<>*|`\\]/g, '\\$&').slice(0, 600);
  const lines = [
    `# SpecGuard report: ` + safe(result.key || 'unnamed issue'),
    '',
    `**Issue:** ` + safe(result.summary),
    `**Specification checks:** ` + result.completeness.present + '/' + result.completeness.total + ' present. Not a quality, release or test-pass score.',
    '',
    '## Gaps', '',
    ...(result.completeness.missing.length ? result.completeness.missing.map(x => `- ` + safe(x)) : ['- No structural gaps detected.']),
    '', '## Acceptance criteria (not verified)', '',
    ...(result.criteria.length ? result.criteria.map(x => `- [ ] ` + safe(x.id) + ': ' + safe(x.text)) : ['- None found.']),
    '', '## Candidate evidence references (unverified)', '',
    ...(result.evidenceDetails.length ? result.evidenceDetails.map(x => `- ` + safe(x.kind) + ': ' + safe(x.url)) : ['- None found.']),
    '', '> ' + safe(result.disclaimer), ''
  ];
  return lines.join('\n');
}

export function analyze(issue) {
  const summary = normalize(issue?.fields?.summary ?? '');
  const desc = adfToText(issue?.fields?.description ?? '');
  const criteria = extractCriteria(desc);
  const missing = [];
  if (!criteria.length) missing.push('Acceptance criteria are not specified in a structured, testable form.');
  // ADF headings are rendered as Markdown headings, not colon-delimited
  // labels. Recognize both forms without counting mentions in ordinary prose.
  const namedSection = pattern => pattern.test(desc);
  if (!namedSection(/(?:^|\n)\s*#{1,6}\s+expected(?:\s+behavior|\s+result)\s*(?:\n|$)/i) &&
      !/expected(?:\s+behavior|\s+result)?\s*:/i.test(desc) && !/Then\s+[^\n]+/i.test(desc))
    missing.push('Expected behavior is not explicitly described.');
  if (!namedSection(/(?:^|\n)\s*#{1,6}\s+(?:reproduction|steps to reproduce|verification steps|how to reproduce)\s*(?:\n|$)/i) &&
      !/(reproduction|steps to reproduce|action performed|how to reproduce)\s*:/i.test(desc) && !/Given\s+[^\n]+/i.test(desc))
    missing.push('Reproduction or verification steps are not explicit.');
  const links = evidenceLinks(desc);
  const evidenceDetails = links.map(url => ({url, kind: classifyEvidenceUrl(url)}))
    .filter(item => item.kind !== null);
  const references = evidenceDetails.map(item => item.url);
  // An "Evidence:" placeholder or link to the issue itself is not a test result.
  if (!references.length)
    missing.push('No review, CI run or test-report reference was found.');
  const coverage = 4 - missing.length;
  return {
    key: typeof issue?.key === 'string' ? issue.key : '',
    summary,
    criteria: criteria.map((criterion, i) => ({ id: `AC-${String(i + 1).padStart(2,'0')}`, text: criterion, verified: false })),
    completeness: { present: coverage, total: 4, missing },
    evidenceReferences: references,
    evidenceDetails,
    externalLinks: links,
    disclaimer: 'Specification completeness only. No tests were executed; no acceptance criterion was verified.'
  };
}
