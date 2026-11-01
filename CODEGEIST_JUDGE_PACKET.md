# SpecGuard — Codegeist 2026 judge packet

**Status (1 Nov 2026):** real Forge development v2.1.0 deployed; live Jira panel verified. Contest NOT SUBMITTED (production judge installation link generated; public real-app video and Devpost entry missing). Prepared 2026-10-31. No URL below is a real deployment proof. Original author / proposed entrant: Daniel Paluszek.

## Devpost fields — final English copy

**Project title:** SpecGuard — Evidence-Aware Acceptance Criteria in Jira

**Category:** Apps for Software Teams

**Tagline:** Stop mistaking checked boxes for tested software: a read-only Jira issue panel that separates written acceptance criteria from verified evidence.

**Description (ready for Devpost after real installation):**

Software teams often close Jira issues when requirements *look* complete, even though the steps for reproducing a bug or the evidence for passing tests may be missing. SpecGuard is a Jira issue panel built with Atlassian Forge that gives a transparent checklist: it extracts structured acceptance criteria from Atlassian Document Format, highlights four specification-presence checks, and lists links to candidate PR reviews, CI runs and test reports. It never labels such a link as a passing test, never makes a release decision, and never changes Jira content. The current user’s permissions govern its read-only Jira API request.

SpecGuard runs deterministic JavaScript rules; it does not ship personal Jira data to another model provider or require model credentials. Error responses do not reveal issue content when the user cannot access it. The project includes a self-contained offline demo, unit tests and a preflight check distinguishing *can attempt deployment* from *actually deployed*. Its value is not an opaque score, but a reviewable map of the missing evidence required to make an informed human decision.

**Technical implementation:** Forge UI Kit `jira:issuePanel` + `@forge/react`, `@forge/bridge`, `@forge/resolver`; `asUser().requestJira` reads only `summary,description`, with `read:jira-work` scope. A pure JS engine parses ADF, identifies structured acceptance criteria, finds possible evidence references and marks every criterion **NOT VERIFIED**.

**Intended impact:** Reduce handoff ambiguity and false confidence in the completeness of issue descriptions. This is an aid to reviewers, not automated compliance verification, actual QA execution, or a software-quality classifier.

**What was actually tested:** 35/35 native Node regression tests, real Forge lint/deploy/install and live browser UI in SGD-1: three acceptance criteria tagged NOT VERIFIED, a missing-evidence warning, and working Refresh analysis. https://agent.tinyfish.ai/runs/ac360431-bf8c-4f95-8741-870e02e42d85 . No actual acceptance test was executed.

## Judge installation & test steps (publish only after live verification)

1. Open the **real Forge sharing link**: `retrievable signed URL from Forge Distribution console (production sharing; not the console URL itself)`. Install SpecGuard in an authorized Jira Cloud development/site environment, following the actual sharing flow.
2. Open an existing Jira issue in the site, e.g. `[ADD AUTHORIZED TEST ISSUE KEY]`, then select **SpecGuard - Acceptance Evidence** panel.
3. Confirm an issue with a structured acceptance section shows each AC as **NOT VERIFIED**; use a second issue with missing reproduction/evidence to observe gap messages. Click **Refresh analysis**. Verify an inaccessible issue does not leak content.

**Permissions:** Jira read-only scope `read:jira-work`. **Configuration:** No external API key; no remote inference. Real app installation and authorization are needed. Sample data under `examples/realistic-issue.json` is fictional and can be used to prepare, but **not to replace real Forge footage**.

## Video plan — <= 3 minutes of real installed Jira app footage

- **0:00–0:20:** Show a real Jira issue and the problem: acceptance checkboxes do not prove tests passed. Keep real names/contact/private Jira details out of the recording.
- **0:20–0:55:** Open installed SpecGuard issue panel; point out extracted criteria and the **NOT VERIFIED** badges.
- **0:55–1:30:** Show missing reproduction/test-evidence gaps, then demonstrate references to a PR or CI run without claiming they passed.
- **1:30–1:55:** Demonstrate Refresh analysis and the current-user Jira access boundary using authorized test issues; do not expose another user's content.
- **1:55–2:25:** Explain Forge read-only architecture and the absence of external model calls.
- **2:25–2:45:** Summarize what the app does and **does not do**. Display installation/sharing link only after verifying it works.

**DO NOT** submit a mock video that only shows `node demo.mjs`; Codegeist requires actual footage of the functioning Forge app. **YouTube URL (public):** `[ADD AFTER UPLOAD]`. Recorded runtime: `[DATE]`.

## Release checklist — hard gates

| Gate | Result as of 2026-10-31 | Evidence before changing status |
|---|---|---|
| Source and offline deterministic tests | PASS in prior recorded QA (19 tests) | Re-run `npm test`, `npm run check` |
| Registered app ID | **BLOCK** — placeholder in `manifest.yml` | Forge-generated app ID on authorized account |
| Installed dependencies, Forge CLI | **BLOCK** — no dependency install in prior environment | `npm install`, `forge lint`, strict preflight |
| Actual Forge deployment and Jira installation | **BLOCK** | Deployment details + authorized real Jira screenshots/test log |
| Sharing/distribution installation URL tested by a second user | **BLOCK** | Working actual link and test confirmation |
| Public <5-minute YouTube video, real app footage | **BLOCK** | Public video URL |
| Devpost entry, category and eligibility/rules accepted | **BLOCK** | Actual account-owner submission receipt/entry URL |
| Award or payment | **NONE** | Organizer/financial confirmation |

**CLI for current static readiness only:**
```bash
cd competitions/codegeist_2026/specguard
npm test
npm run check
npm run preflight -- --json
npm run preflight -- --strict   # intentionally exits 2 until app ID and dependencies are real
```

Official Codegeist rules: https://codegeist2026.devpost.com/rules — deadline **2026-12-22 at 12:00 PST**. A real submission must include a public YouTube video **under 5 minutes**, an installation link for judges, English materials and a running Forge app. An unpublished GitHub PR or a private copy of this packet is not a competition entry.

**Only the account owner can provide the missing Atlassian/Devpost account authorization and accept terms.** Do not invent an app ID, installation URL, public video, entry confirmation, payment, or test results.

## Verified production installation and public distribution (1 November 2026)

- Real Forge **production 2.0.0** built and deployed, followed by production installation in `issueslinux.atlassian.net`. Removed test DEV installation; CLI lists only production installation ID `2204c723-ad6c-4963-af57-b2a6c67cade2` as Up-to-date.
- Verified true production extension panel on fictional `SGD-1` (not Jira description text): 3 NOT VERIFIED ACs, completeness 3/4, no evidence references, functional Refresh. https://agent.tinyfish.ai/runs/5c431b27-044f-4b29-ac01-0e8ade84eb55 .
- Forge Distribution sharing is **Sharing with anyone**; a real signed Jira installation URL was generated and is available in the [developer distribution console](https://developer.atlassian.com/console/myapps/6f5132b0-059b-4210-871d-8295908ff02c/manage/distribution). Genuine contact `issueslinux@gmail.com` and privacy policy `https://github.com/issueslinux/specguard/blob/main/PRIVACY.md` replaced placeholder values.
- **NOT SUBMITTED TO DEVPOST.** A real public YouTube video and authenticated Devpost submission/receipt are still needed. No claim of judging, award, or prize.
