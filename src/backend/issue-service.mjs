/** Testable read-only Jira issue analysis service. No Forge dependency. */
import {analyze} from '../core/analyze.mjs';

const ISSUE_KEY = /^[A-Za-z][A-Za-z0-9_]{0,49}-[1-9][0-9]{0,8}$/;

export async function analyzeIssue(payload, fetchIssue) {
  const key = payload?.issueKey;
  if (typeof key !== 'string' || !ISSUE_KEY.test(key)) {
    throw new Error('Invalid Jira issue key');
  }
  if (typeof fetchIssue !== 'function') {
    throw new TypeError('Jira fetch callback required');
  }
  const response = await fetchIssue(key);
  if (!response || typeof response.ok !== 'boolean') {
    throw new Error('Invalid Jira response');
  }
  if (!response.ok) {
    // Do not leak issue details to a user who cannot read it.
    if ([401, 403, 404].includes(response.status)) {
      throw new Error('Jira issue is unavailable or access was denied');
    }
    throw new Error('Jira request failed');
  }
  let issue;
  try {
    issue = await response.json();
  } catch {
    throw new Error('Invalid Jira response JSON');
  }
  if (!issue || typeof issue !== 'object' || Array.isArray(issue) ||
      !issue.fields || typeof issue.fields !== 'object' || Array.isArray(issue.fields)) {
    throw new Error('Invalid Jira issue payload');
  }
  // Defend against misconfigured gateways returning a different issue.
  if (typeof issue.key !== 'string' || issue.key.toUpperCase() !== key.toUpperCase()) {
    throw new Error('Jira returned a different issue');
  }
  return analyze(issue);
}
