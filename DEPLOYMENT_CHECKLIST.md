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
- **4/4 native Node 22.16.0 tests PASS**, via `node --test test/deploy-script.test.mjs`, checking Bash syntax, missing-token fail-closed behavior, wrong-account fail-closed behavior, and command-mode validation. `bash -n` PASS. Git blob SHA-1 matches tested shell source: `f5903be0349e84aef2723de4bf9b756fc7b8b5ba`; tests `58d2fed9333d8b521e29df18a81ced979b575bf7`.
- **The --deploy path was NOT executed**, since no Forge scoped API token is available in the connected trusted shell; the local sandbox cannot resolve `registry.npmjs.org` and Desktop Commander was quota-blocked. Do not claim deployment, app ID, live panel, install link, video or submitted Codegeist entry until verified from Atlassian itself.
