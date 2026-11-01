import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';
import {analyzeIssue} from './issue-service.mjs';

// @forge/resolver exports { default: Resolver } in the installed CJS package.
// Support both Node ESM import semantics and Forge bundler interop.
const ResolverCtor = typeof Resolver === 'function' ? Resolver : Resolver?.default;
if (typeof ResolverCtor !== 'function') throw new TypeError('Forge resolver constructor unavailable');
const resolver = new ResolverCtor();
resolver.define('analyzeIssue', async ({payload}) => analyzeIssue(
  payload,
  key => api.asUser().requestJira(
    route`/rest/api/3/issue/${key}?fields=summary,description`,
    {headers: {Accept: 'application/json'}}
  )
));
export const handler = resolver.getDefinitions();
