# SpecGuard — production and Codegeist closeout evidence (1 November 2026)

**State:** native tests PASS, Forge production deployment/installation **confirmed**, live Jira issue panel **observed**, signed production installation link **confirmed present** in Atlassian console. **Independent judge-site install NOT VERIFIED; public YouTube demo NOT PUBLISHED; Devpost NOT SUBMITTED.** Neither a CLI installation nor a test-site panel is a competition receipt.

## Installation and real product verification

- Existing Forge app: `6f5132b0-059b-4210-871d-8295908ff02c`; Developer Space: Linux Issues; authorized Jira site: `issueslinux.atlassian.net`.
- Live 1 November CLI invocation: `.forge-tools/node_modules/.bin/forge install list`. The **only row returned** was ID `2204c723-ad6c-4963-af57-b2a6c67cade2`, environment `production`, Jira site `issueslinux.atlassian.net`, version `2`, status `Up-to-date`. This confirms Forge's installation record, not a judge test.
- `npm test`: **35 PASS / 0 FAIL**; `npm run check`: PASS; `npm run preflight -- --strict`: PASS (explicitly warns that an external deploy/submission is not verified by preflight).
- Authenticated, independent browser on the actual Jira site inspected both authorized *fictional* demo issues. Evidence: [live Jira verification run](https://agent.tinyfish.ai/runs/cb143cbe-5b5a-4f67-91ff-7a59f19dea9c).
  - `SGD-1`: actual `SpecGuard - Acceptance Evidence` panel loaded; **3 acceptance criteria**, all `NOT VERIFIED`; completeness `3/4`; no linked test/review evidence. **Refresh analysis** executed and results were unchanged.
  - `SGD-2`: actual panel loaded; **0 structured acceptance criteria**, completeness `0/4` and four missing-evidence/specification messages. Refresh button present.
  - **Attribution limitation:** Forge issue panel UI itself does not expose the installation ID, environment or version. The CLI currently reports only production installed on this site, and the panel is functional on that site; this is strong corroboration, but **not an independent in-panel attestation of the exact production binary**.
- Developer distribution console [for this registered app](https://developer.atlassian.com/console/myapps/6f5132b0-059b-4210-871d-8295908ff02c/manage/distribution) was checked with an authorized session: **Sharing with anyone = enabled**; real **production-signed Jira installation URL exists** (deployment timestamp visible as 2026-11-01 09:00:59 UTC), Marketplace listing not present. [External console inspection evidence](https://agent.tinyfish.ai/runs/ae1e3373-3fdc-4301-ab70-26b1f5a38ca9).
  - **SECURITY / DELIVERY:** the URL is long, with a `signature=` query parameter and `product=jira`. Do not reconstruct, truncate, log in CI, or publish the signed URL in this public Git repository; copy the **actual current link** from the console directly into the authorized Devpost judge-access field.
  - We did **not** independently install through that URL on a different authorized Jira Cloud site; distribution-state confirmation is not a verified second-site install.

## Demo video requirement — NOT COMPLETE

Codegeist requires an **actual live demonstration** of the installed Forge application on **public YouTube**, length **under 5 minutes**. The [real Jira browser run](https://agent.tinyfish.ai/runs/cb143cbe-5b5a-4f67-91ff-7a59f19dea9c) captured a real browser sequence with recording requested, but **no downloadable/exported verified video file or public YouTube watch URL was obtained**. A web-run replay link is **not** a substitute for the public YouTube requirement.

Record a true browser session of the authorized `SGD-1` and `SGD-2` Jira issues (not offline `demo.mjs` or a mock), including a working Refresh action. Keep personal details, unrelated browser tabs and signed Forge link out of the public footage. Show, accurately: three `NOT VERIFIED` criteria on `SGD-1`, missing requirements on `SGD-2`, read-only design and explicit non-verification of tests. Use the concrete shot list in [CODEGEIST_JUDGE_PACKET.md](CODEGEIST_JUDGE_PACKET.md). Publish to public YouTube and record the real URL and duration.

## Devpost gate — NOT COMPLETE

- Competition: https://codegeist2026.devpost.com/ ; deadline **22 December 2026, 12:00 PST**.
- Category: **Apps for Software Teams**; no unearned bonus-prize claim.
- Complete description already prepared in [CODEGEIST_JUDGE_PACKET.md](CODEGEIST_JUDGE_PACKET.md) and [SUBMISSION_DRAFT.md](SUBMISSION_DRAFT.md).
- Required: official **working production Forge signed judge installation link**, proper access/test steps, **public <5-minute YouTube real-app demo**, entrant login and any personal legal/eligibility confirmation on Devpost.
- Live browser verification of Devpost account authentication is still required; prior handoff records a signed-out session. **Only the owner can log in, complete MFA and accept rules; do not infer consent from a successful Forge login.**
- Only after the completed Devpost submission page returns a real entry URL/receipt should Hunter status be advanced to `SUBMITTED`.

## Gate ledger

| Gate | Verified state |
| --- | --- |
| Source and 35 native tests | TESTED (new run, 1 Nov) |
| Forge production deployed | DEPLOYED (prior real CLI deploy, independently visible console time) |
| Forge production installed | INSTALLED (new CLI list, 1 Nov) |
| Real Jira UI | TESTED (SGD-1 and SGD-2, but panel has no environment label) |
| Sharing and actual production-signed judge URL present | DISTRIBUTED (console checked; signed URL kept out of GitHub) |
| Second-site judge install | UNVERIFIED |
| Public authentic YouTube demo | MISSING |
| Devpost Codegeist entry | NOT SUBMITTED |
| Acceptance/prize/payment | NONE CONFIRMED |

The synthetic Jira issues are not live production customer data; the words `production` above refer specifically to the **Forge environment**, not business-system quality or real-world QA validation.
