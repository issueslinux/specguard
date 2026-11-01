# SpecGuard — status wdrożenia, 31.10.2026

**Status: CODE TESTED OFFLINE / NOT DEPLOYED / NOT SUBMITTED.**
Kandydat Codegeist 2026 — autor Daniel Paluszek, adres do zgłoszeń w prywatnym `config/submitter.json`.

## Walidacja w środowisku wykonawczym

Z repozytorium, w `competitions/codegeist_2026/specguard/`:

```sh
npm test                # 19 PASS, 0 FAIL — Node.js v22.16.0
npm run check           # PASS — JavaScript parsuje się poprawnie
npm run preflight       # 5 PASS, 2 BLOCK
npm run preflight -- --strict  # exit 2 — blokada jest zamierzona
```

**6 nowych testów Jira:** poprawne odczyty, walidacja parametrów, brak dostępu (401/403/404), odpowiedzi HTTP 500, błędny JSON, niespójny obiekt Issue i inny identyfikator zwrócony przez backend. Usługa `src/backend/issue-service.mjs` jest wywoływana przez prawdziwy resolver Forge `src/backend/index.js` (API `asUser`, zakres `read:jira-work`); testy izolują samą usługę i symulują odpowiedzi sieciowe. **To nie jest test komunikacji z Jira Cloud.**

**3 nowe testy gotowości:** wykrywają niezarejestrowane `app.id`, brak pakietów i niepożądane uprawnienia zapisu; pomyślny statyczny preflight nie jest dowodem wdrożenia.

## Brakujące kroki do rzeczywistego wdrożenia

1. **Wymagane konto Atlassian / Jira Cloud deweloperskie.** Zalogować się przez `forge login` (autoryzacja jest obowiązkiem właściciela konta).
2. Po sprawdzeniu warunków Atlassian uruchomić z katalogu SpecGuard `forge register`. Narzędzie wpisze do `manifest.yml` przydzielony prawdziwy `app.id`. **Nie fałszować identyfikatora UUID**.
3. Pobrać zależności `npm install`; w tym środowisku rejestr npm jest niedostępny (brak DNS). Przeprowadzić `forge lint`, `npm test`, `npm run preflight -- --strict`.
4. Faktycznie wykonać `forge deploy` i `forge install` na autoryzowanej Jira Cloud; ręcznie przetestować panel na rzeczywistych issue, obsługę uprawnień i brak zapisu.
5. **Do oceny Codegeist:** z poziomu developer console ustawić dystrybucję **Sharing**, przejść na produkcyjne wydanie i uzyskać działający link instalacyjny dla jurorów. Atlassian nie daje publicznego linku automatycznie po commicie na GitHubie.
6. Nagrać działający panel, umieścić **publiczny film na YouTube**, a następnie z konta uczestnika wypełnić Devpost Codegeist; faktyczne potwierdzenie zgłoszenia zachować w repo (bez tokenów i danych wrażliwych).

Dostępność i format manifestu potwierdzone w dokumentacji Atlassian:
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-issue-panel/
- https://developer.atlassian.com/platform/forge/manifest-reference/
- https://developer.atlassian.com/platform/forge/cli-reference/register/
- https://developer.atlassian.com/platform/forge/distribute-your-apps/

## Dowody wykonanej pracy

- 10 istniejących testów analizy opisów + 6 testów usługi Jira + 3 testy preflight = **19 PASS**.
- Brak prawdziwej komunikacji z Forge, Jira Cloud i Devpost w tej rundzie.
- Nie zapisano żadnego autentycznego URL instalacji/filmu/zgłoszenia, bo takie artefakty jeszcze nie istnieją.
- **Wpływy: 0 USD.**

Nie wymaga GitHub Actions ani Desktop Commandera.

## Historyczna blokada Jira — rozwiązana później 31.10.2026

- Integracja Atlassian w ChatGPT potwierdziła witrynę `https://issueslinux.atlassian.net`, `cloudId=1825ea85-7283-4ec1-881e-d7d9defe492b`, dostęp produktu Jira `read-write`. **Nie jest to tożsame z prawem utworzenia projektu ani z logowaniem do Forge CLI.**
- `listJiraProjects` (bez filtra) zwraca `values=[]`, `total=0`; próba utworzenia zadania w `SD` została odrzucona (projekt nie istnieje lub brak uprawnień).
- Kontrola przeglądarkowa potwierdziła pustą listę, brak projektu `SD` i brak możliwości otwarcia `/jira/software/projects/SD`: https://agent.tinyfish.ai/runs/4e17d67a-5fd2-4002-a487-e1dca95223b9 . **Wcześniejszy komunikat automatu o utworzeniu `SD` był fałszywie dodatni i nie stanowi dowodu wdrożenia.**
- Ponowna próba w prawdziwym formularzu `Create space`: interfejs udostępnia szablony Jira Service Management zamiast klasycznego Jira Software, a po stronie organizacji wyświetla **„Nie masz uprawnień do tworzenia nowych przestrzeni”**: https://agent.tinyfish.ai/runs/36459192-a22d-488b-9069-ad216e1047ad . Bez uzyskania przez konto uprawnień tworzenia projektu i dostępnego produktu Jira Software nie da się obecnie utworzyć demo projektu tym kanałem.
- **Forge pozostaje niezarejestrowany i niewdrożony**. Manifest nadal ma `app.id`-placeholder; nie ma prawdziwego `forge register`, `forge deploy`, `forge install`, linku do instalacji ani nagrania. Wymagany uprawniony dostęp deweloperski Forge CLI/API token i projekt Jira, nie sam Rovo MCP.

## Poprawka analizatora ADF — osobna weryfikacja

- `src/core/analyze.mjs` zachowuje teraz nagłówki ADF jako `## Nazwa sekcji` oraz początek `listItem` jako `- `. Poprzednia wersja **nie rozpoznawała anonimowych wypunktowań ADF jako kryteriów akceptacji**. Nowy parser poprawnie kończy sekcję kryteriów przy następnym nagłówku (np. Notes), zamiast klasyfikować dalsze punkty jako AC.
- Test regresyjny wykorzystuje rzeczywistą strukturę ADF (heading, bulletList, listItem, paragraph), dwie reguły w Acceptance Criteria i obce punkty w Notes oraz Reproduction. Pierwotna wersja zgłaszała zero AC; po poprawce dwie, wszystkie `verified=false`.
- **17/17 testów dla `analyze.test.mjs` i `issue-service.test.mjs` PASS w izolowanym środowisku V8** przez wykonanie faktycznych callbacków testów z plików GitHub; ze względu na brak natywnego `URL` w tym środowisku zastosowano wyłącznie dla testów pomocniczy parser URL (bez zmian w produkcji). **Nie uruchomiono natywnego Node.js `node --test`, `forge lint` ani testów Forge/Jira**. Trzy testy preflight pozostają poza tą rundą.

## Jira Software — dostęp i rzeczywiste testowe zadania, stan potwierdzony 31.10.2026

**BLOKADA TWORZENIA PROJEKTÓW USUNIĘTA.** Konto `issueslinux@gmail.com` jest członkiem `jira-admins-issueslinux` i posiada aplikacyjną rolę `Jira Software` (potwierdzone `getJiraCurrentUser(expand=groups,applicationRoles)`). W panelu **Jira Settings → System → Global Permissions** dodano temu gronu jawne uprawnienie **Create team-managed projects**; istniejące uprawnienie Public nie zostało zmienione. Dowód procesu: https://agent.tinyfish.ai/runs/7da84de0-a9f9-41ff-90a8-8c1c363f54bb .

**Niezależny od przeglądarki odczyt przez Atlassian MCP:** `listJiraProjects` zwrócił dokładnie jeden nowy projekt: `{id: "10000", key: "SGD", name: "SpecGuard Demo", projectTypeKey: "software", style: "next-gen"}`. Adres https://issueslinux.atlassian.net/jira/software/projects/SGD .

**Rzeczywiste, fikcyjne dla demonstracji zadania Jira utworzone przez `createJiraIssue` i zweryfikowane przez `getJiraIssue`:**

- [SGD-1 — demo akceptacji po błędzie synchronizacji](https://issueslinux.atlassian.net/browse/SGD-1) — trzy jawne punkty AC, Expected Behavior, Reproduction, sekcja Evidence z TODO. **Nie twierdzi, że testy przeszły**.
- [SGD-2 — demo brakujących dowodów](https://issueslinux.atlassian.net/browse/SGD-2) — celowo niekompletne wymagania, brak właściwych AC i dowodów.
- Oba zgłoszenia są oznaczone jako **FICTIONAL DEMO** i nie reprezentują rzeczywistych błędów klienta.

**Stan Forge po odblokowaniu Jira:** osobny, dotąd niewykonany etap. Oficjalna konsola https://developer.atlassian.com/console/myapps/ pokazuje istniejącą przestrzeń deweloperską **Linux Issues**, brak aplikacji SpecGuard i brak wdrożeń. Forge CLI jest wymagany do zarejestrowania **istniejącego** manifestu przez `forge register` (nie `forge create`), następnie `npm install`, `forge lint`, `forge deploy` oraz `forge install`. Wymagany jest scoped Atlassian API token. Nie generować ani ujawniać tokenu w repo/logach; nie fałszować `app.id`. Weryfikacja konsoli: https://agent.tinyfish.ai/runs/afb8edfd-746d-40d9-89de-b812b5ce51f5 . Nie przeprowadzono wdrożenia, instalacji ani oceny panelu w przeglądarce Jira.

**Uwaga dotycząca środowiska:** asystent nie może obecnie wykonać `npm install` z lokalnego kontenera (DNS `registry.npmjs.org` → `EAI_AGAIN`), a zdalny terminal Desktop Commander osiągnął miesięczny limit. **Nie traktować tego jako ograniczenia samego konta Jira; projekt i zadania już działają**.

## Repeatable Forge delivery script QA (same 31.10.2026 iteration)

- `scripts/deploy_to_jira.sh --verify-only|--deploy` builds a local, **ignored** `.forge-tools/` CLI install from the official `@forge/cli@latest` npm package, reuses the **existing** SpecGuard Forge manifest (`forge register SpecGuard` only while the placeholder app ID is present), runs `npm test`, `npm run check`, strict static preflight, lint, `forge deploy -e development`, and `forge install` to the verified Jira site.
- Requires the owner's `FORGE_EMAIL=issueslinux@gmail.com` and `FORGE_API_TOKEN`; refuses an unexpected account, missing token or unknown command **before network/deployment actions**. The script neither creates nor stores API tokens and does not print secrets. It does not run automatically on commit and uses no GitHub Actions.
- **6/6 committed native Node 22.16.0 tests PASS**, via `node --test test/deploy-script.test.mjs test/token-isolation.test.mjs`: Bash syntax, missing-token fail-closed, wrong-account fail-closed, command-mode validation, plus two isolated mock-execution tests asserting that npm/test subprocesses cannot see `FORGE_API_TOKEN` while the Forge CLI receives it only for authenticated commands. `bash -n` PASS. Git blob SHA-1 matches tested shell source: `956c1ed36e4c1a6493eee1561c53eb140dcd4900`; tests `58d2fed9333d8b521e29df18a81ced979b575bf7` and `497aaa5fa7cc067e72433af891e39653f455dc5f`.
- **The --deploy path was NOT executed**, since no Forge scoped API token is available in the connected trusted shell; the local sandbox cannot resolve `registry.npmjs.org` and Desktop Commander was quota-blocked. Do not claim deployment, app ID, live panel, install link, video or submitted Codegeist entry until verified from Atlassian itself.

## Forge CLI credential isolation and alternative deployment check (31.10.2026)

- Real CLI package `@forge/cli` is the required deployment path for the **existing** SpecGuard source; Forge's official [register](https://developer.atlassian.com/platform/forge/cli-reference/register/), [install](https://developer.atlassian.com/platform/forge/cli-reference/install/) and [environment authentication](https://developer.atlassian.com/platform/forge/getting-started/) docs confirm the script's primary command structure. Do **not** use `--accept-terms` to silently agree to terms on someone else's behalf.
- **Security correction:** an exported `FORGE_API_TOKEN` would previously be passed to `npm install` and any dependency lifecycle script (arbitrary code) and `npm test`, which poses an unnecessary credential-exfiltration risk. The script now captures the token in a **non-exported shell variable** (explicit `export -n` also strips any previously inherited export attribute), unsets the environment variable **before any npm operation**, and injects it only for `forge register`, `forge lint`, `forge deploy`, `forge install` and `forge install list` subprocesses.
- **Verification:** local Node v22.16.0 `node --test test/deploy-script.test.mjs test/token-isolation.test.mjs` returned 6 PASS/0 FAIL; `bash -n` PASS. Two extra non-committed exploratory mock assertions also passed (8/8 combined local harness), but only **6 tested cases are committed**. Source and committed test file Git blob SHA-1 hashes match files actually tested: `956c1ed36e4c1a6493eee1561c53eb140dcd4900` and `497aaa5fa7cc067e72433af891e39653f455dc5f`.
- [Atlassian Studio browser check](https://agent.tinyfish.ai/runs/a51a94bc-456b-49df-9c64-fb9838810334): owner can open Studio but account does not show its app builder/prompt; navigation exposes only agents, automation, assets and hubs. Studio is **not a currently usable workaround** to deploy this Forge `jira:issuePanel`. Forge app is not registered.
- [GitHub Codespaces browser check](https://agent.tinyfish.ai/runs/30380d59-1b9d-48e8-9dbd-66353bba09cd): the profile is not authenticated to GitHub, so it cannot currently provide an authorized cloud terminal. No paid codespace was created.
- Current shell lacks external DNS for npm/Forge services; existing Remote Desktop Commander terminal access reports monthly usage exhausted. **No live Forge deployment was performed** in this step. Next external gate is a trusted terminal with npm network plus Forge CLI authentication; **no token should be committed to GitHub or posted in chat**.

## Forge CLI — wymagane wersje Node (zmiana Atlassian z 26.10.2026)

- Oficjalny [changelog Forge z 26 października 2026](https://developer.atlassian.com/platform/forge/changelog/) podniósł minimum Forge CLI do **Node.js 22.23.4, 24.22.1 albo 26.12.1** (LTS). Node 20 i Node 22.16.0 nie są wystarczające do `@forge/cli@latest`.
- `scripts/deploy_to_jira.sh --deploy` sprawdza teraz wersję przed instalacją npm, bez zgadywania kompatybilności. `--verify-only` nadal uruchamia niezależne od Forge testy offline na starszej wersji Node; nie świadczy to o zgodności z CLI.
- Testy przy użyciu **faktycznego Bash z podstawionymi procesami Node/npm/Forge** odrzuciły `20.30.0`, `22.16.0`, `22.23.3`, `24.22.0`, `25.99.0` i `26.12.0`, a zaakceptowały `22.23.4`, `22.30.0`, `24.22.1`, `26.12.1`. Testowanie z symulacją numeru wersji nie jest uruchomieniem realnego Forge CLI.
- QA zmodyfikowanych plików: `node --test test/deploy-script.test.mjs test/token-isolation.test.mjs` **8/8 PASS**, `bash -n` PASS. Lokalne Node **v22.16.0** wystarcza do uruchomienia samych testów, lecz nie do deploy. SHA1 blob GitHub kodu równe testowanym plikom: `911c944ad0bfd9c6fd94e34d7537eb451166e4e1`, testy `d3135423b45a540f6dc84d3a77a234d490f77e20`.
- Ograniczenie wdrożeniowe pozostaje niezależne od kodu: dostęp do powłoki z obsługiwanym Node i siecią npm/Atlassian, scoped `FORGE_API_TOKEN`, możliwość weryfikacji `forge register/deploy/install` w konsoli oraz rzeczywiste wyświetlenie panelu w [SGD-1](https://issueslinux.atlassian.net/browse/SGD-1).

## Native deployment readiness on hexagony-01 — 01.11.2026

- Installed Node `v24.22.1` with NVM, selected explicitly in the project; `.nvmrc` pins this tested runtime. `npm install` produced a reproducible `package-lock.json` (npm 11.19.1); `@forge/cli@15.0.0` installed into the existing ignored `.forge-tools` as documented, `forge --version` PASS.
- `npm test` in native Node: **28/28 PASS**, `npm run check` PASS; static `npm run preflight -- --json`: all checks except registered Forge App ID passed **after** installation.
- `forge settings set usage-analytics false` successfully disables optional CLI analytics. `forge lint` currently stops with **Not logged in** (after restoring connection to the session D-Bus keyring with `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus`). This is an **auth blocker**, not a lint PASS or manifest error; `forge register/deploy/install` have **not** run.
- Signed-in Atlassian browser profile redirects token manager to an **8-digit MFA challenge** sent to `issueslinux@gmail.com`; automation stopped and did not bypass the second factor or create token: https://agent.tinyfish.ai/runs/e1738beb-87e8-4d63-bd10-c388129f5baf . Owner must complete MFA, create or locate a **scoped Forge API token**, then authenticate locally in `forge login`. Do not enter tokens or MFA codes in repo/chat/logs. 
- Site/project issue `https://issueslinux.atlassian.net/browse/SGD-1` exists and can be used immediately once Forge is authenticated; requirements remain: real app ID, `forge lint`, `forge deploy -e development`, `forge install`, review installed panel, enable sharing, public video and Devpost submission.
- Rootless Docker is **not required for SpecGuard**. It was separately enabled for GraphFraud on the same host under user `daniel`; does not provide Forge authentication.
