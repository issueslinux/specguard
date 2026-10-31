import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';
import {analyze} from '../core/analyze.mjs';

const resolver = new Resolver();
resolver.define('analyzeIssue', async ({payload}) => {
  const key = payload?.issueKey;
  if (typeof key !== 'string' || !/^[A-Za-z][A-Za-z0-9_]{0,49}-[1-9][0-9]{0,8}$/.test(key))
    throw new Error('Invalid Jira issue key');
  // asUser ensures Jira permissions are enforced; no app writes or external calls.
  const response = await api.asUser().requestJira(
    route`/rest/api/3/issue/${key}?fields=summary,description,status,issuetype`,
    {headers: {Accept: 'application/json'}}
  );
  if (!response.ok) throw new Error(`Jira issue unavailable (${response.status})`);
  const issue = await response.json();
  return analyze(issue);
});
export const handler = resolver.getDefinitions();
