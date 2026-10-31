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
