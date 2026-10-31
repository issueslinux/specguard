> **Codegeist judge packet:** [CODEGEIST_JUDGE_PACKET.md](CODEGEIST_JUDGE_PACKET.md) contains ready-to-review Devpost text, authorized Jira install/test steps, a <3-minute **real app** video plan and explicit external gates. The app cannot honestly be called submitted until Forge registration/deployment, a verified judge installation link, a public YouTube video and a Devpost submission exist. The offline source tests do not satisfy these gates.

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

## Audyt dowodów (31.10.2026)

Nowa wersja nie uważa linku do GitHub Issue ani pustego pola `Evidence: TODO` za dowód wykonania testów. Rozpoznaje jedynie **potencjalne referencje** do PR, przebiegu CI lub raportu testowego; samo ich istnienie nie jest potwierdzeniem zaliczenia. Dodatkowe testy sprawdzają również podszywanie się pod domenę GitHub.

Można wygenerować reprodukowalny, jawnie **niezweryfikowany** raport Markdown z przykładowej sprawy:

```sh
node demo.mjs --markdown
node demo.mjs examples/realistic-issue.json --markdown
npm test
npm run check
```

**QA aktualnego źródła:** 10/10 testów `node --test` PASS oraz `npm run check` PASS na Node 22.16.0; pełny wykaz w [AUDIT_2026-10-31.md](AUDIT_2026-10-31.md). Nie wykonywano `forge deploy`, bo konto Atlassian/Forge i sieć rejestracyjna nie są dostępne.

## Forge API test and deployment preflight

The Jira read-only resolver delegates to [issue-service.mjs](src/backend/issue-service.mjs), a dependency-free, testable service. Tests cover a successful issue lookup, invalid keys, access denied, missing/invalid JSON, gateway returning a different issue and no assertion of passing tests.

```sh
npm test
npm run check
npm run preflight
npm run preflight -- --json
npm run preflight -- --strict
```

The **strict** preflight command exits with code **2** while the Forge app ID is a placeholder or the dependencies are not installed. Passing the static check would mean only *eligible to attempt deployment*, **not** deployed, shared, or accepted into Codegeist; see [deployment checklist](DEPLOYMENT_CHECKLIST.md). Results in this environment: **19/19 tests PASS**, `npm run check` PASS, and preflight reports **2 deployment blockers** (placeholder app ID, missing local dependency installation); no forge lint, deploy, install, or Devpost submission.

## Real Jira Cloud test fixture — confirmed 31 October 2026

- Jira Software project **[SpecGuard Demo (SGD)](https://issueslinux.atlassian.net/jira/software/projects/SGD)** has been created on the owner's site. Confirmation: Atlassian `listJiraProjects` returned `id=10000`, `key=SGD`, `projectTypeKey=software`, `style=next-gen`.
- Demo work items created and independently read via Jira API: **[SGD-1](https://issueslinux.atlassian.net/browse/SGD-1)** (three explicit ACs, reproduction, no verified evidence) and **[SGD-2](https://issueslinux.atlassian.net/browse/SGD-2)** (intentionally missing requirements). Both marked FICTIONAL.
- Jira project creation was unblocked by granting the existing admin group `jira-admins-issueslinux` the **Create team-managed projects** global permission. No payment, new public project or unrelated permissions were added.
- **The Forge issue panel is NOT deployed, installed or tested in Jira**. The above proves only that the authorized live Jira test environment now exists.
- The existing app folder contains the Forge manifest with a placeholder app ID, so registration of this **existing app source** is through `forge register`, not `forge create` (which scaffolds a different app). Node package/Forge CLI installation and scoped API-token authentication remain necessary.
- Dedicated [deployment checklist](DEPLOYMENT_CHECKLIST.md) and [single-command development deployment script](scripts/deploy_to_jira.sh) separate actual deploy/install from offline testing.

## Deploy to your own Jira development instance (required before actual entry)

1. Install an eligible Atlassian Forge CLI and create a free developer Jira Cloud site. Authenticate using `forge login`.
2. From this folder register the app with `forge register` (or create your Forge app first), replacing the **placeholder** `app.id` in `manifest.yml` with the assigned value. Confirm manifest against the current Forge CLI.
3. `npm install && forge deploy && forge install` on the test Jira site. Open a Jira issue, select **SpecGuard - Acceptance Evidence** panel. Check the returned issue is the one you are authorized to view.
4. Obtain and test a Forge sharing/installation link, capture an actual screen recording of an installed working app, then complete Devpost Codegeist registration and submission. The contest requires a publicly available YouTube demo, installation URL, a category, setup instructions and a working app; no CLI-only or private repo package meets that submission requirement.

The Jira Cloud site and test project **are now available**; Forge CLI, package installation, Forge registration, real deployment, public video, sharing URL and Devpost submission **remain unverified** in this execution environment. The README is a truthful deployment plan, **not evidence of deployment**.

## Competition

[Codegeist 2026 official rules](https://codegeist2026.devpost.com/rules): ends **December 22, 2026 at noon PST**, category *Apps for Software Teams*. UI Kit integration with Jira is required, and judges need a live install link. The eligible individual participant will need to confirm terms and register with Devpost. The prize pool is for winners only, and participation does not guarantee income.

## Tests and limitations

`npm test` runs offline Node tests over sample ADF documents, deduplication, statuses, URL evidence, absence of false verification and input bounds. No Jira integration test has run. ADF-to-text may miss complex extension content; regex extraction is intentionally incomplete; external links are untrusted. Avoid personal information in public demonstration data. Do **not** present output as an objective risk score or proof of compliance.
