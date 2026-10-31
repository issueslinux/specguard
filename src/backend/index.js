import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';
import {analyzeIssue} from './issue-service.mjs';

const resolver = new Resolver();
resolver.define('analyzeIssue', async ({payload}) => analyzeIssue(
  payload,
  key => api.asUser().requestJira(
    route`/rest/api/3/issue/${key}?fields=summary,description`,
    {headers: {Accept: 'application/json'}}
  )
));
export const handler = resolver.getDefinitions();
