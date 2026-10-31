# SpecGuard — evidence-aware Jira issue review (Codegeist 2026 candidate)

**Author / proposed entrant:** Daniel Paluszek (GitHub `issueslinux`). **Status:** real source + offline tests, **not** registered, deployed, publicly submitted, judged, accepted or awarded. Developed after Codegeist 2026 opened on October 27.

## Problem

Jira issues frequently contain narrative-only requirements or visually checked boxes without reproducible proof. SpecGuard gives reviewers a **read-only, explainable requirement-evidence map** inside each issue, not a misleading automatic “pass” badge. It detects structured acceptance criteria, links to relevant reviews, gaps in expected behaviour / reproduction / evidence and displays every condition as *NOT VERIFIED* until someone evaluates a test.

## Architecture

- Atlassian Forge UI Kit (`jira:issuePanel`) and `@forge/bridge`, server-side `@forge/resolver`.
- Jira REST GET issue with the currently signed-in user's credentials (`asUser`), minimum `read:jira-work` permission. No writes, network egress, stored PII or LLM API keys.
- Pure JavaScript [rule engine](src/core/analyze.mjs) that parses Atlassian Document Format and explicitly separates **presence of specification** from **verification of results**.
- All input bounded to 25,000 characters and 40 criteria, partial evidence URLs displayed as references only, never automatically opened/executed.

## Reproduce without Jira account

```sh
node demo.mjs examples/realistic-issue.json
npm test
npm run check
```

## Deploy to your own Jira development instance (required before actual entry)

1. Install an eligible Atlassian Forge CLI and create a free developer Jira Cloud site. Authenticate using `forge login`.
2. From this folder register the app with `forge register` (or create your Forge app first), replacing the **placeholder** `app.id` in `manifest.yml` with the assigned value. Confirm manifest against the current Forge CLI.
3. `npm install && forge deploy && forge install` on the test Jira site. Open a Jira issue, select **SpecGuard - Acceptance Evidence** panel. Check the returned issue is the one you are authorized to view.
4. Obtain and test a Forge sharing/installation link, capture an actual screen recording of an installed working app, then complete Devpost Codegeist registration and submission. The contest requires a publicly available YouTube demo, installation URL, a category, setup instructions and a working app; no CLI-only or private repo package meets that submission requirement.

The Forge CLI, package installation, Jira credentials, test site, real deployment, public video, sharing URL and Devpost account were **not available** in the current execution environment. The README is a truthful deployment plan, **not evidence of deployment**.

## Competition

[Codegeist 2026 official rules](https://codegeist2026.devpost.com/rules): ends **December 22, 2026 at noon PST**, category *Apps for Software Teams*. UI Kit integration with Jira is required, and judges need a live install link. The eligible individual participant will need to confirm terms and register with Devpost. The prize pool is for winners only, and participation does not guarantee income.

## Tests and limitations

`npm test` runs offline Node tests over sample ADF documents, deduplication, statuses, URL evidence, absence of false verification and input bounds. No Jira integration test has run. ADF-to-text may miss complex extension content; regex extraction is intentionally incomplete; external links are untrusted. Avoid personal information in public demonstration data. Do **not** present output as an objective risk score or proof of compliance.
