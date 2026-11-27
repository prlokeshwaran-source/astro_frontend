# Frontend State and API Flow

## Authentication

`AuthProvider` owns the signed-in account and access/refresh tokens. Feature pages receive the access token and role from `App.jsx`. Requests use `src/api/client.js`, which adds the bearer token where required.

## Language selection

`LanguageProvider` owns the `en`, `ta`, or `hi` choice and exposes `language`, `changeLanguage`, and `t`. It initializes from local storage, syncs from the signed-in profile, and saves authenticated changes through `userApi.updateLanguage`. Keep service output language explicit in request bodies when an operation must capture a specific choice, as report generation does.

## Report flow

1. `ReportsPage.jsx` loads the caller-visible reports and, for astrologers, completed consultation options.
2. The birthplace search uses `locationApi.search(query, language)` and stores the selected latitude/longitude.
3. Report generation sends the consultation, birth details, topic, notes, and current language through `reportApi.generate`.
4. The saved report response contains a language code, localized chart, generated summary, status, and PDF URL.
5. Astrologers can review and share drafts. Authorized participants download the saved PDF through `reportApi.pdf`.

## Chat flow

`ChatPage.jsx` loads authorized consultation sessions, fetches history, and connects a WebSocket for live text updates. HTTP messages support base64 attachment data; the history response exposes only attachment metadata. `ChatAttachment.jsx` loads file bytes from the protected attachment endpoint.

## UI navigation

`App.jsx` selects the page component from local page state. `AppNavigation.jsx` provides role-specific desktop navigation and a shorter mobile dock. Add a destination to both link sets if the feature should be available at both screen sizes.
